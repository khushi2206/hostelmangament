import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import ComplaintCard from '../components/ComplaintCard';
import NoticeCard from '../components/NoticeCard';

function SummaryCard({ icon, label, value, subtext }) {
    return (
        <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm page-card h-100">
                <div className="card-body d-flex align-items-center gap-3">
                    <div className="icon-circle">
                        <i className={`bi ${icon}`}></i>
                    </div>
                    <div>
                        <div className="small text-muted">{label}</div>
                        <h3 className="mb-0 font-weight-bold">{value}</h3>
                        {subtext && <div className="small text-muted mt-1">{subtext}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedComplaintId, setExpandedComplaintId] = useState(null);
    const [expandedNoticeId, setExpandedNoticeId] = useState(null);

    async function loadDashboard() {
        try {
            setLoading(true);
            setError('');
            const response = await axiosClient.get('/admin/dashboard');
            const resultData = response.data?.data || response.data;
            setData(resultData);
        } catch (requestError) {
            console.error(requestError);
            setError('Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard();
    }, []);

    async function handleComplaintStatusChange(complaint, newStatus) {
        try {
            await axiosClient.put(`/admin/complaints/${complaint.complaint_id}/status`, { status: newStatus });
            loadDashboard();
        } catch (err) {
            console.error(err);
            alert('Failed to update complaint status.');
        }
    }

    async function handleNoticeDelete(notice) {
        if (!window.confirm('Are you sure you want to delete this notice?')) return;
        try {
            await axiosClient.delete(`/admin/notices/${notice.notice_id}`);
            loadDashboard();
        } catch (err) {
            console.error(err);
            alert('Failed to delete notice.');
        }
    }

    if (loading) {
        return (
            <section className="py-2">
                <h2 className="mb-1">Dashboard</h2>
                <p className="text-muted mb-4">Hostel administration overview</p>
                <div className="alert alert-info d-flex align-items-center gap-2">
                    <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                    <span>Loading dashboard...</span>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-2">
                <h2 className="mb-1">Dashboard</h2>
                <p className="text-muted mb-4">Hostel administration overview</p>
                <div className="alert alert-danger mb-3">{error}</div>
                <button className="btn btn-primary" onClick={loadDashboard}>
                    <i className="bi bi-arrow-clockwise me-2"></i>Retry
                </button>
            </section>
        );
    }

    const students = data?.students || {};
    const rooms = data?.rooms || {};
    const leaves = data?.leaves || {};
    const visitors = data?.visitors || {};
    const complaints = data?.complaints || {};
    const fees = data?.fees || {};
    const notices = data?.notices || {};
    const recentComplaints = data?.recentComplaints || [];
    const recentNotices = data?.recentNotices || [];

    const occupancyPct = rooms.totalCapacity
        ? Math.round((rooms.occupiedBeds / rooms.totalCapacity) * 100)
        : 0;

    return (
        <section className="py-2">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h2 className="mb-1">Dashboard</h2>
                    <p className="text-muted mb-0">Hostel administration overview</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="row g-3 mb-4">
                <SummaryCard icon="bi-people" label="Total Students" value={students.total || 0} subtext={students.active ? `${students.active} Active` : null} />
                <SummaryCard icon="bi-door-open" label="Total Rooms" value={rooms.total || 0} subtext={`${rooms.occupied || 0} Occupied, ${rooms.available || 0} Available`} />
                <SummaryCard icon="bi-person-check" label="Occupied Beds" value={rooms.occupiedBeds || 0} subtext={`Capacity: ${rooms.totalCapacity || 0}`} />
                <SummaryCard icon="bi-person-plus" label="Available Beds" value={rooms.availableBeds || 0} subtext={`Occupancy: ${occupancyPct}%`} />
                <SummaryCard icon="bi-calendar-event" label="Pending Leaves" value={leaves.pending || 0} />
                <SummaryCard icon="bi-person-badge" label="Pending Visitors" value={visitors.pending || 0} subtext={visitors.today ? `${visitors.today} Today` : null} />
                <SummaryCard icon="bi-tools" label="Pending Complaints" value={complaints.pending || 0} subtext={`${complaints.inProgress || 0} In Progress`} />
                <SummaryCard icon="bi-cash-coin" label="Due Fees" value={fees.due || 0} subtext={`Paid: ${fees.paid || 0}, Partial: ${fees.partial || 0}`} />
                <SummaryCard icon="bi-megaphone" label="Total Notices" value={notices.total || 0} />
            </div>

            {/* Quick Actions */}
            <div className="card border-0 shadow-sm page-card mb-4">
                <div className="card-body">
                    <h5 className="card-title mb-3">Quick Actions</h5>
                    <div className="d-flex gap-2 flex-wrap">
                        <Link to="/admin/students/add" className="btn btn-primary">
                            <i className="bi bi-person-plus me-2"></i>Add Student
                        </Link>
                        <Link to="/admin/rooms/add" className="btn btn-outline-primary">
                            <i className="bi bi-door-open me-2"></i>Add Room
                        </Link>
                        <Link to="/admin/allocation" className="btn btn-outline-primary">
                            <i className="bi bi-person-check me-2"></i>Room Allocation
                        </Link>
                        <Link to="/admin/notices/add" className="btn btn-outline-primary">
                            <i className="bi bi-megaphone me-2"></i>Add Notice
                        </Link>
                        <Link to="/admin/complaints" className="btn btn-outline-primary">
                            <i className="bi bi-tools me-2"></i>View Complaints
                        </Link>
                        <Link to="/admin/fees" className="btn btn-outline-primary">
                            <i className="bi bi-cash-coin me-2"></i>View Fees
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Complaints & Recent Notices */}
            <div className="row g-4">
                {/* Recent Complaints */}
                <div className="col-12 col-lg-6">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Recent Complaints</h5>
                        <Link to="/admin/complaints" className="btn btn-sm btn-outline-secondary">
                            View All <i className="bi bi-arrow-right ms-1"></i>
                        </Link>
                    </div>
                    {recentComplaints.length === 0 ? (
                        <div className="card border-0 shadow-sm page-card">
                            <div className="card-body text-muted small">No complaints found.</div>
                        </div>
                    ) : (
                        recentComplaints.map(complaint => (
                            <ComplaintCard
                                key={complaint.complaint_id}
                                complaint={complaint}
                                expanded={expandedComplaintId === complaint.complaint_id}
                                onView={id => setExpandedComplaintId(expandedComplaintId === id ? null : id)}
                                onStatusChange={handleComplaintStatusChange}
                            />
                        ))
                    )}
                </div>

                {/* Recent Notices */}
                <div className="col-12 col-lg-6">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Recent Notices</h5>
                        <Link to="/admin/notices" className="btn btn-sm btn-outline-secondary">
                            View All <i className="bi bi-arrow-right ms-1"></i>
                        </Link>
                    </div>
                    {recentNotices.length === 0 ? (
                        <div className="card border-0 shadow-sm page-card">
                            <div className="card-body text-muted small">No notices found.</div>
                        </div>
                    ) : (
                        recentNotices.map(notice => (
                            <NoticeCard
                                key={notice.notice_id}
                                notice={notice}
                                expanded={expandedNoticeId === notice.notice_id}
                                onView={id => setExpandedNoticeId(expandedNoticeId === id ? null : id)}
                                onDelete={handleNoticeDelete}
                            />
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
