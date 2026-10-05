const express = require('express');
const controller = require('../controllers/admin.controller');

const router = express.Router();

function requireAdmin(req, res, next) {
	if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
	next();
}

router.use(requireAdmin);
router.get('/dashboard', controller.getDashboard);
router.get('/students', controller.getStudents);
router.get('/students/:id', controller.getStudent);
router.post('/students', controller.addStudent);
router.put('/students/:id', controller.updateStudent);
router.delete('/students/:id', controller.deleteStudent);
router.get('/rooms', controller.getRooms);
router.get('/rooms/:id', controller.getRoom);
router.post('/rooms', controller.addRoom);
router.put('/rooms/:id', controller.updateRoom);
router.delete('/rooms/:id', controller.deleteRoom);
router.get('/allocation/students', controller.getAllocationStudents);
router.get('/allocation/rooms', controller.getAllocationRooms);
router.post('/allocation', controller.addAllocation);
router.put('/allocation/:studentId', controller.reassignAllocation);
router.delete('/allocation/:studentId', controller.vacateAllocation);
router.get('/leaves', controller.getLeaves);
router.get('/leaves/:id', controller.getLeave);
router.put('/leaves/:id/status', controller.updateLeaveStatus);
router.get('/visitors', controller.getVisitors);
router.post('/visitors', controller.addVisitor);
router.get('/visitors/:id', controller.getVisitor);
router.put('/visitors/:id/status', controller.updateVisitorStatus);
router.get('/complaints', controller.getComplaints);
router.get('/complaints/:id', controller.getComplaint);
router.put('/complaints/:id/status', controller.updateComplaintStatus);
router.get('/fees', controller.getFees);
router.get('/fees/:id', controller.getFee);
router.get('/notices', controller.getNotices);
router.get('/notices/:id', controller.getNotice);
router.post('/notices', controller.addNotice);
router.put('/notices/:id', controller.updateNotice);
router.delete('/notices/:id', controller.deleteNotice);

module.exports = router;
