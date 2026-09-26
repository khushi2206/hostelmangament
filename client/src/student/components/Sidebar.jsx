import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User, DoorClosed, Calendar, Users, AlertCircle, CreditCard, Bell, Utensils, Search, Shirt } from 'lucide-react';

const Sidebar = () => {
  const linkClass = ({ isActive }) => 
    `nav-link d-flex align-items-center gap-3 py-2 px-3 rounded ${isActive ? 'bg-primary text-white' : 'text-dark hover-bg-light'}`;
  
  return (
    <div className="bg-white border-end shadow-sm" style={{ width: '250px', minHeight: 'calc(100vh - 56px)' }}>
      <div className="nav flex-column nav-pills p-3 gap-1">
        <NavLink to="/" className={linkClass} end><Home size={20}/> Dashboard</NavLink>
        <NavLink to="/profile" className={linkClass}><User size={20}/> Profile</NavLink>
        <NavLink to="/room" className={linkClass}><DoorClosed size={20}/> My Room</NavLink>
        <NavLink to="/mess" className={linkClass}><Utensils size={20}/> Mess Menu</NavLink>
        <NavLink to="/laundry" className={linkClass}><Shirt size={20}/> Laundry</NavLink>
        <NavLink to="/leaves" className={linkClass}><Calendar size={20}/> Leaves</NavLink>
        <NavLink to="/visitors" className={linkClass}><Users size={20}/> Visitors</NavLink>
        <NavLink to="/complaints" className={linkClass}><AlertCircle size={20}/> Complaints</NavLink>
        <NavLink to="/lost-found" className={linkClass}><Search size={20}/> Lost & Found</NavLink>
        <NavLink to="/fees" className={linkClass}><CreditCard size={20}/> Fees</NavLink>
        <NavLink to="/notices" className={linkClass}><Bell size={20}/> Notices</NavLink>
      </div>
    </div>
  );
};
export default Sidebar;
