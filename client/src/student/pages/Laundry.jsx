import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../components/StatusBadge';

export default function Laundry() {
    const [requests, setRequests] = useState([]);
    const [count,    setCount]    = useState('');
    const [success,  setSuccess]  = useState('');
    const [error,    setError]    = useState('');

    const load = () => axiosClient.get('/student/laundry').then(r => setRequests(r.data)).catch(console.error);
    useEffect(() => { load(); }, []);

    async function submit(e) {
        e.preventDefault(); setError('');
        try {
            await axiosClient.post('/student/laundry', { clothes_count: count });
            setCount('');
            load();
            setSuccess('Laundry pickup scheduled!');
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) { setError(err.response?.data?.message || 'Failed.'); }
    }

    const pending  = requests.filter(r => r.status === 'Pending').length;
    const inProgress = requests.filter(r => r.status === 'In Progress').length;

    return (
        <>
            <div className="hh-page-title">Laundry</div>
            <div className="hh-page-sub">Schedule laundry pickup and track your requests.</div>

            {requests.length > 0 && (
                <div className="row g-3 mb-4">
                    <div className="col-md-4">
                        <div className="hh-stat"><div className="hh-stat-icon blue"><i className="bi bi-bag"/></div>
                            <div><div className="hh-stat-label">Total Requests</div><div className="hh-stat-val">{requests.length}</div></div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="hh-stat"><div className="hh-stat-icon amber"><i className="bi bi-clock"/></div>
                            <div><div className="hh-stat-label">Pending</div><div className="hh-stat-val">{pending}</div></div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="hh-stat"><div className="hh-stat-icon teal"><i className="bi bi-arrow-repeat"/></div>
                            <div><div className="hh-stat-label">In Progress</div><div className="hh-stat-val">{inProgress}</div></div>
                        </div>
                    </div>
                </div>
            )}

            <div className="hh-card mb-4">
                <div className="hh-card-header">
                    <span className="hh-card-title"><i className="bi bi-plus-circle me-2 text-primary" />New Pickup Request</span>
                </div>
                <div className="hh-card-body">
                    {success && <div className="hh-alert-success mb-3"><i className="bi bi-check-circle me-2" />{success}</div>}
                    {error   && <div className="hh-alert-danger  mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
                    <form onSubmit={submit} className="row g-3 align-items-end">
                        <div className="col-md-6">
                            <label className="hh-form-label">Number of Clothes</label>
                            <input type="number" min="1" max="50" className="form-control" value={count}
                                onChange={e => setCount(e.target.value)} required />
                        </div>
                        <div className="col-md-6">
                            <button type="submit" className="btn btn-primary w-100">
                                <i className="bi bi-bag me-2" />Schedule Pickup
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="hh-card">
                <div className="hh-card-header">
                    <span className="hh-card-title"><i className="bi bi-clock-history me-2" />Request History</span>
                </div>
                <div className="table-responsive">
                    <table className="hh-table">
                        <thead><tr><th>Request ID</th><th>Items</th><th>Date</th><th>Status</th></tr></thead>
                        <tbody>
                            {requests.length === 0
                                ? <tr><td colSpan="4" className="text-center text-muted py-4">No laundry requests yet.</td></tr>
                                : requests.map(r => (
                                    <tr key={r.laundry_id}>
                                        <td className="fw-semibold text-muted">#LND-{r.laundry_id}</td>
                                        <td>{r.clothes_count} clothes</td>
                                        <td>{new Date(r.request_date).toLocaleDateString()}</td>
                                        <td><StatusBadge status={r.status} /></td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
