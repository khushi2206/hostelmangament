const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains user_id and role
    next();
  } catch (err) {
    res.status(400).json({ message: 'Token is not valid' });
  }
};

const isStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Students only' });
  }
};

module.exports = { auth, isStudent };
