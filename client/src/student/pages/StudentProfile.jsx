import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    axiosClient.get('/student/profile').then(res => {
      setProfile(res.data);
      setFormData({ phone: res.data.phone, address: res.data.address, emergency_contact: res.data.emergency_contact });
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.put('/student/profile', formData);
      setProfile(res.data);
      setEditMode(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch(err) { alert('Error updating profile'); }
  };

  if (!profile) return <div>Loading...</div>;

  const inputStyle = { width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '1rem' };
  
  return (
    <div style={{ background: 'white', padding: '2.5rem', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, color: 'var(--primary)' }}>My Profile</h2>
        <button onClick={() => setEditMode(!editMode)} style={{ padding: '0.5rem 1.5rem', background: editMode ? 'var(--text-light)' : 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>
          {editMode ? 'Cancel' : 'Edit Contact Info'}
        </button>
      </div>

      {successMsg && <div style={{ background: '#d1fae5', color: '#065f46', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem' }}>{successMsg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
        <div><label style={{color:'var(--text-light)', display: 'block', marginBottom: '0.5rem'}}>Full Name</label><div style={{fontWeight:500, fontSize:'1.1rem'}}>{profile.name}</div></div>
        <div><label style={{color:'var(--text-light)', display: 'block', marginBottom: '0.5rem'}}>Enrollment No</label><div style={{fontWeight:500, fontSize:'1.1rem'}}>{profile.enrollment_no}</div></div>
        <div><label style={{color:'var(--text-light)', display: 'block', marginBottom: '0.5rem'}}>Course</label><div style={{fontWeight:500, fontSize:'1.1rem'}}>{profile.course}</div></div>
        <div><label style={{color:'var(--text-light)', display: 'block', marginBottom: '0.5rem'}}>Department</label><div style={{fontWeight:500, fontSize:'1.1rem'}}>{profile.department}</div></div>
        <div><label style={{color:'var(--text-light)', display: 'block', marginBottom: '0.5rem'}}>Semester</label><div style={{fontWeight:500, fontSize:'1.1rem'}}>{profile.semester}</div></div>
        <div><label style={{color:'var(--text-light)', display: 'block', marginBottom: '0.5rem'}}>Date of Birth</label><div style={{fontWeight:500, fontSize:'1.1rem'}}>{profile.dob ? new Date(profile.dob).toLocaleDateString() : '-'}</div></div>
      </div>
      
      <hr style={{ margin: '3rem 0', borderColor: 'var(--border-color)', borderTop: 'none' }} />
      <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-dark)' }}>Contact Information</h3>

      {editMode ? (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Phone Number</label>
            <input style={inputStyle} value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Emergency Contact</label>
            <input style={inputStyle} value={formData.emergency_contact || ''} onChange={e => setFormData({...formData, emergency_contact: e.target.value})} required />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Residential Address</label>
            <textarea style={{...inputStyle, height: '100px'}} value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} required />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" style={{ padding: '0.75rem 2rem', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 500 }}>Save Changes</button>
          </div>
        </form>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div><label style={{color:'var(--text-light)', display: 'block', marginBottom: '0.5rem'}}>Phone Number</label><div style={{fontWeight:500, fontSize:'1.1rem'}}>{profile.phone || '-'}</div></div>
          <div><label style={{color:'var(--text-light)', display: 'block', marginBottom: '0.5rem'}}>Emergency Contact</label><div style={{fontWeight:500, fontSize:'1.1rem'}}>{profile.emergency_contact || '-'}</div></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={{color:'var(--text-light)', display: 'block', marginBottom: '0.5rem'}}>Residential Address</label><div style={{fontWeight:500, fontSize:'1.1rem', whiteSpace: 'pre-wrap'}}>{profile.address || '-'}</div></div>
        </div>
      )}
    </div>
  );
};
export default StudentProfile;
