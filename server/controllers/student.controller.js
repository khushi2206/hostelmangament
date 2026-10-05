const studentModel = require('../models/student.model');

function isValidDate(dateValue) {
	return typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue) && !Number.isNaN(Date.parse(dateValue));
}

const allowedLeaveTypes = ['Outing', 'Home Leave'];

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
			leave_type: leaveType,
			from_date: fromDate,
			to_date: toDate,
			reason: reason
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

module.exports = { getProfile, getLeaves, createLeave };
