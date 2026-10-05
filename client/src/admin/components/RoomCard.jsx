import React from 'react';
import { Link } from 'react-router-dom';

export default function RoomCard({ room, onDelete }) {
    const availableBeds = Math.max(0, room.capacity - room.occupied);
    const isAvailable = room.occupied < room.capacity;
    return <div className="card room-card mb-3 shadow-sm border-0">
        <div className="card-body d-flex align-items-center gap-3 flex-wrap">
            <div className="icon-circle"><i className="bi bi-door-open"></i></div>
            <div className="flex-grow-1">
                <h5 className="mb-1">Room {room.block} - {room.room_number}</h5>
                <div className="small text-muted">Floor: {room.floor}</div>
                <div className="small text-muted">Capacity: {room.capacity}</div>
                <div className="small text-muted">Occupied: {room.occupied}</div>
                <div className="small text-muted">Available Beds: {availableBeds}</div>
            </div>
            <div className="text-md-end">
                <span className={'badge ' + (isAvailable ? 'bg-success' : 'bg-danger')}>{isAvailable ? 'Available' : 'Full'}</span>
                <div className="mt-2 d-flex gap-2">
                    <Link to={'/admin/rooms/' + room.room_id + '/edit'} className="btn btn-sm btn-outline-secondary"><i className="bi bi-pencil me-1"></i>Edit</Link>
                    <button onClick={() => onDelete(room)} className="btn btn-sm btn-outline-danger"><i className="bi bi-trash me-1"></i>Delete</button>
                </div>
            </div>
        </div>
    </div>;
}
