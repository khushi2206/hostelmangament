import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const leaveTypes = ['Outing', 'Home Leave'];

export default function StudentLeaves() {
    const [profile, setProfile] = useState(null);
    const [leaves, setLeaves] = useState([]);
    const [form, setForm] = useState({ leave_type: 'Outing', from_date: '', to_date: '', reason: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    async function loadData() {
        try {
            setLoading(true);
            setError('');
            const [profileRes, leavesRes] = await Promise.all([
                axiosClient.get('/student/profile'),
                axiosClient.get('/student/leaves')
            ]);
            setProfile(profileRes.data);
            setLeaves(leavesRes.data);
        } catch (requestError) {
            console.error(requestError);
            setError(requestError.response?.data?.message || 'Unable to load leave data.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    function changeField(event) {
        setForm({ ...form, [event.target.name]: event.target.value });
    }

    async function submitLeave(event) {
        event.preventDefault();
        if (!form.from_date || !form.to_date || !form.reason.trim()) {
            setError('Leave type, dates, and reason are required.');
            return;
        }
        try {
            setSaving(true);
            setError('');
            const response = await axiosClient.post('/student/leaves', form);
            setMessage(response.data.message);
            setForm({ leave_type: 'Outing', from_date: '', to_date: '', reason: '' });
            loadData();
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to submit leave request.');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <div className="alert alert-info">Loading your leave requests...</div>;
    }

    return (
        <section>
            <h2>Leave Requests</h2>
            <p className="text-muted">Submit a leave request for warden approval.</p>
            {profile && (
                <div className="alert alert-light border small mb-4">
                    <strong>{profile.name}</strong> · {profile.enrollment_no}
                    {profile.room_number ? ` · Room ${profile.room_number}, Block ${profile.block}` : ' · No room allocated'}
                </div>
            )}
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card border-0 shadow-sm page-card mb-4">
                <div className="card-body">
                    <h5 className="card-title">New Leave Request</h5>
                    <form onSubmit={submitLeave} className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label">Leave Type</label>
                            <select name="leave_type" value={form.leave_type} onChange={changeField} className="form-select" required>
                                {leaveTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">From Date</label>
                            <input type="date" name="from_date" value={form.from_date} onChange={changeField} className="form-control" required />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">To Date</label>
                            <input type="date" name="to_date" value={form.to_date} onChange={changeField} className="form-control" required />
                        </div>
                        <div className="col-12">
                            <label className="form-label">Reason</label>
                            <textarea name="reason" value={form.reason} onChange={changeField} className="form-control" rows="3" placeholder="Purpose of leave" required />
                        </div>
                        <div className="col-12">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Submitting...' : 'Submit Leave Request'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <h5 className="mb-3">Your Requests</h5>
            {leaves.length === 0 ? (
                <div className="alert alert-light border">No leave requests yet.</div>
            ) : (
                leaves.map(leave => (
                    <div key={leave.leave_id} className="card border-0 shadow-sm page-card mb-3">
                        <div className="card-body d-flex justify-content-between align-items-start flex-wrap gap-2">
                            <div>
                                <div className="fw-semibold">{leave.leave_type}</div>
                                <div className="small text-muted">{leave.from_date} → {leave.to_date}</div>
                                <div className="mt-2">{leave.reason}</div>
                                {leave.admin_comment && (
                                    <div className="small text-muted mt-2">Admin: {leave.admin_comment}</div>
                                )}
                            </div>
                            <span className={`badge ${leave.status === 'Approved' ? 'bg-success' : leave.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                {leave.status}
                            </span>
                        </div>
                    </div>
                ))
            )}
        </section>
    );
}
