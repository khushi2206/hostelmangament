import React from 'react';
import { useEffect, useState } from 'react';
import axiosClient from '../../../api/axiosClient';
import LeaveCard from '../../components/LeaveCard';

export default function LeaveList() {
    const [leaves, setLeaves] = useState([]);
    const [filters, setFilters] = useState({ search: '', status: '', leave_type: '', date: '' });
    const [expandedId, setExpandedId] = useState(null);
    const [rejectingLeave, setRejectingLeave] = useState(null);
    const [adminComment, setAdminComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    async function loadLeaves() {
        try {
            setLoading(true);
            setError('');
            const response = await axiosClient.get('/admin/leaves', { params: filters });
            setLeaves(response.data);
        } catch (requestError) {
            console.error(requestError);
            setError('Unable to load leave requests. Please check whether the backend is running.');
        } finally { setLoading(false); }
    }

    useEffect(() => { loadLeaves(); }, [filters]);

    function changeFilter(event) { setFilters({ ...filters, [event.target.name]: event.target.value }); }

    async function updateStatus(leave, status, comment) {
        try {
            setError('');
            const response = await axiosClient.put('/admin/leaves/' + leave.leave_id + '/status', { status: status, admin_comment: comment || '' });
            setMessage(response.data.message);
            setRejectingLeave(null);
            setAdminComment('');
            loadLeaves();
        } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to update leave request'); }
    }

    function approve(leave) {
        if (window.confirm('Are you sure you want to approve this leave request?')) updateStatus(leave, 'Approved', '');
    }

    function startReject(leave) {
        setRejectingLeave(leave);
        setAdminComment('');
        setError('');
    }

    function reject(event) {
        event.preventDefault();
        updateStatus(rejectingLeave, 'Rejected', adminComment);
    }

    return <section>
        <h2>Leave Management</h2><p className="text-muted">Students submit leave requests from their portal; approve or reject them here.</p>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card border-0 shadow-sm page-card mb-4"><div className="card-body"><div className="row g-2">
            <div className="col-md-5"><input name="search" value={filters.search} onChange={changeFilter} className="form-control" placeholder="Search by student name or enrollment number" /></div>
            <div className="col-md-2"><select name="status" value={filters.status} onChange={changeFilter} className="form-select"><option value="">All Status</option><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Rejected">Rejected</option></select></div>
            <div className="col-md-3"><select name="leave_type" value={filters.leave_type} onChange={changeFilter} className="form-select"><option value="">All Leave Types</option><option value="Outing">Outing</option><option value="Home Leave">Home Leave</option></select></div>
            <div className="col-md-2"><input name="date" type="date" value={filters.date} onChange={changeFilter} className="form-control" /></div>
        </div></div></div>
        {loading && <div className="alert alert-info">Loading leave requests...</div>}
        {!loading && !error && leaves.length === 0 && <div className="alert alert-light border">No leave requests found.</div>}
        {!loading && leaves.map(leave => <LeaveCard key={leave.leave_id} leave={leave} expanded={expandedId === leave.leave_id} onView={id => setExpandedId(expandedId === id ? null : id)} onApprove={approve} onReject={startReject} />)}
        {rejectingLeave && <div className="card border-0 shadow-sm page-card mt-4"><div className="card-body"><h5>Reject Leave Request</h5><p className="text-muted mb-2">{rejectingLeave.student_name} - {rejectingLeave.leave_type}</p><form onSubmit={reject}><label className="form-label">Admin Comment</label><textarea value={adminComment} onChange={event => setAdminComment(event.target.value)} className="form-control mb-3" rows="3" placeholder="Reason for rejection (optional)"></textarea><div className="d-flex gap-2"><button className="btn btn-danger">Reject Leave</button><button type="button" className="btn btn-outline-secondary" onClick={() => setRejectingLeave(null)}>Cancel</button></div></form></div></div>}
    </section>;
}
