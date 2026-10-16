import React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';

export default function AddNotice() {
    const { id } = useParams();
    const editing = Boolean(id);
    const navigate = useNavigate();
    const [form, setForm] = useState({ title: '', description: '' });
    const [loading, setLoading] = useState(editing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!editing) return;
        axiosClient.get('/admin/notices/' + id).then(response => setForm({ title: response.data.notice.title, description: response.data.notice.description })).catch(requestError => setError(requestError.response?.data?.message || 'Failed to load notice.')).finally(() => setLoading(false));
    }, [id, editing]);

    function change(event) { setForm({ ...form, [event.target.name]: event.target.value }); }

    async function submit(event) {
        event.preventDefault();
        if (!form.title.trim()) return setError('Notice title is required.');
        if (!form.description.trim()) return setError('Notice description is required.');
        try {
            setSaving(true);
            setError('');
            const response = editing ? await axiosClient.put('/admin/notices/' + id, form) : await axiosClient.post('/admin/notices', form);
            navigate('/admin/notices', { state: { message: response.data.message } });
        } catch (requestError) { setError(requestError.response?.data?.message || 'Failed to save notice.'); }
        finally { setSaving(false); }
    }

    if (loading) return <p>Loading notice...</p>;
    return <section><h2>{editing ? 'Edit Notice' : 'Create Notice'}</h2><p className="text-muted">{editing ? 'Update hostel announcement.' : 'Publish a new hostel announcement.'}</p>{error && <div className="alert alert-danger">{error}</div>}<div className="card border-0 shadow-sm page-card"><div className="card-body"><form onSubmit={submit}><div className="mb-3"><label className="form-label">Notice Title</label><input name="title" value={form.title} onChange={change} className="form-control" required /></div><div className="mb-3"><label className="form-label">Description</label><textarea name="description" value={form.description} onChange={change} className="form-control" rows="6" required></textarea></div><div className="d-flex gap-2"><button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Notice' : 'Publish Notice'}</button><Link to="/admin/notices" className="btn btn-outline-secondary">Cancel</Link></div></form></div></div></section>;
}
