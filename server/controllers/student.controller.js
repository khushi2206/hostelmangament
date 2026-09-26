const pool = require('../db');

// --- Helper to get student id ---
const getStudentId = async (user_id) => {
    const [rows] = await pool.query('SELECT student_id, room_id FROM students WHERE user_id = ?', [user_id]);
    return rows[0];
};

// --- Profile ---
const getProfile = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM students WHERE user_id = ?', [req.user.user_id]);
        if(rows.length === 0) return res.status(404).json({message: 'Student profile not found'});
        res.json(rows[0]);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

const updateProfile = async (req, res) => {
    const { phone, address, emergency_contact } = req.body;
    try {
        await pool.query(
            'UPDATE students SET phone = ?, address = ?, emergency_contact = ? WHERE user_id = ?',
            [phone, address, emergency_contact, req.user.user_id]
        );
        const [rows] = await pool.query('SELECT * FROM students WHERE user_id = ?', [req.user.user_id]);
        res.json(rows[0]);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

// --- Room ---
const getRoom = async (req, res) => {
    try {
        const student = await getStudentId(req.user.user_id);
        const roomId = student?.room_id;
        if (!roomId) return res.json({ room: null, roommates: [] });

        const [roomRows] = await pool.query('SELECT * FROM rooms WHERE room_id = ?', [roomId]);
        const [roommatesRows] = await pool.query('SELECT name, enrollment_no, course FROM students WHERE room_id = ? AND user_id != ?', [roomId, req.user.user_id]);
        
        res.json({ room: roomRows[0], roommates: roommatesRows });
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

// --- Leaves ---
const getLeaves = async (req, res) => {
    try {
        const student = await getStudentId(req.user.user_id);
        const [rows] = await pool.query('SELECT * FROM leave_requests WHERE student_id = ? ORDER BY created_at DESC', [student.student_id]);
        res.json(rows);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

const submitLeave = async (req, res) => {
    const { leave_type, from_date, to_date, reason } = req.body;
    try {
        const student = await getStudentId(req.user.user_id);
        await pool.query(
            'INSERT INTO leave_requests (student_id, leave_type, from_date, to_date, reason) VALUES (?, ?, ?, ?, ?)',
            [student.student_id, leave_type, from_date, to_date, reason]
        );
        res.status(201).json({ success: true });
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

const cancelLeave = async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM leave_requests WHERE leave_id = ? AND status = 'Pending'", [req.params.id]);
        if(result.affectedRows === 0) return res.status(400).json({message: 'Cannot cancel. Leave request not found or not pending.'});
        res.json({message: 'Leave cancelled successfully'});
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

// --- Visitors ---
const getVisitors = async (req, res) => {
    try {
        const student = await getStudentId(req.user.user_id);
        const [rows] = await pool.query('SELECT * FROM visitors WHERE student_id = ? ORDER BY created_at DESC', [student.student_id]);
        res.json(rows);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

const registerVisitor = async (req, res) => {
    const { visitor_name, relation, phone, visit_date, visit_time } = req.body;
    try {
        const student = await getStudentId(req.user.user_id);
        await pool.query(
            'INSERT INTO visitors (student_id, visitor_name, relation, phone, visit_date, visit_time) VALUES (?, ?, ?, ?, ?, ?)',
            [student.student_id, visitor_name, relation, phone, visit_date, visit_time]
        );
        res.status(201).json({ success: true });
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

// --- Complaints ---
const getComplaints = async (req, res) => {
    try {
        const student = await getStudentId(req.user.user_id);
        const [rows] = await pool.query('SELECT * FROM complaints WHERE student_id = ? ORDER BY created_date DESC', [student.student_id]);
        res.json(rows);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

const submitComplaint = async (req, res) => {
    const { category, description } = req.body;
    try {
        const student = await getStudentId(req.user.user_id);
        await pool.query(
            'INSERT INTO complaints (student_id, room_id, category, description) VALUES (?, ?, ?, ?)',
            [student.student_id, student.room_id, category, description]
        );
        res.status(201).json({ success: true });
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

const getComplaintDetails = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM complaints WHERE complaint_id = ?', [req.params.id]);
        if(rows.length === 0) return res.status(404).json({message: 'Complaint not found'});
        res.json(rows[0]);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

// --- Fees ---
const getFees = async (req, res) => {
    try {
        const student = await getStudentId(req.user.user_id);
        const [rows] = await pool.query('SELECT * FROM fees WHERE student_id = ? ORDER BY payment_date DESC', [student.student_id]);
        res.json(rows);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

// --- Notices ---
const getNotices = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM notices ORDER BY created_at DESC');
        res.json(rows);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

// --- Dashboard ---
const getDashboardInfo = async (req, res) => {
    try {
        const [studentRows] = await pool.query('SELECT * FROM students WHERE user_id = ?', [req.user.user_id]);
        const student = studentRows[0];
        if(!student) return res.status(404).json({message: 'Student not found'});
        
        const [roomRows] = await pool.query('SELECT * FROM rooms WHERE room_id = ?', [student.room_id]);
        
        const [leaveRows] = await pool.query('SELECT status FROM leave_requests WHERE student_id = ? ORDER BY created_at DESC LIMIT 1', [student.student_id]);
        const [complaintRows] = await pool.query('SELECT status FROM complaints WHERE student_id = ? ORDER BY created_date DESC LIMIT 1', [student.student_id]);
        const [feeRows] = await pool.query('SELECT status, remaining_amount FROM fees WHERE student_id = ?', [student.student_id]);
        const [noticesRows] = await pool.query('SELECT title, date FROM notices ORDER BY created_at DESC LIMIT 3');

        res.json({
            student: { name: student.name },
            room: roomRows[0] ? { room_number: roomRows[0].room_number, block: roomRows[0].block, floor: roomRows[0].floor } : null,
            latestLeaveStatus: leaveRows[0]?.status || 'None',
            latestComplaintStatus: complaintRows[0]?.status || 'None',
            feeStatus: feeRows[0] ? { status: feeRows[0].status, remaining: feeRows[0].remaining_amount } : null,
            recentNotices: noticesRows
        });
    } catch(err) { console.error(err); res.status(500).json({message: 'Server error'}); }
};

// --- Mess ---
const getMessMenu = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM mess_menu ORDER BY day_of_week, meal_type');
        res.json(rows);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

const getMessOptOuts = async (req, res) => {
    try {
        const student = await getStudentId(req.user.user_id);
        const [rows] = await pool.query('SELECT * FROM mess_opt_out WHERE student_id = ? ORDER BY opt_date DESC', [student.student_id]);
        res.json(rows);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
}

const submitMessOptOut = async (req, res) => {
    const { opt_date, meal_type } = req.body;
    try {
        const student = await getStudentId(req.user.user_id);
        await pool.query(
            'INSERT INTO mess_opt_out (student_id, opt_date, meal_type) VALUES (?, ?, ?)',
            [student.student_id, opt_date, meal_type]
        );
        res.status(201).json({ success: true });
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

// --- Room Change ---
const getRoomChanges = async (req, res) => {
    try {
        const student = await getStudentId(req.user.user_id);
        const [rows] = await pool.query('SELECT * FROM room_change_requests WHERE student_id = ? ORDER BY created_at DESC', [student.student_id]);
        res.json(rows);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

const submitRoomChange = async (req, res) => {
    const { reason } = req.body;
    try {
        const student = await getStudentId(req.user.user_id);
        if(!student.room_id) return res.status(400).json({message: 'You are not assigned to a room currently.'});
        
        await pool.query(
            'INSERT INTO room_change_requests (student_id, current_room_id, reason) VALUES (?, ?, ?)',
            [student.student_id, student.room_id, reason]
        );
        res.status(201).json({ success: true });
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

// --- Lost and Found ---
const getLostAndFound = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT lf.*, s.name as student_name 
            FROM lost_and_found lf 
            JOIN students s ON lf.student_id = s.student_id 
            ORDER BY created_at DESC
        `);
        res.json(rows);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

const submitLostAndFound = async (req, res) => {
    const { type, item_name, description, location } = req.body;
    try {
        const student = await getStudentId(req.user.user_id);
        await pool.query(
            'INSERT INTO lost_and_found (student_id, type, item_name, description, location) VALUES (?, ?, ?, ?, ?)',
            [student.student_id, type, item_name, description, location]
        );
        res.status(201).json({ success: true });
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

// --- Laundry ---
const getLaundry = async (req, res) => {
    try {
        const student = await getStudentId(req.user.user_id);
        const [rows] = await pool.query('SELECT * FROM laundry_requests WHERE student_id = ? ORDER BY created_at DESC', [student.student_id]);
        res.json(rows);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

const submitLaundry = async (req, res) => {
    const { clothes_count } = req.body;
    try {
        const student = await getStudentId(req.user.user_id);
        await pool.query(
            'INSERT INTO laundry_requests (student_id, clothes_count) VALUES (?, ?)',
            [student.student_id, clothes_count]
        );
        res.status(201).json({ success: true });
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

module.exports = {
    getProfile, updateProfile, getRoom, getLeaves, submitLeave, cancelLeave,
    getVisitors, registerVisitor, getComplaints, submitComplaint, getComplaintDetails,
    getFees, getNotices, getDashboardInfo,
    getMessMenu, getMessOptOuts, submitMessOptOut,
    getRoomChanges, submitRoomChange,
    getLostAndFound, submitLostAndFound,
    getLaundry, submitLaundry
};
