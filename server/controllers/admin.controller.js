const bcrypt = require('bcrypt');
const db = require('../config/db');
const studentModel = require('../models/student.model');

function validateStudent(data, creating) {
	if (!data.name || !data.name.trim() || !data.enrollment_no || !data.enrollment_no.trim() || !data.email || !data.email.trim() || !data.course || !data.course.trim() || !data.department || !data.department.trim()) {
		return 'Name, enrollment number, email, course, and department are required';
	}
	if (data.name.trim().length < 2) return 'Name must be at least 2 characters long';
	if (!/^[A-Za-z\s.'-]+$/.test(data.name.trim())) return 'Name can only contain letters, spaces, dots, and hyphens';
	if (!/^[A-Za-z0-9/-]{3,30}$/.test(data.enrollment_no.trim())) return 'Enrollment number must be 3-30 alphanumeric characters';
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) return 'Enter a valid email address';
	if (creating && (!data.password || data.password.length < 6)) return 'Password is required and must be at least 6 characters long';
	if (data.password && data.password.length < 6) return 'Password must be at least 6 characters long';
	if (data.phone && data.phone.trim() && !/^\+?[0-9\s-]{10,15}$/.test(data.phone.trim())) return 'Enter a valid 10 to 15 digit phone number';
	if (data.emergency_contact && data.emergency_contact.trim() && !/^\+?[0-9\s-]{10,15}$/.test(data.emergency_contact.trim())) return 'Enter a valid 10 to 15 digit emergency contact number';
	const sem = Number(data.semester);
	if (!Number.isInteger(sem) || sem < 1 || sem > 12) return 'Semester must be a positive integer between 1 and 12';
	if (data.dob) {
		const dobDate = new Date(data.dob);
		if (Number.isNaN(dobDate.getTime())) return 'Enter a valid date of birth';
		if (dobDate >= new Date()) return 'Date of birth must be in the past';
	}
	return null;
}

function studentValues(data) {
	return [data.name.trim(), data.phone || null, data.course.trim(), Number(data.semester), data.department.trim(), data.dob || null, data.address || null, data.emergency_contact || null];
}

async function getStudents(req, res) {
	try {
		res.json(await studentModel.getAllStudents(req.query));
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to load students' });
	}
}

async function getStudent(req, res) {
	try {
		const student = await studentModel.getStudentById(req.params.id);
		if (!student) return res.status(404).json({ message: 'Student not found' });
		res.json(student);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to load student' });
	}
}

async function addStudent(req, res) {
	let connection;
	try {
		const errorMessage = validateStudent(req.body, true);
		if (errorMessage) return res.status(400).json({ message: errorMessage });
		if (await studentModel.findByEnrollment(req.body.enrollment_no)) return res.status(409).json({ message: 'Enrollment number already exists' });
		if (await studentModel.findUserByEmail(req.body.email)) return res.status(409).json({ message: 'Email already exists' });
		connection = await db.getConnection();
		await connection.beginTransaction();
		const passwordHash = await bcrypt.hash(req.body.password, 10);
		const [userResult] = await connection.query('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [req.body.email.trim(), passwordHash, 'student']);
		await connection.query(`INSERT INTO students
			(user_id, enrollment_no, name, phone, course, semester, department, dob, address, emergency_contact)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [userResult.insertId, req.body.enrollment_no.trim(), ...studentValues(req.body)]);
		await connection.commit();
		res.status(201).json({ message: 'Student added successfully' });
	} catch (error) {
		if (connection) await connection.rollback();
		console.error(error);
		res.status(500).json({ message: 'Unable to add student' });
	} finally {
		if (connection) connection.release();
	}
}

async function updateStudent(req, res) {
	const errorMessage = validateStudent(req.body, false);
	if (errorMessage) return res.status(400).json({ message: errorMessage });
	try {
		const student = await studentModel.getStudentById(req.params.id);
		if (!student) return res.status(404).json({ message: 'Student not found' });
		if (await studentModel.findByEnrollment(req.body.enrollment_no, req.params.id)) return res.status(409).json({ message: 'Enrollment number already exists' });
		if (await studentModel.findUserByEmail(req.body.email, req.params.id)) return res.status(409).json({ message: 'Email already exists' });
		const connection = await db.getConnection();
		try {
			await connection.beginTransaction();
			await connection.query('UPDATE users SET email = ? WHERE user_id = ?', [req.body.email.trim(), student.user_id]);
			if (req.body.password) {
				const passwordHash = await bcrypt.hash(req.body.password, 10);
				await connection.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [passwordHash, student.user_id]);
			}
			await connection.query(`UPDATE students SET enrollment_no = ?, name = ?, phone = ?, course = ?, semester = ?, department = ?, dob = ?, address = ?, emergency_contact = ? WHERE student_id = ?`, [req.body.enrollment_no.trim(), ...studentValues(req.body), req.params.id]);
			await connection.commit();
			res.json({ message: 'Student updated successfully' });
		} catch (error) {
			await connection.rollback();
			throw error;
		} finally {
			connection.release();
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to update student' });
	}
}

async function deleteStudent(req, res) {
	const connection = await db.getConnection();
	try {
		const [students] = await connection.query('SELECT user_id, room_id FROM students WHERE student_id = ?', [req.params.id]);
		if (!students[0]) return res.status(404).json({ message: 'Student not found' });
		if (students[0].room_id) return res.status(409).json({ message: 'Student cannot be deleted while a room is allocated. Vacate the room first.' });
		await connection.beginTransaction();
		await connection.query('DELETE FROM students WHERE student_id = ?', [req.params.id]);
		await connection.query('DELETE FROM users WHERE user_id = ?', [students[0].user_id]);
		await connection.commit();
		res.json({ message: 'Student deleted successfully' });
	} catch (error) {
		await connection.rollback();
		console.error(error);
		res.status(500).json({ message: 'Unable to delete student' });
	} finally {
		connection.release();
	}
}

function validateRoom(data) {
	if (!data.room_number || !data.block) return 'Room number and block are required';
	if (!Number.isInteger(Number(data.floor)) || Number(data.floor) <= 0) return 'Floor must be a positive number';
	if (!Number.isInteger(Number(data.capacity)) || Number(data.capacity) <= 0) return 'Capacity must be greater than 0';
	return null;
}

async function getRooms(req, res) {
	try {
		res.json(await studentModel.getAllRooms(req.query));
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to load rooms' });
	}
}

async function getRoom(req, res) {
	try {
		const room = await studentModel.getRoomById(req.params.id);
		if (!room) return res.status(404).json({ message: 'Room not found' });
		res.json(room);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to load room' });
	}
}

async function addRoom(req, res) {
	try {
		const errorMessage = validateRoom(req.body);
		if (errorMessage) return res.status(400).json({ message: errorMessage });
		if (await studentModel.findRoom(req.body.room_number.trim(), req.body.block.trim())) return res.status(409).json({ message: 'Room already exists in this block.' });
		await db.query('INSERT INTO rooms (room_number, block, floor, capacity, occupied) VALUES (?, ?, ?, ?, 0)', [req.body.room_number.trim(), req.body.block.trim(), Number(req.body.floor), Number(req.body.capacity)]);
		res.status(201).json({ message: 'Room added successfully.' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to add room' });
	}
}

async function updateRoom(req, res) {
	try {
		const errorMessage = validateRoom(req.body);
		if (errorMessage) return res.status(400).json({ message: errorMessage });
		const room = await studentModel.getRoomById(req.params.id);
		if (!room) return res.status(404).json({ message: 'Room not found' });
		if (await studentModel.findRoom(req.body.room_number.trim(), req.body.block.trim(), req.params.id)) return res.status(409).json({ message: 'Room already exists in this block.' });
		if (Number(req.body.capacity) < room.occupied) return res.status(400).json({ message: 'Capacity cannot be less than the number of occupied beds.' });
		await db.query('UPDATE rooms SET room_number = ?, block = ?, floor = ?, capacity = ? WHERE room_id = ?', [req.body.room_number.trim(), req.body.block.trim(), Number(req.body.floor), Number(req.body.capacity), req.params.id]);
		res.json({ message: 'Room updated successfully.' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to update room' });
	}
}

async function deleteRoom(req, res) {
	try {
		const room = await studentModel.getRoomById(req.params.id);
		if (!room) return res.status(404).json({ message: 'Room not found' });
		if (room.occupied > 0) return res.status(409).json({ message: 'Room cannot be deleted because students are currently allocated to it. Vacate the room first.' });
		await db.query('DELETE FROM rooms WHERE room_id = ?', [req.params.id]);
		res.json({ message: 'Room deleted successfully.' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to delete room' });
	}
}

function validateAllocationInput(studentId, roomId, bedLabel) {
	if (!Number.isInteger(Number(studentId)) || !Number.isInteger(Number(roomId))) return 'Student and room are required';
	if (!bedLabel || !/^[A-Za-z0-9 _-]+$/.test(bedLabel)) return 'A valid bed label is required';
	return null;
}

async function getAllocationStudents(req, res) {
	try {
		res.json(await studentModel.getAllocationStudents(req.query.search));
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to load students' });
	}
}

async function getAllocationRooms(req, res) {
	try {
		res.json(await studentModel.getAvailableAllocationRooms());
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to load available rooms' });
	}
}

async function addAllocation(req, res) {
	let connection;
	try {
		const errorMessage = validateAllocationInput(req.body.student_id, req.body.room_id, req.body.bed_label);
		if (errorMessage) return res.status(400).json({ message: errorMessage });
		connection = await db.getConnection();
		await connection.beginTransaction();
		const [students] = await connection.query('SELECT student_id, room_id FROM students WHERE student_id = ? FOR UPDATE', [req.body.student_id]);
		if (!students[0]) { await connection.rollback(); return res.status(404).json({ message: 'Student not found.' }); }
		if (students[0].room_id) { await connection.rollback(); return res.status(409).json({ message: 'Student is already allocated to a room.' }); }
		const [rooms] = await connection.query('SELECT room_id, capacity, occupied FROM rooms WHERE room_id = ? FOR UPDATE', [req.body.room_id]);
		if (!rooms[0]) { await connection.rollback(); return res.status(404).json({ message: 'Room not found.' }); }
		if (rooms[0].occupied >= rooms[0].capacity) { await connection.rollback(); return res.status(409).json({ message: 'Room is already full.' }); }
		const [beds] = await connection.query('SELECT student_id FROM students WHERE room_id = ? AND bed_label = ? FOR UPDATE', [req.body.room_id, req.body.bed_label]);
		if (beds[0]) { await connection.rollback(); return res.status(409).json({ message: 'Selected bed is already occupied.' }); }
		await connection.query('UPDATE students SET room_id = ?, bed_label = ? WHERE student_id = ?', [req.body.room_id, req.body.bed_label, req.body.student_id]);
		await connection.query('UPDATE rooms SET occupied = occupied + 1 WHERE room_id = ? AND occupied < capacity', [req.body.room_id]);
		await connection.commit();
		res.json({ message: 'Room allocated successfully.' });
	} catch (error) {
		if (connection) await connection.rollback();
		if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Selected bed is already occupied.' });
		console.error(error);
		res.status(500).json({ message: 'Unable to allocate room.' });
	} finally {
		if (connection) connection.release();
	}
}

async function reassignAllocation(req, res) {
	let connection;
	try {
		const errorMessage = validateAllocationInput(req.params.studentId, req.body.room_id, req.body.bed_label);
		if (errorMessage) return res.status(400).json({ message: errorMessage });
		connection = await db.getConnection();
		await connection.beginTransaction();
		const [students] = await connection.query('SELECT student_id, room_id FROM students WHERE student_id = ? FOR UPDATE', [req.params.studentId]);
		if (!students[0]) { await connection.rollback(); return res.status(404).json({ message: 'Student not found.' }); }
		if (!students[0].room_id) { await connection.rollback(); return res.status(400).json({ message: 'Student does not currently have a room.' }); }
		if (Number(students[0].room_id) === Number(req.body.room_id)) { await connection.rollback(); return res.status(409).json({ message: 'Student is already allocated to this room.' }); }
		const [oldRooms] = await connection.query('SELECT room_id, occupied FROM rooms WHERE room_id = ? FOR UPDATE', [students[0].room_id]);
		const [newRooms] = await connection.query('SELECT room_id, capacity, occupied FROM rooms WHERE room_id = ? FOR UPDATE', [req.body.room_id]);
		if (!newRooms[0]) { await connection.rollback(); return res.status(404).json({ message: 'Room not found.' }); }
		if (newRooms[0].occupied >= newRooms[0].capacity) { await connection.rollback(); return res.status(409).json({ message: 'Room is already full.' }); }
		if (!oldRooms[0] || oldRooms[0].occupied <= 0) { await connection.rollback(); return res.status(400).json({ message: 'Current room occupancy is invalid.' }); }
		const [beds] = await connection.query('SELECT student_id FROM students WHERE room_id = ? AND bed_label = ? FOR UPDATE', [req.body.room_id, req.body.bed_label]);
		if (beds[0]) { await connection.rollback(); return res.status(409).json({ message: 'Selected bed is already occupied.' }); }
		await connection.query('UPDATE rooms SET occupied = occupied - 1 WHERE room_id = ? AND occupied > 0', [students[0].room_id]);
		await connection.query('UPDATE rooms SET occupied = occupied + 1 WHERE room_id = ? AND occupied < capacity', [req.body.room_id]);
		await connection.query('UPDATE students SET room_id = ?, bed_label = ? WHERE student_id = ?', [req.body.room_id, req.body.bed_label, req.params.studentId]);
		await connection.commit();
		res.json({ message: 'Room reassigned successfully.' });
	} catch (error) {
		if (connection) await connection.rollback();
		if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Selected bed is already occupied.' });
		console.error(error);
		res.status(500).json({ message: 'Unable to reassign room.' });
	} finally {
		if (connection) connection.release();
	}
}

async function vacateAllocation(req, res) {
	let connection;
	try {
		connection = await db.getConnection();
		await connection.beginTransaction();
		const [students] = await connection.query('SELECT student_id, room_id FROM students WHERE student_id = ? FOR UPDATE', [req.params.studentId]);
		if (!students[0]) { await connection.rollback(); return res.status(404).json({ message: 'Student not found.' }); }
		if (!students[0].room_id) { await connection.rollback(); return res.status(400).json({ message: 'Student does not currently have a room.' }); }
		const [rooms] = await connection.query('SELECT room_id, occupied FROM rooms WHERE room_id = ? FOR UPDATE', [students[0].room_id]);
		if (!rooms[0] || rooms[0].occupied <= 0) { await connection.rollback(); return res.status(400).json({ message: 'Current room occupancy is invalid.' }); }
		await connection.query('UPDATE rooms SET occupied = occupied - 1 WHERE room_id = ? AND occupied > 0', [students[0].room_id]);
		await connection.query('UPDATE students SET room_id = NULL, bed_label = NULL WHERE student_id = ?', [req.params.studentId]);
		await connection.commit();
		res.json({ message: 'Room vacated successfully.' });
	} catch (error) {
		if (connection) await connection.rollback();
		console.error(error);
		res.status(500).json({ message: 'Unable to vacate room.' });
	} finally {
		if (connection) connection.release();
	}
}

function isValidDate(dateValue) {
	return typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue) && !Number.isNaN(Date.parse(dateValue));
}

function validateLeaveFilters(query) {
	const allowedStatuses = ['Pending', 'Approved', 'Rejected'];
	if (query.status && !allowedStatuses.includes(query.status)) return 'Invalid leave status';
	if (query.date && !isValidDate(query.date)) return 'Invalid date filter';
	return null;
}

async function getLeaves(req, res) {
	try {
		const errorMessage = validateLeaveFilters(req.query);
		if (errorMessage) return res.status(400).json({ message: errorMessage });
		res.json(await studentModel.getAllLeaves(req.query));
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to load leave requests' });
	}
}

async function getLeave(req, res) {
	try {
		const leave = await studentModel.getLeaveById(req.params.id);
		if (!leave) return res.status(404).json({ message: 'Leave request not found' });
		res.json(leave);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to load leave request' });
	}
}

async function updateLeaveStatus(req, res) {
	let connection;
	try {
		const leaveId = Number(req.params.id);
		const newStatus = req.body.status;
		if (!Number.isInteger(leaveId)) return res.status(400).json({ message: 'Invalid leave request ID' });
		if (!['Approved', 'Rejected'].includes(newStatus)) return res.status(400).json({ message: 'Leave status must be Approved or Rejected' });
		if (req.body.admin_comment !== undefined && typeof req.body.admin_comment !== 'string') return res.status(400).json({ message: 'Admin comment must be text' });

		connection = await db.getConnection();
		await connection.beginTransaction();
		const [rows] = await connection.query('SELECT status, from_date, to_date FROM leave_requests WHERE leave_id = ? FOR UPDATE', [leaveId]);
		if (!rows[0]) { await connection.rollback(); return res.status(404).json({ message: 'Leave request not found' }); }
		if (rows[0].status !== 'Pending') { await connection.rollback(); return res.status(409).json({ message: 'Only pending leave requests can be updated.' }); }
		const fromDate = rows[0].from_date instanceof Date ? rows[0].from_date.toISOString().slice(0, 10) : String(rows[0].from_date).slice(0, 10);
		const toDate = rows[0].to_date instanceof Date ? rows[0].to_date.toISOString().slice(0, 10) : String(rows[0].to_date).slice(0, 10);
		if (!isValidDate(fromDate) || !isValidDate(toDate) || fromDate > toDate) { await connection.rollback(); return res.status(400).json({ message: 'To date cannot be before from date.' }); }
		await connection.query('UPDATE leave_requests SET status = ?, admin_comment = ?, updated_at = CURRENT_TIMESTAMP WHERE leave_id = ?', [newStatus, req.body.admin_comment || null, leaveId]);
		await connection.commit();
		res.json({ message: newStatus === 'Approved' ? 'Leave request approved successfully.' : 'Leave request rejected successfully.' });
	} catch (error) {
		if (connection) await connection.rollback();
		console.error(error);
		res.status(500).json({ message: 'Unable to update leave request' });
	} finally {
		if (connection) connection.release();
	}
}

async function getVisitors(req, res) {
	try {
		if (req.query.status && !['Pending', 'Approved'].includes(req.query.status)) return res.status(400).json({ message: 'Invalid visitor status' });
		if (req.query.date && !isValidDate(req.query.date)) return res.status(400).json({ message: 'Invalid date filter' });
		res.json(await studentModel.getAllVisitors(req.query));
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to load visitors' });
	}
}

async function getVisitor(req, res) {
	try {
		const visitorId = Number(req.params.id);
		if (!Number.isInteger(visitorId)) return res.status(400).json({ message: 'Invalid visitor ID' });
		const visitor = await studentModel.getVisitorById(visitorId);
		if (!visitor) return res.status(404).json({ message: 'Visitor not found' });
		res.json(visitor);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to load visitor' });
	}
}

async function addVisitor(req, res) {
	try {
		const studentId = Number(req.body.student_id);
		const visitorName = typeof req.body.visitor_name === 'string' ? req.body.visitor_name.trim() : '';
		const visitDate = req.body.visit_date;
		const visitTime = req.body.visit_time;
		if (!Number.isInteger(studentId)) return res.status(400).json({ message: 'Valid student is required' });
		if (!visitorName || visitorName.length < 2) return res.status(400).json({ message: 'Visitor name is required' });
		if (!isValidDate(visitDate)) return res.status(400).json({ message: 'Valid visit date is required' });
		if (typeof visitTime !== 'string' || !/^\d{2}:\d{2}(:\d{2})?$/.test(visitTime)) return res.status(400).json({ message: 'Valid visit time is required' });
		if (req.body.phone && !/^\+?[0-9\s-]{10,15}$/.test(String(req.body.phone).trim())) return res.status(400).json({ message: 'Enter a valid phone number' });
		const student = await studentModel.getStudentById(studentId);
		if (!student) return res.status(404).json({ message: 'Student not found' });
		const visitorId = await studentModel.createVisitor({
			student_id: studentId,
			visitor_name: visitorName,
			relation: typeof req.body.relation === 'string' ? req.body.relation.trim() || null : null,
			phone: typeof req.body.phone === 'string' ? req.body.phone.trim() || null : null,
			visit_date: visitDate,
			visit_time: visitTime.length === 5 ? visitTime + ':00' : visitTime,
			status: 'Approved'
		});
		res.status(201).json({ message: 'Visitor registered successfully.', visitor: await studentModel.getVisitorById(visitorId) });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Unable to register visitor' });
	}
}

async function updateVisitorStatus(req, res) {
	let connection;
	try {
		const visitorId = Number(req.params.id);
		if (!Number.isInteger(visitorId)) return res.status(400).json({ message: 'Invalid visitor ID' });
		if (req.body.status !== 'Approved') return res.status(400).json({ message: 'Visitor status can only be Approved' });
		connection = await db.getConnection();
		await connection.beginTransaction();
		const [visitors] = await connection.query('SELECT status FROM visitors WHERE visitor_id = ? FOR UPDATE', [visitorId]);
		if (!visitors[0]) { await connection.rollback(); return res.status(404).json({ message: 'Visitor not found' }); }
		if (visitors[0].status !== 'Pending') { await connection.rollback(); return res.status(409).json({ message: 'Only pending visitors can be approved.' }); }
		await connection.query('UPDATE visitors SET status = ? WHERE visitor_id = ?', ['Approved', visitorId]);
		await connection.commit();
		res.json({ message: 'Visitor approved successfully.' });
	} catch (error) {
		if (connection) await connection.rollback();
		console.error(error);
		res.status(500).json({ message: 'Unable to approve visitor' });
	} finally {
		if (connection) connection.release();
	}
}

const complaintCategories = ['Electrical', 'Plumbing', 'Cleaning', 'Wi-Fi', 'Furniture', 'Other'];
const complaintStatuses = ['Pending', 'In Progress', 'Resolved'];

async function getComplaints(req, res) {
	try {
		if (req.query.category && !complaintCategories.includes(req.query.category)) return res.status(400).json({ success: false, message: 'Invalid complaint category' });
		if (req.query.status && !complaintStatuses.includes(req.query.status)) return res.status(400).json({ success: false, message: 'Invalid complaint status' });
		const complaints = await studentModel.getAllComplaints(req.query);
		res.json({ success: true, complaints: complaints });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Failed to load complaints.' });
	}
}

async function getComplaint(req, res) {
	try {
		const complaintId = Number(req.params.id);
		if (!Number.isInteger(complaintId)) return res.status(400).json({ success: false, message: 'Invalid complaint ID' });
		const complaint = await studentModel.getComplaintById(complaintId);
		if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
		res.json({ success: true, complaint: complaint });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Failed to load complaint.' });
	}
}

async function updateComplaintStatus(req, res) {
	try {
		const complaintId = Number(req.params.id);
		if (!Number.isInteger(complaintId)) return res.status(400).json({ success: false, message: 'Invalid complaint ID' });
		if (!req.body.status) return res.status(400).json({ success: false, message: 'Complaint status is required' });
		if (!complaintStatuses.includes(req.body.status)) return res.status(400).json({ success: false, message: 'Invalid complaint status' });
		const complaint = await studentModel.getComplaintById(complaintId);
		if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
		await studentModel.updateComplaintStatus(complaintId, req.body.status);
		res.json({ success: true, message: 'Complaint status updated successfully.' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Failed to update complaint status.' });
	}
}

function normalizeFee(fee) {
	const totalValue = fee.amount !== undefined ? fee.amount : fee.total_amount !== undefined ? fee.total_amount : fee.total_fee;
	const paidValue = fee.paid !== undefined ? fee.paid : fee.paid_amount;
	const totalAmount = Number(totalValue);
	const paidAmount = Number(paidValue);
	const hasAmounts = Number.isFinite(totalAmount) && Number.isFinite(paidAmount);
	const safeTotal = hasAmounts ? Math.max(0, totalAmount) : 0;
	const safePaid = hasAmounts ? Math.max(0, paidAmount) : 0;
	const remainingAmount = Math.max(0, safeTotal - safePaid);
	const status = !hasAmounts || safePaid === 0 ? 'Due' : safePaid >= safeTotal ? 'Paid' : 'Partial';
	return { ...fee, total_amount: safeTotal, paid_amount: safePaid, remaining_amount: remainingAmount, fee_status: status, fee_data_available: hasAmounts };
}

async function getFees(req, res) {
	try {
		const fees = (await studentModel.getAllFees()).map(normalizeFee);
		res.json({ success: true, fees: fees, payment_updates_supported: false });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Failed to load fee records.' });
	}
}

async function getFee(req, res) {
	try {
		const feeId = Number(req.params.id);
		if (!Number.isInteger(feeId)) return res.status(400).json({ success: false, message: 'Invalid fee ID' });
		const fee = await studentModel.getFeeById(feeId);
		if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found' });
		res.json({ success: true, fee: normalizeFee(fee), payment_updates_supported: false });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Failed to load fee record.' });
	}
}

function validateNotice(data) {
	if (!data || typeof data.title !== 'string' || !data.title.trim()) return 'Notice title is required';
	if (typeof data.description !== 'string' || !data.description.trim()) return 'Notice description is required';
	return null;
}

async function getNotices(req, res) {
	try {
		res.json({ success: true, notices: await studentModel.getAllNotices() });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Failed to load notices.' });
	}
}

async function getNotice(req, res) {
	try {
		const noticeId = Number(req.params.id);
		if (!Number.isInteger(noticeId)) return res.status(400).json({ success: false, message: 'Invalid notice ID' });
		const notice = await studentModel.getNoticeById(noticeId);
		if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
		res.json({ success: true, notice: notice });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Failed to load notice.' });
	}
}

async function addNotice(req, res) {
	try {
		const errorMessage = validateNotice(req.body);
		if (errorMessage) return res.status(400).json({ success: false, message: errorMessage });
		const noticeId = await studentModel.addNotice({ title: req.body.title.trim(), description: req.body.description.trim() });
		res.status(201).json({ success: true, message: 'Notice published successfully.', notice: await studentModel.getNoticeById(noticeId) });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Failed to publish notice.' });
	}
}

async function updateNotice(req, res) {
	try {
		const noticeId = Number(req.params.id);
		if (!Number.isInteger(noticeId)) return res.status(400).json({ success: false, message: 'Invalid notice ID' });
		const errorMessage = validateNotice(req.body);
		if (errorMessage) return res.status(400).json({ success: false, message: errorMessage });
		if (!(await studentModel.getNoticeById(noticeId))) return res.status(404).json({ success: false, message: 'Notice not found' });
		await studentModel.updateNotice(noticeId, { title: req.body.title.trim(), description: req.body.description.trim() });
		res.json({ success: true, message: 'Notice updated successfully.', notice: await studentModel.getNoticeById(noticeId) });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Failed to update notice.' });
	}
}

async function deleteNotice(req, res) {
	try {
		const noticeId = Number(req.params.id);
		if (!Number.isInteger(noticeId)) return res.status(400).json({ success: false, message: 'Invalid notice ID' });
		if (!(await studentModel.getNoticeById(noticeId))) return res.status(404).json({ success: false, message: 'Notice not found' });
		await studentModel.deleteNotice(noticeId);
		res.json({ success: true, message: 'Notice deleted successfully.' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Failed to delete notice.' });
	}
}

async function getDashboard(req, res) {
	try {
		res.json({ success: true, data: await studentModel.getDashboardStats() });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Failed to load dashboard data.' });
	}
}

module.exports = { getStudents, getStudent, addStudent, updateStudent, deleteStudent, getRooms, getRoom, addRoom, updateRoom, deleteRoom, getAllocationStudents, getAllocationRooms, addAllocation, reassignAllocation, vacateAllocation, getLeaves, getLeave, updateLeaveStatus, getVisitors, getVisitor, addVisitor, updateVisitorStatus, getComplaints, getComplaint, updateComplaintStatus, getFees, getFee, getNotices, getNotice, addNotice, updateNotice, deleteNotice, getDashboard };
