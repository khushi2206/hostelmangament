import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const MessMenu = () => {
  const [menu, setMenu] = useState([]);
  const [optOuts, setOptOuts] = useState([]);
  const [optData, setOptData] = useState({ opt_date: '', meal_type: '' });
  const [successMsg, setSuccessMsg] = useState('');

  const fetchMenu = () => axiosClient.get('/student/mess/menu').then(res => setMenu(res.data)).catch(console.error);
  const fetchOptOuts = () => axiosClient.get('/student/mess/opt-out').then(res => setOptOuts(res.data)).catch(console.error);
  
  useEffect(() => { fetchMenu(); fetchOptOuts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/student/mess/opt-out', optData);
      setOptData({ opt_date: '', meal_type: '' });
      fetchOptOuts();
      setSuccessMsg('Successfully opted out of meal!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch(err) { alert('Error opting out'); }
  };

  const days = [...new Set(menu.map(m => m.day_of_week))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <h2 style={{ marginTop: 0, color: 'var(--primary)' }}>Weekly Mess Menu</h2>
        {days.length === 0 && <p style={{ color: 'var(--text-light)' }}>No menu available.</p>}
        <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1.5rem' }}>
          {days.map(day => (
            <div key={day} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>{day}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {menu.filter(m => m.day_of_week === day).map(m => (
                  <div key={m.menu_id}>
                    <strong>{m.meal_type}</strong>
                    <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-light)' }}>{m.items}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <h2 style={{ marginTop: 0, color: 'var(--primary)' }}>Meal Opt-Out</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>Going out? Opt-out of a meal to help us prevent food waste!</p>
        
        {successMsg && <div style={{ background: '#d1fae5', color: '#065f46', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>{successMsg}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Date</label>
            <input type="date" style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={optData.opt_date} onChange={e => setOptData({...optData, opt_date: e.target.value})} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Meal Type</label>
            <select style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={optData.meal_type} onChange={e => setOptData({...optData, meal_type: e.target.value})} required>
              <option value="">Select Meal</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>
          <button type="submit" style={{ padding: '0.75rem 2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>Opt Out</button>
        </form>

        <h3 style={{ marginTop: '2rem', color: 'var(--text-dark)' }}>Opt-Out History</h3>
        <ul style={{ paddingLeft: '1.5rem' }}>
          {optOuts.map(opt => (
            <li key={opt.opt_id} style={{ margin: '0.5rem 0' }}>{new Date(opt.opt_date).toLocaleDateString()} - <strong>{opt.meal_type}</strong></li>
          ))}
          {optOuts.length === 0 && <li style={{ color: 'var(--text-light)', listStyle: 'none', marginLeft: '-1.5rem' }}>No records found.</li>}
        </ul>
      </div>
    </div>
  );
};
export default MessMenu;
