const db = require('../config/db');

async function getAllStudents(filters) {
    let query = `
        SELECT s.*, u.email, r.room_number, r.block
        FROM students s
        JOIN users u ON s.user_id = u.user_id
        LEFT JOIN rooms r ON s.room_id = r.room_id
        WHERE 1 = 1`;
    const values = [];

    if (filters.search) {
        query += ' AND (s.name LIKE ? OR s.enrollment_no LIKE ?)';
        values.push('%' + filters.search + '%', '%' + filters.search + '%');
    }
    if (filters.course) {
        query += ' AND s.course = ?';
        values.push(filters.course);
    }
    if (filters.semester) {
        query += ' AND s.semester = ?';
        values.push(filters.semester);
    }
    if (filters.department) {
        query += ' AND s.department = ?';
        values.push(filters.department);
    }
    if (filters.block) {
        query += ' AND r.block = ?';
        values.push(filters.block);
    }

    query += ' ORDER BY s.name';
    const [rows] = await db.query(query, values);
    return rows;
}

async function getStudentById(studentId) {
    const [rows] = await db.query(`
        SELECT s.*, u.email, r.room_number, r.block
        FROM students s
        JOIN users u ON s.user_id = u.user_id
        LEFT JOIN rooms r ON s.room_id = r.room_id
        WHERE s.student_id = ?`, [studentId]);
    return rows[0];
}

async function findByEnrollment(enrollmentNo, studentId) {
    let query = 'SELECT student_id FROM students WHERE enrollment_no = ?';
    const values = [enrollmentNo];
    if (studentId) {
        query += ' AND student_id <> ?';
        values.push(studentId);
    }
    const [rows] = await db.query(query, values);
    return rows[0];
}

async function findUserByEmail(email, studentId) {
    let query = `SELECT u.user_id FROM users u
        LEFT JOIN students s ON s.user_id = u.user_id
        WHERE u.email = ?`;
    const values = [email];
    if (studentId) {
        query += ' AND (s.student_id IS NULL OR s.student_id <> ?)';
        values.push(studentId);
    }
    const [rows] = await db.query(query, values);
    return rows[0];
}

async function getAllRooms(filters) {
    let query = `SELECT room_id, room_number, block, floor, capacity, occupied, created_at,
        (capacity - occupied) AS available_beds,
        CASE WHEN occupied < capacity THEN 'Available' ELSE 'Full' END AS status
        FROM rooms WHERE 1 = 1`;
    const values = [];
    if (filters.search) {
        query += ' AND room_number LIKE ?';
        values.push('%' + filters.search + '%');
    }
    if (filters.block) {
        query += ' AND block = ?';
        values.push(filters.block);
    }
    if (filters.floor) {
        query += ' AND floor = ?';
        values.push(filters.floor);
    }
    if (filters.status === 'Available') query += ' AND occupied < capacity';
    if (filters.status === 'Full') query += ' AND occupied >= capacity';
    query += ' ORDER BY block, floor, room_number';
    const [rows] = await db.query(query, values);
    return rows;
}

async function getRoomById(roomId) {
    const [rows] = await db.query(`SELECT room_id, room_number, block, floor, capacity, occupied, created_at,
        (capacity - occupied) AS available_beds,
        CASE WHEN occupied < capacity THEN 'Available' ELSE 'Full' END AS status
        FROM rooms WHERE room_id = ?`, [roomId]);
    return rows[0];
}

async function findRoom(roomNumber, block, roomId) {
    let query = 'SELECT room_id FROM rooms WHERE room_number = ? AND block = ?';
    const values = [roomNumber, block];
    if (roomId) {
        query += ' AND room_id <> ?';
        values.push(roomId);
    }
    const [rows] = await db.query(query, values);
    return rows[0];
}

async function getAllocationStudents(search) {
    let query = `SELECT s.student_id, s.name, s.enrollment_no, s.course, s.room_id, s.bed_label,
        r.room_number, r.block
        FROM students s
        LEFT JOIN rooms r ON s.room_id = r.room_id
        WHERE 1 = 1`;
    const values = [];
    if (search) {
        query += ' AND (s.name LIKE ? OR s.enrollment_no LIKE ?)';
        values.push('%' + search + '%', '%' + search + '%');
    }
    query += ' ORDER BY s.name LIMIT 50';
    const [rows] = await db.query(query, values);
    return rows;
}

async function getAvailableAllocationRooms() {
    const [rows] = await db.query(`SELECT room_id, room_number, block, floor, capacity, occupied,
        (capacity - occupied) AS available_beds,
        (SELECT GROUP_CONCAT(bed_label) FROM students WHERE students.room_id = rooms.room_id AND bed_label IS NOT NULL) AS occupied_beds
        FROM rooms WHERE occupied < capacity ORDER BY block, floor, room_number`);
    return rows;
}

