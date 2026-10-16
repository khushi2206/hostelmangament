import React from 'react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';

export default function StudentDetails() {
	const { id } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const [student, setStudent] = useState(null);
	const [error, setError] = useState('');
	useEffect(() => { axiosClient.get('/admin/students/' + id).then(response => setStudent(response.data)).catch(requestError => setError(requestError.response?.status === 404 ? 'Student not found.' : 'Unable to load student.')); }, [id]);
	async function deleteStudent() {
		if (!window.confirm('Are you sure you want to delete this student?')) return;
		try { await axiosClient.delete('/admin/students/' + id); navigate('/admin/students'); }
		catch (requestError) { setError(requestError.response?.data?.message || 'Unable to delete student'); }
	}
	if (error) return <div className="alert alert-danger">{error}</div>;
	if (!student) return <p>Loading...</p>;
	const details = [['Name', student.name], ['Enrollment Number', student.enrollment_no], ['Email', student.email], ['Phone', student.phone], ['Course', student.course], ['Semester', student.semester], ['Department', student.department], ['Date of Birth', student.dob], ['Address', student.address], ['Emergency Contact', student.emergency_contact], ['Room', student.room_id ? student.block + ' - ' + student.room_number : 'Not allocated'], ['Bed', student.bed_label || 'Not allocated']];
	return <section>{location.state?.message && <div className="alert alert-success">{location.state.message}</div>}<div className="d-flex justify-content-between align-items-start mb-4"><div><h2>{student.name}</h2><p className="text-muted">Student details</p></div><div className="d-flex gap-2"><Link to={'/admin/students/' + id + '/edit'} className="btn btn-outline-primary"><i className="bi bi-pencil me-2"></i>Edit</Link><button onClick={deleteStudent} className="btn btn-outline-danger"><i className="bi bi-trash me-2"></i>Delete</button></div></div><div className="card border-0 shadow-sm page-card"><div className="card-body row g-3">{details.map(detail => <div className="col-md-6" key={detail[0]}><div className="small text-muted">{detail[0]}</div><div>{detail[1] || 'Not provided'}</div></div>)}</div></div><Link to="/admin/students" className="btn btn-link px-0 mt-3">Back to students</Link></section>;
}
