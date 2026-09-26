import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [formData, setFormData] = useState({ visitor_name: '', relation: '', phone: '', visit_date: '', visit_time: '' });
  const [successMsg, setSuccessMsg] = useState('');

  const fetchVisitors = () => axios.get('http://localhost:5001/api/student/visitors').then(res => setVisitors(res.data)).catch(console.error);
  
  useEffect(() => { fetchVisitors(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/student/visitors', formData);
      setFormData({ visitor_name: '', relation: '', phone: '', visit_date: '', visit_time: '' });
      fetchVisitors();
      setSuccessMsg('Visitor registered successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch(err) { alert('Error registering visitor'); }
  };

  return (
    <div className="container-fluid py-2 d-flex flex-column gap-4">
      <div className="card shadow-sm border-0 p-4">
        <h3 className="fw-bold text-primary mb-4">Register Visitor</h3>
        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-4">
            <label className="form-label fw-semibold">Visitor Name</label>
            <input type="text" className="form-control" value={formData.visitor_name} onChange={e => setFormData({...formData, visitor_name: e.target.value})} required />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Relation</label>
            <input type="text" className="form-control" value={formData.relation} onChange={e => setFormData({...formData, relation: e.target.value})} required />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Phone</label>
            <input type="text" className="form-control" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Visit Date</label>
            <input type="date" className="form-control" value={formData.visit_date} onChange={e => setFormData({...formData, visit_date: e.target.value})} required />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Visit Time</label>
            <input type="time" className="form-control" value={formData.visit_time} onChange={e => setFormData({...formData, visit_time: e.target.value})} required />
          </div>
          <div className="col-12 mt-4">
            <button type="submit" className="btn btn-primary px-4 fw-semibold">Register Visitor</button>
          </div>
        </form>
      </div>

      <div className="card shadow-sm border-0 p-4">
        <h3 className="fw-bold mb-4">Visitor History</h3>
        {visitors.length === 0 ? <p className="text-muted">No visitors registered.</p> : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Relation</th>
                  <th>Phone</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v) => (
                  <tr key={v.visitor_id}>
                    <td className="fw-semibold">{v.visitor_name}</td>
                    <td>{v.relation}</td>
                    <td>{v.phone}</td>
                    <td>{new Date(v.visit_date).toLocaleDateString()}</td>
                    <td>{v.visit_time}</td>
                    <td><StatusBadge status={v.status} /></td>
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
export default Visitors;

