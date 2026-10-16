const crypto = require('crypto');

const sessions = new Map();

function createSession(user) {
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, { user_id: user.user_id, email: user.email, role: user.role });
    return token;
}

function authenticate(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    const user = sessions.get(token);
    if (!user) return res.status(401).json({ message: 'Authentication required' });
    req.user = user;
    req.sessionToken = token;
    next();
}

function destroySession(token) {
    sessions.delete(token);
}

module.exports = { createSession, authenticate, destroySession };
