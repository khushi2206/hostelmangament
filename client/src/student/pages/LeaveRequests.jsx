import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../components/StatusBadge';

export default function LeaveRequests() {
    const [leaves,   setLeaves]  = useState([]);
    const [form,     setForm]    = useState({ leave_type: 'Outing', from_date: '', to_date: '', reason: '' });
    const [success,  setSuccess] = useState('');
    const [error,    setError]   = useState('');
    const [saving,   setSaving]  = useState(false);

    const load = () => axiosClient.get('/student/leaves').then(r => setLeaves(r.data)).catch(console.error);
    useEffect(() => { load(); }, []);

    async function submit(e) {
        e.preventDefault(); setError('');
        try {
            setSaving(true);
            await axiosClient.post('/student/leaves', form);
            setForm({ leave_type: 'Outing', from_date: '', to_date: '', reason: '' });
            load();
            setSuccess('Leave request submitted!');
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) { setError(err.response?.data?.message || 'Failed to submit.'); }
        finally { setSaving(false); }
    }

    async function cancel(id) {
        if (!window.confirm('Cancel this leave request?')) return;
        try {
            await axiosClient.delete(`/student/leaves/${id}`);
            load();
        } catch (err) { setError(err.response?.data?.message || 'Cannot cancel.'); }
    }

    return (
        <>
            <div className="hh-page-title">Leave Requests</div>
            <div className="hh-page-sub">Apply for leave and track your request status.</div>

            {/* Form */}
            <div className="hh-card mb-4">
                <div className="hh-card-header">
                    <span className="hh-card-title"><i className="bi bi-plus-circle me-2 text-primary" />New Leave Request</span>
                </div>
                <div className="hh-card-body">
                    {success && <div className="hh-alert-success mb-3"><i className="bi bi-check-circle me-2" />{success}</div>}
                    {error   && <div className="hh-alert-danger  mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
                    <form onSubmit={submit} className="row g-3">
                        <div className="col-md-4">
                            <label className="hh-form-label">Leave Type</label>
                            <select className="form-select" value={form.leave_type}
                                onChange={e => setForm({...form, leave_type: e.target.value})} required>
                                <option value="Outing">Outing</option>
                                <option value="Home Leave">Home Leave</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="hh-form-label">From Date</label>
                            <input type="date" className="form-control" value={form.from_date}
                                onChange={e => setForm({...form, from_date: e.target.value})} required />
                        </div>
                        <div className="col-md-4">
                            <label className="hh-form-label">To Date</label>
                            <input type="date" className="form-control" value={form.to_date}
                                onChange={e => setForm({...form, to_date: e.target.value})} required />
                        </div>
                        <div className="col-12">
                            <label className="hh-form-label">Reason</label>
                            <textarea className="form-control" rows="2" value={form.reason}
                                onChange={e => setForm({...form, reason: e.target.value})}
                                placeholder="Briefly describe your reason…" required />
                        </div>
                        <div className="col-12">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</> : <><i className="bi bi-send me-2" />Submit Request</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* History table */}
            <div className="hh-card">
                <div className="hh-card-header">
                    <span className="hh-card-title"><i className="bi bi-clock-history me-2" />Leave History</span>
                    <span className="hh-badge hh-badge-default">{leaves.length} records</span>
                </div>
                <div className="table-responsive">
                    <table className="hh-table">
                        <thead>
                            <tr><th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Status</th><th>Admin Note</th><th></th></tr>
                        </thead>
                        <tbody>
                            {leaves.length === 0
                                ? <tr><td colSpan="7" className="text-center text-muted py-4">No leave requests yet.</td></tr>
                                : leaves.map(l => (
                                    <tr key={l.leave_id}>
                                        <td className="fw-semibold">{l.leave_type}</td>
                                        <td>{new Date(l.from_date).toLocaleDateString()}</td>
                                        <td>{new Date(l.to_date).toLocaleDateString()}</td>
                                        <td style={{maxWidth:'200px'}} className="text-truncate">{l.reason}</td>
                                        <td><StatusBadge status={l.status} /></td>
                                        <td className="text-muted small">{l.admin_comment || '—'}</td>
                                        <td>
                                            {l.status === 'Pending' &&
                                                <button onClick={() => cancel(l.leave_id)}
                                                    className="btn btn-sm btn-outline-danger">Cancel</button>}
                                        </td>
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
