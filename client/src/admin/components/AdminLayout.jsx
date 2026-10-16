import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './AdminLayout.css';

const NAV = [
  { to: '/admin', icon: 'bi-speedometer2', label: 'Dashboard', end: true },
  { to: '/admin/students', icon: 'bi-people', label: 'Students' },
  { to: '/admin/rooms', icon: 'bi-door-open', label: 'Rooms' },
  { to: '/admin/allocation', icon: 'bi-diagram-3', label: 'Allocation' },
  { to: '/admin/leaves', icon: 'bi-calendar-check', label: 'Leaves' },
  { to: '/admin/visitors', icon: 'bi-person-badge', label: 'Visitors' },
  { to: '/admin/complaints', icon: 'bi-exclamation-circle', label: 'Complaints' },
  { to: '/admin/fees', icon: 'bi-credit-card', label: 'Fees' },
  { to: '/admin/notices', icon: 'bi-bell', label: 'Notices' },
];

export default function AdminLayout() {
  const { logout } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        <div className="admin-sidebar-brand">
          <i className="bi bi-building me-2"></i>
          {sidebarOpen && <span>HostelHub</span>}
        </div>
        <nav className="admin-sidebar-nav">
          {NAV.map(({ to, icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <i className={`bi ${icon}`}></i>
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button className="admin-nav-link w-100 text-start border-0 bg-transparent" onClick={handleLogout}>
            <i className="bi bi-box-arrow-left"></i>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="admin-toggle-btn" onClick={() => setSidebarOpen(o => !o)}>
            <i className="bi bi-list"></i>
          </button>
          <span className="admin-topbar-title">Admin Panel</span>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
