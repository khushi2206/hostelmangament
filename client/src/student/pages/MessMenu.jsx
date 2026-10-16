import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

export default function MessMenu() {
    const [menu,     setMenu]    = useState([]);
    const [optOuts,  setOptOuts] = useState([]);
    const [optForm,  setOptForm] = useState({ opt_date: '', meal_type: '' });
    const [success,  setSuccess] = useState('');
    const [error,    setError]   = useState('');

    const loadMenu    = () => axiosClient.get('/student/mess/menu').then(r => setMenu(r.data)).catch(console.error);
    const loadOptOuts = () => axiosClient.get('/student/mess/opt-out').then(r => setOptOuts(r.data)).catch(console.error);
    useEffect(() => { loadMenu(); loadOptOuts(); }, []);

    async function submitOptOut(e) {
        e.preventDefault(); setError('');
        try {
            await axiosClient.post('/student/mess/opt-out', optForm);
            setOptForm({ opt_date: '', meal_type: '' });
            loadOptOuts();
            setSuccess('Opted out successfully!');
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) { setError(err.response?.data?.message || 'Failed.'); }
    }

    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const meals = ['Breakfast','Lunch','Dinner'];
    const menuByDay = {};
    menu.forEach(m => {
        if (!menuByDay[m.day_of_week]) menuByDay[m.day_of_week] = {};
        menuByDay[m.day_of_week][m.meal_type] = m.items;
    });
    const activeDays = days.filter(d => menuByDay[d]);

    return (
        <>
            <div className="hh-page-title">Mess Menu</div>
            <div className="hh-page-sub">Weekly meal schedule and opt-out management.</div>

            {/* Weekly table */}
            <div className="hh-card mb-4">
                <div className="hh-card-header">
                    <span className="hh-card-title"><i className="bi bi-calendar3-week me-2" />Weekly Schedule</span>
                </div>
                {activeDays.length === 0
                    ? <div className="hh-card-body text-muted">No mess menu configured yet.</div>
                    : <div className="table-responsive">
                        <table className="hh-table">
                            <thead>
                                <tr>
                                    <th>Day</th>
                                    {meals.map(m => <th key={m}>{m}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {activeDays.map(day => (
                                    <tr key={day}>
                                        <td className="fw-semibold">{day}</td>
                                        {meals.map(m => (
                                            <td key={m} style={{fontSize:'0.82rem',color:'#475569'}}>
                                                {menuByDay[day]?.[m] || '—'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                }
            </div>

            {/* Opt-out */}
            <div className="hh-card">
                <div className="hh-card-header">
                    <span className="hh-card-title"><i className="bi bi-x-circle me-2" />Meal Opt-Out</span>
                </div>
                <div className="hh-card-body">
                    <p className="text-muted mb-3" style={{fontSize:'0.85rem'}}>Going out? Opt-out of a meal to reduce food waste.</p>
                    {success && <div className="hh-alert-success mb-3"><i className="bi bi-check-circle me-2" />{success}</div>}
                    {error   && <div className="hh-alert-danger  mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
                    <form onSubmit={submitOptOut} className="row g-3">
                        <div className="col-md-5">
                            <label className="hh-form-label">Date</label>
                            <input type="date" className="form-control" value={optForm.opt_date}
                                onChange={e => setOptForm({...optForm, opt_date: e.target.value})} required />
                        </div>
                        <div className="col-md-4">
                            <label className="hh-form-label">Meal</label>
                            <select className="form-select" value={optForm.meal_type}
                                onChange={e => setOptForm({...optForm, meal_type: e.target.value})} required>
                                <option value="">Select meal…</option>
                                {meals.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div className="col-md-3 d-flex align-items-end">
                            <button type="submit" className="btn btn-primary w-100">
                                <i className="bi bi-x-circle me-1" />Opt Out
                            </button>
                        </div>
                    </form>

                    {optOuts.length > 0 && (
                        <div className="mt-4">
                            <div className="fw-semibold mb-2" style={{fontSize:'0.85rem',color:'#374151'}}>Opt-Out History</div>
                            <div className="d-flex flex-column gap-2">
                                {optOuts.map(o => (
                                    <div key={o.opt_id} className="d-flex justify-content-between align-items-center p-3 rounded" style={{background:'#f8fafc',border:'1px solid #e2e8f0'}}>
                                        <span style={{fontSize:'0.87rem'}}>{new Date(o.opt_date).toLocaleDateString()}</span>
                                        <span className="hh-badge hh-badge-default">{o.meal_type}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
