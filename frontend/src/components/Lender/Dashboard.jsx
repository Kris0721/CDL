import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../context/Web3Context';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import LendFunds from './LendFunds';
import ActiveLoans from './ActiveLoans';
import Marketplace from './Marketplace';
import ProfitHistory from './ProfitHistory';
import WalletConnect from '../Common/WalletConnect';
import { getWalletAddress, getBalance } from '../../services/wallet';
import '../../styles/components/dashboard.css';
import { BuilderComponent } from '@builder.io/react';
import '../../builder-config';

const LenderDashboard = () => {
    return (
        <div className="dashboard-layout lender-theme glass-effect">
            <div className="watermark-overlay"></div>
            <div className="ambient-background-neon"></div>
            <Navbar />
            <div className="dashboard-container">
                <Sidebar role="lender" />
                <main className="dashboard-main">
                    <Routes>
                        <Route index element={<DashboardHome />} />
                        <Route path="marketplace" element={<Marketplace />} />
                        <Route path="lend" element={<LendFunds />} />
                        <Route path="loans" element={<ActiveLoans />} />
                        <Route path="profits" element={<ProfitHistory />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

const DashboardHome = () => {
    const { currentAccount, connectWallet, isConnecting } = useWeb3();
    const navigate = useNavigate(); // Add navigation hook
    const [walletAddress, setWalletAddress] = useState('');
    const [ethBalance, setEthBalance] = useState('0');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentAccount) {
            setWalletAddress(currentAccount);
        } else {
            // Fallback to mock if needed, or just empty
            const userRole = localStorage.getItem('userRole');
            if (userRole === 'lender') {
                // Keep mock for now if not connected, but indicate it's mock?
                // or just leave empty to encourage connection
                setWalletAddress('');
            }
        }
    }, [currentAccount]);

    const formatAddress = (addr) => {
        if (!addr) return 'Not connected';
        return `${addr.substring(0, 6)}...${addr.slice(-4)}`;
    };

    // Real data for new lender account (no activity yet)
    const stats = {
        totalLent: 0,
        activeLoans: 0,
        totalEarned: 0,
        apy: 0,
        monthlyChange: 0
    };

    const activeLoansList = [
        // No loans yet - empty array
    ];

    return (
        <div className="dashboard-content">
            <BuilderComponent model="dashboard-header" />
            {/* Header with wallet */}
            <div className="dashboard-header">
                <div>
                    <h1>💰 Lender Dashboard</h1>
                    <p className="subtitle">Grow your wealth through decentralized lending</p>
                </div>
                <div className="wallet-info-box">
                    <div className="wallet-badge-large">
                        <span className="wallet-icon">🦊</span>
                        <div>
                            <div className="wallet-label">Your Wallet</div>
                            <div className="wallet-address-large">
                                {walletAddress ? formatAddress(walletAddress) : (
                                    <button onClick={connectWallet} className="connect-btn-small">
                                        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                                    </button>
                                )}
                            </div>
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

            {/* Main stats grid */}
            <div className="stats-grid">
                <StatCard
                    title="Total Lent"
                    value={`$${stats.totalLent.toLocaleString()}`}
                    change="+5%"
                    changeLabel="this week"
                    icon="💵"
                    color="green"
                />
                <StatCard
                    title="Active Loans"
                    value={stats.activeLoans}
                    change="+2"
                    changeLabel="new borrowers"
                    icon="📊"
                    color="blue"
                />
                <StatCard
                    title="Total Earned"
                    value={`$${stats.totalEarned.toLocaleString()}`}
                    change="+15%"
                    changeLabel="all time"
                    icon="💎"
                    color="purple"
                />
                <StatCard
                    title="Current APY"
                    value={`${stats.apy}%`}
                    change="+0.5%"
                    changeLabel="market rate"
                    icon="📈"
                    color="orange"
                />
            </div>

            {/* Quick actions */}
            <div className="quick-actions">
                <button
                    className="action-card action-primary"
                    onClick={() => navigate('/lender/marketplace')}
                >
                    <span className="action-icon">🛒</span>
                    <div>
                        <h3>Marketplace</h3>
                        <p>Browse & Offer Loans</p>
                    </div>
                </button>
                <button
                    className="action-card"
                    onClick={() => navigate('/lender/lend')}
                >
                    <span className="action-icon">➕</span>
                    <div>
                        <h3>Lend Funds</h3>
                        <p>Add liquidity to pool</p>
                    </div>
                </button>
                <button
                    className="action-card"
                    onClick={() => navigate('/lender/loans')}
                >
                    <span className="action-icon">📋</span>
                    <div>
                        <h3>View Loans</h3>
                        <p>Track your investments</p>
                    </div>
                </button>
                <button
                    className="action-card"
                    onClick={() => navigate('/lender/profits')}
                >
                    <span className="action-icon">💰</span>
                    <div>
                        <h3>Profit History</h3>
                        <p>See earnings over time</p>
                    </div>
                </button>
            </div>

            {/* Active loans table */}
            <div className="data-section">
                <h2>Active Loans</h2>
                {activeLoansList.length > 0 ? (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Loan ID</th>
                                    <th>Borrower</th>
                                    <th>Amount</th>
                                    <th>Duration</th>
                                    <th>APY</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeLoansList.map(loan => (
                                    <tr key={loan.id}>
                                        <td className="loan-id">{loan.id}</td>
                                        <td className="wallet-cell">{loan.borrower}</td>
                                        <td className="amount-cell">${loan.amount.toLocaleString()}</td>
                                        <td>{loan.duration}</td>
                                        <td className="apy-cell">{loan.apy}%</td>
                                        <td>{loan.dueDate}</td>
                                        <td>
                                            <span className="status-badge status-active">
                                                {loan.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h3>No Active Loans Yet</h3>
                        <p>Start lending to earn passive income. Click "Lend Funds" to get started.</p>
                        <button
                            className="btn-primary"
                            onClick={() => navigate('/lender/lend')}
                        >
                            Start Lending
                        </button>
                    </div>
                )}
            </div>

            {/* Performance metrics */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <h3>This Month</h3>
                    <div className="metric-value">$0</div>
                    <div className="metric-subtitle">Earned Interest</div>
                    <div className="metric-trend">No activity yet</div>
                </div>
                <div className="metric-card">
                    <h3>Pool Utilization</h3>
                    <div className="metric-value">0%</div>
                    <div className="metric-subtitle">Of your funds are lent</div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '0%' }}></div>
                    </div>
                </div>
                <div className="metric-card">
                    <h3>Total Users</h3>
                    <div className="metric-value">3</div>
                    <div className="metric-subtitle">Platform accounts</div>
                    <div className="metric-trend">1 Lender, 1 Borrower, 1 Admin</div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, change, changeLabel, icon, color }) => (
    <div className={`stat-card stat-${color} glass-card hover-lift`}>
        <div className="stat-header">
            <span className="stat-icon-wrapper">{icon}</span>
            <span className={`stat-change ${change.startsWith('+') ? 'positive' : 'negative'}`}>
                {change} <span className="trend-label">{changeLabel}</span>
            </span>
        </div>
        <div className="stat-content">
            <h3 className="stat-title">{title}</h3>
            <p className="stat-value animated-number">{value}</p>
        </div>
        <div className="card-shine"></div>
    </div>
);

export default LenderDashboard;
