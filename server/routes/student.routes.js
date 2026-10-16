const express = require('express');
const controller = require('../controllers/student.controller');

const router = express.Router();

function requireStudent(req, res, next) {
	if (req.user.role !== 'student') return res.status(403).json({ message: 'Student access required' });
	next();
}

router.use(requireStudent);

// Profile
router.get('/profile', controller.getProfile);
router.put('/profile', controller.updateProfile);

// Dashboard
router.get('/dashboard', controller.getDashboard);

// Leaves
router.get('/leaves', controller.getLeaves);
router.post('/leaves', controller.createLeave);
router.delete('/leaves/:id', controller.deleteLeave);

// Visitors
router.get('/visitors', controller.getStudentVisitors);
router.post('/visitors', controller.createStudentVisitor);

// Complaints
router.get('/complaints', controller.getStudentComplaints);
router.post('/complaints', controller.createStudentComplaint);

// Room
router.get('/room', controller.getStudentRoom);
router.get('/room-change', controller.getRoomChangeRequests);
router.post('/room-change', controller.createRoomChangeRequest);

// Fees
router.get('/fees', controller.getStudentFees);

// Notices
router.get('/notices', controller.getStudentNotices);

// Mess menu
router.get('/mess/menu', controller.getMessMenu);
router.get('/mess/opt-out', controller.getMessOptOuts);
router.post('/mess/opt-out', controller.createMessOptOut);

// Lost & Found
router.get('/lost-found', controller.getLostFound);
router.post('/lost-found', controller.createLostFound);

// Laundry
router.get('/laundry', controller.getLaundry);
router.post('/laundry', controller.createLaundry);

module.exports = router;
