require('dotenv').config();
const express = require('express');
const cors = require('cors');
const adminRoutes = require('./routes/admin.routes');
const studentRoutes = require('./routes/student.routes');
const authRoutes = require('./routes/auth.routes');
const { authenticate } = require('./middleware/auth.middleware');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', authenticate, adminRoutes);
app.use('/api/student', authenticate, studentRoutes);

const port = process.env.PORT || 5000;
if (require.main === module) app.listen(port, () => console.log('Server running on port ' + port));

module.exports = app;
