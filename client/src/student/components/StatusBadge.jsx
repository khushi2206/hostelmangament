import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;
  let color = 'var(--text-light)';
  let bg = '#f3f4f6';
  
  switch(status.toLowerCase()) {
    case 'approved': case 'resolved': case 'paid': case 'available':
      color = 'var(--success)'; bg = '#d1fae5'; break;
    case 'pending': case 'in progress': case 'partial':
      color = 'var(--warning)'; bg = '#fef3c7'; break;
    case 'rejected': case 'due': case 'full':
      color = 'var(--danger)'; bg = '#fee2e2'; break;
  }
  
  return (
    <span style={{ padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 500, color, backgroundColor: bg }}>
      {status}
    </span>
  );
};
export default StatusBadge;
