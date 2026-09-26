const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const pool = new Pool({ user: "postgres", password: "2206", host: "localhost", port: 5432, database: "hostelhub" });
bcrypt.hash("password123", 10).then(hash => pool.query("UPDATE users SET password_hash = $1 WHERE email = $2", [hash, "student@email.com"])).then(() => { console.log("Password updated successfully"); process.exit(0); });
