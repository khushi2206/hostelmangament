const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userQuery.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = userQuery.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Get student details if student
    let studentDetails = null;
    if (user.role === 'student') {
        const studentQuery = await pool.query('SELECT * FROM students WHERE user_id = $1', [user.user_id]);
        if(studentQuery.rows.length > 0) {
            studentDetails = studentQuery.rows[0];
        }
    }

    res.json({ token, role: user.role, student: studentDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.user_id;

    try {
        const userQuery = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        const user = userQuery.rows[0];

        const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect old password' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await pool.query('UPDATE users SET password_hash = $1 WHERE user_id = $2', [hashedPassword, userId]);
        res.json({ message: 'Password updated successfully' });
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { login, changePassword };
