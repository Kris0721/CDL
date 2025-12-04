import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../Common/Navbar';
import Sidebar from '../Common/Sidebar';
import UserManagement from './UserManagement';
import TransactionMonitor from './TransactionMonitor';
import SystemLogs from './SystemLogs';
import '../../styles/components/dashboard.css';

const MaintainerDashboard = () => {
    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-container">
                <Sidebar role="maintainer" />
                <main className="dashboard-main">
                    <Routes>
                        <Route index element={<DashboardHome />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="transactions" element={<TransactionMonitor />} />
                        <Route path="logs" element={<SystemLogs />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

const DashboardHome = () => {
    return (
        <div className="dashboard-content">
            <h1>Maintainer Dashboard</h1>
            <div className="stats-grid">
                <StatCard title="Total Users" value="1,234" change="+12%" />
                <StatCard title="Active Loans" value="456" change="+8%" />
                <StatCard title="Total Volume" value="$2.5M" change="+15%" />
                <StatCard title="Platform Fee" value="$12.5K" change="+10%" />
            </div>
        </div>
    );
};

const StatCard = ({ title, value, change }) => (
    <div className="stat-card">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
        <span className={`stat-change ${change.startsWith('+') ? 'positive' : 'negative'}`}>
            {change}
        </span>
    </div>
);

export default MaintainerDashboard;
