const studentModel = require('../models/student.model');
const db = require('../config/db');

function isValidDate(dateValue) {
	return typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue) && !Number.isNaN(Date.parse(dateValue));
}

const allowedLeaveTypes = ['Outing', 'Home Leave'];

/* ── Profile ─────────────────────────────────────────────────────────────── */
async function getProfile(req, res) {
	try {
		const profile = await studentModel.getStudentByUserId(req.user.user_id);
		if (!profile) return res.status(404).json({ message: 'Student profile not found' });
		res.json(profile);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to load profile' });
	}
}

async function updateProfile(req, res) {
	try {
		const profile = await studentModel.getStudentByUserId(req.user.user_id);
		if (!profile) return res.status(404).json({ message: 'Student profile not found' });
		const { phone, address, emergency_contact } = req.body;
		await db.query(
			'UPDATE students SET phone = ?, address = ?, emergency_contact = ? WHERE student_id = ?',
			[phone || null, address || null, emergency_contact || null, profile.student_id]
		);
		const updated = await studentModel.getStudentByUserId(req.user.user_id);
		res.json(updated);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to update profile' });
	}
}

/* ── Dashboard ──────────────────────────────────────────────────────────── */
async function getDashboard(req, res) {
	try {
		const profile = await studentModel.getStudentByUserId(req.user.user_id);
		if (!profile) return res.status(404).json({ message: 'Student profile not found' });

		// Room info
		let room = null;
		if (profile.room_id) {
			const [roomRows] = await db.query(
				'SELECT room_id, room_number, block, floor, capacity, occupied FROM rooms WHERE room_id = ?',
				[profile.room_id]
			);
			room = roomRows[0] || null;
		}

		// Latest leave status
		const [leaveRows] = await db.query(
			'SELECT status FROM leave_requests WHERE student_id = ? ORDER BY created_at DESC LIMIT 1',
			[profile.student_id]
		);
		const latestLeaveStatus = leaveRows[0]?.status || null;

		// Fee status
		const [feeRows] = await db.query(
			"SELECT CASE WHEN paid >= amount THEN 'Paid' WHEN paid > 0 THEN 'Partial' ELSE 'Due' END AS status, amount, paid AS paid_amount, GREATEST(amount - paid, 0) AS remaining_amount FROM fees WHERE student_id = ? ORDER BY created_at DESC LIMIT 1",
			[profile.student_id]
		).catch(() => [[]]);
		const feeStatus = feeRows[0] ? {
			status: feeRows[0].status,
			remaining: feeRows[0].remaining_amount
		} : null;

		// Recent notices
		const [noticeRows] = await db.query(
			'SELECT notice_id, title, description, created_at FROM notices ORDER BY created_at DESC LIMIT 5'
		);

		res.json({
			student: profile,
			room,
			latestLeaveStatus,
			feeStatus,
			recentNotices: noticeRows
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to load dashboard' });
	}
}

/* ── Leaves ─────────────────────────────────────────────────────────────── */
async function getLeaves(req, res) {
	try {
		const profile = await studentModel.getStudentByUserId(req.user.user_id);
		if (!profile) return res.status(404).json({ message: 'Student profile not found' });
		res.json(await studentModel.getLeavesByStudentId(profile.student_id));
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to load leave requests' });
	}
}

async function createLeave(req, res) {
	try {
		const profile = await studentModel.getStudentByUserId(req.user.user_id);
		if (!profile) return res.status(404).json({ message: 'Student profile not found' });

		const leaveType = typeof req.body.leave_type === 'string' ? req.body.leave_type.trim() : '';
		const fromDate = req.body.from_date;
		const toDate = req.body.to_date;
		const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : '';

		if (!allowedLeaveTypes.includes(leaveType)) return res.status(400).json({ message: 'Invalid leave type' });
		if (!isValidDate(fromDate) || !isValidDate(toDate)) return res.status(400).json({ message: 'Valid from and to dates are required' });
		if (fromDate > toDate) return res.status(400).json({ message: 'To date cannot be before from date' });
		if (!reason || reason.length < 5) return res.status(400).json({ message: 'Reason must be at least 5 characters' });

		const leaveId = await studentModel.createLeaveRequest(profile.student_id, {
			leave_type: leaveType, from_date: fromDate, to_date: toDate, reason
		});
		res.status(201).json({
			message: 'Leave request submitted successfully. Awaiting admin approval.',
			leave: await studentModel.getLeaveById(leaveId)
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to submit leave request' });
	}
}

async function deleteLeave(req, res) {
	try {
		const profile = await studentModel.getStudentByUserId(req.user.user_id);
		if (!profile) return res.status(404).json({ message: 'Student profile not found' });
		const [rows] = await db.query(
			"SELECT leave_id, status FROM leave_requests WHERE leave_id = ? AND student_id = ?",
			[req.params.id, profile.student_id]
		);
		if (!rows[0]) return res.status(404).json({ message: 'Leave request not found' });
		if (rows[0].status !== 'Pending') return res.status(400).json({ message: 'Only pending leaves can be cancelled' });
		await db.query('DELETE FROM leave_requests WHERE leave_id = ?', [req.params.id]);
		res.json({ message: 'Leave request cancelled' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to cancel leave request' });
	}
}

/* ── Visitors ───────────────────────────────────────────────────────────── */
async function getStudentVisitors(req, res) {
	try {
		const profile = await studentModel.getStudentByUserId(req.user.user_id);
		if (!profile) return res.status(404).json({ message: 'Student profile not found' });
		const [rows] = await db.query(
			'SELECT * FROM visitors WHERE student_id = ? ORDER BY visit_date DESC, created_at DESC',
			[profile.student_id]
		);
		res.json(rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to load visitors' });
	}
}

async function createStudentVisitor(req, res) {
	try {
		const profile = await studentModel.getStudentByUserId(req.user.user_id);
		if (!profile) return res.status(404).json({ message: 'Student profile not found' });
		const { visitor_name, relation, phone, visit_date, visit_time } = req.body;
		if (!visitor_name || !visit_date || !visit_time) {
			return res.status(400).json({ message: 'Visitor name, date, and time are required' });
		}
		const visitorId = await studentModel.createVisitor({
			student_id: profile.student_id, visitor_name, relation, phone, visit_date, visit_time, status: 'Pending'
		});
		res.status(201).json({ message: 'Visitor registered successfully', visitor_id: visitorId });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to register visitor' });
	}
}

/* ── Complaints ─────────────────────────────────────────────────────────── */
async function getStudentComplaints(req, res) {
	try {
		const profile = await studentModel.getStudentByUserId(req.user.user_id);
		if (!profile) return res.status(404).json({ message: 'Student profile not found' });
		const [rows] = await db.query(
			'SELECT complaint_id, category, description, status, created_date, updated_at FROM complaints WHERE student_id = ? ORDER BY created_date DESC',
			[profile.student_id]
		);
		res.json(rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to load complaints' });
	}
}

async function createStudentComplaint(req, res) {
	try {
		const profile = await studentModel.getStudentByUserId(req.user.user_id);
		if (!profile) return res.status(404).json({ message: 'Student profile not found' });
		const { category, description } = req.body;
		if (!category || !description) return res.status(400).json({ message: 'Category and description are required' });
		const [result] = await db.query(
			"INSERT INTO complaints (student_id, room_id, category, description, status, created_date) VALUES (?, ?, ?, ?, 'Pending', CURDATE())",
			[profile.student_id, profile.room_id || null, category, description]
		);
		res.status(201).json({ message: 'Complaint submitted successfully', complaint_id: result.insertId });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to submit complaint' });
	}
}

/* ── Room ───────────────────────────────────────────────────────────────── */
async function getStudentRoom(req, res) {
	try {
		const profile = await studentModel.getStudentByUserId(req.user.user_id);
		if (!profile) return res.status(404).json({ message: 'Student profile not found' });
		if (!profile.room_id) return res.json({ room: null, roommates: [] });
		const [roomRows] = await db.query(
			'SELECT room_id, room_number, block, floor, capacity, occupied FROM rooms WHERE room_id = ?',
			[profile.room_id]
		);
		const [roommateRows] = await db.query(
			'SELECT name, enrollment_no, course FROM students WHERE room_id = ? AND student_id != ? ORDER BY name',
			[profile.room_id, profile.student_id]
		);
		res.json({ room: roomRows[0] || null, roommates: roommateRows });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to load room information' });
	}
}

async function getRoomChangeRequests(req, res) {
	try {
		const profile = await studentModel.getStudentByUserId(req.user.user_id);
		if (!profile) return res.status(404).json({ message: 'Student profile not found' });
		let rows = [];
		try {
			[rows] = await db.query(
				'SELECT request_id, reason, status, created_at FROM room_change_requests WHERE student_id = ? ORDER BY created_at DESC',
				[profile.student_id]
			);
		} catch (err) {
			if (err.code !== 'ER_NO_SUCH_TABLE') throw err;
		}
		res.json(rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to load room change requests' });
	}
}

async function createRoomChangeRequest(req, res) {
	try {
		const profile = await studentModel.getStudentByUserId(req.user.user_id);
		if (!profile) return res.status(404).json({ message: 'Student profile not found' });
		const { reason } = req.body;
		if (!reason) return res.status(400).json({ message: 'Reason is required' });
		try {
			const [result] = await db.query(
				"INSERT INTO room_change_requests (student_id, reason, status) VALUES (?, ?, 'Pending')",
				[profile.student_id, reason]
			);
			res.status(201).json({ message: 'Room change request submitted', request_id: result.insertId });
		} catch (err) {
			if (err.code === 'ER_NO_SUCH_TABLE') {
				return res.status(201).json({ message: 'Room change request noted (feature coming soon)' });
			}
			throw err;
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to submit room change request' });
	}
}

/* ── Fees ───────────────────────────────────────────────────────────────── */
async function getStudentFees(req, res) {
	try {
		const profile = await studentModel.getStudentByUserId(req.user.user_id);
		if (!profile) return res.status(404).json({ message: 'Student profile not found' });
		let rows = [];
		try {
			[rows] = await db.query(
				"SELECT fee_id, amount, paid AS paid_amount, GREATEST(amount - paid, 0) AS remaining_amount, NULL AS payment_date, CASE WHEN paid >= amount THEN 'Paid' WHEN paid > 0 THEN 'Partial' ELSE 'Due' END AS status FROM fees WHERE student_id = ? ORDER BY created_at DESC",
				[profile.student_id]
			);
		} catch (err) {
			if (err.code !== 'ER_NO_SUCH_TABLE') throw err;
		}
		res.json(rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to load fee records' });
	}
}

/* ── Notices ────────────────────────────────────────────────────────────── */
async function getStudentNotices(req, res) {
	try {
		const notices = await studentModel.getAllNotices();
		res.json(notices);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to load notices' });
	}
}

/* ── Mess Menu ──────────────────────────────────────────────────────────── */
async function getMessMenu(req, res) {
	try {
		let rows = [];
		try {
			[rows] = await db.query(`SELECT * FROM mess_menu
				ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), meal_type`);
		} catch (err) {
			if (err.code !== 'ER_NO_SUCH_TABLE') throw err;
		}
		res.json(rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to load mess menu' });
	}
}

async function getMessOptOuts(req, res) {
	try {
		const profile = await studentModel.getStudentByUserId(req.user.user_id);
		if (!profile) return res.status(404).json({ message: 'Student profile not found' });
		let rows = [];
		try {
			[rows] = await db.query(
				'SELECT opt_id, opt_date, meal_type FROM mess_opt_outs WHERE student_id = ? ORDER BY opt_date DESC',
				[profile.student_id]
			);
		} catch (err) {
			if (err.code !== 'ER_NO_SUCH_TABLE') throw err;
		}
		res.json(rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to load meal opt-outs' });
	}
}

async function createMessOptOut(req, res) {
	try {
		const profile = await studentModel.getStudentByUserId(req.user.user_id);
		if (!profile) return res.status(404).json({ message: 'Student profile not found' });
		const { opt_date, meal_type } = req.body;
		if (!opt_date || !meal_type) return res.status(400).json({ message: 'Date and meal type are required' });
		try {
			await db.query(
				'INSERT INTO mess_opt_outs (student_id, opt_date, meal_type) VALUES (?, ?, ?)',
				[profile.student_id, opt_date, meal_type]
			);
		} catch (err) {
			if (err.code === 'ER_NO_SUCH_TABLE') return res.status(201).json({ message: 'Opted out (feature coming soon)' });
			throw err;
		}
		res.status(201).json({ message: 'Successfully opted out of meal' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to process opt-out' });
	}
}

/* ── Lost & Found ───────────────────────────────────────────────────────── */
async function getLostFound(req, res) {
	try {
		let rows = [];
		try {
			[rows] = await db.query(
				'SELECT lf.*, s.name AS student_name FROM lost_found lf JOIN students s ON s.student_id = lf.student_id ORDER BY lf.created_at DESC'
			);
		} catch (err) {
			if (err.code !== 'ER_NO_SUCH_TABLE') throw err;
		}
		res.json(rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to load lost & found items' });
	}
}

async function createLostFound(req, res) {
	try {
		const profile = await studentModel.getStudentByUserId(req.user.user_id);
		if (!profile) return res.status(404).json({ message: 'Student profile not found' });
		const { type, item_name, description, location } = req.body;
		if (!item_name || !description) return res.status(400).json({ message: 'Item name and description are required' });
		try {
			await db.query(
				"INSERT INTO lost_found (student_id, type, item_name, description, location, status) VALUES (?, ?, ?, ?, ?, 'Open')",
				[profile.student_id, type || 'Lost', item_name, description, location || null]
			);
		} catch (err) {
			if (err.code === 'ER_NO_SUCH_TABLE') return res.status(201).json({ message: 'Report submitted (feature coming soon)' });
			throw err;
		}
		res.status(201).json({ message: 'Lost & Found report submitted successfully' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to submit report' });
	}
}

/* ── Laundry ────────────────────────────────────────────────────────────── */
async function getLaundry(req, res) {
	try {
		const profile = await studentModel.getStudentByUserId(req.user.user_id);
		if (!profile) return res.status(404).json({ message: 'Student profile not found' });
		let rows = [];
		try {
			[rows] = await db.query(
				'SELECT laundry_id, clothes_count, request_date, status FROM laundry WHERE student_id = ? ORDER BY request_date DESC',
				[profile.student_id]
			);
		} catch (err) {
			if (err.code !== 'ER_NO_SUCH_TABLE') throw err;
		}
		res.json(rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to load laundry requests' });
	}
}

async function createLaundry(req, res) {
	try {
		const profile = await studentModel.getStudentByUserId(req.user.user_id);
		if (!profile) return res.status(404).json({ message: 'Student profile not found' });
		const { clothes_count } = req.body;
		if (!clothes_count || isNaN(clothes_count)) return res.status(400).json({ message: 'Valid clothes count is required' });
		try {
			await db.query(
				"INSERT INTO laundry (student_id, clothes_count, request_date, status) VALUES (?, ?, CURDATE(), 'Pending')",
				[profile.student_id, clothes_count]
			);
		} catch (err) {
			if (err.code === 'ER_NO_SUCH_TABLE') return res.status(201).json({ message: 'Laundry request noted (feature coming soon)' });
			throw err;
		}
		res.status(201).json({ message: 'Laundry pickup scheduled successfully' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to submit laundry request' });
	}
}

module.exports = {
	getProfile, updateProfile, getDashboard,
	getLeaves, createLeave, deleteLeave,
	getStudentVisitors, createStudentVisitor,
	getStudentComplaints, createStudentComplaint,
	getStudentRoom, getRoomChangeRequests, createRoomChangeRequest,
	getStudentFees,
	getStudentNotices,
	getMessMenu, getMessOptOuts, createMessOptOut,
	getLostFound, createLostFound,
	getLaundry, createLaundry
};
