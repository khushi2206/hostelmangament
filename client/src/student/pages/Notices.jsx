import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Notices = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5001/api/student/notices').then(res => setNotices(res.data)).catch(console.error);
  }, []);

  return (
    <div className="container-fluid py-2">
      <div className="card shadow-sm border-0 p-4">
        <h3 className="fw-bold mb-4">Hostel Notices</h3>
        <div className="row g-4">
          {notices.map((n) => (
            <div className="col-12" key={n.notice_id}>
              <div className="card h-100 border-start border-4 border-primary shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="card-title fw-bold mb-0">{n.title}</h5>
                    <span className="badge bg-light text-dark border">{new Date(n.date).toLocaleDateString()}</span>
                  </div>
                  <p className="card-text text-muted" style={{ whiteSpace: 'pre-wrap' }}>{n.description}</p>
                </div>
              </div>
            </div>
          ))}
          {notices.length === 0 && <p className="text-muted">No notices available.</p>}
        </div>
      </div>
    </div>
  );
};
export default Notices;

