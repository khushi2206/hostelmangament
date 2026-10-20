import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

export default function Notices() {
    const [notices, setNotices] = useState([]);
    const [error,   setError]   = useState('');

    useEffect(() => {
        axiosClient.get('/student/notices')
            .then(r => setNotices(r.data))
            .catch(e => setError(e.response?.data?.message || 'Failed to load.'));
    }, []);

    return (
        <>
            <div className="hh-page-title">Notices</div>
            <div className="hh-page-sub">Official announcements and hostel updates from the warden.</div>

            {error && <div className="hh-alert-danger mb-3">{error}</div>}

            {notices.length === 0 && !error && (
                <div className="hh-card">
                    <div className="hh-card-body text-center text-muted py-5">
                        <i className="bi bi-megaphone display-5 d-block mb-2" style={{color:'#cbd5e1'}} />
                        No notices available right now.
                    </div>
                </div>
            )}

            <div className="d-flex flex-column gap-3">
                {notices.map(n => (
                    <div key={n.notice_id} className="hh-card">
                        <div className="hh-card-body">
                            <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
                                <h6 className="fw-bold mb-0" style={{color:'#0f172a'}}>{n.title}</h6>
                                <span className="hh-badge hh-badge-default flex-shrink-0">
                                    <i className="bi bi-calendar3" style={{fontSize:'0.7rem'}} />
                                    {new Date(n.created_at || n.date).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-muted mb-0" style={{fontSize:'0.87rem', whiteSpace:'pre-wrap'}}>{n.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
