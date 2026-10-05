import React from 'react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import VisitorCard from '../../components/VisitorCard';

function todayString() {
    const date = new Date();
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}

export default function VisitorList() {
    const location = useLocation();
    const [visitors, setVisitors] = useState([]);
    const [filters, setFilters] = useState({ search: '', status: '', date: '' });
    const [todayMode, setTodayMode] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    async function loadVisitors() {
        try {
            setLoading(true);
            setError('');
            const response = await axiosClient.get('/admin/visitors', { params: filters });
            setVisitors(response.data);
        } catch (requestError) {
            console.error(requestError);
            setError('Unable to load visitors. Please check whether the backend is running.');
        } finally { setLoading(false); }
    }

    useEffect(() => { loadVisitors(); }, [filters]);

    function changeFilter(event) {
        setTodayMode(false);
        setFilters({ ...filters, [event.target.name]: event.target.value });
    }

    function showToday() {
        setTodayMode(true);
        setFilters({ ...filters, date: todayString() });
    }

    function clearFilters() {
        setTodayMode(false);
        setFilters({ search: '', status: '', date: '' });
    }

    async function approveVisitor(visitor) {
        if (!window.confirm('Are you sure you want to approve this visitor?')) return;
        try {
            const response = await axiosClient.put('/admin/visitors/' + visitor.visitor_id + '/status', { status: 'Approved' });
            setMessage(response.data.message);
            loadVisitors();
        } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to approve visitor'); }
    }

    const emptyMessage = todayMode ? "No visitors are scheduled for today." : filters.search || filters.status || filters.date ? 'No visitors found for the selected filters.' : 'No visitors found.';

    return <section>
        <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
            <div>
                <h2>Visitor Management</h2>
                <p className="text-muted mb-0">View, register, and approve visitor entries.</p>
            </div>
            <Link to="/admin/visitors/add" className="btn btn-primary"><i className="bi bi-plus-lg me-2"></i>Add Visitor</Link>
        </div>
        {location.state?.message && <div className="alert alert-success">{location.state.message}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card border-0 shadow-sm page-card mb-4"><div className="card-body"><div className="row g-2 align-items-center">
            <div className="col-md-5"><input name="search" value={filters.search} onChange={changeFilter} className="form-control" placeholder="Search by visitor or student name" /></div>
            <div className="col-md-2"><select name="status" value={filters.status} onChange={changeFilter} className="form-select"><option value="">All Status</option><option value="Pending">Pending</option><option value="Approved">Approved</option></select></div>
            <div className="col-md-2"><input name="date" type="date" value={filters.date} onChange={changeFilter} className="form-control" /></div>
            <div className="col-md-3 d-flex gap-2"><button className={'btn ' + (todayMode ? 'btn-primary' : 'btn-outline-primary')} onClick={showToday}><i className="bi bi-calendar-event me-1"></i>Today's Visitors</button><button className="btn btn-outline-secondary" onClick={clearFilters}>Clear Filters</button></div>
        </div></div></div>
        {todayMode && <div className="alert alert-info">Showing today's visitors.</div>}
        {loading && <div className="alert alert-info">Loading visitors...</div>}
        {!loading && !error && visitors.length === 0 && <div className="alert alert-light border">{emptyMessage}</div>}
        {!loading && visitors.map(visitor => <VisitorCard key={visitor.visitor_id} visitor={visitor} expanded={expandedId === visitor.visitor_id} onView={id => setExpandedId(expandedId === id ? null : id)} onApprove={approveVisitor} />)}
    </section>;
}
