const express = require('express');
const router = express.Router();
const { auth, isStudent } = require('../middleware/auth.middleware');
const {
    getProfile, updateProfile, getRoom, getLeaves, submitLeave, cancelLeave,
    getVisitors, registerVisitor, getComplaints, submitComplaint, getComplaintDetails,
    getFees, getNotices, getDashboardInfo,
    getMessMenu, getMessOptOuts, submitMessOptOut,
    getRoomChanges, submitRoomChange,
    getLostAndFound, submitLostAndFound,
    getLaundry, submitLaundry
} = require('../controllers/student.controller');

router.use(auth, isStudent);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.get('/room', getRoom);
router.get('/room-change', getRoomChanges);
router.post('/room-change', submitRoomChange);

router.get('/leaves', getLeaves);
router.post('/leaves', submitLeave);
router.delete('/leaves/:id', cancelLeave);

router.get('/visitors', getVisitors);
router.post('/visitors', registerVisitor);

router.get('/complaints', getComplaints);
router.post('/complaints', submitComplaint);
router.get('/complaints/:id', getComplaintDetails);

router.get('/fees', getFees);
router.get('/notices', getNotices);
router.get('/dashboard', getDashboardInfo);

router.get('/mess/menu', getMessMenu);
router.get('/mess/opt-out', getMessOptOuts);
router.post('/mess/opt-out', submitMessOptOut);

router.get('/lost-found', getLostAndFound);
router.post('/lost-found', submitLostAndFound);

router.get('/laundry', getLaundry);
router.post('/laundry', submitLaundry);

module.exports = router;
