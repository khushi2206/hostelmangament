const express = require('express');
const cors = require('cors');
const adminRoutes = require('./routes/admin.routes');
const studentRoutes = require('./routes/student.routes');
const authRoutes = require('./routes/auth.routes');
const { authenticate } = require('./middleware/auth.middleware');
const db = require('./config/db');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', async (req, res) => {
	try {
		await db.query('SELECT 1');
		res.json({ status: 'ok', database: 'connected' });
	} catch (error) {
		res.status(503).json({ status: 'error', database: 'unavailable' });
	}
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', authenticate, adminRoutes);
app.use('/api/student', authenticate, studentRoutes);

const port = process.env.PORT || 5000;
if (require.main === module) {
	app.listen(port, () => console.log(`Local: http://localhost:${port}/`));
}

module.exports = app;
