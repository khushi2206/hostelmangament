import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../components/StatusBadge';

export default function Complaints() {
    const [list,    setList]   = useState([]);
    const [form,    setForm]   = useState({ category: '', description: '' });
    const [success, setSuccess]= useState('');
    const [error,   setError]  = useState('');
    const [saving,  setSaving] = useState(false);

    const load = () => axiosClient.get('/student/complaints').then(r => setList(r.data)).catch(console.error);
    useEffect(() => { load(); }, []);

    async function submit(e) {
        e.preventDefault(); setError('');
        try {
            setSaving(true);
            await axiosClient.post('/student/complaints', form);
            setForm({ category: '', description: '' });
            load();
            setSuccess('Complaint submitted successfully!');
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) { setError(err.response?.data?.message || 'Failed to submit.'); }
        finally { setSaving(false); }
    }

    const categories = ['Electrical', 'Plumbing', 'Cleaning', 'Wi-Fi', 'Furniture', 'Other'];

    return (
        <>
            <div className="hh-page-title">Complaints</div>
            <div className="hh-page-sub">Submit and track maintenance or other hostel complaints.</div>

            <div className="hh-card mb-4">
                <div className="hh-card-header">
                    <span className="hh-card-title"><i className="bi bi-plus-circle me-2 text-primary" />Submit Complaint</span>
                </div>
                <div className="hh-card-body">
                    {success && <div className="hh-alert-success mb-3"><i className="bi bi-check-circle me-2" />{success}</div>}
                    {error   && <div className="hh-alert-danger  mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
                    <form onSubmit={submit} className="row g-3">
                        <div className="col-md-5">
                            <label className="hh-form-label">Category</label>
                            <select className="form-select" value={form.category}
                                onChange={e => setForm({...form, category: e.target.value})} required>
                                <option value="">Select category…</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="col-12">
                            <label className="hh-form-label">Description</label>
                            <textarea className="form-control" rows="3" value={form.description}
                                onChange={e => setForm({...form, description: e.target.value})}
                                placeholder="Describe the issue in detail…" required />
                        </div>
                        <div className="col-12">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</> : <><i className="bi bi-send me-2" />Submit Complaint</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="hh-card">
                <div className="hh-card-header">
                    <span className="hh-card-title"><i className="bi bi-list-check me-2" />My Complaints</span>
                    <span className="hh-badge hh-badge-default">{list.length} records</span>
                </div>
                <div className="table-responsive">
                    <table className="hh-table">
                        <thead>
                            <tr><th>Date</th><th>Category</th><th>Description</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            {list.length === 0
                                ? <tr><td colSpan="4" className="text-center text-muted py-4">No complaints submitted yet.</td></tr>
                                : list.map(c => (
                                    <tr key={c.complaint_id}>
                                        <td>{new Date(c.created_date).toLocaleDateString()}</td>
                                        <td className="fw-semibold">{c.category}</td>
                                        <td style={{maxWidth:'300px'}}>{c.description}</td>
                                        <td><StatusBadge status={c.status} /></td>
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
