import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [formData, setFormData] = useState({ visitor_name: '', relation: '', phone: '', visit_date: '', visit_time: '' });
  const [successMsg, setSuccessMsg] = useState('');

  const fetchVisitors = () => axios.get('http://localhost:5000/api/student/visitors').then(res => setVisitors(res.data)).catch(console.error);
  
  useEffect(() => { fetchVisitors(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/student/visitors', formData);
      setFormData({ visitor_name: '', relation: '', phone: '', visit_date: '', visit_time: '' });
      fetchVisitors();
      setSuccessMsg('Visitor registered successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch(err) { alert('Error registering visitor'); }
  };

  const inputStyle = { width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '1rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--primary)' }}>Register Visitor</h2>
        {successMsg && <div style={{ background: '#d1fae5', color: '#065f46', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>{successMsg}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Visitor Name</label>
            <input style={inputStyle} value={formData.visitor_name} onChange={e => setFormData({...formData, visitor_name: e.target.value})} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Relation</label>
            <input style={inputStyle} value={formData.relation} onChange={e => setFormData({...formData, relation: e.target.value})} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Phone</label>
            <input style={inputStyle} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Visit Date</label>
            <input type="date" style={inputStyle} value={formData.visit_date} onChange={e => setFormData({...formData, visit_date: e.target.value})} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Visit Time</label>
            <input type="time" style={inputStyle} value={formData.visit_time} onChange={e => setFormData({...formData, visit_time: e.target.value})} required />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" style={{ padding: '0.75rem 2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 500 }}>Register Visitor</button>
          </div>
        </form>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', flex: 1 }}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-dark)' }}>Visitor History</h2>
        {visitors.length === 0 ? <p style={{ color: 'var(--text-light)' }}>No visitors registered.</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-color)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Name</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Relation</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Phone</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Time</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v) => (
                  <tr key={v.visitor_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem' }}>{v.visitor_name}</td>
                    <td style={{ padding: '1rem' }}>{v.relation}</td>
                    <td style={{ padding: '1rem' }}>{v.phone}</td>
                    <td style={{ padding: '1rem' }}>{new Date(v.visit_date).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>{v.visit_time}</td>
                    <td style={{ padding: '1rem' }}><StatusBadge status={v.status} /></td>
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
export default Visitors;
