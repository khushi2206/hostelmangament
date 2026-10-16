import React from 'react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import NoticeCard from '../../components/NoticeCard';

export default function NoticeList() {
    const [notices, setNotices] = useState([]);
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const location = useLocation();

    useEffect(() => {
        if (location.state?.message) {
            setMessage(location.state.message);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    async function loadNotices() {
        try {
            setLoading(true);
            setError('');
            const response = await axiosClient.get('/admin/notices');
            setNotices(response.data.notices || []);
        } catch (requestError) {
            console.error(requestError);
            setError('Failed to load notices.');
        } finally { setLoading(false); }
    }

    useEffect(() => { loadNotices(); }, []);

    async function deleteNotice(notice) {
        if (!window.confirm('Are you sure you want to delete this notice?')) return;
        try {
            const response = await axiosClient.delete('/admin/notices/' + notice.notice_id);
            setMessage(response.data.message);
            setNotices(notices.filter(item => item.notice_id !== notice.notice_id));
        } catch (requestError) { setError(requestError.response?.data?.message || 'Failed to delete notice.'); }
    }

    const filteredNotices = notices.filter(notice => (notice.title + ' ' + notice.description).toLowerCase().includes(search.toLowerCase()));
    return <section>
        <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2"><div><h2>Notices</h2><p className="text-muted">Create and manage hostel announcements.</p></div><Link to="/admin/notices/add" className="btn btn-primary"><i className="bi bi-plus-lg me-2"></i>Create Notice</Link></div>
        {message && <div className="alert alert-success">{message}</div>}{error && <div className="alert alert-danger">{error}</div>}
        <div className="card border-0 shadow-sm page-card mb-4"><div className="card-body"><input value={search} onChange={event => setSearch(event.target.value)} className="form-control" placeholder="Search notice title or description" /></div></div>
        {loading && <div className="alert alert-info">Loading notices...</div>}
        {!loading && !error && filteredNotices.length === 0 && <div className="alert alert-light border">No notices available.</div>}
        {!loading && filteredNotices.map(notice => <NoticeCard key={notice.notice_id} notice={notice} expanded={expandedId === notice.notice_id} onView={id => setExpandedId(expandedId === id ? null : id)} onDelete={deleteNotice} />)}
    </section>;
}
