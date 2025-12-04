import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import OTPVerification from './components/Auth/OTPVerification';
import MaintainerDashboard from './components/Maintainer/Dashboard';
import LenderDashboard from './components/Lender/Dashboard';
import BorrowerDashboard from './components/Borrower/Dashboard';

export const routes = [
    { path: '/', element: <Navigate to="/login" replace /> },
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    { path: '/verify-otp', element: <OTPVerification /> },
    { path: '/maintainer/*', element: <MaintainerDashboard /> },
    { path: '/lender/*', element: <LenderDashboard /> },
    { path: '/borrower/*', element: <BorrowerDashboard /> }
];

export default routes;
