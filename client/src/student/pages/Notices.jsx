import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Notices = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/student/notices').then(res => setNotices(res.data)).catch(console.error);
  }, []);

  return (
    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px' }}>
      <h2>Notices</h2>
      <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
        {notices.map((n) => (
          <div key={n.notice_id} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>{n.title}</h3>
              <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>{new Date(n.date).toLocaleDateString()}</span>
            </div>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{n.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Notices;
