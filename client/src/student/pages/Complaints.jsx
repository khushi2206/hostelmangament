import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [formData, setFormData] = useState({ category: '', description: '' });
  const [successMsg, setSuccessMsg] = useState('');

  const fetchComplaints = () => axios.get('http://localhost:5001/api/student/complaints').then(res => setComplaints(res.data)).catch(console.error);
  
  useEffect(() => { fetchComplaints(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/student/complaints', formData);
      setFormData({ category: '', description: '' });
      fetchComplaints();
      setSuccessMsg('Complaint submitted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch(err) { alert('Error submitting complaint'); }
  };

  return (
    <div className="container-fluid py-2 d-flex flex-column gap-4">
      <div className="card shadow-sm border-0 p-4">
        <h3 className="fw-bold text-primary mb-4">Submit Complaint</h3>
        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Category</label>
            <select className="form-select" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
              <option value="">Select Category</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Wi-Fi">Wi-Fi</option>
              <option value="Furniture">Furniture</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold">Description</label>
            <textarea className="form-control" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe the issue in detail..." required></textarea>
          </div>
          <div className="col-12 mt-4">
            <button type="submit" className="btn btn-primary px-4 fw-semibold">Submit Complaint</button>
          </div>
        </form>
      </div>

      <div className="card shadow-sm border-0 p-4">
        <h3 className="fw-bold mb-4">My Complaints</h3>
        {complaints.length === 0 ? <p className="text-muted">No complaints submitted yet.</p> : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{width: '150px'}}>Date</th>
                  <th style={{width: '150px'}}>Category</th>
                  <th>Description</th>
                  <th style={{width: '150px'}}>Status</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.complaint_id}>
                    <td>{new Date(c.created_date).toLocaleDateString()}</td>
                    <td className="fw-semibold">{c.category}</td>
                    <td style={{whiteSpace: 'pre-wrap'}}>{c.description}</td>
                    <td><StatusBadge status={c.status} /></td>
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
export default Complaints;

