import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

import './styles/global.css';

import ProtectedRoute from './components/Auth/ProtectedRoute';
import MaintainerDashboard from './components/Admin/MaintainerDashboard';
import LenderDashboard from './components/Lender/Dashboard';
import BorrowerDashboard from './components/Borrower/Dashboard';
import { PlatformDataProvider } from './context/PlatformDataContext';
import { Web3Provider } from './context/Web3Context';
import routes from './routes';
import BuilderPage from './components/BuilderPage';
import FeatureDetail from './components/FeatureDetail/FeatureDetail';
import Disclaimer from './components/Disclaimer/Disclaimer';
import Security from './components/Security/Security';

// Assuming AnimatedBackground and ConnectionStatus are also imported or defined elsewhere
// For the purpose of this edit, I will just add them as they appear in the instruction.
// If they are not imported, this will cause a compilation error.
// import AnimatedBackground from './components/AnimatedBackground';
// import ConnectionStatus from './components/ConnectionStatus';

function App() {
    return (
        <Web3Provider>
            <PlatformDataProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected Routes */}
                        <Route
                            path="/maintainer/*"
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

                        {/* Public Routes */}
                        <Route path="/feature/:featureId" element={<FeatureDetail />} />
                        <Route path="/disclaimer" element={<Disclaimer />} />
                        <Route path="/security" element={<Security />} />

                        {/* Catch-all for Builder.io pages */}
                        <Route path="*" element={<BuilderPage />} />
                    </Routes>
                </Router>
            </PlatformDataProvider>
        </Web3Provider>
    );
}

export default App;
