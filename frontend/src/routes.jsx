import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import OTPVerification from './components/Auth/OTPVerification';
import MaintainerDashboard from './components/Maintainer/Dashboard';
import LenderDashboard from './components/Lender/Dashboard';
import BorrowerDashboard from './components/Borrower/Dashboard';
import FeatureDetail from './components/FeatureDetail/FeatureDetail';
import Disclaimer from './components/Disclaimer/Disclaimer';
import Security from './components/Security/Security';
import GhostCursorDemo from './components/Common/GhostCursorDemo';

export const routes = [
    { path: '/', element: <Home /> },
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    { path: '/verify-otp', element: <OTPVerification /> },
    { path: '/feature/:featureId', element: <FeatureDetail /> },
    { path: '/disclaimer', element: <Disclaimer /> },
    { path: '/security', element: <Security /> },
    { path: '/demo/ghost-cursor', element: <GhostCursorDemo /> },
    { path: '/maintainer/*', element: <MaintainerDashboard /> },
    { path: '/lender/*', element: <LenderDashboard /> },
    { path: '/borrower/*', element: <BorrowerDashboard /> }
];

export default routes;
