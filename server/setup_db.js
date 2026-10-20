const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setup() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    });

    console.log("Connected to MySQL. Running schema...");
    const sqlPath = path.join(__dirname, '../database/schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await connection.query(sql);
    console.log("Database 'hostelhub' and all tables created successfully!");
    
  } catch (error) {
    console.error("Failed to run schema:", error.message);
    process.exitCode = 1;
  } finally {
    if (connection) await connection.end();
  }
}

setup();
