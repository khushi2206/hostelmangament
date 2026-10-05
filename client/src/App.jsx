import React from 'react';
import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './admin/pages/Dashboard';
import StudentList from './admin/pages/students/StudentList';
import AddStudent from './admin/pages/students/AddStudent';
import StudentDetails from './admin/pages/students/StudentDetails';
import EditStudent from './admin/pages/students/EditStudent';
import RoomList from './admin/pages/rooms/RoomList';
import AddRoom from './admin/pages/rooms/AddRoom';
import EditRoom from './admin/pages/rooms/EditRoom';
import RoomAllocation from './admin/pages/allocation/RoomAllocation';
import LeaveList from './admin/pages/leaves/LeaveList';
import VisitorList from './admin/pages/visitors/VisitorList';
import ComplaintList from './admin/pages/complaints/ComplaintList';
import AddVisitor from './admin/pages/visitors/AddVisitor';
import FeeList from './admin/pages/fees/FeeList';
import NoticeList from './admin/pages/notices/NoticeList';
import AddNotice from './admin/pages/notices/AddNotice';
import Login from './auth/Login';
import ProtectedRoute from './auth/ProtectedRoute';
import StudentLeaves from './student/pages/StudentLeaves';
import { useAuth } from './auth/AuthContext';

function StudentPortalLayout({ children }) {
    const { user, logout } = useAuth();

    return (
        <div className="min-vh-100 bg-light">
            <header className="bg-white shadow-sm px-4 py-3 d-flex justify-content-between align-items-center">
                <div>
                    <strong className="brand">HostelHub</strong>
                    <span className="text-muted small ms-2">Student Portal</span>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <span className="small text-muted"><i className="bi bi-person-circle me-1"></i>{user?.email || 'Student'}</span>
                    <button onClick={logout} className="btn btn-sm btn-outline-danger">
                        <i className="bi bi-box-arrow-right me-1"></i>Logout
                    </button>
                </div>
            </header>
            <div className="container py-4">{children}</div>
        </div>
    );
}

function Layout({ children }) {
    const { user, logout } = useAuth();

    return (
        <div className="d-md-flex">
            <aside className="sidebar p-3 col-md-2">
                <Link to="/admin" className="text-decoration-none">
                    <h4 className="brand mb-4">HostelHub</h4>
                </Link>
                <nav className="nav flex-column gap-1">
                    <NavLink to="/admin" end className="nav-link rounded"><i className="bi bi-speedometer2 me-2"></i>Dashboard</NavLink>
                    <NavLink to="/admin/students" className="nav-link rounded"><i className="bi bi-people me-2"></i>Students</NavLink>
                    <NavLink to="/admin/rooms" className="nav-link rounded"><i className="bi bi-door-open me-2"></i>Rooms</NavLink>
                    <NavLink to="/admin/allocation" className="nav-link rounded"><i className="bi bi-person-check me-2"></i>Room Allocation</NavLink>
                    <NavLink to="/admin/leaves" className="nav-link rounded"><i className="bi bi-calendar-event me-2"></i>Leaves</NavLink>
                    <NavLink to="/admin/visitors" className="nav-link rounded"><i className="bi bi-person-badge me-2"></i>Visitors</NavLink>
                    <NavLink to="/admin/complaints" className="nav-link rounded"><i className="bi bi-tools me-2"></i>Complaints</NavLink>
                    <NavLink to="/admin/fees" className="nav-link rounded"><i className="bi bi-cash-coin me-2"></i>Fees</NavLink>
                    <NavLink to="/admin/notices" className="nav-link rounded"><i className="bi bi-megaphone me-2"></i>Notices</NavLink>
                </nav>
            </aside>
            <main className="flex-grow-1">
                <header className="bg-white shadow-sm px-4 py-3 d-flex justify-content-between align-items-center">
                    <strong>Admin Panel</strong>
                    <div className="d-flex align-items-center gap-3">
                        <span className="small text-muted"><i className="bi bi-person-circle me-1"></i>{user?.email || 'Admin'}</span>
                        <button onClick={logout} className="btn btn-sm btn-outline-danger">
                            <i className="bi bi-box-arrow-right me-1"></i>Logout
                        </button>
                    </div>
                </header>
                <div className="container-fluid p-4">{children}</div>
            </main>
        </div>
    );
}

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route
                path="/admin/*"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/students" element={<StudentList />} />
                                <Route path="/students/add" element={<AddStudent />} />
                                <Route path="/students/:id" element={<StudentDetails />} />
                                <Route path="/students/:id/edit" element={<EditStudent />} />
                                <Route path="/rooms" element={<RoomList />} />
                                <Route path="/rooms/add" element={<AddRoom />} />
                                <Route path="/rooms/:id/edit" element={<EditRoom />} />
                                <Route path="/allocation" element={<RoomAllocation />} />
                                <Route path="/leaves" element={<LeaveList />} />
                                <Route path="/visitors" element={<VisitorList />} />
                                <Route path="/visitors/add" element={<AddVisitor />} />
                                <Route path="/complaints" element={<ComplaintList />} />
                                <Route path="/fees" element={<FeeList />} />
                                <Route path="/notices" element={<NoticeList />} />
                                <Route path="/notices/add" element={<AddNotice />} />
                                <Route path="/notices/:id/edit" element={<AddNotice />} />
                                <Route path="*" element={<Dashboard />} />
                            </Routes>
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student/*"
                element={
                    <ProtectedRoute role="student">
                        <StudentPortalLayout>
                            <Routes>
                                <Route path="/" element={<StudentLeaves />} />
                                <Route path="/leaves" element={<StudentLeaves />} />
                                <Route path="*" element={<StudentLeaves />} />
                            </Routes>
                        </StudentPortalLayout>
                    </ProtectedRoute>
                }
            />
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
    );
}