async function getAllLeaves(filters) {
    let query = `SELECT l.leave_id, l.student_id, s.name AS student_name, s.enrollment_no,
        l.leave_type, l.from_date, l.to_date, l.reason, l.status, l.admin_comment,
        l.created_at, l.updated_at
        FROM leave_requests l
        JOIN students s ON s.student_id = l.student_id
        WHERE 1 = 1`;
    const values = [];
    if (filters.search) {
        query += ' AND (s.name LIKE ? OR s.enrollment_no LIKE ?)';
        values.push('%' + filters.search + '%', '%' + filters.search + '%');
    }
    if (filters.status) {
        query += ' AND l.status = ?';
        values.push(filters.status);
    }
    if (filters.leave_type) {
        query += ' AND l.leave_type = ?';
        values.push(filters.leave_type);
    }
    if (filters.date) {
        query += ' AND l.from_date <= ? AND l.to_date >= ?';
        values.push(filters.date, filters.date);
    }
    query += ' ORDER BY l.created_at DESC';
    const [rows] = await db.query(query, values);
    return rows;
}

async function getStudentByUserId(userId) {
    const [rows] = await db.query(`
        SELECT s.*, u.email, r.room_number, r.block
        FROM students s
        JOIN users u ON s.user_id = u.user_id
        LEFT JOIN rooms r ON s.room_id = r.room_id
        WHERE s.user_id = ?`, [userId]);
    return rows[0];
}

async function getLeavesByStudentId(studentId) {
    const [rows] = await db.query(`SELECT leave_id, student_id, leave_type, from_date, to_date, reason, status, admin_comment, created_at, updated_at
        FROM leave_requests WHERE student_id = ? ORDER BY created_at DESC`, [studentId]);
    return rows;
}

async function createLeaveRequest(studentId, data) {
    const [result] = await db.query(`INSERT INTO leave_requests (student_id, leave_type, from_date, to_date, reason, status)
        VALUES (?, ?, ?, ?, ?, 'Pending')`, [studentId, data.leave_type, data.from_date, data.to_date, data.reason]);
    return result.insertId;
}

async function createVisitor(data) {
    const status = data.status || 'Approved';
    const [result] = await db.query(`INSERT INTO visitors (student_id, visitor_name, relation, phone, visit_date, visit_time, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)`, [
        data.student_id,
        data.visitor_name,
        data.relation || null,
        data.phone || null,
        data.visit_date,
        data.visit_time,
        status
    ]);
    return result.insertId;
}

async function getLeaveById(leaveId) {
    const [rows] = await db.query(`SELECT l.leave_id, l.student_id, s.name AS student_name, s.enrollment_no,
        l.leave_type, l.from_date, l.to_date, l.reason, l.status, l.admin_comment,
        l.created_at, l.updated_at
        FROM leave_requests l
        JOIN students s ON s.student_id = l.student_id
        WHERE l.leave_id = ?`, [leaveId]);
    return rows[0];
}

async function getAllVisitors(filters) {
    let query = `SELECT v.visitor_id, v.student_id, v.visitor_name, v.relation, v.phone,
        v.visit_date, v.visit_time, v.status, v.created_at,
        s.name AS student_name, s.enrollment_no, r.room_number, r.block
        FROM visitors v
        JOIN students s ON s.student_id = v.student_id
        LEFT JOIN rooms r ON r.room_id = s.room_id
        WHERE 1 = 1`;
    const values = [];
    if (filters.search) {
        query += ' AND (v.visitor_name LIKE ? OR s.name LIKE ? OR s.enrollment_no LIKE ?)';
        values.push('%' + filters.search + '%', '%' + filters.search + '%', '%' + filters.search + '%');
    }
    if (filters.status) {
        query += ' AND v.status = ?';
        values.push(filters.status);
    }
    if (filters.date) {
        query += ' AND v.visit_date = ?';
        values.push(filters.date);
    }
    query += ' ORDER BY v.visit_date DESC, v.visit_time DESC, v.created_at DESC';
    const [rows] = await db.query(query, values);
    return rows;
}

async function getVisitorById(visitorId) {
    const [rows] = await db.query(`SELECT v.visitor_id, v.student_id, v.visitor_name, v.relation, v.phone,
        v.visit_date, v.visit_time, v.status, v.created_at,
        s.name AS student_name, s.enrollment_no, r.room_number, r.block
        FROM visitors v
        JOIN students s ON s.student_id = v.student_id
        LEFT JOIN rooms r ON r.room_id = s.room_id
        WHERE v.visitor_id = ?`, [visitorId]);
    return rows[0];
}

