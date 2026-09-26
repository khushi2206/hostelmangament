import React from 'react';

const StatusBadge = ({ status }) => {
  let badgeClass = 'bg-secondary';
  
  switch(status?.toLowerCase()) {
    case 'approved': case 'resolved': case 'paid': case 'available':
      badgeClass = 'bg-success'; break;
    case 'pending': case 'in progress': case 'partial': case 'requested': case 'washing':
      badgeClass = 'bg-warning text-dark'; break;
    case 'rejected': case 'due': case 'full':
      badgeClass = 'bg-danger'; break;
    case 'ready':
      badgeClass = 'bg-info text-dark'; break;
  }
  
  return (
    <span className={`badge rounded-pill ${badgeClass} px-3 py-2`}>
      {status}
    </span>
  );
};
export default StatusBadge;
