import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../components/StatusBadge';

export default function MyRoom() {
    const [data,    setData]    = useState(null);
    const [changes, setChanges] = useState([]);
    const [reason,  setReason]  = useState('');
    const [success, setSuccess] = useState('');
    const [error,   setError]   = useState('');

    const loadRoom    = () => axiosClient.get('/student/room').then(r => setData(r.data)).catch(console.error);
    const loadChanges = () => axiosClient.get('/student/room-change').then(r => setChanges(r.data)).catch(console.error);

    useEffect(() => { loadRoom(); loadChanges(); }, []);

    async function submitChange(e) {
        e.preventDefault(); setError('');
        try {
            await axiosClient.post('/student/room-change', { reason });
            setReason('');
            loadChanges();
            setSuccess('Room change request submitted!');
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) { setError(err.response?.data?.message || 'Failed to submit.'); }
    }

    if (!data) return (
        <div className="d-flex align-items-center gap-2 text-muted mt-4">
            <div className="spinner-border spinner-border-sm" />Loading room info…
        </div>
    );

    if (!data.room) return (
        <>
            <div className="hh-page-title">My Room</div>
            <div className="hh-alert-warn mt-3">
                <i className="bi bi-info-circle me-2" />
                You have not been allocated a room yet. Please contact the warden.
            </div>
        </>
    );

    const { room, roommates = [] } = data;

    return (
        <>
            <div className="hh-page-title">My Room</div>
            <div className="hh-page-sub">Room details and roommate information.</div>

            {/* Room info */}
            <div className="row g-3 mb-4">
                {[
                    { label:'Room Number', value: room.room_number, icon:'bi-door-closed' },
                    { label:'Block',       value: room.block || '—', icon:'bi-building' },
                    { label:'Floor',       value: room.floor,        icon:'bi-layers' },
                    { label:'Occupancy',   value: `${room.occupied} / ${room.capacity}`, icon:'bi-people' },
                ].map(s => (
                    <div className="col-md-3 col-6" key={s.label}>
                        <div className="hh-stat">
                            <div className="hh-stat-icon teal"><i className={`bi ${s.icon}`}/></div>
                            <div><div className="hh-stat-label">{s.label}</div><div className="hh-stat-val" style={{fontSize:'1.1rem'}}>{s.value}</div></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Roommates */}
            <div className="hh-card mb-4">
                <div className="hh-card-header">
                    <span className="hh-card-title"><i className="bi bi-people me-2" />Roommates</span>
                    <span className="hh-badge hh-badge-default">{roommates.length}</span>
                </div>
                <div className="table-responsive">
                    <table className="hh-table">
                        <thead><tr><th>Name</th><th>Enrollment No</th><th>Course</th></tr></thead>
                        <tbody>
                            {roommates.length === 0
                                ? <tr><td colSpan="3" className="text-center text-muted py-3">No other roommates assigned.</td></tr>
                                : roommates.map((r, i) => (
                                    <tr key={i}>
                                        <td className="fw-semibold">{r.name}</td>
                                        <td>{r.enrollment_no}</td>
                                        <td>{r.course}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Room change */}
            <div className="hh-card">
                <div className="hh-card-header">
                    <span className="hh-card-title"><i className="bi bi-arrow-left-right me-2" />Request Room Change</span>
                </div>
                <div className="hh-card-body">
                    {success && <div className="hh-alert-success mb-3"><i className="bi bi-check-circle me-2" />{success}</div>}
                    {error   && <div className="hh-alert-danger  mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
                    <form onSubmit={submitChange}>
                        <label className="hh-form-label">Reason for change</label>
                        <textarea className="form-control mb-3" rows="2" value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder='e.g. "Mutual swap with 22CS010"' required />
                        <button type="submit" className="btn btn-primary">
                            <i className="bi bi-send me-2" />Submit Request
                        </button>
                    </form>

                    {changes.length > 0 && (
                        <div className="mt-4">
                            <div className="fw-semibold mb-2" style={{fontSize:'0.85rem',color:'#374151'}}>Your Requests</div>
                            <div className="d-flex flex-column gap-2">
                                {changes.map(c => (
                                    <div key={c.request_id} className="d-flex justify-content-between align-items-center p-3 rounded" style={{background:'#f8fafc',border:'1px solid #e2e8f0'}}>
                                        <span style={{fontSize:'0.87rem'}}>{c.reason}</span>
                                        <StatusBadge status={c.status} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
