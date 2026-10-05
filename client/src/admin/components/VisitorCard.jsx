import React from 'react';

function formatDate(value) {
    if (!value) return 'Not provided';
    const parts = String(value).slice(0, 10).split('-');
    if (parts.length !== 3) return String(value);
    return parts[2] + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(parts[1]) - 1] + ' ' + parts[0];
}

function formatTime(value) {
    if (!value) return 'Not provided';
    const parts = String(value).slice(0, 5).split(':');
    if (parts.length !== 2) return String(value);
    const hour = Number(parts[0]);
    return ((hour % 12) || 12) + ':' + parts[1] + ' ' + (hour >= 12 ? 'PM' : 'AM');
}

export default function VisitorCard({ visitor, expanded, onView, onApprove }) {
    const statusClass = visitor.status === 'Pending' ? 'bg-warning text-dark' : 'bg-success';
    return <div className="card visitor-card mb-3 shadow-sm border-0">
        <div className="card-body d-flex align-items-center gap-3 flex-wrap">
            <div className="icon-circle"><i className="bi bi-person-badge"></i></div>
            <div className="flex-grow-1">
                <h5 className="mb-1">{visitor.visitor_name}</h5>
                <div className="small text-muted">Visiting: {visitor.student_name}</div>
                <div className="small text-muted">Relation: {visitor.relation || 'Not provided'}</div>
                <div className="small text-muted">{formatDate(visitor.visit_date)} at {formatTime(visitor.visit_time)}</div>
                {visitor.phone && <div className="small text-muted">Phone: {visitor.phone}</div>}
            </div>
            <div className="text-md-end">
                <span className={'badge ' + statusClass}>{visitor.status}</span>
                <div className="mt-2 d-flex gap-2 flex-wrap justify-content-md-end">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => onView(visitor.visitor_id)}><i className="bi bi-eye me-1"></i>{expanded ? 'Hide' : 'View'}</button>
                    {visitor.status === 'Pending' && <button className="btn btn-sm btn-success" onClick={() => onApprove(visitor)}><i className="bi bi-check-circle me-1"></i>Approve</button>}
                </div>
            </div>
        </div>
        {expanded && <div className="border-top px-3 py-3 small"><div><strong>Visitor Name:</strong> {visitor.visitor_name}</div><div><strong>Relation:</strong> {visitor.relation || 'Not provided'}</div><div><strong>Phone:</strong> {visitor.phone || 'Not provided'}</div><div><strong>Student:</strong> {visitor.student_name}</div><div><strong>Enrollment:</strong> {visitor.enrollment_no}</div><div><strong>Room:</strong> {visitor.room_id ? visitor.block + ' - ' + visitor.room_number : visitor.room_number ? visitor.block + ' - ' + visitor.room_number : 'Not Allocated'}</div><div><strong>Visit Date:</strong> {formatDate(visitor.visit_date)}</div><div><strong>Visit Time:</strong> {formatTime(visitor.visit_time)}</div><div><strong>Status:</strong> {visitor.status}</div><div><strong>Created:</strong> {formatDate(visitor.created_at)}</div></div>}
    </div>;
}
