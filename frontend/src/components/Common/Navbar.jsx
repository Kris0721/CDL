import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WalletConnect from './WalletConnect';
import './Navbar.css';

import { usePlatformData } from '../../context/PlatformDataContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { apiMode, toggleApiMode } = usePlatformData();
    const userRole = localStorage.getItem('userRole');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to={`/${userRole}`} className="navbar-brand">
                    <span className="brand-icon">🏦</span>
                    <span>CDL</span>
                </Link>

                <div className="navbar-actions">
                    <button
                        onClick={toggleApiMode}
                        className="mode-toggle-btn"
                        style={{
                            marginRight: '1rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            background: apiMode === 'cloud' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        {apiMode === 'cloud' ? '☁️ Cloud' : '💻 Local'}
                    </button>
                    <WalletConnect />
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
