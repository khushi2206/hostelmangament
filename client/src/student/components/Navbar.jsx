import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar student-topnav px-4 shadow-sm d-flex justify-content-between align-items-center">
      <Link className="navbar-brand brand mb-0 h1" to="/student">HostelHub</Link>
      <button className="btn btn-outline-light d-flex align-items-center gap-2" onClick={handleLogout}>
        <i className="bi bi-box-arrow-right" /> Logout
      </button>
    </nav>
  );
};
export default Navbar;
