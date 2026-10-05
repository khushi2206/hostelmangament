const bcrypt = require('bcrypt');
const db = require('./config/db');

async function seedAdmin() {
    try {
        const email = 'admin@hostelhub.com';
        const password = 'admin123';
        const [existing] = await db.query('SELECT user_id, role, password_hash FROM users WHERE email = ?', [email]);
        const hash = await bcrypt.hash(password, 10);

        if (existing.length > 0) {
            await db.query('UPDATE users SET password_hash = ?, role = ? WHERE email = ?', [hash, 'admin', email]);
            console.log('SUCCESS: Admin user updated with email:', email, 'and password:', password);
            process.exit(0);
        }

        await db.query('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [email, hash, 'admin']);
        console.log('SUCCESS: Admin user created with email:', email, 'and password:', password);
        process.exit(0);
    } catch (err) {
        console.error('FULL SEED ERROR:', err);
        process.exit(1);
    }
}

seedAdmin();
