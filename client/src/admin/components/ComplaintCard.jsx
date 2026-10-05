import React from 'react';

function formatDate(value) {
    if (!value) return 'Not provided';
    const parts = String(value).slice(0, 10).split('-');
    if (parts.length !== 3) return String(value);
    return parts[2] + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(parts[1]) - 1] + ' ' + parts[0];
}

function statusClass(status) {
    if (status === 'Pending') return 'bg-warning text-dark';
    if (status === 'Resolved') return 'bg-success';
    return 'status-in-progress text-white';
}

export default function ComplaintCard({ complaint, expanded, onView, onStatusChange }) {
    return <div className="card complaint-card mb-3 shadow-sm border-0">
        <div className="card-body d-flex align-items-center gap-3 flex-wrap">
            <div className="icon-circle"><i className="bi bi-tools"></i></div>
            <div className="flex-grow-1">
                <h5 className="mb-1">{complaint.category}</h5>
                <div className="small text-muted">Student: {complaint.student_name}</div>
                <div className="small text-muted">Enrollment: {complaint.enrollment_no || 'Not provided'}</div>
                <div className="small text-muted">Room: {complaint.room_number ? complaint.block + ' - ' + complaint.room_number : 'Not Allocated'}</div>
                <div className="small text-muted">Date: {formatDate(complaint.created_date)}</div>
                <div className="small text-muted text-truncate" style={{ maxWidth: '520px' }}>"{complaint.description}"</div>
            </div>
            <div className="text-md-end">
                <span className={'badge ' + statusClass(complaint.status)}>{complaint.status}</span>
                <div className="mt-2 d-flex gap-2 flex-wrap justify-content-md-end">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => onView(complaint.complaint_id)}><i className="bi bi-eye me-1"></i>{expanded ? 'Hide' : 'View'}</button>
                    <select value={complaint.status} onChange={event => onStatusChange(complaint, event.target.value)} className="form-select form-select-sm" aria-label="Complaint status"><option>Pending</option><option>In Progress</option><option>Resolved</option></select>
                </div>
            </div>
        </div>
        {expanded && <div className="border-top px-3 py-3 small"><div><strong>Student:</strong> {complaint.student_name}</div><div><strong>Enrollment:</strong> {complaint.enrollment_no || 'Not provided'}</div><div><strong>Email:</strong> {complaint.email || 'Not provided'}</div><div><strong>Room:</strong> {complaint.room_number ? complaint.block + ' - ' + complaint.room_number : 'Not Allocated'}</div><div><strong>Category:</strong> {complaint.category}</div><div><strong>Description:</strong> {complaint.description}</div><div><strong>Created:</strong> {formatDate(complaint.created_date)}</div><div><strong>Updated:</strong> {formatDate(complaint.updated_at)}</div><div><strong>Status:</strong> {complaint.status}</div></div>}
    </div>;
}
