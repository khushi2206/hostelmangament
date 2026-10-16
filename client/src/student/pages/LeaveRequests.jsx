import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';

const LeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [formData, setFormData] = useState({ leave_type: '', from_date: '', to_date: '', reason: '' });
  const [successMsg, setSuccessMsg] = useState('');

  const fetchLeaves = () => axios.get('http://localhost:5000/api/student/leaves').then(res => setLeaves(res.data)).catch(console.error);
  
  useEffect(() => { fetchLeaves(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/student/leaves', formData);
      setFormData({ leave_type: '', from_date: '', to_date: '', reason: '' });
      fetchLeaves();
      setSuccessMsg('Leave request submitted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch(err) { alert('Error submitting leave'); }
  };

  const cancelLeave = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/student/leaves/${id}`);
      fetchLeaves();
    } catch(err) { alert('Cannot cancel this leave'); }
  };

  const inputStyle = { width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '1rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--primary)' }}>Submit Leave Request</h2>
        {successMsg && <div style={{ background: '#d1fae5', color: '#065f46', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>{successMsg}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Leave Type</label>
            <select style={inputStyle} value={formData.leave_type} onChange={e => setFormData({...formData, leave_type: e.target.value})} required>
              <option value="">Select Type</option>
              <option value="Home Leave">Home Leave</option>
              <option value="Medical Leave">Medical Leave</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>From Date</label>
            <input type="date" style={inputStyle} value={formData.from_date} onChange={e => setFormData({...formData, from_date: e.target.value})} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>To Date</label>
            <input type="date" style={inputStyle} value={formData.to_date} onChange={e => setFormData({...formData, to_date: e.target.value})} required />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Reason</label>
            <textarea style={{...inputStyle, height: '80px'}} value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} required />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" style={{ padding: '0.75rem 2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 500 }}>Submit Request</button>
          </div>
        </form>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', flex: 1 }}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-dark)' }}>Leave History</h2>
        {leaves.length === 0 ? <p style={{ color: 'var(--text-light)' }}>No leave requests found.</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-color)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>From</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>To</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Reason</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l.leave_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem' }}>{l.leave_type}</td>
                    <td style={{ padding: '1rem' }}>{new Date(l.from_date).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>{new Date(l.to_date).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.reason}</td>
                    <td style={{ padding: '1rem' }}><StatusBadge status={l.status} /></td>
                    <td style={{ padding: '1rem' }}>
                      {l.status === 'Pending' && <button onClick={() => cancelLeave(l.leave_id)} style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}>Cancel</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default LeaveRequests;
