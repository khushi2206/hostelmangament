import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import StudentForm from '../../components/StudentForm';

export default function EditStudent() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [student, setStudent] = useState(null);
	const [error, setError] = useState('');
	useEffect(() => { axiosClient.get('/admin/students/' + id).then(response => setStudent(response.data)).catch(requestError => setError(requestError.response?.data?.message || 'Unable to load student')); }, [id]);
	async function updateStudent(data) {
		try { const response = await axiosClient.put('/admin/students/' + id, data); navigate('/admin/students/' + id, { state: { message: response.data.message + '.' } }); }
		catch (requestError) { setError(requestError.response?.data?.message || 'Unable to update student'); }
	}
	if (error) return <div className="alert alert-danger">{error}</div>;
	if (!student) return <p>Loading...</p>;
	return <section><h2>Edit Student</h2><p className="text-muted">Update student information</p><div className="card border-0 shadow-sm page-card"><div className="card-body"><StudentForm initialStudent={student} editing onSubmit={updateStudent} /></div></div></section>;
}
