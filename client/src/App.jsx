import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import './theme.css';

// Student pages
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

// Admin pages
import AdminDashboard from './admin/pages/Dashboard';
import StudentList from './admin/pages/students/StudentList';
import AddStudent from './admin/pages/students/AddStudent';
import EditStudent from './admin/pages/students/EditStudent';
import StudentDetails from './admin/pages/students/StudentDetails';
import RoomList from './admin/pages/rooms/RoomList';
import AddRoom from './admin/pages/rooms/AddRoom';
import EditRoom from './admin/pages/rooms/EditRoom';
import RoomAllocation from './admin/pages/allocation/RoomAllocation';
import LeaveList from './admin/pages/leaves/LeaveList';
import VisitorList from './admin/pages/visitors/VisitorList';
import AddVisitor from './admin/pages/visitors/AddVisitor';
import ComplaintList from './admin/pages/complaints/ComplaintList';
import FeeList from './admin/pages/fees/FeeList';
import NoticeList from './admin/pages/notices/NoticeList';
import AddNotice from './admin/pages/notices/AddNotice';
import AdminLayout from './admin/components/AdminLayout';

// Protected route for students
const StudentRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  return children;
};

// Protected route for admins
const AdminRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<LoginForm />} />

          {/* Student portal — original routes */}
          <Route path="/" element={<StudentRoute><DashboardLayout /></StudentRoute>}>
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

          {/* Admin portal */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<StudentList />} />
            <Route path="students/add" element={<AddStudent />} />
            <Route path="students/edit/:id" element={<EditStudent />} />
            <Route path="students/:id" element={<StudentDetails />} />
            <Route path="rooms" element={<RoomList />} />
            <Route path="rooms/add" element={<AddRoom />} />
            <Route path="rooms/edit/:id" element={<EditRoom />} />
            <Route path="allocation" element={<RoomAllocation />} />
            <Route path="leaves" element={<LeaveList />} />
            <Route path="visitors" element={<VisitorList />} />
            <Route path="visitors/add" element={<AddVisitor />} />
            <Route path="complaints" element={<ComplaintList />} />
            <Route path="fees" element={<FeeList />} />
            <Route path="notices" element={<NoticeList />} />
            <Route path="notices/add" element={<AddNotice />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
