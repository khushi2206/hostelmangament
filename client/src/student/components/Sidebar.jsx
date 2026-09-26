import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User, DoorClosed, Calendar, Users, AlertCircle, CreditCard, Bell, Utensils, Search, Shirt } from 'lucide-react';

const Sidebar = () => {
  const navStyle = {
    display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', background: 'white', width: '250px', minHeight: 'calc(100vh - 64px)', borderRight: '1px solid var(--border-color)'
  };
  const linkStyle = { textDecoration: 'none', color: 'var(--text-dark)', padding: '0.75rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.75rem' };
  
  return (
    <div style={navStyle}>
      <NavLink to="/" style={linkStyle}><Home size={20}/> Dashboard</NavLink>
      <NavLink to="/profile" style={linkStyle}><User size={20}/> Profile</NavLink>
      <NavLink to="/room" style={linkStyle}><DoorClosed size={20}/> My Room</NavLink>
      <NavLink to="/mess" style={linkStyle}><Utensils size={20}/> Mess Menu</NavLink>
      <NavLink to="/laundry" style={linkStyle}><Shirt size={20}/> Laundry</NavLink>
      <NavLink to="/leaves" style={linkStyle}><Calendar size={20}/> Leaves</NavLink>
      <NavLink to="/visitors" style={linkStyle}><Users size={20}/> Visitors</NavLink>
      <NavLink to="/complaints" style={linkStyle}><AlertCircle size={20}/> Complaints</NavLink>
      <NavLink to="/lost-found" style={linkStyle}><Search size={20}/> Lost & Found</NavLink>
      <NavLink to="/fees" style={linkStyle}><CreditCard size={20}/> Fees</NavLink>
      <NavLink to="/notices" style={linkStyle}><Bell size={20}/> Notices</NavLink>
    </div>
  );
};
export default Sidebar;
