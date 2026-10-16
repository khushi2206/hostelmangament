import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../components/StatusBadge';

export default function Visitors() {
    const [list,    setList]   = useState([]);
    const [form,    setForm]   = useState({ visitor_name:'', relation:'', phone:'', visit_date:'', visit_time:'' });
    const [success, setSuccess]= useState('');
    const [error,   setError]  = useState('');
    const [saving,  setSaving] = useState(false);

    const load = () => axiosClient.get('/student/visitors').then(r => setList(r.data)).catch(console.error);
    useEffect(() => { load(); }, []);

    async function submit(e) {
        e.preventDefault(); setError('');
        try {
            setSaving(true);
            await axiosClient.post('/student/visitors', form);
            setForm({ visitor_name:'', relation:'', phone:'', visit_date:'', visit_time:'' });
            load();
            setSuccess('Visitor registered successfully!');
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) { setError(err.response?.data?.message || 'Failed to register.'); }
        finally { setSaving(false); }
    }

    return (
        <>
            <div className="hh-page-title">Visitors</div>
            <div className="hh-page-sub">Register expected visitors and track approvals.</div>

            <div className="hh-card mb-4">
                <div className="hh-card-header">
                    <span className="hh-card-title"><i className="bi bi-person-plus me-2 text-primary" />Register Visitor</span>
                </div>
                <div className="hh-card-body">
                    {success && <div className="hh-alert-success mb-3"><i className="bi bi-check-circle me-2" />{success}</div>}
                    {error   && <div className="hh-alert-danger  mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
                    <form onSubmit={submit} className="row g-3">
                        <div className="col-md-4">
                            <label className="hh-form-label">Visitor Name</label>
                            <input type="text" className="form-control" value={form.visitor_name}
                                onChange={e => setForm({...form, visitor_name: e.target.value})} required />
                        </div>
                        <div className="col-md-4">
                            <label className="hh-form-label">Relation</label>
                            <input type="text" className="form-control" value={form.relation}
                                onChange={e => setForm({...form, relation: e.target.value})} required />
                        </div>
                        <div className="col-md-4">
                            <label className="hh-form-label">Phone</label>
                            <input type="text" className="form-control" value={form.phone}
                                onChange={e => setForm({...form, phone: e.target.value})} required />
                        </div>
                        <div className="col-md-6">
                            <label className="hh-form-label">Visit Date</label>
                            <input type="date" className="form-control" value={form.visit_date}
                                onChange={e => setForm({...form, visit_date: e.target.value})} required />
                        </div>
                        <div className="col-md-6">
                            <label className="hh-form-label">Visit Time</label>
                            <input type="time" className="form-control" value={form.visit_time}
                                onChange={e => setForm({...form, visit_time: e.target.value})} required />
                        </div>
                        <div className="col-12">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? <><span className="spinner-border spinner-border-sm me-2" />Registering…</> : <><i className="bi bi-person-check me-2" />Register Visitor</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="hh-card">
                <div className="hh-card-header">
                    <span className="hh-card-title"><i className="bi bi-clock-history me-2" />Visitor History</span>
                    <span className="hh-badge hh-badge-default">{list.length} records</span>
                </div>
                <div className="table-responsive">
                    <table className="hh-table">
                        <thead>
                            <tr><th>Name</th><th>Relation</th><th>Phone</th><th>Date</th><th>Time</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            {list.length === 0
                                ? <tr><td colSpan="6" className="text-center text-muted py-4">No visitors registered.</td></tr>
                                : list.map(v => (
                                    <tr key={v.visitor_id}>
                                        <td className="fw-semibold">{v.visitor_name}</td>
                                        <td>{v.relation}</td>
                                        <td>{v.phone}</td>
                                        <td>{new Date(v.visit_date).toLocaleDateString()}</td>
                                        <td>{v.visit_time}</td>
                                        <td><StatusBadge status={v.status} /></td>
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
