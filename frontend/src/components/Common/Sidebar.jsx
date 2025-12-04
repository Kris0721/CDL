import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ role }) => {
    const location = useLocation();

    const menuItems = {
        maintainer: [
            { path: '/maintainer', label: 'Dashboard', icon: '📊' },
            { path: '/maintainer/users', label: 'Users', icon: '👥' },
            { path: '/maintainer/transactions', label: 'Transactions', icon: '💸' },
            { path: '/maintainer/logs', label: 'System Logs', icon: '📝' }
        ],
        lender: [
            { path: '/lender', label: 'Dashboard', icon: '📊' },
            { path: '/lender/lend', label: 'Lend Funds', icon: '💰' },
            { path: '/lender/loans', label: 'Active Loans', icon: '📋' },
            { path: '/lender/profits', label: 'Profit History', icon: '📈' }
        ],
        borrower: [
            { path: '/borrower', label: 'Dashboard', icon: '📊' },
            { path: '/borrower/request', label: 'Request Loan', icon: '📝' },
            { path: '/borrower/loans', label: 'My Loans', icon: '💳' },
            { path: '/borrower/repay', label: 'Repay', icon: '💵' }
        ]
    };

    const items = menuItems[role] || [];

    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                {items.map(item => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
