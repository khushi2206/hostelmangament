import React from 'react';

const map = {
    'pending':     'hh-badge-pending',
    'approved':    'hh-badge-approved',
    'rejected':    'hh-badge-rejected',
    'resolved':    'hh-badge-resolved',
    'in progress': 'hh-badge-progress',
    'paid':        'hh-badge-paid',
    'due':         'hh-badge-due',
    'partial':     'hh-badge-partial',
    'available':   'hh-badge-approved',
    'full':        'hh-badge-due',
    'open':        'hh-badge-pending',
    'closed':      'hh-badge-resolved',
};

const icons = {
    'pending':     'bi-clock',
    'approved':    'bi-check-circle',
    'rejected':    'bi-x-circle',
    'resolved':    'bi-check-circle',
    'in progress': 'bi-arrow-repeat',
    'paid':        'bi-check-circle',
    'due':         'bi-exclamation-circle',
    'partial':     'bi-dash-circle',
};

export default function StatusBadge({ status }) {
    if (!status) return null;
    const key   = String(status).toLowerCase();
    const cls   = map[key] || 'hh-badge-default';
    const icon  = icons[key] || 'bi-circle';
    return (
        <span className={`hh-badge ${cls}`}>
            <i className={`bi ${icon}`} style={{ fontSize: '0.7rem' }} />
            {status}
        </span>
    );
}
