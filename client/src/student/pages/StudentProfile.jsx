import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

export default function StudentProfile() {
    const [profile,  setProfile]  = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [form,     setForm]     = useState({});
    const [success,  setSuccess]  = useState('');
    const [error,    setError]    = useState('');

    useEffect(() => {
        axiosClient.get('/student/profile').then(r => {
            setProfile(r.data);
            setForm({ phone: r.data.phone, address: r.data.address, emergency_contact: r.data.emergency_contact });
        }).catch(e => setError(e.response?.data?.message || 'Failed to load profile.'));
    }, []);

    async function save(e) {
        e.preventDefault(); setError('');
        try {
            const r = await axiosClient.put('/student/profile', form);
            setProfile(r.data);
            setEditMode(false);
            setSuccess('Profile updated!');
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) { setError(err.response?.data?.message || 'Failed to update.'); }
    }

    if (error && !profile) return <div className="hh-alert-danger">{error}</div>;
    if (!profile) return (
        <div className="d-flex align-items-center gap-2 text-muted mt-4">
            <div className="spinner-border spinner-border-sm" />Loading profile…
        </div>
    );

    const InfoRow = ({ label, value }) => (
        <div className="col-md-4 col-sm-6">
            <div style={{fontSize:'0.72rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.05em',color:'#94a3b8'}}>{label}</div>
            <div style={{fontWeight:600,color:'#0f172a',marginTop:'0.15rem'}}>{value || '—'}</div>
        </div>
    );

    return (
        <>
            <div className="hh-page-title">My Profile</div>
            <div className="hh-page-sub">Your personal and academic information.</div>

            {success && <div className="hh-alert-success mb-3"><i className="bi bi-check-circle me-2" />{success}</div>}
            {error   && <div className="hh-alert-danger  mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}

            {/* Academic info */}
            <div className="hh-card mb-4">
                <div className="hh-card-header">
                    <span className="hh-card-title"><i className="bi bi-mortarboard me-2" />Academic Details</span>
                    <span className="hh-badge hh-badge-approved"><i className="bi bi-check-circle" style={{fontSize:'0.7rem'}} />Active</span>
                </div>
                <div className="hh-card-body">
                    <div className="row g-4">
                        <InfoRow label="Full Name"      value={profile.name} />
                        <InfoRow label="Enrollment No"  value={profile.enrollment_no} />
                        <InfoRow label="Email"          value={profile.email} />
                        <InfoRow label="Course"         value={profile.course} />
                        <InfoRow label="Department"     value={profile.department} />
                        <InfoRow label="Semester"       value={profile.semester} />
                        <InfoRow label="Date of Birth"  value={profile.dob ? new Date(profile.dob).toLocaleDateString() : null} />
                        <InfoRow label="Room"           value={profile.room_number ? `${profile.room_number}, Block ${profile.block}` : 'Not Allocated'} />
                    </div>
                </div>
            </div>

            {/* Contact info */}
            <div className="hh-card">
                <div className="hh-card-header">
                    <span className="hh-card-title"><i className="bi bi-telephone me-2" />Contact Information</span>
                    <button onClick={() => setEditMode(!editMode)}
                        className={`btn btn-sm ${editMode ? 'btn-outline-secondary' : 'btn-primary'}`}>
                        {editMode ? <><i className="bi bi-x me-1" />Cancel</> : <><i className="bi bi-pencil me-1" />Edit</>}
                    </button>
                </div>
                <div className="hh-card-body">
                    {editMode ? (
                        <form onSubmit={save} className="row g-3">
                            <div className="col-md-6">
                                <label className="hh-form-label">Phone Number</label>
                                <input type="text" className="form-control" value={form.phone || ''}
                                    onChange={e => setForm({...form, phone: e.target.value})} required />
                            </div>
                            <div className="col-md-6">
                                <label className="hh-form-label">Emergency Contact</label>
                                <input type="text" className="form-control" value={form.emergency_contact || ''}
                                    onChange={e => setForm({...form, emergency_contact: e.target.value})} required />
                            </div>
                            <div className="col-12">
                                <label className="hh-form-label">Residential Address</label>
                                <textarea className="form-control" rows="3" value={form.address || ''}
                                    onChange={e => setForm({...form, address: e.target.value})} required />
                            </div>
                            <div className="col-12">
                                <button type="submit" className="btn btn-primary">
                                    <i className="bi bi-check2 me-2" />Save Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="row g-4">
                            <InfoRow label="Phone Number"      value={profile.phone} />
                            <InfoRow label="Emergency Contact" value={profile.emergency_contact} />
                            <div className="col-12">
                                <div style={{fontSize:'0.72rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.05em',color:'#94a3b8'}}>Residential Address</div>
                                <div style={{fontWeight:600,color:'#0f172a',marginTop:'0.15rem',whiteSpace:'pre-wrap'}}>{profile.address || '—'}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
