import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children, role = 'admin' }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== role) {
        return <Navigate to={user.role === 'student' ? '/student' : '/admin'} replace />;
    }
    return children;
}
