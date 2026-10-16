import React from 'react';
import { LogOut } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { logout } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ background: 'var(--primary)', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
      <h2>HostelHub</h2>
      <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <LogOut size={20} /> Logout
      </button>
    </nav>
  );
};
export default Navbar;
