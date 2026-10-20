import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const linkClass = ({ isActive }) =>
    `nav-link d-flex align-items-center gap-3 py-2 px-3 rounded ${isActive ? 'bg-primary text-white' : 'text-dark'}`;

  return (
    <div className="bg-white border-end shadow-sm" style={{ width: '250px', minHeight: 'calc(100vh - 56px)' }}>
      <div className="nav flex-column nav-pills p-3 gap-1">
        <NavLink to="/student" className={linkClass} end><i className="bi bi-speedometer2" /> Dashboard</NavLink>
        <NavLink to="/student/profile" className={linkClass}><i className="bi bi-person" /> Profile</NavLink>
        <NavLink to="/student/room" className={linkClass}><i className="bi bi-door-closed" /> My Room</NavLink>
        <NavLink to="/student/mess" className={linkClass}><i className="bi bi-cup-hot" /> Mess Menu</NavLink>
        <NavLink to="/student/laundry" className={linkClass}><i className="bi bi-bag" /> Laundry</NavLink>
        <NavLink to="/student/leaves" className={linkClass}><i className="bi bi-calendar-event" /> Leaves</NavLink>
        <NavLink to="/student/visitors" className={linkClass}><i className="bi bi-people" /> Visitors</NavLink>
        <NavLink to="/student/complaints" className={linkClass}><i className="bi bi-tools" /> Complaints</NavLink>
        <NavLink to="/student/lost-found" className={linkClass}><i className="bi bi-search" /> Lost &amp; Found</NavLink>
        <NavLink to="/student/fees" className={linkClass}><i className="bi bi-cash-coin" /> Fees</NavLink>
        <NavLink to="/student/notices" className={linkClass}><i className="bi bi-megaphone" /> Notices</NavLink>
      </div>
    </div>
  );
};
export default Sidebar;
