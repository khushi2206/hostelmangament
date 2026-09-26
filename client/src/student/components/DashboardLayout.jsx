import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', maxHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
