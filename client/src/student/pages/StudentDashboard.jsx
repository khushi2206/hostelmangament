import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../components/StatusBadge';

export default function StudentDashboard() {
    const { user }  = useAuth();
    const [data,    setData]    = useState(null);
    const [error,   setError]   = useState('');

    useEffect(() => {
        axiosClient.get('/student/dashboard')
            .then(r => setData(r.data))
            .catch(e => setError(e.response?.data?.message || 'Failed to load dashboard.'));
    }, []);

    if (error) return <div className="hh-alert-danger">{error}</div>;
    if (!data)  return (
        <div className="d-flex align-items-center gap-2 text-muted mt-4">
            <div className="spinner-border spinner-border-sm text-primary" />
            Loading dashboard…
        </div>
    );

    const { student, room, latestLeaveStatus, feeStatus, recentNotices = [] } = data;

    return (
        <>
            {/* Page header */}
            <div className="hh-page-title">Welcome back, {student?.name || user?.email} 👋</div>
            <div className="hh-page-sub">Here's a quick overview of your hostel life.</div>

            {/* Stat row */}
            <div className="row g-3 mb-4">
                {/* Room card */}
                <div className="col-md-4">
                    <div className="hh-stat h-100">
                        <div className="hh-stat-icon teal"><i className="bi bi-door-closed" /></div>
                        <div>
                            <div className="hh-stat-label">My Room</div>
                            {room
                                ? <div className="hh-stat-val">{room.room_number}</div>
                                : <div className="hh-stat-val" style={{fontSize:'1rem', color:'#94a3b8'}}>Not Allocated</div>
                            }
                            {room && <div className="hh-stat-sub">Floor {room.floor} · Block {room.block}</div>}
                        </div>
                    </div>
                </div>

                {/* Leave card */}
                <div className="col-md-4">
                    <div className="hh-stat h-100">
                        <div className="hh-stat-icon blue"><i className="bi bi-calendar-event" /></div>
                        <div>
                            <div className="hh-stat-label">Latest Leave</div>
                            <div className="mt-1">
                                <StatusBadge status={latestLeaveStatus || 'None'} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fee card */}
                <div className="col-md-4">
                    <div className="hh-stat h-100">
                        <div className="hh-stat-icon amber"><i className="bi bi-cash-coin" /></div>
                        <div>
                            <div className="hh-stat-label">Fee Status</div>
                            {feeStatus
                                ? <>
                                    <div className="mt-1"><StatusBadge status={feeStatus.status} /></div>
                                    <div className="hh-stat-sub mt-1">Remaining: ₹{feeStatus.remaining}</div>
                                  </>
                                : <div className="hh-stat-sub mt-1">No fee records</div>
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick actions */}
            <div className="hh-card mb-4">
                <div className="hh-card-header">
                    <span className="hh-card-title"><i className="bi bi-lightning me-2 text-warning" />Quick Actions</span>
                </div>
                <div className="hh-card-body d-flex gap-2 flex-wrap">
                    <Link to="/student/leaves"     className="btn btn-primary btn-sm"><i className="bi bi-calendar-event me-1" />Submit Leave</Link>
                    <Link to="/student/complaints" className="btn btn-outline-primary btn-sm"><i className="bi bi-tools me-1" />Raise Complaint</Link>
                    <Link to="/student/visitors"   className="btn btn-outline-primary btn-sm"><i className="bi bi-people me-1" />Register Visitor</Link>
                    <Link to="/student/notices"    className="btn btn-outline-secondary btn-sm"><i className="bi bi-megaphone me-1" />View Notices</Link>
                    <Link to="/student/mess"       className="btn btn-outline-secondary btn-sm"><i className="bi bi-cup-hot me-1" />Mess Menu</Link>
                </div>
            </div>

            {/* Recent notices */}
            <div className="hh-card">
                <div className="hh-card-header">
                    <span className="hh-card-title"><i className="bi bi-megaphone me-2" />Recent Notices</span>
                    <Link to="/student/notices" className="btn btn-sm btn-outline-secondary">
                        View All <i className="bi bi-arrow-right ms-1" />
                    </Link>
                </div>
                <div className="hh-card-body p-0">
                    {recentNotices.length === 0
                        ? <div className="px-4 py-3 text-muted small">No notices yet.</div>
                        : recentNotices.map(n => (
                            <div key={n.notice_id} className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom" style={{gap:'1rem'}}>
                                <span className="fw-semibold" style={{fontSize:'0.88rem'}}>{n.title}</span>
                                <span className="hh-badge hh-badge-default flex-shrink-0">
                                    <i className="bi bi-calendar3" style={{fontSize:'0.7rem'}} />
                                    {new Date(n.created_at || n.date).toLocaleDateString()}
                                </span>
                            </div>
                        ))
                    }
                </div>
            </div>
        </>
    );
}
