import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/student/dashboard').then(res => setData(res.data)).catch(console.error);
  }, []);

  if (!data) return <div>Loading...</div>;

  const cardStyle = { background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', flex: '1 1 300px' };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Welcome, {data.student.name}</h1>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <div style={cardStyle}>
          <h3>My Room</h3>
          {data.room ? <p>{data.room.block} - {data.room.room_number} (Floor {data.room.floor})</p> : <p>Not Allocated</p>}
          <Link to="/room" style={{ color: 'var(--primary)', textDecoration: 'none' }}>View Details</Link>
        </div>
        <div style={cardStyle}>
          <h3>Latest Leave Status</h3>
          <p style={{ margin: '1rem 0' }}><StatusBadge status={data.latestLeaveStatus || 'No requests'} /></p>
          <Link to="/leaves" style={{ color: 'var(--primary)', textDecoration: 'none' }}>View All</Link>
        </div>
        <div style={cardStyle}>
          <h3>Fee Status</h3>
          {data.feeStatus ? (
            <>
              <p style={{ margin: '1rem 0' }}><StatusBadge status={data.feeStatus.status} /></p>
              <p>Remaining: ₹{data.feeStatus.remaining}</p>
            </>
          ) : <p>No fee records</p>}
          <Link to="/fees" style={{ color: 'var(--primary)', textDecoration: 'none' }}>View Details</Link>
        </div>
      </div>
      
      <div style={cardStyle}>
        <h3>Recent Notices</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {data.recentNotices && data.recentNotices.map((n, i) => (
            <li key={i} style={{ padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <strong>{n.title}</strong> - {new Date(n.date).toLocaleDateString()}
            </li>
          ))}
          {(!data.recentNotices || data.recentNotices.length === 0) && <li style={{ color: 'var(--text-light)' }}>No notices.</li>}
        </ul>
      </div>
    </div>
  );
};
export default StudentDashboard;
