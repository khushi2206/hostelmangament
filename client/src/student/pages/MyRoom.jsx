import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';

const MyRoom = () => {
  const [data, setData] = useState(null);
  const [changes, setChanges] = useState([]);
  const [reason, setReason] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchRoom = () => axios.get('http://localhost:5001/api/student/room').then(res => setData(res.data)).catch(console.error);
  const fetchChanges = () => axios.get('http://localhost:5001/api/student/room-change').then(res => setChanges(res.data)).catch(console.error);

  useEffect(() => { fetchRoom(); fetchChanges(); }, []);

  const handleRequestChange = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/student/room-change', { reason });
      setReason('');
      fetchChanges();
      setSuccessMsg('Room change requested successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch(err) { alert('Error submitting request'); }
  };

  if (!data) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (!data.room) return <div className="alert alert-info shadow-sm m-4"><h4>Not Allocated</h4><p>You have not been assigned a room yet.</p></div>;

  return (
    <div className="container-fluid py-2 d-flex flex-column gap-4">
      <div className="card shadow-sm border-0 p-4">
        <h3 className="fw-bold text-primary mb-4">Room Information</h3>
        <div className="row g-4">
          <div className="col-md-3 col-6"><label className="text-muted small text-uppercase">Room Number</label><div className="fw-bold fs-5">{data.room.room_number}</div></div>
          <div className="col-md-3 col-6"><label className="text-muted small text-uppercase">Floor</label><div className="fw-bold fs-5">{data.room.floor}</div></div>
          <div className="col-md-3 col-6"><label className="text-muted small text-uppercase">Occupancy</label><div className="fw-bold fs-5">{data.room.occupied} / {data.room.capacity}</div></div>
          <div className="col-md-3 col-6"><label className="text-muted small text-uppercase mb-2">Status</label><div><StatusBadge status={data.room.status} /></div></div>
        </div>
      </div>
      
      <div className="card shadow-sm border-0 p-4">
        <h3 className="fw-bold mb-4">Roommates</h3>
        {data.roommates.length === 0 ? <p className="text-muted">No roommates assigned.</p> : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Enrollment No</th>
                  <th>Course</th>
                </tr>
              </thead>
              <tbody>
                {data.roommates.map((rm, i) => (
                  <tr key={i}>
                    <td className="fw-semibold">{rm.name}</td>
                    <td>{rm.enrollment_no}</td>
                    <td>{rm.course}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card shadow-sm border-0 p-4">
        <h3 className="fw-bold mb-4">Request Room Swap / Change</h3>
        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        
        <form onSubmit={handleRequestChange}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Reason for changing room (e.g., "Mutual swap with 22CS010")</label>
            <textarea className="form-control" rows="3" value={reason} onChange={e => setReason(e.target.value)} required></textarea>
          </div>
          <button type="submit" className="btn btn-primary px-4 fw-semibold">Submit Request</button>
        </form>

        {changes.length > 0 && (
          <div className="mt-5">
            <h5 className="fw-bold mb-3">Your Requests</h5>
            <div className="list-group">
              {changes.map(c => (
                <div key={c.request_id} className="list-group-item d-flex justify-content-between align-items-center py-3">
                  <span>{c.reason}</span>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default MyRoom;


