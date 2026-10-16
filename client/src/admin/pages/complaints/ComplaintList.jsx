import React from 'react';
import { useEffect, useState } from 'react';
import axiosClient from '../../../api/axiosClient';
import ComplaintCard from '../../components/ComplaintCard';

export default function ComplaintList() {
    const [complaints, setComplaints] = useState([]);
    const [filters, setFilters] = useState({ search: '', category: '', status: '' });
    const [expandedId, setExpandedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    async function loadComplaints() {
        try {
            setLoading(true);
            setError('');
            const response = await axiosClient.get('/admin/complaints', { params: filters });
            setComplaints(response.data.complaints || []);
        } catch (requestError) {
            console.error(requestError);
            setError('Failed to load complaints.');
        } finally { setLoading(false); }
    }

    useEffect(() => { loadComplaints(); }, [filters]);

    function changeFilter(event) { setFilters({ ...filters, [event.target.name]: event.target.value }); }

    async function updateStatus(complaint, status) {
        if (status === complaint.status) return;
        try {
            setError('');
            const response = await axiosClient.put('/admin/complaints/' + complaint.complaint_id + '/status', { status: status });
            setMessage(response.data.message);
            setComplaints(complaints.map(item => item.complaint_id === complaint.complaint_id ? { ...item, status: status } : item));
        } catch (requestError) {
            console.error(requestError);
            setError(requestError.response?.data?.message || 'Failed to update complaint status.');
        }
    }

    const pendingCount = complaints.filter(complaint => complaint.status === 'Pending').length;
    const progressCount = complaints.filter(complaint => complaint.status === 'In Progress').length;
    const resolvedCount = complaints.filter(complaint => complaint.status === 'Resolved').length;

    return <section>
        <h2>Complaints</h2><p className="text-muted">Manage student complaints and update their status.</p>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="row g-3 mb-4"><div className="col-md-3"><div className="card border-0 shadow-sm page-card"><div className="card-body"><div className="small text-muted">Total Complaints</div><h4 className="mb-0">{complaints.length}</h4></div></div></div><div className="col-md-3"><div className="card border-0 shadow-sm page-card"><div className="card-body"><div className="small text-muted">Pending</div><h4 className="mb-0">{pendingCount}</h4></div></div></div><div className="col-md-3"><div className="card border-0 shadow-sm page-card"><div className="card-body"><div className="small text-muted">In Progress</div><h4 className="mb-0">{progressCount}</h4></div></div></div><div className="col-md-3"><div className="card border-0 shadow-sm page-card"><div className="card-body"><div className="small text-muted">Resolved</div><h4 className="mb-0">{resolvedCount}</h4></div></div></div></div>
        <div className="card border-0 shadow-sm page-card mb-4"><div className="card-body"><div className="row g-2">
            <div className="col-md-5"><input name="search" value={filters.search} onChange={changeFilter} className="form-control" placeholder="Search by student name or enrollment number" /></div>
            <div className="col-md-3"><select name="category" value={filters.category} onChange={changeFilter} className="form-select"><option value="">All Categories</option><option>Electrical</option><option>Plumbing</option><option>Cleaning</option><option>Wi-Fi</option><option>Furniture</option><option>Other</option></select></div>
            <div className="col-md-4"><select name="status" value={filters.status} onChange={changeFilter} className="form-select"><option value="">All Status</option><option>Pending</option><option>In Progress</option><option>Resolved</option></select></div>
        </div></div></div>
        {loading && <div className="alert alert-info">Loading...</div>}
        {!loading && !error && complaints.length === 0 && <div className="alert alert-light border">No complaints found.</div>}
        {!loading && complaints.map(complaint => <ComplaintCard key={complaint.complaint_id} complaint={complaint} expanded={expandedId === complaint.complaint_id} onView={id => setExpandedId(expandedId === id ? null : id)} onStatusChange={updateStatus} />)}
    </section>;
}
