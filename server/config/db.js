const path = require('path');
const { promisify } = require('util');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mysql = require('mysql');
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hostelhub',
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10
});

const poolQuery = promisify(pool.query).bind(pool);

async function getConnection() {
  const raw = await promisify(pool.getConnection).bind(pool)();
  const query = promisify(raw.query).bind(raw);
  return {
    query: async (sql, values) => [await query(sql, values)],
    beginTransaction: promisify(raw.beginTransaction).bind(raw),
    commit: promisify(raw.commit).bind(raw),
    rollback: promisify(raw.rollback).bind(raw),
    release: () => raw.release()
  };
}

module.exports = {
  query: async (sql, values) => [await poolQuery(sql, values)],
  getConnection,
  end: () => new Promise((resolve, reject) => pool.end(error => error ? reject(error) : resolve()))
};
