import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';

const LeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [formData, setFormData] = useState({ leave_type: '', from_date: '', to_date: '', reason: '' });
  const [successMsg, setSuccessMsg] = useState('');

  const fetchLeaves = () => axios.get('http://localhost:5001/api/student/leaves').then(res => setLeaves(res.data)).catch(console.error);
  
  useEffect(() => { fetchLeaves(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/student/leaves', formData);
      setFormData({ leave_type: '', from_date: '', to_date: '', reason: '' });
      fetchLeaves();
      setSuccessMsg('Leave request submitted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch(err) { alert('Error submitting leave'); }
  };

  const cancelLeave = async (id) => {
    if(window.confirm('Are you sure you want to cancel this request?')) {
      try {
        await axios.delete(`http://localhost:5001/api/student/leaves/${id}`);
        fetchLeaves();
      } catch(err) { alert('Cannot cancel this leave'); }
    }
  };

  return (
    <div className="container-fluid py-2 d-flex flex-column gap-4">
      <div className="card shadow-sm border-0 p-4">
        <h3 className="fw-bold text-primary mb-4">Submit Leave Request</h3>
        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-4">
            <label className="form-label fw-semibold">Leave Type</label>
            <select className="form-select" value={formData.leave_type} onChange={e => setFormData({...formData, leave_type: e.target.value})} required>
              <option value="">Select Type</option>
              <option value="Home Leave">Home Leave</option>
              <option value="Medical Leave">Medical Leave</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">From Date</label>
            <input type="date" className="form-control" value={formData.from_date} onChange={e => setFormData({...formData, from_date: e.target.value})} required />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">To Date</label>
            <input type="date" className="form-control" value={formData.to_date} onChange={e => setFormData({...formData, to_date: e.target.value})} required />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold">Reason</label>
            <textarea className="form-control" rows="2" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} required></textarea>
          </div>
          <div className="col-12 mt-4">
            <button type="submit" className="btn btn-primary px-4 fw-semibold">Submit Request</button>
          </div>
        </form>
      </div>

      <div className="card shadow-sm border-0 p-4">
        <h3 className="fw-bold mb-4">Leave History</h3>
        {leaves.length === 0 ? <p className="text-muted">No leave requests found.</p> : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l.leave_id}>
                    <td className="fw-semibold">{l.leave_type}</td>
                    <td>{new Date(l.from_date).toLocaleDateString()}</td>
                    <td>{new Date(l.to_date).toLocaleDateString()}</td>
                    <td className="text-truncate" style={{maxWidth: '200px'}}>{l.reason}</td>
                    <td><StatusBadge status={l.status} /></td>
                    <td>
                      {l.status === 'Pending' && <button onClick={() => cancelLeave(l.leave_id)} className="btn btn-sm btn-outline-danger fw-semibold">Cancel</button>}
                    </td>
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
export default LeaveRequests;

