import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="auth-loading">
                <div className="spinner"></div>
                <p>Đang xác thực thông tin...</p>
            </div>
        );
    }
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(user.role_code)) {
        if (user.role_code === 'ADMIN') {
            return <Navigate to="/admin/dashboard" replace />;
        } else if (user.role_code === 'TEACHER') {
            return <Navigate to="/teacher/dashboard" replace />;
        } else if (user.role_code === 'STUDENT') {
            return <Navigate to="/student/dashboard" replace />;
        }
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
};
export default ProtectedRoute;