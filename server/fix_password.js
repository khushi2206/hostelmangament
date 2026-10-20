require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const bcrypt = require('bcrypt');
const db = require('./config/db');

async function updatePassword() {
  const email = process.argv[2];
  const password = process.argv[3];
  if (!email || !password) {
    console.error('Usage: node fix_password.js <email> <new-password>');
    process.exitCode = 1;
    return;
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await db.query('UPDATE users SET password_hash = ? WHERE email = ?', [passwordHash, email]);
    if (!result.affectedRows) throw new Error(`No user found for ${email}`);
    console.log(`Password updated for ${email}`);
  } catch (error) {
    console.error('Unable to update password:', error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

updatePassword();
