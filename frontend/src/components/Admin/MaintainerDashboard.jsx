import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../shared/Card';
import Button from '../shared/Button';
import './MaintainerDashboard.css';
import { getPlatformStats } from '../../services/admin'; // We'll assume this exists or create it
import { logout } from '../../services/auth';

const MaintainerDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeLoans: 0,
        totalLiquidity: 0,
        totalDisbursed: 0,
        pendingKYC: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching stats for now if API not ready
        // In production, call: await getPlatformStats();
        setTimeout(() => {
            setStats({
                totalUsers: 1250,
                activeLoans: 45,
                totalLiquidity: 500000,
                totalDisbursed: 2500000,
                pendingKYC: 12
            });
            setLoading(false);
        }, 1000);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="maintainer-dashboard">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="brand">
                        <span className="icon">🛡️</span>
                        <h1>Maintainer Console</h1>
                    </div>
                    <div className="user-info">
                        <span>Welcome, Kris</span>
                        <Button variant="secondary" onClick={handleLogout} size="small">Logout</Button>
                    </div>
                </div>
            </header>

            <main className="dashboard-content">
                {/* System Overview Section */}
                <section className="overview-section">
                    <h2>System Overview</h2>
                    <div className="stats-grid">
                        <Card className="stat-card">
                            <div className="stat-icon">👥</div>
                            <div className="stat-details">
                                <h3>Total Users</h3>
                                <p className="stat-value">{stats.totalUsers.toLocaleString()}</p>
                            </div>
                        </Card>
                        <Card className="stat-card">
                            <div className="stat-icon">💰</div>
                            <div className="stat-details">
                                <h3>Total Liquidity</h3>
                                <p className="stat-value">${stats.totalLiquidity.toLocaleString()}</p>
                            </div>
                        </Card>
                        <Card className="stat-card">
                            <div className="stat-icon">📉</div>
                            <div className="stat-details">
                                <h3>Active Loans</h3>
                                <p className="stat-value">{stats.activeLoans}</p>
                            </div>
                        </Card>
                        <Card className="stat-card">
                            <div className="stat-icon">⚠️</div>
                            <div className="stat-details">
                                <h3>Pending KYC</h3>
                                <p className="stat-value">{stats.pendingKYC}</p>
                            </div>
                        </Card>
                    </div>
                </section>

                {/* Exclusive Maintainer Actions */}
                <section className="actions-section">
                    <h2>Exclusive Controls</h2>
                    <div className="actions-grid">
                        <Card className="action-card emergency">
                            <div className="card-header">
                                <h3>🚨 Emergency Stop</h3>
                                <span className="status-badge active">System Active</span>
                            </div>
                            <p>Pause all lending pool activities. Use only in critical security events.</p>
                            <Button variant="danger" fullWidth>Pause Protocol</Button>
                        </Card>

                        <Card className="action-card">
                            <div className="card-header">
                                <h3>💸 Fee Management</h3>
                            </div>
                            <p>Adjust platform transaction fees and interest rate models.</p>
                            <div className="fee-input-group">
                                <label>Platform Fee (%)</label>
                                <input type="number" defaultValue="0.5" step="0.1" />
                            </div>
                            <Button variant="primary" fullWidth>Update Fees</Button>
                        </Card>

                        <Card className="action-card">
                            <div className="card-header">
                                <h3>🔐 User Administration</h3>
                            </div>
                            <p>Manage user roles, ban suspicious accounts, and review KYC data.</p>
                            <div className="admin-links">
                                <Button variant="secondary" fullWidth onClick={() => navigate('/admin/users')}>Manage Users</Button>
                                <Button variant="secondary" fullWidth onClick={() => navigate('/admin/kyc')}>Review KYC</Button>
                            </div>
                        </Card>

                        <Card className="action-card">
                            <div className="card-header">
                                <h3>📜 Smart Contracts</h3>
                            </div>
                            <p>View contract status, upgrade implementations, and manage parameters.</p>
                            <Button variant="secondary" fullWidth>Contract Manager</Button>
                        </Card>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default MaintainerDashboard;
