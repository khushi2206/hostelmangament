import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5001/api/student/profile').then(res => {
      setProfile(res.data);
      setFormData({ phone: res.data.phone, address: res.data.address, emergency_contact: res.data.emergency_contact });
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('http://localhost:5001/api/student/profile', formData);
      setProfile(res.data);
      setEditMode(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch(err) { alert('Error updating profile'); }
  };

  if (!profile) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container-fluid py-2">
      <div className="card shadow-sm border-0 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold text-primary mb-0">My Profile</h3>
          <button onClick={() => setEditMode(!editMode)} className={`btn ${editMode ? 'btn-secondary' : 'btn-primary'}`}>
            {editMode ? 'Cancel' : 'Edit Contact Info'}
          </button>
        </div>

        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <div className="row g-4 mb-5">
          <div className="col-md-4 col-sm-6"><label className="text-muted small text-uppercase">Full Name</label><div className="fw-bold fs-5">{profile.name}</div></div>
          <div className="col-md-4 col-sm-6"><label className="text-muted small text-uppercase">Enrollment No</label><div className="fw-bold fs-5">{profile.enrollment_no}</div></div>
          <div className="col-md-4 col-sm-6"><label className="text-muted small text-uppercase">Course</label><div className="fw-bold fs-5">{profile.course}</div></div>
          <div className="col-md-4 col-sm-6"><label className="text-muted small text-uppercase">Department</label><div className="fw-bold fs-5">{profile.department}</div></div>
          <div className="col-md-4 col-sm-6"><label className="text-muted small text-uppercase">Semester</label><div className="fw-bold fs-5">{profile.semester}</div></div>
          <div className="col-md-4 col-sm-6"><label className="text-muted small text-uppercase">Date of Birth</label><div className="fw-bold fs-5">{new Date(profile.dob).toLocaleDateString()}</div></div>
        </div>
        
        <h4 className="fw-bold mb-4 border-top pt-4">Contact Information</h4>

        {editMode ? (
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Phone Number</label>
              <input type="text" className="form-control" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Emergency Contact</label>
              <input type="text" className="form-control" value={formData.emergency_contact || ''} onChange={e => setFormData({...formData, emergency_contact: e.target.value})} required />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Residential Address</label>
              <textarea className="form-control" rows="3" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} required />
            </div>
            <div className="col-12 mt-4">
              <button type="submit" className="btn btn-success px-4 py-2 fw-semibold">Save Changes</button>
            </div>
          </form>
        ) : (
          <div className="row g-4">
            <div className="col-md-6"><label className="text-muted small text-uppercase">Phone Number</label><div className="fw-bold fs-5">{profile.phone || '-'}</div></div>
            <div className="col-md-6"><label className="text-muted small text-uppercase">Emergency Contact</label><div className="fw-bold fs-5">{profile.emergency_contact || '-'}</div></div>
            <div className="col-12"><label className="text-muted small text-uppercase">Residential Address</label><div className="fw-bold fs-5" style={{whiteSpace: 'pre-wrap'}}>{profile.address || '-'}</div></div>
          </div>
        )}
      </div>
    </div>
  );
};
export default StudentProfile;

