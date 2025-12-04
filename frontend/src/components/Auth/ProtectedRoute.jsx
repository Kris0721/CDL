import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (role && role !== userRole) {
        // Redirect to appropriate dashboard based on actual role
        if (userRole === 'maintainer') return <Navigate to="/maintainer" replace />;
        if (userRole === 'lender') return <Navigate to="/lender" replace />;
        if (userRole === 'borrower') return <Navigate to="/borrower" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
