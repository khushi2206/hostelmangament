import React from 'react';

function formatDate(value) { return value ? String(value).slice(0, 10) : 'Not provided'; }

export default function LeaveCard({ leave, expanded, onView, onApprove, onReject }) {
    const statusClass = leave.status === 'Pending' ? 'bg-warning text-dark' : leave.status === 'Approved' ? 'bg-success' : 'bg-danger';
    return <div className="card leave-card mb-3 shadow-sm border-0">
        <div className="card-body d-flex align-items-center gap-3 flex-wrap">
            <div className="icon-circle"><i className="bi bi-calendar-event"></i></div>
            <div className="flex-grow-1">
                <h5 className="mb-1">{leave.student_name}</h5>
                <div className="small text-muted">Enrollment: {leave.enrollment_no}</div>
                <div className="small text-muted">{leave.leave_type}</div>
                <div className="small text-muted">{formatDate(leave.from_date)} to {formatDate(leave.to_date)}</div>
                <div className="small text-muted">Reason: {leave.reason}</div>
            </div>
            <div className="text-md-end">
                <span className={'badge ' + statusClass}>{leave.status}</span>
                <div className="mt-2 d-flex gap-2 flex-wrap justify-content-md-end">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => onView(leave.leave_id)}><i className="bi bi-eye me-1"></i>{expanded ? 'Hide' : 'View'}</button>
                    {leave.status === 'Pending' && <><button className="btn btn-sm btn-success" onClick={() => onApprove(leave)}><i className="bi bi-check-circle me-1"></i>Approve</button><button className="btn btn-sm btn-danger" onClick={() => onReject(leave)}><i className="bi bi-x-circle me-1"></i>Reject</button></>}
                </div>
            </div>
        </div>
        {expanded && <div className="border-top px-3 py-3 small"><div><strong>Student:</strong> {leave.student_name}</div><div><strong>Enrollment:</strong> {leave.enrollment_no}</div><div><strong>Leave Type:</strong> {leave.leave_type}</div><div><strong>From:</strong> {formatDate(leave.from_date)}</div><div><strong>To:</strong> {formatDate(leave.to_date)}</div><div><strong>Reason:</strong> {leave.reason}</div><div><strong>Status:</strong> {leave.status}</div><div><strong>Admin Comment:</strong> {leave.admin_comment || 'None'}</div><div><strong>Created:</strong> {formatDate(leave.created_at)}</div><div><strong>Updated:</strong> {formatDate(leave.updated_at)}</div></div>}
    </div>;
}
