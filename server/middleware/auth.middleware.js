const crypto = require('crypto');

const SESSION_LIFETIME_SECONDS = 12 * 60 * 60;
const SESSION_SECRET = process.env.SESSION_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'hostelhub-local-development-secret');

function sign(payload) {
    if (!SESSION_SECRET) throw new Error('SESSION_SECRET must be set in production');
    return crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
}

function createSession(user) {
    const payload = Buffer.from(JSON.stringify({
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        expires_at: Math.floor(Date.now() / 1000) + SESSION_LIFETIME_SECONDS
    })).toString('base64url');
    return `${payload}.${sign(payload)}`;
}

function authenticate(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra) return res.status(401).json({ message: 'Authentication required' });

    try {
        const expectedBuffer = Buffer.from(sign(payload));
        const actualBuffer = Buffer.from(signature);
        if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        if (!session.user_id || !session.role || session.expires_at <= Math.floor(Date.now() / 1000)) {
            return res.status(401).json({ message: 'Session expired. Please sign in again.' });
        }
        req.user = { user_id: session.user_id, email: session.email, role: session.role };
        req.sessionToken = token;
        next();
    } catch {
        return res.status(401).json({ message: 'Authentication required' });
    }
}

// Sessions are stateless on Vercel; the client discards its token on logout.
function destroySession() {}

module.exports = { createSession, authenticate, destroySession };
