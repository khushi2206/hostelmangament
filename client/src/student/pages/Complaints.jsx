import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [formData, setFormData] = useState({ category: '', description: '' });
  const [successMsg, setSuccessMsg] = useState('');

  const fetchComplaints = () => axios.get('http://localhost:5000/api/student/complaints').then(res => setComplaints(res.data)).catch(console.error);
  
  useEffect(() => { fetchComplaints(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/student/complaints', formData);
      setFormData({ category: '', description: '' });
      fetchComplaints();
      setSuccessMsg('Complaint submitted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch(err) { alert('Error submitting complaint'); }
  };

  const inputStyle = { width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '1rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--primary)' }}>Submit Complaint</h2>
        {successMsg && <div style={{ background: '#d1fae5', color: '#065f46', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>{successMsg}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Category</label>
            <select style={{...inputStyle, maxWidth: '300px'}} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
              <option value="">Select Category</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Wi-Fi">Wi-Fi</option>
              <option value="Furniture">Furniture</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
            <textarea style={{...inputStyle, height: '120px'}} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe the issue in detail..." required />
          </div>
          <div>
            <button type="submit" style={{ padding: '0.75rem 2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 500 }}>Submit Complaint</button>
          </div>
        </form>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', flex: 1 }}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-dark)' }}>My Complaints</h2>
        {complaints.length === 0 ? <p style={{ color: 'var(--text-light)' }}>No complaints submitted yet.</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-color)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem', fontWeight: 600, width: '150px' }}>Date</th>
                  <th style={{ padding: '1rem', fontWeight: 600, width: '150px' }}>Category</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Description</th>
                  <th style={{ padding: '1rem', fontWeight: 600, width: '150px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.complaint_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem' }}>{new Date(c.created_date).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>{c.category}</td>
                    <td style={{ padding: '1rem', whiteSpace: 'pre-wrap' }}>{c.description}</td>
                    <td style={{ padding: '1rem' }}><StatusBadge status={c.status} /></td>
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
export default Complaints;
