import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import RequestLoan from './RequestLoan';
import ActiveLoans from './ActiveLoans';
import RepayLoan from './RepayLoan';
import { getWalletAddress, getBalance } from '../../services/wallet';
import '../../styles/components/dashboard.css';

const BorrowerDashboard = () => {
    return (
        <div className="dashboard-layout borrower-theme glass-effect">
            <div className="watermark-overlay"></div>
            <div className="ambient-background"></div>
            <Navbar />
            <div className="dashboard-container">
                <Sidebar role="borrower" />
                <main className="dashboard-main">
                    <Routes>
                        <Route index element={<DashboardHome />} />
                        <Route path="request" element={<RequestLoan />} />
                        <Route path="loans" element={<ActiveLoans />} />
                        <Route path="repay" element={<RepayLoan />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

const DashboardHome = () => {
    const navigate = useNavigate();
    const [walletAddress, setWalletAddress] = useState('');
    const [ethBalance, setEthBalance] = useState('0');

    useEffect(() => {
        loadWalletInfo();
    }, []);

    const loadWalletInfo = async () => {
        try {
            // Get wallet from mock auth
            const userRole = localStorage.getItem('userRole');
            if (userRole === 'borrower') {
                setWalletAddress('0x0c6024f0d49b897ee29ad85047602cfdf7d34fab');
            }

            // Try to get real MetaMask wallet
            const connectedWallet = await getWalletAddress();
            if (connectedWallet) {
                setWalletAddress(connectedWallet);
                const balance = await getBalance(connectedWallet);
                setEthBalance(parseFloat(balance).toFixed(4));
            }
        } catch (error) {
            console.log('Wallet not connected');
        }
    };

    const formatAddress = (addr) => {
        if (!addr) return 'Not connected';
        return `${addr.substring(0, 6)}...${addr.slice(-4)}`;
    };

    // Real data for new borrower account (no activity yet)
    const stats = {
        totalBorrowed: 0,
        activeLoans: 0,
        totalRepaid: 0,
        creditScore: 650, // Default starting credit score
        availableCredit: 5000 // Initial credit limit based on default score
    };

    const loanHistory = [
        // No loans yet - empty array
    ];

    const getCreditScoreColor = (score) => {
        if (score >= 750) return 'excellent';
        if (score >= 650) return 'good';
        if (score >= 550) return 'fair';
        return 'poor';
    };

    const getCreditScoreLabel = (score) => {
        if (score >= 750) return 'Excellent';
        if (score >= 650) return 'Good';
        if (score >= 550) return 'Fair';
        return 'Needs Improvement';
    };

    return (
        <div className="dashboard-content">
            {/* Header with wallet */}
            <div className="dashboard-header">
                <div>
                    <h1>📊 Borrower Dashboard</h1>
                    <p className="subtitle">Manage your loans and track repayments</p>
                </div>
                <div className="wallet-info-box">
                    <div className="wallet-badge-large">
                        <span className="wallet-icon">🦊</span>
                        <div>
                            <div className="wallet-label">Your Wallet</div>
                            <div className="wallet-address-large">{formatAddress(walletAddress)}</div>
                        </div>
                    </div>
                    {ethBalance !== '0' && (
                        <div className="eth-balance">
                            <span className="balance-label">ETH Balance:</span>
                            <span className="balance-value">{ethBalance} ETH</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats grid with animated cards */}
            <div className="stats-grid">
                <StatCard
                    title="Total Borrowed"
                    value={`$${stats.totalBorrowed.toLocaleString()}`}
                    icon="💳"
                    color="blue"
                    trend="+12%"
                    trendLabel="vs last month"
                />
                <StatCard
                    title="Active Loans"
                    value={stats.activeLoans}
                    icon="📝"
                    color="orange"
                    trend="2"
                    trendLabel="active now"
                />
                <StatCard
                    title="Total Repaid"
                    value={`$${stats.totalRepaid.toLocaleString()}`}
                    icon="✅"
                    color="green"
                    trend="100%"
                    trendLabel="on time"
                />
                <div className={`stat-card stat-credit ${getCreditScoreColor(stats.creditScore)} glass-card glowing-border`}>
                    <div className="stat-header">
                        <span className="stat-icon">⭐</span>
                        <div className="credit-score-ring">
                            <svg viewBox="0 0 36 36" className="circular-chart">
                                <path className="circle-bg"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path className="circle"
                                    strokeDasharray={`${(stats.creditScore / 850) * 100}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                        </div>
                    </div>
                    <div className="stat-content">
                        <h3 className="stat-title">Credit Score</h3>
                        <p className="stat-value animated-number">{stats.creditScore}</p>
                        <span className="credit-label">{getCreditScoreLabel(stats.creditScore)}</span>
                    </div>
                </div>
            </div>

            {/* Quick actions */}
            <div className="quick-actions">
                <button
                    className="action-card action-primary"
                    onClick={() => navigate('/borrower/request')}
                >
                    <span className="action-icon">💰</span>
                    <div>
                        <h3>Request Loan</h3>
                        <p>Up to ${stats.availableCredit.toLocaleString()} available</p>
                    </div>
                </button>
                <button
                    className="action-card"
                    onClick={() => navigate('/borrower/repay')}
                >
                    <span className="action-icon">💵</span>
                    <div>
                        <h3>Make Payment</h3>
                        <p>Repay your active loans</p>
                    </div>
                </button>
                <button
                    className="action-card"
                    onClick={() => navigate('/borrower/loans')}
                >
                    <span className="action-icon">📊</span>
                    <div>
                        <h3>Loan History</h3>
                        <p>View all transactions</p>
                    </div>
                </button>
            </div>

            {/* Active loans table */}
            <div className="data-section">
                <h2>Active Loans</h2>
                {loanHistory.length > 0 ? (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Loan ID</th>
                                    <th>Borrowed</th>
                                    <th>Borrowed Date</th>
                                    <th>Due Date</th>
                                    <th>Remaining</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loanHistory.map(loan => (
                                    <tr key={loan.id}>
                                        <td className="loan-id">{loan.id}</td>
                                        <td className="amount-cell">${loan.amount.toLocaleString()}</td>
                                        <td>{loan.borrowed}</td>
                                        <td>{loan.due}</td>
                                        <td className="amount-cell remaining">${loan.remaining.toLocaleString()}</td>
                                        <td>
                                            <span className="status-badge status-active">
                                                {loan.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn-small btn-repay"
                                                onClick={() => navigate('/borrower/repay')}
                                            >
                                                Repay
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">💳</div>
                        <h3>No Active Loans</h3>
                        <p>You haven't taken any loans yet. Request your first loan to get started.</p>
                        <button
                            className="btn-primary"
                            onClick={() => navigate('/borrower/request')}
                        >
                            Request Loan
                        </button>
                    </div>
                )}
            </div>

            {/* Payment schedule and metrics */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <h3>Next Payment</h3>
                    <div className="metric-value">$0</div>
                    <div className="metric-subtitle">No loans yet</div>
                    <div className="metric-trend">Apply for a loan to get started</div>
                </div>
                <div className="metric-card">
                    <h3>Available Credit</h3>
                    <div className="metric-value">${stats.availableCredit.toLocaleString()}</div>
                    <div className="metric-subtitle">Based on your credit score ({stats.creditScore})</div>
                    <button
                        className="btn-metric-action"
                        onClick={() => navigate('/borrower/request')}
                    >
                        Apply Now
                    </button>
                </div>
                <div className="metric-card">
                    <h3>Account Status</h3>
                    <div className="metric-value">✅ Active</div>
                    <div className="metric-subtitle">Ready to borrow</div>
                    <div className="metric-trend">Complete KYC to increase limit</div>
                </div>
            </div>

            {/* Financial health tips */}
            <div className="tips-section">
                <h3>💡 Getting Started</h3>
                <div className="tips-grid">
                    <div className="tip-card">
                        <span className="tip-icon">🎯</span>
                        <p>Welcome! You have a starting credit limit of ${stats.availableCredit.toLocaleString()} based on your initial score of {stats.creditScore}.</p>
                    </div>
                    <div className="tip-card">
                        <span className="tip-icon">📈</span>
                        <p>Complete KYC verification to unlock higher borrowing limits and better interest rates.</p>
                    </div>
                    <div className="tip-card">
                        <span className="tip-icon">💡</span>
                        <p>Making timely repayments will improve your credit score and increase your borrowing power.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color, trend, trendLabel }) => (
    <div className={`stat-card stat-${color} glass-card hover-lift`}>
        <div className="stat-header">
            <span className="stat-icon-wrapper">{icon}</span>
            {trend && (
                <span className="stat-trend positive">
                    {trend} <span className="trend-label">{trendLabel}</span>
                </span>
            )}
        </div>
        <div className="stat-content">
            <h3 className="stat-title">{title}</h3>
            <p className="stat-value animated-number">{value}</p>
        </div>
        <div className="card-shine"></div>
    </div>
);

export default BorrowerDashboard;
