import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5001/api/student/dashboard').then(res => setData(res.data)).catch(console.error);
  }, []);

  if (!data) return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;

  return (
    <div className="container-fluid py-2">
      <h2 className="mb-4 text-dark fw-bold">Welcome, {data.student.name}</h2>
      
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title text-muted mb-3">My Room</h5>
              {data.room ? <h4 className="card-text fw-bold">{data.room.room_number} <span className="fs-6 text-muted fw-normal">(Floor {data.room.floor})</span></h4> : <h4>Not Allocated</h4>}
              <Link to="/room" className="mt-auto btn btn-outline-primary btn-sm align-self-start">View Details</Link>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title text-muted mb-3">Latest Leave Status</h5>
              <div className="mb-3"><StatusBadge status={data.latestLeaveStatus} /></div>
              <Link to="/leaves" className="mt-auto btn btn-outline-primary btn-sm align-self-start">View All</Link>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title text-muted mb-3">Fee Status</h5>
              {data.feeStatus ? (
                <>
                  <div className="mb-2"><StatusBadge status={data.feeStatus.status} /></div>
                  <p className="card-text text-danger fw-bold mb-3">Remaining: Rs. {data.feeStatus.remaining}</p>
                </>
              ) : <p className="text-muted">No fee records</p>}
              <Link to="/fees" className="mt-auto btn btn-outline-primary btn-sm align-self-start">View Details</Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
          <h5 className="card-title mb-0 fw-bold">Recent Notices</h5>
        </div>
        <div className="card-body">
          <ul className="list-group list-group-flush">
            {data.recentNotices.map((n, i) => (
              <li key={i} className="list-group-item px-0 py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">{n.title}</span>
                  <span className="badge bg-light text-dark border">{new Date(n.date).toLocaleDateString()}</span>
                </div>
              </li>
            ))}
            {data.recentNotices.length === 0 && <li className="list-group-item text-muted">No recent notices.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};
export default StudentDashboard;



