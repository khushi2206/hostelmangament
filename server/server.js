const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');

app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
