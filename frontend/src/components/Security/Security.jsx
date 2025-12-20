import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Security.css';

const Security = () => {
    const navigate = useNavigate();

    return (
        <div className="security-page">
            <nav className="security-nav">
                <div className="nav-content">
                    <div className="nav-logo" onClick={() => navigate('/')}>
                        <span className="logo-text">CDL</span>
                    </div>
                    <button className="back-btn" onClick={() => navigate('/')}>
                        ← Back to Home
                    </button>
                </div>
            </nav>

            <div className="security-content">
                <h1>Security</h1>
                <div className="security-meme-container">
                    <img
                        src="/assets/security-meme.png"
                        alt="Cybersecurity Memes"
                        className="security-meme"
                    />
                </div>
                <div className="security-footer">
                    <p>😄 Because cybersecurity is serious business... but we can still laugh about it!</p>
                </div>
            </div>
        </div>
    );
};

export default Security;
