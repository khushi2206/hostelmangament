import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';

export default function AddVisitor() {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [form, setForm] = useState({
        student_id: '',
        visitor_name: '',
        relation: '',
        phone: '',
        visit_date: '',
        visit_time: ''
    });
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        axiosClient.get('/admin/students')
            .then(response => setStudents(response.data))
            .catch(() => setError('Unable to load students.'))
            .finally(() => setLoadingStudents(false));
    }, []);

    function change(event) {
        setForm({ ...form, [event.target.name]: event.target.value });
    }

    async function submit(event) {
        event.preventDefault();
        if (!form.student_id || !form.visitor_name.trim() || !form.visit_date || !form.visit_time) {
            setError('Student, visitor name, visit date, and time are required.');
            return;
        }
        try {
            setSaving(true);
            setError('');
            const response = await axiosClient.post('/admin/visitors', form);
            navigate('/admin/visitors', { state: { message: response.data.message } });
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to register visitor.');
        } finally {
            setSaving(false);
        }
    }

    if (loadingStudents) return <p>Loading students...</p>;

    return (
        <section>
            <h2>Register Visitor</h2>
            <p className="text-muted">Add a visitor entry for a hostel student.</p>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="card border-0 shadow-sm page-card">
                <div className="card-body">
                    <form onSubmit={submit}>
                        <div className="mb-3">
                            <label className="form-label">Student</label>
                            <select name="student_id" value={form.student_id} onChange={change} className="form-select" required>
                                <option value="">Select student</option>
                                {students.map(student => (
                                    <option key={student.student_id} value={student.student_id}>
                                        {student.name} ({student.enrollment_no})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Visitor Name</label>
                            <input name="visitor_name" value={form.visitor_name} onChange={change} className="form-control" required />
                        </div>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Relation</label>
                                <input name="relation" value={form.relation} onChange={change} className="form-control" placeholder="e.g. Parent, Sibling" />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Phone</label>
                                <input name="phone" value={form.phone} onChange={change} className="form-control" placeholder="10-digit mobile" />
                            </div>
                        </div>
                        <div className="row g-3 mt-1">
                            <div className="col-md-6">
                                <label className="form-label">Visit Date</label>
                                <input type="date" name="visit_date" value={form.visit_date} onChange={change} className="form-control" required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Visit Time</label>
                                <input type="time" name="visit_time" value={form.visit_time} onChange={change} className="form-control" required />
                            </div>
                        </div>
                        <div className="d-flex gap-2 mt-4">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : 'Register Visitor'}
                            </button>
                            <Link to="/admin/visitors" className="btn btn-outline-secondary">Cancel</Link>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}
