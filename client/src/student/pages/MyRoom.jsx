import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../components/StatusBadge';

const MyRoom = () => {
  const [data, setData] = useState(null);
  const [changes, setChanges] = useState([]);
  const [reason, setReason] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchRoom = () => axiosClient.get('/student/room').then(res => setData(res.data)).catch(console.error);
  const fetchChanges = () => axiosClient.get('/student/room-change').then(res => setChanges(res.data)).catch(console.error);

  useEffect(() => { fetchRoom(); fetchChanges(); }, []);

  const handleRequestChange = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/student/room-change', { reason });
      setReason('');
      fetchChanges();
      setSuccessMsg('Room change requested successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch(err) { alert('Error submitting request'); }
  };

  if (!data) return <div>Loading...</div>;
  if (!data.room) return <div style={{background:'white', padding:'2rem', borderRadius:'8px'}}><h2>Not Allocated</h2></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <h2 style={{ marginTop: 0, color: 'var(--primary)' }}>Room Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
          <div><label style={{color:'var(--text-light)', display: 'block', marginBottom:'0.5rem'}}>Room Number</label><div style={{fontWeight:500, fontSize:'1.1rem'}}>{data.room.block}-{data.room.room_number}</div></div>
          <div><label style={{color:'var(--text-light)', display: 'block', marginBottom:'0.5rem'}}>Floor</label><div style={{fontWeight:500, fontSize:'1.1rem'}}>{data.room.floor}</div></div>
          <div><label style={{color:'var(--text-light)', display: 'block', marginBottom:'0.5rem'}}>Occupancy</label><div style={{fontWeight:500, fontSize:'1.1rem'}}>{data.room.occupied} / {data.room.capacity}</div></div>
          <div><label style={{color:'var(--text-light)', display: 'block', marginBottom:'0.5rem'}}>Status</label><div style={{fontWeight:500, fontSize:'1.1rem'}}><StatusBadge status={data.room.status} /></div></div>
        </div>
      </div>
      
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <h2 style={{ marginTop: 0, color: 'var(--text-dark)' }}>Roommates</h2>
        {data.roommates.length === 0 ? <p style={{ color: 'var(--text-light)' }}>No roommates assigned.</p> : (
          <table style={{width:'100%', textAlign:'left', marginTop:'1.5rem', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background: 'var(--bg-color)', borderBottom:'2px solid var(--border-color)'}}>
                <th style={{padding:'1rem'}}>Name</th>
                <th style={{padding:'1rem'}}>Enrollment No</th>
                <th style={{padding:'1rem'}}>Course</th>
              </tr>
            </thead>
            <tbody>
              {data.roommates.map((rm, i) => (
                <tr key={i} style={{borderBottom:'1px solid var(--border-color)'}}>
                  <td style={{padding:'1rem'}}>{rm.name}</td>
                  <td style={{padding:'1rem'}}>{rm.enrollment_no}</td>
                  <td style={{padding:'1rem'}}>{rm.course}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <h2 style={{ marginTop: 0, color: 'var(--text-dark)' }}>Request Room Swap/Change</h2>
        {successMsg && <div style={{ background: '#d1fae5', color: '#065f46', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem' }}>{successMsg}</div>}
        
        <form onSubmit={handleRequestChange} style={{ display: 'grid', gap: '1rem' }}>
          <label style={{ fontWeight: 500 }}>Reason for changing room (e.g., "Mutual swap with 22CS010")</label>
          <textarea style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', height: '100px', fontSize: '1rem' }} value={reason} onChange={e => setReason(e.target.value)} required />
          <div>
            <button type="submit" style={{ padding: '0.75rem 2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}>Submit Request</button>
          </div>
        </form>

        {changes.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Your Requests</h3>
            {changes.map(c => (
              <div key={c.request_id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '4px', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>{c.reason}</span>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default MyRoom;
