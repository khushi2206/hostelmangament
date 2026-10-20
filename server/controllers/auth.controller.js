const bcrypt = require('bcrypt');
const db = require('../config/db');
const { createSession, destroySession } = require('../middleware/auth.middleware');

async function login(req, res) {
    try {
        const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';
        const password = typeof req.body.password === 'string' ? req.body.password : '';
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
        const [rows] = await db.query(
            'SELECT u.user_id, u.email, u.password_hash, u.role FROM users u LEFT JOIN students s ON s.user_id = u.user_id WHERE u.email = ? OR s.enrollment_no = ? LIMIT 1',
            [email, email]
        );
        if (!rows[0] || !(await bcrypt.compare(password, rows[0].password_hash))) return res.status(401).json({ message: 'Invalid email or password' });
        const user = { user_id: rows[0].user_id, email: rows[0].email, role: rows[0].role };
        const token = createSession(user);
        res.json({ message: 'Login successful', token: token, user: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Unable to login' });
    }
}

function logout(req, res) {
    destroySession(req.sessionToken);
    res.json({ message: 'Logout successful' });
}

module.exports = { login, logout };
