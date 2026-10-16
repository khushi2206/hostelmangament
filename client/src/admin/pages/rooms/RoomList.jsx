import React from 'react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import RoomCard from '../../components/RoomCard';

export default function RoomList() {
    const [rooms, setRooms] = useState([]);
    const [filters, setFilters] = useState({ search: '', block: '', floor: '', status: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const location = useLocation();

    useEffect(() => {
        if (location.state?.message) {
            setMessage(location.state.message);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    async function loadRooms() {
        try {
            setLoading(true);
            setError('');
            const response = await axiosClient.get('/admin/rooms', { params: filters });
            setRooms(response.data);
        } catch (requestError) {
            console.error(requestError);
            setError('Unable to load rooms. Please check whether the backend is running.');
        } finally { setLoading(false); }
    }

    useEffect(() => { loadRooms(); }, [filters]);

    function changeFilter(event) { setFilters({ ...filters, [event.target.name]: event.target.value }); }

    async function deleteRoom(room) {
        if (!window.confirm('Are you sure you want to delete this room?')) return;
        try {
            const response = await axiosClient.delete('/admin/rooms/' + room.room_id);
            setMessage(response.data.message);
            loadRooms();
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to delete room');
        }
    }

    return <section>
        <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2"><div><h2>Rooms</h2><p className="text-muted">Manage hostel rooms and their availability.</p></div><Link to="/admin/rooms/add" className="btn btn-primary"><i className="bi bi-plus-lg me-2"></i>Add Room</Link></div>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card page-card border-0 shadow-sm mb-4"><div className="card-body"><div className="row g-2">
            <div className="col-md-5"><input name="search" value={filters.search} onChange={changeFilter} className="form-control" placeholder="Search by room number..." /></div>
            <div className="col-md-2"><select name="block" value={filters.block} onChange={changeFilter} className="form-select"><option value="">All Blocks</option><option value="H1">H1</option><option value="H2">H2</option><option value="H3">H3</option><option value="H4">H4</option></select></div>
            <div className="col-md-2"><select name="floor" value={filters.floor} onChange={changeFilter} className="form-select"><option value="">All Floors</option>{[1, 2, 3, 4, 5].map(floor => <option key={floor} value={floor}>{floor}</option>)}</select></div>
            <div className="col-md-3"><select name="status" value={filters.status} onChange={changeFilter} className="form-select"><option value="">All Status</option><option value="Available">Available</option><option value="Full">Full</option></select></div>
        </div></div></div>
        {loading && <div className="alert alert-info">Loading rooms...</div>}
        {!loading && rooms.length === 0 && <div className="alert alert-light border">No rooms found.</div>}
        {!loading && rooms.map(room => <RoomCard key={room.room_id} room={room} onDelete={deleteRoom} />)}
    </section>;
}
