import React, { useContext } from 'react';
import { LogOut } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-dark bg-primary px-4 shadow-sm">
      <Link className="navbar-brand fw-bold mb-0 h1" to="/">HostelHub</Link>
      <button className="btn btn-outline-light d-flex align-items-center gap-2" onClick={handleLogout}>
        <LogOut size={18} /> Logout
      </button>
    </nav>
  );
};
export default Navbar;
