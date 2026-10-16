import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';

export default function AddRoom() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ room_number: '', block: '', floor: '', capacity: '' });
    const [error, setError] = useState('');

    function change(event) { setForm({ ...form, [event.target.name]: event.target.value }); }

    async function submit(event) {
        event.preventDefault();
        if (!form.room_number || !form.block) return setError('Room number and block are required.');
        if (Number(form.floor) <= 0 || !Number.isInteger(Number(form.floor))) return setError('Floor must be a positive number.');
        if (Number(form.capacity) <= 0 || !Number.isInteger(Number(form.capacity))) return setError('Capacity must be greater than 0.');
        try {
            const response = await axiosClient.post('/admin/rooms', form);
            navigate('/admin/rooms', { state: { message: response.data.message } });
        } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to add room'); }
    }

    return <section><h2>Add Room</h2><p className="text-muted">Create a new hostel room</p>{error && <div className="alert alert-danger">{error}</div>}<div className="card border-0 shadow-sm page-card"><div className="card-body"><form onSubmit={submit}><div className="row g-3">
        <div className="col-md-6"><label className="form-label">Room Number</label><input name="room_number" value={form.room_number} onChange={change} className="form-control" required /></div>
        <div className="col-md-6"><label className="form-label">Block</label><input name="block" value={form.block} onChange={change} className="form-control" required /></div>
        <div className="col-md-6"><label className="form-label">Floor</label><input name="floor" type="number" min="1" value={form.floor} onChange={change} className="form-control" required /></div>
        <div className="col-md-6"><label className="form-label">Capacity</label><input name="capacity" type="number" min="1" value={form.capacity} onChange={change} className="form-control" required /></div>
    </div><div className="mt-4 d-flex gap-2"><button className="btn btn-primary">Add Room</button><Link to="/admin/rooms" className="btn btn-outline-secondary">Cancel</Link></div></form></div></div></section>;
}
