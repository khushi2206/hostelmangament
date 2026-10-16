import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';

const LostFound = () => {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({ type: 'Lost', item_name: '', description: '', location: '' });
  const [successMsg, setSuccessMsg] = useState('');

  const fetchItems = () => axios.get('http://localhost:5000/api/student/lost-found').then(res => setItems(res.data)).catch(console.error);
  
  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/student/lost-found', formData);
      setFormData({ type: 'Lost', item_name: '', description: '', location: '' });
      fetchItems();
      setSuccessMsg('Report submitted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch(err) { alert('Error submitting report'); }
  };

  const inputStyle = { width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '1rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <h2 style={{ marginTop: 0, color: 'var(--primary)', marginBottom: '1.5rem' }}>Report Lost or Found Item</h2>
        {successMsg && <div style={{ background: '#d1fae5', color: '#065f46', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem' }}>{successMsg}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Report Type</label>
            <select style={inputStyle} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required>
              <option value="Lost">I Lost Something</option>
              <option value="Found">I Found Something</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Item Name</label>
            <input style={inputStyle} value={formData.item_name} onChange={e => setFormData({...formData, item_name: e.target.value})} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Location (Last seen / Found at)</label>
            <input style={inputStyle} value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
            <textarea style={{...inputStyle, height: '80px'}} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
          </div>
          <div>
            <button type="submit" style={{ padding: '0.75rem 2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>Submit Report</button>
          </div>
        </form>
      </div>

      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <h2 style={{ marginTop: 0, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>Community Board</h2>
        {items.length === 0 ? <p style={{ color: 'var(--text-light)' }}>No items reported.</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {items.map(item => (
              <div key={item.item_id} style={{ border: `1px solid ${item.type === 'Lost' ? 'var(--danger)' : 'var(--success)'}`, borderRadius: '8px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 'bold', color: item.type === 'Lost' ? 'var(--danger)' : 'var(--success)' }}>{item.type}</span>
                  <StatusBadge status={item.status} />
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{item.item_name}</h3>
                <p style={{ margin: '0 0 1rem 0', color: 'var(--text-light)', fontSize: '0.9rem' }}>{item.description}</p>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  <p style={{ margin: '0.2rem 0' }}><strong>Location:</strong> {item.location}</p>
                  <p style={{ margin: '0.2rem 0' }}><strong>Reported by:</strong> {item.student_name}</p>
                  <p style={{ margin: '0.2rem 0' }}><strong>Date:</strong> {new Date(item.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default LostFound;
