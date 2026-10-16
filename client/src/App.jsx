import React from 'react';
import { NavLink, Navigate, Route, Routes, Link } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Login from './auth/Login';

// ── Admin pages ──────────────────────────────────────────────────────────────
import Dashboard        from './admin/pages/Dashboard';
import StudentList      from './admin/pages/students/StudentList';
import AddStudent       from './admin/pages/students/AddStudent';
import StudentDetails   from './admin/pages/students/StudentDetails';
import EditStudent      from './admin/pages/students/EditStudent';
import RoomList         from './admin/pages/rooms/RoomList';
import AddRoom          from './admin/pages/rooms/AddRoom';
import EditRoom         from './admin/pages/rooms/EditRoom';
import RoomAllocation   from './admin/pages/allocation/RoomAllocation';
import LeaveList        from './admin/pages/leaves/LeaveList';
import VisitorList      from './admin/pages/visitors/VisitorList';
import AddVisitor       from './admin/pages/visitors/AddVisitor';
import ComplaintList    from './admin/pages/complaints/ComplaintList';
import FeeList          from './admin/pages/fees/FeeList';
import NoticeList       from './admin/pages/notices/NoticeList';
import AddNotice        from './admin/pages/notices/AddNotice';

// ── Student pages ─────────────────────────────────────────────────────────────
import StudentDashboard from './student/pages/StudentDashboard';
import StudentProfile   from './student/pages/StudentProfile';
import MyRoom           from './student/pages/MyRoom';
import LeaveRequests    from './student/pages/LeaveRequests';
import Visitors         from './student/pages/Visitors';
import Complaints       from './student/pages/Complaints';
import Fees             from './student/pages/Fees';
import Notices          from './student/pages/Notices';
import MessMenu         from './student/pages/MessMenu';
import LostFound        from './student/pages/LostFound';
import Laundry          from './student/pages/Laundry';

// ─────────────────────────────────────────────────────────────────────────────
// Shared AppShell — identical layout for admin AND student
// ─────────────────────────────────────────────────────────────────────────────
function AppShell({ navItems, title, children }) {
    const { user, logout } = useAuth();
    return (
        <div className="hh-shell">
            {/* ── Sidebar ── */}
            <aside className="hh-sidebar">
                <div className="hh-sidebar-brand">
                    <div className="hh-brand-text">
                        <i className="bi bi-building me-2" />HostelHub
                    </div>
                    <div className="hh-brand-sub">{title}</div>
                </div>
                <nav className="hh-sidebar-nav">
                    {navItems.map((item) =>
                        item.section ? (
                            <div key={item.section} className="hh-nav-section">{item.section}</div>
                        ) : (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    `hh-nav-link${isActive ? ' active' : ''}`
                                }
                            >
                                <i className={`bi ${item.icon}`} />
                                {item.label}
                            </NavLink>
                        )
                    )}
                </nav>
                {/* Sidebar footer */}
                <div style={{ padding: '0.75rem', borderTop: '1px solid #1e293b' }}>
                    <button
                        onClick={logout}
                        className="hh-nav-link w-100 border-0 text-start"
                        style={{ cursor: 'pointer', background: 'none' }}
                    >
                        <i className="bi bi-box-arrow-right" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <div className="hh-main">
                {/* Top bar */}
                <header className="hh-topbar">
                    <span className="hh-topbar-title">{title}</span>
                    <div className="hh-topbar-right">
                        <span className="hh-user-badge">
                            <i className="bi bi-person-circle" />
                            {user?.email || user?.name || 'User'}
                        </span>
                    </div>
                </header>

                {/* Page content */}
                <div className="hh-content">{children}</div>
            </div>
        </div>
    );
}

// ── Admin nav config ──────────────────────────────────────────────────────────
const ADMIN_NAV = [
    { to: '/admin',            end: true, icon: 'bi-speedometer2',   label: 'Dashboard' },
    { section: 'Manage' },
    { to: '/admin/students',   icon: 'bi-people',          label: 'Students' },
    { to: '/admin/rooms',      icon: 'bi-door-open',       label: 'Rooms' },
    { to: '/admin/allocation', icon: 'bi-person-check',    label: 'Room Allocation' },
    { section: 'Operations' },
    { to: '/admin/leaves',     icon: 'bi-calendar-event',  label: 'Leaves' },
    { to: '/admin/visitors',   icon: 'bi-person-badge',    label: 'Visitors' },
    { to: '/admin/complaints', icon: 'bi-tools',           label: 'Complaints' },
    { to: '/admin/fees',       icon: 'bi-cash-coin',       label: 'Fees' },
    { to: '/admin/notices',    icon: 'bi-megaphone',       label: 'Notices' },
];

