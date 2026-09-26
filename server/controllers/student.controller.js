const pool = require('../db');

// --- Profile ---
const getProfile = async (req, res) => {
    try {
        const studentQuery = await pool.query('SELECT * FROM students WHERE user_id = $1', [req.user.user_id]);
        if(studentQuery.rows.length === 0) return res.status(404).json({message: 'Student profile not found'});
        res.json(studentQuery.rows[0]);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

const updateProfile = async (req, res) => {
    const { phone, address, emergency_contact } = req.body;
    try {
        const result = await pool.query(
            'UPDATE students SET phone = $1, address = $2, emergency_contact = $3 WHERE user_id = $4 RETURNING *',
            [phone, address, emergency_contact, req.user.user_id]
        );
        res.json(result.rows[0]);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

// --- Room ---
const getRoom = async (req, res) => {
    try {
        const studentQuery = await pool.query('SELECT room_id FROM students WHERE user_id = $1', [req.user.user_id]);
        const roomId = studentQuery.rows[0]?.room_id;
        if (!roomId) return res.json({ room: null, roommates: [] });

        const roomQuery = await pool.query('SELECT * FROM rooms WHERE room_id = $1', [roomId]);
        const roommatesQuery = await pool.query('SELECT name, enrollment_no, course FROM students WHERE room_id = $1 AND user_id != $2', [roomId, req.user.user_id]);
        
        res.json({ room: roomQuery.rows[0], roommates: roommatesQuery.rows });
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

// --- Leaves ---
const getLeaves = async (req, res) => {
    try {
        const studentQuery = await pool.query('SELECT student_id FROM students WHERE user_id = $1', [req.user.user_id]);
        const studentId = studentQuery.rows[0].student_id;
        const result = await pool.query('SELECT * FROM leave_requests WHERE student_id = $1 ORDER BY created_at DESC', [studentId]);
        res.json(result.rows);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

const submitLeave = async (req, res) => {
    const { leave_type, from_date, to_date, reason } = req.body;
    try {
        const studentQuery = await pool.query('SELECT student_id FROM students WHERE user_id = $1', [req.user.user_id]);
        const studentId = studentQuery.rows[0].student_id;
        const result = await pool.query(
            'INSERT INTO leave_requests (student_id, leave_type, from_date, to_date, reason) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [studentId, leave_type, from_date, to_date, reason]
        );
        res.status(201).json(result.rows[0]);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

const cancelLeave = async (req, res) => {
    try {
        const result = await pool.query("DELETE FROM leave_requests WHERE leave_id = $1 AND status = 'Pending' RETURNING *", [req.params.id]);
        if(result.rows.length === 0) return res.status(400).json({message: 'Cannot cancel. Leave request not found or not pending.'});
        res.json({message: 'Leave cancelled successfully'});
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

// --- Visitors ---
const getVisitors = async (req, res) => {
    try {
        const studentQuery = await pool.query('SELECT student_id FROM students WHERE user_id = $1', [req.user.user_id]);
        const studentId = studentQuery.rows[0].student_id;
        const result = await pool.query('SELECT * FROM visitors WHERE student_id = $1 ORDER BY created_at DESC', [studentId]);
        res.json(result.rows);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

const registerVisitor = async (req, res) => {
    const { visitor_name, relation, phone, visit_date, visit_time } = req.body;
    try {
        const studentQuery = await pool.query('SELECT student_id FROM students WHERE user_id = $1', [req.user.user_id]);
        const studentId = studentQuery.rows[0].student_id;
        const result = await pool.query(
            'INSERT INTO visitors (student_id, visitor_name, relation, phone, visit_date, visit_time) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [studentId, visitor_name, relation, phone, visit_date, visit_time]
        );
        res.status(201).json(result.rows[0]);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

// --- Complaints ---
const getComplaints = async (req, res) => {
    try {
        const studentQuery = await pool.query('SELECT student_id FROM students WHERE user_id = $1', [req.user.user_id]);
        const studentId = studentQuery.rows[0].student_id;
        const result = await pool.query('SELECT * FROM complaints WHERE student_id = $1 ORDER BY created_date DESC', [studentId]);
        res.json(result.rows);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

const submitComplaint = async (req, res) => {
    const { category, description } = req.body;
    try {
        const studentQuery = await pool.query('SELECT student_id, room_id FROM students WHERE user_id = $1', [req.user.user_id]);
        const { student_id, room_id } = studentQuery.rows[0];
        const result = await pool.query(
            'INSERT INTO complaints (student_id, room_id, category, description) VALUES ($1, $2, $3, $4) RETURNING *',
            [student_id, room_id, category, description]
        );
        res.status(201).json(result.rows[0]);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

const getComplaintDetails = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM complaints WHERE complaint_id = $1', [req.params.id]);
        if(result.rows.length === 0) return res.status(404).json({message: 'Complaint not found'});
        res.json(result.rows[0]);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

// --- Fees ---
const getFees = async (req, res) => {
    try {
        const studentQuery = await pool.query('SELECT student_id FROM students WHERE user_id = $1', [req.user.user_id]);
        const studentId = studentQuery.rows[0].student_id;
        const result = await pool.query('SELECT * FROM fees WHERE student_id = $1 ORDER BY payment_date DESC', [studentId]);
        res.json(result.rows);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

// --- Notices ---
const getNotices = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM notices ORDER BY created_at DESC');
        res.json(result.rows);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

// --- Dashboard ---
const getDashboardInfo = async (req, res) => {
    try {
        const studentQuery = await pool.query('SELECT * FROM students WHERE user_id = $1', [req.user.user_id]);
        const student = studentQuery.rows[0];
        if(!student) return res.status(404).json({message: 'Student not found'});
        
        const roomQuery = await pool.query('SELECT * FROM rooms WHERE room_id = $1', [student.room_id]);
        
        const leaveQuery = await pool.query('SELECT status FROM leave_requests WHERE student_id = $1 ORDER BY created_at DESC LIMIT 1', [student.student_id]);
        const complaintQuery = await pool.query('SELECT status FROM complaints WHERE student_id = $1 ORDER BY created_date DESC LIMIT 1', [student.student_id]);
        const feeQuery = await pool.query('SELECT status, remaining_amount FROM fees WHERE student_id = $1', [student.student_id]);
        const noticesQuery = await pool.query('SELECT title, date FROM notices ORDER BY created_at DESC LIMIT 3');

        res.json({
            student: { name: student.name },
            room: roomQuery.rows[0] ? { room_number: roomQuery.rows[0].room_number, block: roomQuery.rows[0].block, floor: roomQuery.rows[0].floor } : null,
            latestLeaveStatus: leaveQuery.rows[0]?.status || 'None',
            latestComplaintStatus: complaintQuery.rows[0]?.status || 'None',
            feeStatus: feeQuery.rows[0] ? { status: feeQuery.rows[0].status, remaining: feeQuery.rows[0].remaining_amount } : null,
            recentNotices: noticesQuery.rows
        });
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};


// --- Mess ---
const getMessMenu = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM mess_menu ORDER BY day_of_week, meal_type');
        res.json(result.rows);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

const getMessOptOuts = async (req, res) => {
    try {
        const studentQuery = await pool.query('SELECT student_id FROM students WHERE user_id = $1', [req.user.user_id]);
        const studentId = studentQuery.rows[0].student_id;
        const result = await pool.query('SELECT * FROM mess_opt_out WHERE student_id = $1 ORDER BY opt_date DESC', [studentId]);
        res.json(result.rows);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
}

const submitMessOptOut = async (req, res) => {
    const { opt_date, meal_type } = req.body;
    try {
        const studentQuery = await pool.query('SELECT student_id FROM students WHERE user_id = $1', [req.user.user_id]);
        const studentId = studentQuery.rows[0].student_id;
        const result = await pool.query(
            'INSERT INTO mess_opt_out (student_id, opt_date, meal_type) VALUES ($1, $2, $3) RETURNING *',
            [studentId, opt_date, meal_type]
        );
        res.status(201).json(result.rows[0]);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

// --- Room Change ---
const getRoomChanges = async (req, res) => {
    try {
        const studentQuery = await pool.query('SELECT student_id FROM students WHERE user_id = $1', [req.user.user_id]);
        const studentId = studentQuery.rows[0].student_id;
        const result = await pool.query('SELECT * FROM room_change_requests WHERE student_id = $1 ORDER BY created_at DESC', [studentId]);
        res.json(result.rows);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

const submitRoomChange = async (req, res) => {
    const { reason } = req.body;
    try {
        const studentQuery = await pool.query('SELECT student_id, room_id FROM students WHERE user_id = $1', [req.user.user_id]);
        const { student_id, room_id } = studentQuery.rows[0];
        if(!room_id) return res.status(400).json({message: 'You are not assigned to a room currently.'});
        
        const result = await pool.query(
            'INSERT INTO room_change_requests (student_id, current_room_id, reason) VALUES ($1, $2, $3) RETURNING *',
            [student_id, room_id, reason]
        );
        res.status(201).json(result.rows[0]);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

// --- Lost and Found ---
const getLostAndFound = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT lf.*, s.name as student_name 
            FROM lost_and_found lf 
            JOIN students s ON lf.student_id = s.student_id 
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

const submitLostAndFound = async (req, res) => {
    const { type, item_name, description, location } = req.body;
    try {
        const studentQuery = await pool.query('SELECT student_id FROM students WHERE user_id = $1', [req.user.user_id]);
        const studentId = studentQuery.rows[0].student_id;
        const result = await pool.query(
            'INSERT INTO lost_and_found (student_id, type, item_name, description, location) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [studentId, type, item_name, description, location]
        );
        res.status(201).json(result.rows[0]);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

// --- Laundry ---
const getLaundry = async (req, res) => {
    try {
        const studentQuery = await pool.query('SELECT student_id FROM students WHERE user_id = $1', [req.user.user_id]);
        const studentId = studentQuery.rows[0].student_id;
        const result = await pool.query('SELECT * FROM laundry_requests WHERE student_id = $1 ORDER BY created_at DESC', [studentId]);
        res.json(result.rows);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};

const submitLaundry = async (req, res) => {
    const { clothes_count } = req.body;
    try {
        const studentQuery = await pool.query('SELECT student_id FROM students WHERE user_id = $1', [req.user.user_id]);
        const studentId = studentQuery.rows[0].student_id;
        const result = await pool.query(
            'INSERT INTO laundry_requests (student_id, clothes_count) VALUES ($1, $2) RETURNING *',
            [studentId, clothes_count]
        );
        res.status(201).json(result.rows[0]);
    } catch(err) { res.status(500).json({message: 'Server error'}); }
};
module.exports = {
    getMessMenu, getMessOptOuts, submitMessOptOut,
    getRoomChanges, submitRoomChange,
    getLostAndFound, submitLostAndFound,
    getLaundry, submitLaundry,
    getProfile, updateProfile, getRoom, getLeaves, submitLeave, cancelLeave,
    getVisitors, registerVisitor, getComplaints, submitComplaint, getComplaintDetails,
    getFees, getNotices, getDashboardInfo
};

