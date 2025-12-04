import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import OTPVerification from './components/Auth/OTPVerification';
import './styles/global.css';

import ProtectedRoute from './components/Auth/ProtectedRoute';
import MaintainerDashboard from './components/Admin/MaintainerDashboard';
import LenderDashboard from './components/Lender/Dashboard';
import BorrowerDashboard from './components/Borrower/Dashboard';
import { PlatformDataProvider } from './context/PlatformDataContext';

function App() {
    return (
        <PlatformDataProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-otp" element={<OTPVerification />} />

                    {/* Protected Routes */}
                    <Route
                        path="/maintainer"
                        element={
                            <ProtectedRoute role="maintainer">
                                <MaintainerDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/lender/*"
                        element={
                            <ProtectedRoute role="lender">
                                <LenderDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/borrower/*"
                        element={
                            <ProtectedRoute role="borrower">
                                <BorrowerDashboard />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </PlatformDataProvider>
    );
}

export default App;