async function getAllComplaints(filters) {
    let query = `SELECT c.complaint_id, c.student_id, s.name AS student_name,
        s.enrollment_no, u.email, c.room_id, r.room_number, r.block,
        c.category, c.description, c.status, c.created_date, c.updated_at
        FROM complaints c
        JOIN students s ON s.student_id = c.student_id
        JOIN users u ON u.user_id = s.user_id
        LEFT JOIN rooms r ON r.room_id = c.room_id
        WHERE 1 = 1`;
    const values = [];
    if (filters.search) {
        query += ' AND (s.name LIKE ? OR s.enrollment_no LIKE ?)';
        values.push('%' + filters.search + '%', '%' + filters.search + '%');
    }
    if (filters.category) {
        query += ' AND c.category = ?';
        values.push(filters.category);
    }
    if (filters.status) {
        query += ' AND c.status = ?';
        values.push(filters.status);
    }
    query += ' ORDER BY c.created_date DESC';
    const [rows] = await db.query(query, values);
    return rows;
}

async function getComplaintById(complaintId) {
    const [rows] = await db.query(`SELECT c.complaint_id, c.student_id, s.name AS student_name,
        s.enrollment_no, u.email, c.room_id, r.room_number, r.block,
        c.category, c.description, c.status, c.created_date, c.updated_at
        FROM complaints c
        JOIN students s ON s.student_id = c.student_id
        JOIN users u ON u.user_id = s.user_id
        LEFT JOIN rooms r ON r.room_id = c.room_id
        WHERE c.complaint_id = ?`, [complaintId]);
    return rows[0];
}

async function updateComplaintStatus(complaintId, status) {
    const [result] = await db.query('UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE complaint_id = ?', [status, complaintId]);
    return result.affectedRows;
}

async function getAllFees() {
    const [rows] = await db.query(`SELECT f.*, s.name AS student_name, s.enrollment_no,
        u.email, r.room_number, r.block
        FROM fees f
        JOIN students s ON s.student_id = f.student_id
        JOIN users u ON u.user_id = s.user_id
        LEFT JOIN rooms r ON r.room_id = s.room_id
        ORDER BY f.created_at DESC`);
    return rows;
}

async function getFeeById(feeId) {
    const [rows] = await db.query(`SELECT f.*, s.name AS student_name, s.enrollment_no,
        u.email, r.room_number, r.block
        FROM fees f
        JOIN students s ON s.student_id = f.student_id
        JOIN users u ON u.user_id = s.user_id
        LEFT JOIN rooms r ON r.room_id = s.room_id
        WHERE f.fee_id = ?`, [feeId]);
    return rows[0];
}

async function getAllNotices() {
    const [rows] = await db.query(`SELECT notice_id, title, description, created_at, updated_at
        FROM notices ORDER BY created_at DESC`);
    return rows;
}

async function getNoticeById(noticeId) {
    const [rows] = await db.query(`SELECT notice_id, title, description, created_at, updated_at
        FROM notices WHERE notice_id = ?`, [noticeId]);
    return rows[0];
}

async function addNotice(data) {
    const [result] = await db.query('INSERT INTO notices (title, description) VALUES (?, ?)', [data.title, data.description]);
    return result.insertId;
}

async function updateNotice(noticeId, data) {
    const [result] = await db.query('UPDATE notices SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE notice_id = ?', [data.title, data.description, noticeId]);
    return result.affectedRows;
}

async function deleteNotice(noticeId) {
    const [result] = await db.query('DELETE FROM notices WHERE notice_id = ?', [noticeId]);
    return result.affectedRows;
}

async function optionalCount(query, values) {
    try {
        const [rows] = await db.query(query, values || []);
        return rows[0];
    } catch (error) {
        if (error.code === 'ER_NO_SUCH_TABLE') return null;
        throw error;
    }
}

