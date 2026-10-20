const mysql = require('mysql');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function setup() {
  let connection;
  let query;
  try {
    const databaseName = process.env.DB_NAME || 'hostelhub';
    if (!/^[a-zA-Z0-9_]+$/.test(databaseName)) {
      throw new Error('DB_NAME may contain only letters, numbers, and underscores');
    }

    connection = mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    });
    query = promisify(connection.query).bind(connection);

    await query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
    await query(`USE \`${databaseName}\``);

    console.log(`Connected to MySQL. Creating tables in '${databaseName}'...`);
    const sqlPath = path.join(__dirname, '../database/schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8')
      .replace(/^\uFEFF/, '')
      .replace(/^\s*CREATE DATABASE IF NOT EXISTS hostelhub;\s*USE hostelhub;\s*/i, '');

    await query(sql);

    // CREATE TABLE IF NOT EXISTS does not update tables created by older app
    // versions. Add the columns expected by current queries without replacing
    // any existing rows.
    const ensureColumn = async (table, column, definition) => {
      const rows = await query(
        'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
        [databaseName, table, column]
      );
      if (rows.length === 0) {
        await query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
        console.log(`Added ${table}.${column}.`);
        return true;
      }
      return false;
    };

    const ensureNullableColumn = async (table, column, definition) => {
      const rows = await query(
        'SELECT IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
        [databaseName, table, column]
      );
      if (rows.length && rows[0].IS_NULLABLE === 'NO') {
        await query(`ALTER TABLE \`${table}\` MODIFY COLUMN \`${column}\` ${definition}`);
        console.log(`Made ${table}.${column} optional until the student completes their profile.`);
      }
    };

    await ensureColumn('leave_requests', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await ensureColumn('notices', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await ensureColumn('rooms', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    await ensureColumn('students', 'bed_label', 'VARCHAR(30) NULL');
    await ensureColumn('fees', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    await ensureNullableColumn('students', 'enrollment_no', 'VARCHAR(100) NULL');
    await ensureNullableColumn('students', 'course', 'VARCHAR(150) NULL');
    await ensureNullableColumn('students', 'semester', 'INT NULL');
    await ensureNullableColumn('students', 'department', 'VARCHAR(150) NULL');
    const addedPaidColumn = await ensureColumn('fees', 'paid', 'DECIMAL(10, 2) NOT NULL DEFAULT 0');
    // Older installations stored the paid amount under paid_amount.
    const legacyPaidColumn = await query(
      'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
      [databaseName, 'fees', 'paid_amount']
    );
    if (addedPaidColumn && legacyPaidColumn.length > 0) {
      await query('UPDATE fees SET paid = paid_amount');
    }

    console.log(`Database '${databaseName}' and all tables are ready.`);
    
  } catch (error) {
    console.error("Failed to run schema:", error.message);
    process.exitCode = 1;
  } finally {
    if (connection) await new Promise((resolve, reject) => connection.end(error => error ? reject(error) : resolve()));
  }
}

setup();
