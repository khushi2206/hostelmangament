import React from 'react';

function money(value) { return 'INR ' + Number(value || 0).toLocaleString('en-IN'); }

export default function FeeCard({ fee, expanded, onView }) {
    const statusClass = fee.fee_status === 'Paid' ? 'bg-success' : fee.fee_status === 'Partial' ? 'bg-warning text-dark' : 'bg-danger';
    return <div className="card fee-card mb-3 shadow-sm border-0">
        <div className="card-body d-flex align-items-center gap-3 flex-wrap">
            <div className="icon-circle"><i className="bi bi-cash-coin"></i></div>
            <div className="flex-grow-1">
                <h5 className="mb-1">{fee.student_name}</h5>
                <div className="small text-muted">Enrollment: {fee.enrollment_no || 'Not provided'}</div>
                <div className="small text-muted">Room: {fee.room_number ? fee.block + ' - ' + fee.room_number : 'Not Allocated'}</div>
                <div className="small text-muted">Total: {money(fee.total_amount)} | Paid: {money(fee.paid_amount)}</div>
                <div className="small text-muted">Remaining: {money(fee.remaining_amount)}</div>
            </div>
            <div className="text-md-end">
                <span className={'badge ' + statusClass}>{fee.fee_status}</span>
                <div className="mt-2"><button className="btn btn-sm btn-outline-primary" onClick={() => onView(fee.fee_id)}><i className="bi bi-eye me-1"></i>{expanded ? 'Hide' : 'View'}</button></div>
            </div>
        </div>
        {expanded && <div className="border-top px-3 py-3 small"><div><strong>Student:</strong> {fee.student_name}</div><div><strong>Enrollment:</strong> {fee.enrollment_no || 'Not provided'}</div><div><strong>Email:</strong> {fee.email || 'Not provided'}</div><div><strong>Room:</strong> {fee.room_number ? fee.block + ' - ' + fee.room_number : 'Not Allocated'}</div><div><strong>Total Fee:</strong> {money(fee.total_amount)}</div><div><strong>Paid:</strong> {money(fee.paid_amount)}</div><div><strong>Remaining:</strong> {money(fee.remaining_amount)}</div><div><strong>Status:</strong> {fee.fee_status}</div>{!fee.fee_data_available && <div className="text-warning mt-2">Fee amount fields are not available in the current database response.</div>}</div>}
    </div>;
}
