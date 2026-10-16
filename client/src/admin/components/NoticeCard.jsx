import React from 'react';
import { Link } from 'react-router-dom';

function formatDate(value) {
    if (!value) return 'Not provided';
    const parts = String(value).slice(0, 10).split('-');
    if (parts.length !== 3) return String(value);
    return parts[2] + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(parts[1]) - 1] + ' ' + parts[0];
}

export default function NoticeCard({ notice, expanded, onView, onDelete }) {
    return <div className="card notice-card mb-3 shadow-sm border-0">
        <div className="card-body d-flex align-items-center gap-3 flex-wrap">
            <div className="icon-circle"><i className="bi bi-megaphone"></i></div>
            <div className="flex-grow-1"><h5 className="mb-1">{notice.title}</h5><div className="small text-muted">{formatDate(notice.created_at)}</div><div className="small text-muted text-truncate" style={{ maxWidth: '620px' }}>{notice.description}</div></div>
            <div className="d-flex gap-2 flex-wrap"><button className="btn btn-sm btn-outline-primary" onClick={() => onView(notice.notice_id)}><i className="bi bi-eye me-1"></i>{expanded ? 'Hide' : 'View'}</button><Link to={'/admin/notices/' + notice.notice_id + '/edit'} className="btn btn-sm btn-outline-primary"><i className="bi bi-pencil me-1"></i>Edit</Link><button className="btn btn-sm btn-danger" onClick={() => onDelete(notice)}><i className="bi bi-trash me-1"></i>Delete</button></div>
        </div>
        {expanded && <div className="border-top px-3 py-3 small"><div><strong>Title:</strong> {notice.title}</div><div><strong>Description:</strong> {notice.description}</div><div><strong>Created:</strong> {formatDate(notice.created_at)}</div><div><strong>Updated:</strong> {formatDate(notice.updated_at)}</div></div>}
    </div>;
}
