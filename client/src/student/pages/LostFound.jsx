import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../components/StatusBadge';

export default function LostFound() {
    const [items,   setItems]  = useState([]);
    const [form,    setForm]   = useState({ type:'Lost', item_name:'', description:'', location:'' });
    const [success, setSuccess]= useState('');
    const [error,   setError]  = useState('');
    const [saving,  setSaving] = useState(false);

    const load = () => axiosClient.get('/student/lost-found').then(r => setItems(r.data)).catch(console.error);
    useEffect(() => { load(); }, []);

    async function submit(e) {
        e.preventDefault(); setError('');
        try {
            setSaving(true);
            await axiosClient.post('/student/lost-found', form);
            setForm({ type:'Lost', item_name:'', description:'', location:'' });
            load();
            setSuccess('Report submitted!');
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) { setError(err.response?.data?.message || 'Failed.'); }
        finally { setSaving(false); }
    }

    return (
        <>
            <div className="hh-page-title">Lost &amp; Found</div>
            <div className="hh-page-sub">Report lost items or notify others about found items.</div>

            <div className="hh-card mb-4">
                <div className="hh-card-header">
                    <span className="hh-card-title"><i className="bi bi-search me-2 text-primary" />Submit Report</span>
                </div>
                <div className="hh-card-body">
                    {success && <div className="hh-alert-success mb-3"><i className="bi bi-check-circle me-2" />{success}</div>}
                    {error   && <div className="hh-alert-danger  mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
                    <form onSubmit={submit} className="row g-3">
                        <div className="col-md-4">
                            <label className="hh-form-label">Report Type</label>
                            <select className="form-select" value={form.type}
                                onChange={e => setForm({...form, type: e.target.value})}>
                                <option value="Lost">I Lost Something</option>
                                <option value="Found">I Found Something</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="hh-form-label">Item Name</label>
                            <input type="text" className="form-control" value={form.item_name}
                                onChange={e => setForm({...form, item_name: e.target.value})} required />
                        </div>
                        <div className="col-md-4">
                            <label className="hh-form-label">Location</label>
                            <input type="text" className="form-control" value={form.location}
                                onChange={e => setForm({...form, location: e.target.value})}
                                placeholder="Last seen / found at" />
                        </div>
                        <div className="col-12">
                            <label className="hh-form-label">Description</label>
                            <textarea className="form-control" rows="2" value={form.description}
                                onChange={e => setForm({...form, description: e.target.value})} required />
                        </div>
                        <div className="col-12">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</> : <><i className="bi bi-send me-2" />Submit Report</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Community board */}
            <div className="hh-page-title" style={{fontSize:'1rem'}}>Community Board</div>
            {items.length === 0
                ? <div className="hh-card mt-3"><div className="hh-card-body text-muted">No items reported yet.</div></div>
                : <div className="row g-3 mt-1">
                    {items.map(item => (
                        <div className="col-md-6 col-lg-4" key={item.item_id}>
                            <div className="hh-card h-100">
                                <div className="hh-card-body">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className={`hh-badge ${item.type === 'Lost' ? 'hh-badge-due' : 'hh-badge-approved'}`}>
                                            <i className={`bi ${item.type === 'Lost' ? 'bi-exclamation-circle' : 'bi-check-circle'}`} style={{fontSize:'0.7rem'}} />
                                            {item.type}
                                        </span>
                                        <StatusBadge status={item.status} />
                                    </div>
                                    <div className="fw-bold mb-1">{item.item_name}</div>
                                    <p className="text-muted mb-2" style={{fontSize:'0.82rem'}}>{item.description}</p>
                                    <div style={{fontSize:'0.78rem',color:'#64748b'}}>
                                        {item.location && <div><i className="bi bi-geo-alt me-1" />{item.location}</div>}
                                        <div><i className="bi bi-person me-1" />{item.student_name}</div>
                                        <div><i className="bi bi-calendar3 me-1" />{new Date(item.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            }
        </>
    );
}
