import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';

const LostFound = () => {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({ type: 'Lost', item_name: '', description: '', location: '' });
  const [successMsg, setSuccessMsg] = useState('');

  const fetchItems = () => axios.get('http://localhost:5001/api/student/lost-found').then(res => setItems(res.data)).catch(console.error);
  
  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/student/lost-found', formData);
      setFormData({ type: 'Lost', item_name: '', description: '', location: '' });
      fetchItems();
      setSuccessMsg('Report submitted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch(err) { alert('Error submitting report'); }
  };

  return (
    <div className="container-fluid py-2 d-flex flex-column gap-4">
      <div className="card shadow-sm border-0 p-4">
        <h3 className="fw-bold text-primary mb-4">Report Lost or Found Item</h3>
        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-4">
            <label className="form-label fw-semibold">Report Type</label>
            <select className="form-select" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required>
              <option value="Lost">I Lost Something</option>
              <option value="Found">I Found Something</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Item Name</label>
            <input type="text" className="form-control" value={formData.item_name} onChange={e => setFormData({...formData, item_name: e.target.value})} required />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Location (Last seen / Found at)</label>
            <input type="text" className="form-control" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold">Description</label>
            <textarea className="form-control" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required></textarea>
          </div>
          <div className="col-12 mt-4">
            <button type="submit" className="btn btn-primary px-4 fw-semibold">Submit Report</button>
          </div>
        </form>
      </div>

      <div className="card shadow-sm border-0 p-4">
        <h3 className="fw-bold mb-4">Community Board</h3>
        {items.length === 0 ? <p className="text-muted">No items reported.</p> : (
          <div className="row g-4">
            {items.map(item => (
              <div className="col-md-6 col-lg-4" key={item.item_id}>
                <div className={`card h-100 border-${item.type === 'Lost' ? 'danger' : 'success'} border-2 shadow-sm`}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className={`badge bg-${item.type === 'Lost' ? 'danger' : 'success'}`}>{item.type}</span>
                      <StatusBadge status={item.status} />
                    </div>
                    <h5 className="card-title fw-bold">{item.item_name}</h5>
                    <p className="card-text text-muted small">{item.description}</p>
                    <hr/>
                    <div className="small text-muted">
                      <div className="mb-1"><i className="bi bi-geo-alt me-2"></i><strong>Location:</strong> {item.location}</div>
                      <div className="mb-1"><i className="bi bi-person me-2"></i><strong>Reported by:</strong> {item.student_name}</div>
                      <div><i className="bi bi-calendar me-2"></i><strong>Date:</strong> {new Date(item.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default LostFound;

