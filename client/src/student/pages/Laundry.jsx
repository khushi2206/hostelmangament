import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../components/StatusBadge';

const Laundry = () => {
  const [requests, setRequests] = useState([]);
  const [clothesCount, setClothesCount] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchLaundry = () => axiosClient.get('/student/laundry').then(res => setRequests(res.data)).catch(console.error);
  
  useEffect(() => { fetchLaundry(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/student/laundry', { clothes_count: clothesCount });
      setClothesCount('');
      fetchLaundry();
      setSuccessMsg('Laundry request sent successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch(err) { alert('Error submitting request'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <h2 style={{ marginTop: 0, color: 'var(--primary)', marginBottom: '1.5rem' }}>Schedule Laundry Pickup</h2>
        {successMsg && <div style={{ background: '#d1fae5', color: '#065f46', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem' }}>{successMsg}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Number of Clothes</label>
            <input type="number" min="1" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '1rem' }} value={clothesCount} onChange={e => setClothesCount(e.target.value)} required />
          </div>
          <button type="submit" style={{ padding: '0.75rem 2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, height: '42px' }}>Request Pickup</button>
        </form>
      </div>

      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', flex: 1 }}>
        <h2 style={{ marginTop: 0, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>Laundry History</h2>
        {requests.length === 0 ? <p style={{ color: 'var(--text-light)' }}>No laundry requests found.</p> : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-color)', borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Request ID</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Clothes Count</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.laundry_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>#LND-{req.laundry_id}</td>
                  <td style={{ padding: '1rem' }}>{req.clothes_count} items</td>
                  <td style={{ padding: '1rem' }}>{new Date(req.request_date).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}><StatusBadge status={req.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
export default Laundry;
