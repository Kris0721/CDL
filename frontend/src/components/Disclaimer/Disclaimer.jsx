import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Disclaimer.css';

const Disclaimer = () => {
    const navigate = useNavigate();

    return (
        <div className="disclaimer-page">
            <nav className="disclaimer-nav">
                <div className="nav-content">
                    <div className="nav-logo" onClick={() => navigate('/')}>
                        <span className="logo-text">CDL</span>
                    </div>
                    <button className="back-btn" onClick={() => navigate('/')}>
                        ← Back to Home
                    </button>
                </div>
            </nav>

            <div className="disclaimer-content">
                <div className="disclaimer-icon">ℹ️</div>
                <h1>Disclaimer</h1>
                <div className="disclaimer-message">
                    <p>Only a college project, not a real exchange.</p>
                </div>
                <button className="home-btn" onClick={() => navigate('/')}>
                    Return to Home
                </button>
            </div>
        </div>
    );
};

export default Disclaimer;
