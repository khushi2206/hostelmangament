import React from 'react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import StudentCard from '../../components/StudentCard';

export default function StudentList() {
	const [students, setStudents] = useState([]);
	const [filters, setFilters] = useState({ search: '', course: '', semester: '', department: '', block: '' });
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(true);
	const location = useLocation();

	useEffect(() => {
		if (location.state?.message) {
			setMessage(location.state.message);
			window.history.replaceState({}, document.title);
		}
	}, [location.state]);

	async function loadStudents() {
		try {
			setLoading(true);
			setError('');
			const response = await axiosClient.get('/admin/students', { params: filters });
			setStudents(response.data);
		} catch (requestError) {
			console.error(requestError);
			setError('Unable to load students. Please check whether the backend is running.');
		} finally { setLoading(false); }
	}

	useEffect(() => { loadStudents(); }, [filters]);

	async function deleteStudent(student) {
		if (!window.confirm('Are you sure you want to delete this student?')) return;
		try {
			await axiosClient.delete('/admin/students/' + student.student_id);
			setMessage('Student deleted successfully');
			loadStudents();
		} catch (requestError) { setError(requestError.response?.data?.message || 'Unable to delete student'); }
	}

	function changeFilter(event) { setFilters({ ...filters, [event.target.name]: event.target.value }); }

	return <section>
		<div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2"><div><h2>Students</h2><p className="text-muted">Manage hostel student profiles</p></div><Link to="/admin/students/add" className="btn btn-primary"><i className="bi bi-plus-lg me-2"></i>Add Student</Link></div>
		{message && <div className="alert alert-success">{message}</div>}{error && <div className="alert alert-danger">{error}</div>}
		<div className="card page-card border-0 shadow-sm mb-4"><div className="card-body"><div className="row g-2">
			<div className="col-md-4"><input name="search" value={filters.search} onChange={changeFilter} className="form-control" placeholder="Search name or enrollment" /></div>
			<div className="col-md-2"><select name="course" value={filters.course} onChange={changeFilter} className="form-select"><option value="">All Courses</option><option value="Computer Engineering">Computer Engineering</option><option value="Information Technology">Information Technology</option></select></div>
			<div className="col-md-2"><select name="semester" value={filters.semester} onChange={changeFilter} className="form-select"><option value="">All Semesters</option>{[1, 2, 3, 4, 5, 6, 7, 8].map(semester => <option key={semester} value={semester}>{semester}</option>)}</select></div>
			<div className="col-md-2"><select name="department" value={filters.department} onChange={changeFilter} className="form-select"><option value="">All Departments</option><option value="Computer Engineering">Computer Engineering</option><option value="Information Technology">Information Technology</option><option value="Mechanical Engineering">Mechanical Engineering</option></select></div>
			<div className="col-md-2"><select name="block" value={filters.block} onChange={changeFilter} className="form-select"><option value="">All Blocks</option><option value="H1">H1</option><option value="H2">H2</option><option value="H3">H3</option><option value="H4">H4</option></select></div>
		</div></div></div>
		{loading && <div className="alert alert-info">Loading students...</div>}
		{!loading && students.length === 0 && <div className="alert alert-light border">No students found.</div>}
		{!loading && students.map(student => <StudentCard key={student.student_id} student={student} onDelete={deleteStudent} />)}
	</section>;
}
