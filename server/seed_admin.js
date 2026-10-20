const bcrypt = require('bcrypt');
const db = require('./config/db');

async function seedAdmin() {
    const email = process.env.ADMIN_EMAIL || (process.env.NODE_ENV === 'production' ? '' : 'admin@hostelhub.com');
    const password = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? '' : 'admin123');

    if (!email || !password) {
        console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD before creating the production admin account.');
        process.exitCode = 1;
        return;
    }

    try {
        const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
        const hash = await bcrypt.hash(password, 10);

        if (existing[0]) {
            await db.query('UPDATE users SET password_hash = ?, role = ? WHERE email = ?', [hash, 'admin', email]);
            console.log('Admin account updated:', email);
        } else {
            await db.query('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [email, hash, 'admin']);
            console.log('Admin account created:', email);
        }
    } catch (error) {
        console.error('Unable to create admin account:', error.message);
        process.exitCode = 1;
    } finally {
        await db.end();
    }
}

seedAdmin();
