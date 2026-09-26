import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MessMenu = () => {
  const [menu, setMenu] = useState([]);
  const [optOuts, setOptOuts] = useState([]);
  const [optData, setOptData] = useState({ opt_date: '', meal_type: '' });
  const [successMsg, setSuccessMsg] = useState('');

  const fetchMenu = () => axios.get('http://localhost:5001/api/student/mess/menu').then(res => setMenu(res.data)).catch(console.error);
  const fetchOptOuts = () => axios.get('http://localhost:5001/api/student/mess/opt-out').then(res => setOptOuts(res.data)).catch(console.error);
  
  useEffect(() => { fetchMenu(); fetchOptOuts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/student/mess/opt-out', optData);
      setOptData({ opt_date: '', meal_type: '' });
      fetchOptOuts();
      setSuccessMsg('Successfully opted out of meal!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch(err) { alert('Error opting out'); }
  };

  const days = [...new Set(menu.map(m => m.day_of_week))];

  return (
    <div className="container-fluid py-2 d-flex flex-column gap-4">
      <div className="card shadow-sm border-0 p-4">
        <h3 className="fw-bold text-primary mb-4">Weekly Mess Menu</h3>
        <div className="row g-4">
          {days.map(day => (
            <div className="col-lg-6" key={day}>
              <div className="card border-0 shadow-sm h-100 bg-light">
                <div className="card-body">
                  <h5 className="card-title fw-bold border-bottom pb-2 mb-3">{day}</h5>
                  <div className="row g-3">
                    {menu.filter(m => m.day_of_week === day).map(m => (
                      <div className="col-12" key={m.menu_id}>
                        <div className="fw-semibold text-primary">{m.meal_type}</div>
                        <div className="text-muted small">{m.items}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card shadow-sm border-0 p-4">
        <h3 className="fw-bold mb-2">Meal Opt-Out</h3>
        <p className="text-muted mb-4">Going out? Opt-out of a meal to help us prevent food waste!</p>
        
        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        
        <form onSubmit={handleSubmit} className="row g-3 align-items-end mb-5">
          <div className="col-md-4">
            <label className="form-label fw-semibold">Date</label>
            <input type="date" className="form-control" value={optData.opt_date} onChange={e => setOptData({...optData, opt_date: e.target.value})} required />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Meal Type</label>
            <select className="form-select" value={optData.meal_type} onChange={e => setOptData({...optData, meal_type: e.target.value})} required>
              <option value="">Select Meal</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>
          <div className="col-md-4">
            <button type="submit" className="btn btn-primary w-100 fw-semibold">Opt Out</button>
          </div>
        </form>

        <h5 className="fw-bold mb-3 border-top pt-4">Opt-Out History</h5>
        {optOuts.length === 0 ? <p className="text-muted">No records found.</p> : (
          <ul className="list-group">
            {optOuts.map(opt => (
              <li className="list-group-item d-flex justify-content-between align-items-center" key={opt.opt_id}>
                <span>{new Date(opt.opt_date).toLocaleDateString()}</span>
                <span className="badge bg-secondary rounded-pill">{opt.meal_type}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
export default MessMenu;

