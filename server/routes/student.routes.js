const express = require('express');
const controller = require('../controllers/student.controller');

const router = express.Router();

function requireStudent(req, res, next) {
	if (req.user.role !== 'student') return res.status(403).json({ message: 'Student access required' });
	next();
}

router.use(requireStudent);
router.get('/profile', controller.getProfile);
router.get('/leaves', controller.getLeaves);
router.post('/leaves', controller.createLeave);

module.exports = router;
