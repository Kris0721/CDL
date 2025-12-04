import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WalletConnect from './WalletConnect';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
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
