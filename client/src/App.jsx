import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import './theme.css';

// Pages
import LoginForm from './student/pages/LoginForm';
import StudentDashboard from './student/pages/StudentDashboard';
import StudentProfile from './student/pages/StudentProfile';
import MyRoom from './student/pages/MyRoom';
import LeaveRequests from './student/pages/LeaveRequests';
import Visitors from './student/pages/Visitors';
import Complaints from './student/pages/Complaints';
import Fees from './student/pages/Fees';
import Notices from './student/pages/Notices';
import MessMenu from './student/pages/MessMenu';
import LostFound from './student/pages/LostFound';
import Laundry from './student/pages/Laundry';
import DashboardLayout from './student/components/DashboardLayout';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="room" element={<MyRoom />} />
            <Route path="leaves" element={<LeaveRequests />} />
            <Route path="visitors" element={<Visitors />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="fees" element={<Fees />} />
            <Route path="notices" element={<Notices />} />
            <Route path="mess" element={<MessMenu />} />
            <Route path="lost-found" element={<LostFound />} />
            <Route path="laundry" element={<Laundry />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