// ── Student nav config ────────────────────────────────────────────────────────
const STUDENT_NAV = [
    { to: '/student',              end: true, icon: 'bi-speedometer2',  label: 'Dashboard' },
    { section: 'My Info' },
    { to: '/student/profile',      icon: 'bi-person',           label: 'My Profile' },
    { to: '/student/room',         icon: 'bi-door-closed',      label: 'My Room' },
    { to: '/student/fees',         icon: 'bi-cash-coin',        label: 'Fees' },
    { section: 'Services' },
    { to: '/student/leaves',       icon: 'bi-calendar-event',   label: 'Leaves' },
    { to: '/student/complaints',   icon: 'bi-tools',            label: 'Complaints' },
    { to: '/student/visitors',     icon: 'bi-people',           label: 'Visitors' },
    { section: 'Hostel Life' },
    { to: '/student/mess',         icon: 'bi-cup-hot',          label: 'Mess Menu' },
    { to: '/student/laundry',      icon: 'bi-bag',              label: 'Laundry' },
    { to: '/student/lost-found',   icon: 'bi-search',           label: 'Lost & Found' },
    { to: '/student/notices',      icon: 'bi-megaphone',        label: 'Notices' },
];

// ─────────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            {/* ── Admin ── */}
            <Route
                path="/admin/*"
                element={
                    <ProtectedRoute role="admin">
                        <AppShell navItems={ADMIN_NAV} title="Admin Panel">
                            <Routes>
                                <Route path="/"                element={<Dashboard />} />
                                <Route path="/dashboard"       element={<Dashboard />} />
                                <Route path="/students"        element={<StudentList />} />
                                <Route path="/students/add"    element={<AddStudent />} />
                                <Route path="/students/:id"    element={<StudentDetails />} />
                                <Route path="/students/:id/edit" element={<EditStudent />} />
                                <Route path="/rooms"           element={<RoomList />} />
                                <Route path="/rooms/add"       element={<AddRoom />} />
                                <Route path="/rooms/:id/edit"  element={<EditRoom />} />
                                <Route path="/allocation"      element={<RoomAllocation />} />
                                <Route path="/leaves"          element={<LeaveList />} />
                                <Route path="/visitors"        element={<VisitorList />} />
                                <Route path="/visitors/add"    element={<AddVisitor />} />
                                <Route path="/complaints"      element={<ComplaintList />} />
                                <Route path="/fees"            element={<FeeList />} />
                                <Route path="/notices"         element={<NoticeList />} />
                                <Route path="/notices/add"     element={<AddNotice />} />
                                <Route path="/notices/:id/edit" element={<AddNotice />} />
                                <Route path="*"                element={<Dashboard />} />
                            </Routes>
                        </AppShell>
                    </ProtectedRoute>
                }
            />

            {/* ── Student ── */}
            <Route
                path="/student/*"
                element={
                    <ProtectedRoute role="student">
                        <AppShell navItems={STUDENT_NAV} title="Student Portal">
                            <Routes>
                                <Route path="/"            element={<StudentDashboard />} />
                                <Route path="/profile"     element={<StudentProfile />} />
                                <Route path="/room"        element={<MyRoom />} />
                                <Route path="/leaves"      element={<LeaveRequests />} />
                                <Route path="/visitors"    element={<Visitors />} />
                                <Route path="/complaints"  element={<Complaints />} />
                                <Route path="/fees"        element={<Fees />} />
                                <Route path="/notices"     element={<Notices />} />
                                <Route path="/mess"        element={<MessMenu />} />
                                <Route path="/lost-found"  element={<LostFound />} />
                                <Route path="/laundry"     element={<Laundry />} />
                                <Route path="*"            element={<StudentDashboard />} />
                            </Routes>
                        </AppShell>
                    </ProtectedRoute>
                }
            />

            <Route path="/"  element={<Navigate to="/login" replace />} />
            <Route path="*"  element={<Navigate to="/login" replace />} />
        </Routes>
    );
}