async function getDashboardStats() {
    const [studentRows] = await db.query('SELECT COUNT(*) AS total FROM students');
    const [roomRows] = await db.query(`SELECT COUNT(*) AS total_rooms,
        SUM(CASE WHEN occupied > 0 THEN 1 ELSE 0 END) AS occupied_rooms,
        SUM(capacity) AS total_capacity, SUM(occupied) AS occupied_beds
        FROM rooms`);
    const [leaveRows] = await db.query("SELECT COUNT(*) AS pending FROM leave_requests WHERE status = 'Pending'");
    const [visitorRows] = await db.query("SELECT COUNT(*) AS pending, SUM(CASE WHEN visit_date = CURDATE() THEN 1 ELSE 0 END) AS today FROM visitors WHERE status = 'Pending' OR visit_date = CURDATE()");
    const complaintRows = await optionalCount(`SELECT
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved
        FROM complaints`);
    const noticeRows = await optionalCount('SELECT COUNT(*) AS total, MAX(created_at) AS latest_date FROM notices');

    let feeStats = { total: 0, paid: 0, partial: 0, due: 0 };
    try {
        const [feeRows] = await db.query('SELECT * FROM fees');
        if (feeRows) {
            let paid = 0, partial = 0, due = 0;
            feeRows.forEach(fee => {
                const totalValue = fee.amount !== undefined ? fee.amount : fee.total_amount !== undefined ? fee.total_amount : fee.total_fee;
                const paidValue = fee.paid !== undefined ? fee.paid : fee.paid_amount;
                const totalAmount = Number(totalValue);
                const paidAmount = Number(paidValue);
                const hasAmounts = Number.isFinite(totalAmount) && Number.isFinite(paidAmount);
                const safeTotal = hasAmounts ? Math.max(0, totalAmount) : 0;
                const safePaid = hasAmounts ? Math.max(0, paidAmount) : 0;
                const status = fee.status || fee.fee_status || (!hasAmounts || safePaid === 0 ? 'Due' : safePaid >= safeTotal ? 'Paid' : 'Partial');
                if (status === 'Paid') paid++;
                else if (status === 'Partial') partial++;
                else due++;
            });
            feeStats = { total: feeRows.length, paid, partial, due };
        }
    } catch (error) {
        if (error.code !== 'ER_NO_SUCH_TABLE') throw error;
    }

    let recentComplaints = [];
    try {
        const [rows] = await db.query(`SELECT c.complaint_id, c.student_id, s.name AS student_name,
            s.enrollment_no, u.email, c.room_id, r.room_number, r.block,
            c.category, c.description, c.status, c.created_date, c.updated_at
            FROM complaints c
            JOIN students s ON s.student_id = c.student_id
            JOIN users u ON u.user_id = s.user_id
            LEFT JOIN rooms r ON r.room_id = c.room_id
            ORDER BY c.created_date DESC LIMIT 5`);
        recentComplaints = rows;
    } catch (error) {
        if (error.code !== 'ER_NO_SUCH_TABLE') throw error;
    }

    let recentNotices = [];
    try {
        const [rows] = await db.query(`SELECT notice_id, title, description, created_at, updated_at
            FROM notices ORDER BY created_at DESC LIMIT 5`);
        recentNotices = rows;
    } catch (error) {
        if (error.code !== 'ER_NO_SUCH_TABLE') throw error;
    }

    const studentTotal = Number(studentRows[0]?.total || 0);
    const totalRooms = Number(roomRows[0]?.total_rooms || 0);
    const occupiedRooms = Number(roomRows[0]?.occupied_rooms || 0);
    const totalCapacity = Number(roomRows[0]?.total_capacity || 0);
    const occupiedBeds = Number(roomRows[0]?.occupied_beds || 0);
    const availableBeds = Math.max(0, totalCapacity - occupiedBeds);
    const availableRooms = Math.max(0, totalRooms - occupiedRooms);

    const pendingComplaints = Number(complaintRows?.pending || 0);
    const inProgressComplaints = Number(complaintRows?.in_progress || 0);
    const resolvedComplaints = Number(complaintRows?.resolved || 0);

    return {
        students: { total: studentTotal, active: studentTotal },
        rooms: {
            total: totalRooms,
            occupied: occupiedRooms,
            available: availableRooms,
            totalCapacity: totalCapacity,
            occupiedBeds: occupiedBeds,
            availableBeds: availableBeds
        },
        leaves: { pending: Number(leaveRows[0]?.pending || 0) },
        visitors: { pending: Number(visitorRows[0]?.pending || 0), today: Number(visitorRows[0]?.today || 0) },
        complaints: {
            pending: pendingComplaints,
            inProgress: inProgressComplaints,
            resolved: resolvedComplaints
        },
        fees: feeStats,
        notices: {
            total: Number(noticeRows?.total || 0),
            latestDate: noticeRows?.latest_date || null
        },
        recentComplaints: recentComplaints,
        recentNotices: recentNotices
    };
}

module.exports = { getAllStudents, getStudentById, getStudentByUserId, findByEnrollment, findUserByEmail, getAllRooms, getRoomById, findRoom, getAllocationStudents, getAvailableAllocationRooms, getAllLeaves, getLeaveById, getLeavesByStudentId, createLeaveRequest, getAllVisitors, getVisitorById, createVisitor, getAllComplaints, getComplaintById, updateComplaintStatus, getAllFees, getFeeById, getAllNotices, getNoticeById, addNotice, updateNotice, deleteNotice, getDashboardStats };
