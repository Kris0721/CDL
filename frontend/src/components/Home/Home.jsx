import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { BuilderComponent } from '@builder.io/react';
import '../../builder-config'; // Initialize builder

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-page">
            {/* Builder.io Announcement Slot */}
            <BuilderComponent model="home-announcement" />

            {/* Navigation Bar */}
            <nav className="home-nav">
                <div className="nav-content">
                    <div className="nav-logo" onClick={() => navigate('/')}>
                        <span className="logo-icon">💰</span>
                        <span className="logo-text">CDL</span>
                    </div>
                    <div className="nav-links">
                        <button
                            className="nav-btn nav-btn-login"
                            onClick={() => navigate('/login')}
                        >
                            Sign In
                        </button>
                        <button
                            className="nav-btn nav-btn-register"
                            onClick={() => navigate('/register')}
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Decentralized Lending
                        <span className="gradient-text"> Made Simple</span>
                    </h1>
                    <p className="hero-subtitle">
                        Borrow and lend crypto assets with transparent rates, instant approvals,
                        and blockchain-powered security.
                    </p>
                    <div className="hero-buttons">
                        <button
                            className="btn btn-primary btn-large"
                            onClick={() => navigate('/register')}
                        >
                            Get Started
                        </button>
                        <button
                            className="btn btn-secondary btn-large"
                            onClick={() => navigate('/login')}
                        >
                            Sign In
                        </button>
                    </div>
                    <div className="hero-stats">
                        <div className="stat">
                            <div className="stat-value">$2.5M+</div>
                            <div className="stat-label">Total Disbursed</div>
                        </div>
                        <div className="stat">
                            <div className="stat-value">1,200+</div>
                            <div className="stat-label">Active Users</div>
                        </div>
                        <div className="stat">
                            <div className="stat-value">98%</div>
                            <div className="stat-label">Repayment Rate</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <h2 className="section-title">Why Choose Our Platform?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🔒</div>
                        <h3>Secure & Transparent</h3>
                        <p>
                            All transactions are recorded on the blockchain, ensuring
                            complete transparency and security for your assets.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h3>Instant Approval</h3>
                        <p>
                            Get your loan approved within minutes with our automated
                            KYC verification and smart contract system.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💰</div>
                        <h3>Competitive Rates</h3>
                        <p>
                            Enjoy interest rates from 6% to 10% based on loan duration,
                            with no hidden fees or charges.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🌐</div>
                        <h3>Decentralized</h3>
                        <p>
                            No intermediaries, no banks. Peer-to-peer lending powered
                            by Ethereum smart contracts.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Real-time Tracking</h3>
                        <p>
                            Monitor your loans, repayments, and earnings in real-time
                            with our intuitive dashboard.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🛡️</div>
                        <h3>KYC Verified</h3>
                        <p>
                            All users are verified through our secure KYC process,
                            ensuring a safe lending environment.
                        </p>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works">
                <h2 className="section-title">How It Works</h2>
                <div className="steps-container">
                    <div className="step">
                        <div className="step-number">1</div>
                        <h3>Create Account</h3>
                        <p>Sign up and complete KYC verification in minutes</p>
                    </div>
                    <div className="step-arrow">→</div>
                    <div className="step">
                        <div className="step-number">2</div>
                        <h3>Request Loan</h3>
                        <p>Choose amount, duration, and submit your request</p>
                    </div>
                    <div className="step-arrow">→</div>
                    <div className="step">
                        <div className="step-number">3</div>
                        <h3>Get Approved</h3>
                        <p>Automated approval based on your profile and KYC</p>
                    </div>
                    <div className="step-arrow">→</div>
                    <div className="step">
                        <div className="step-number">4</div>
                        <h3>Receive Funds</h3>
                        <p>Funds disbursed directly to your wallet instantly</p>
                    </div>
                </div>
            </section>

            {/* Interest Rates Section */}
            <section className="rates">
                <h2 className="section-title">Transparent Interest Rates</h2>
                <div className="rates-grid">
                    <div className="rate-card">
                        <div className="rate-duration">30 Days</div>
                        <div className="rate-percentage">6%</div>
                        <div className="rate-label">Annual Rate</div>
                    </div>
                    <div className="rate-card">
                        <div className="rate-duration">60 Days</div>
                        <div className="rate-percentage">7.5%</div>
                        <div className="rate-label">Annual Rate</div>
                    </div>
                    <div className="rate-card popular">
                        <div className="popular-badge">Most Popular</div>
                        <div className="rate-duration">90 Days</div>
                        <div className="rate-percentage">8.5%</div>
                        <div className="rate-label">Annual Rate</div>
                    </div>
                    <div className="rate-card">
                        <div className="rate-duration">180 Days</div>
                        <div className="rate-percentage">10%</div>
                        <div className="rate-label">Annual Rate</div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <h2>Ready to Get Started?</h2>
                <p>Join thousands of users already using our platform</p>
                <button
                    className="btn btn-primary btn-large"
                    onClick={() => navigate('/register')}
                >
                    Create Free Account
                </button>
            </section>

            {/* Footer */}
            <footer className="home-footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>CDL</h4>
                        <p>Crypto DeFi Lending - Decentralized lending platform powered by Ethereum</p>
                    </div>
                    <div className="footer-section">
                        <h4>Platform</h4>
                        <ul>
                            <li><a href="#features">Features</a></li>
                            <li><a href="#how-it-works">How It Works</a></li>
                            <li><a href="#rates">Interest Rates</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Support</h4>
                        <ul>
                            <li><a href="#faq">FAQ</a></li>
                            <li><a href="#contact">Contact</a></li>
                            <li><a href="#docs">Documentation</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Legal</h4>
                        <ul>
                            <li><a href="#terms">Terms of Service</a></li>
                            <li><a href="#privacy">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2025 CDL Platform. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
