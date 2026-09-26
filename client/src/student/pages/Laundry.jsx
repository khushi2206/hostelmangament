import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';

const Laundry = () => {
  const [requests, setRequests] = useState([]);
  const [clothesCount, setClothesCount] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchLaundry = () => axios.get('http://localhost:5001/api/student/laundry').then(res => setRequests(res.data)).catch(console.error);
  
  useEffect(() => { fetchLaundry(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/student/laundry', { clothes_count: clothesCount });
      setClothesCount('');
      fetchLaundry();
      setSuccessMsg('Laundry request sent successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch(err) { alert('Error submitting request'); }
  };

  return (
    <div className="container-fluid py-2 d-flex flex-column gap-4">
      <div className="card shadow-sm border-0 p-4">
        <h3 className="fw-bold text-primary mb-4">Schedule Laundry Pickup</h3>
        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        
        <form onSubmit={handleSubmit} className="row g-3 align-items-end">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Number of Clothes</label>
            <input type="number" min="1" className="form-control" value={clothesCount} onChange={e => setClothesCount(e.target.value)} required />
          </div>
          <div className="col-md-6">
            <button type="submit" className="btn btn-primary px-4 fw-semibold w-100">Request Pickup</button>
          </div>
        </form>
      </div>

      <div className="card shadow-sm border-0 p-4">
        <h3 className="fw-bold mb-4">Laundry History</h3>
        {requests.length === 0 ? <p className="text-muted">No laundry requests found.</p> : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Request ID</th>
                  <th>Clothes Count</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.laundry_id}>
                    <td className="fw-semibold text-muted">#LND-{req.laundry_id}</td>
                    <td>{req.clothes_count} items</td>
                    <td>{new Date(req.request_date).toLocaleDateString()}</td>
                    <td><StatusBadge status={req.status} /></td>
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
export default Laundry;

