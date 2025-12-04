import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Card from '../shared/Card';
import './Dashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getPlatformStats();
            setStats(response.data);
        } catch (err) {
            setError('Failed to load platform statistics');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading statistics...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!stats) return null;

    return (
        <div className="admin-dashboard">
            <h1>Platform Dashboard</h1>

            <div className="stats-grid">
                {/* User Statistics */}
                <Card title="User Statistics">
                    <div className="stat-item">
                        <span className="stat-label">Total Users</span>
                        <span className="stat-value">{stats.users.total}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">KYC Approved</span>
                        <span className="stat-value success">{stats.users.kycApproved}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">KYC Pending</span>
                        <span className="stat-value warning">{stats.users.kycPending}</span>
                    </div>
                    <div className="stat-breakdown">
                        <h4>By Role:</h4>
                        {Object.entries(stats.users.byRole).map(([role, count]) => (
                            <div key={role} className="breakdown-item">
                                <span>{role}</span>
                                <span>{count}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Loan Statistics */}
                <Card title="Loan Statistics">
                    <div className="stat-item">
                        <span className="stat-label">Total Loans</span>
                        <span className="stat-value">{stats.loans.total}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Pending</span>
                        <span className="stat-value warning">{stats.loans.pending}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Active</span>
                        <span className="stat-value info">{stats.loans.active}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Completed</span>
                        <span className="stat-value success">{stats.loans.completed}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Defaulted</span>
                        <span className="stat-value danger">{stats.loans.defaulted}</span>
                    </div>
                </Card>

                {/* Financial Statistics */}
                <Card title="Financial Overview">
                    <div className="stat-item">
                        <span className="stat-label">Total Disbursed</span>
                        <span className="stat-value">${stats.financial.totalDisbursed.toLocaleString()}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Total Repaid</span>
                        <span className="stat-value success">${stats.financial.totalRepaid.toLocaleString()}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Outstanding</span>
                        <span className="stat-value warning">${stats.financial.totalOutstanding.toLocaleString()}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Avg Loan Amount</span>
                        <span className="stat-value">${stats.financial.averageLoanAmount.toLocaleString()}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Default Rate</span>
                        <span className="stat-value danger">{stats.financial.defaultRate.toFixed(2)}%</span>
                    </div>
                </Card>
            </div>

            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                    <button onClick={() => window.location.href = '/admin/loans'} className="btn btn-primary">
                        Manage Loans
                    </button>
                    <button onClick={() => window.location.href = '/admin/users'} className="btn btn-primary">
                        Manage Users
                    </button>
                    <button onClick={fetchStats} className="btn btn-secondary">
                        Refresh Stats
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
