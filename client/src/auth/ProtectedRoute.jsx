import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * Wraps a route requiring authentication.
 * - role='admin'   → only admins can access; students are redirected to /student
 * - role='student' → only students can access; admins are redirected to /admin
 * - role='any'     → any authenticated user can access
 */
export default function ProtectedRoute({ children, role = 'admin' }) {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    if (role !== 'any' && user.role !== role) {
        return <Navigate to={user.role === 'student' ? '/student' : '/admin'} replace />;
    }

    return children;
}
