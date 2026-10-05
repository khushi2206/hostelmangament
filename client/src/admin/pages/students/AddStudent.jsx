import React from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import StudentForm from '../../components/StudentForm';

export default function AddStudent() {
	const navigate = useNavigate();
	const [error, setError] = React.useState('');
	async function addStudent(data) {
		try {
			const response = await axiosClient.post('/admin/students', data);
			navigate('/admin/students', { state: { message: response.data.message + '.' } });
		} catch (error) {
			setError(error.response?.data?.message || 'Unable to add student');
		}
	}
	return <section><h2>Add Student</h2><p className="text-muted">Create a new hostel student profile</p>{error && <div className="alert alert-danger">{error}</div>}<div className="card border-0 shadow-sm page-card"><div className="card-body"><StudentForm onSubmit={addStudent} /></div></div></section>;
}
