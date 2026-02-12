import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { BuilderComponent } from '@builder.io/react';
import '../../builder-config'; // Initialize builder
import { API_KEYS, API_ENDPOINTS } from '../../config/apiKeys';
import LoanCalculator from '../LoanCalculator/LoanCalculator';
import Web3Debug from '../shared/Web3Debug';

import { usePlatformData } from '../../context/PlatformDataContext';

const Home = () => {
    const navigate = useNavigate();
    const { apiMode, toggleApiMode } = usePlatformData();
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [showTickers, setShowTickers] = useState(true);
    const [theme, setTheme] = useState('dark'); // 'dark' (default) or 'light'

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Ticker States
    const [cryptoData, setCryptoData] = useState(null);
    const [currencyData, setCurrencyData] = useState(null);

    // Fetch Crypto Data (CoinLayer)
    React.useEffect(() => {
        if (!showTickers) return; // Stop fetching if tickers are hidden

        const fetchCrypto = async () => {
            try {
                // Fetch Crypto (CoinLayer) - HTTP Only usually for free tier
                // CoinLayer Free Endpoint: http://api.coinlayer.com/live?access_key=KEY
                try {
                    const cryptoRes = await fetch(`${API_ENDPOINTS.CRYPTO}?access_key=${API_KEYS.CRYPTO_API_KEY}&symbols=BTC,ETH`, {
                        signal: AbortSignal.timeout(3000) // Timeout after 3s to show fallback quickly
                    });
                    const cryptoJson = await cryptoRes.json();
                    if (cryptoJson.success) {
                        setCryptoData(cryptoJson.rates);
                    } else {
                        throw new Error('CoinLayer API returned success: false');
                    }
                } catch (e) {
                    console.warn("Crypto API failed, using fallback:", e);
                    setCryptoData({ BTC: 65432.10, ETH: 3456.78 }); // Mock Data
                }

                // Fetch Currency (Amdoren) - Likely CORS blocked on localhost
                // We will default to mock data immediately if we suspect CORS, or try-catch it.
                try {
                    const pairs = [
                        { from: 'USD', to: 'INR' },
                        { from: 'GBP', to: 'USD' },
                        { from: 'USD', to: 'JPY' }
                    ];

                    const currencyResults = {};

                    // Parallel fetch with timeout
                    await Promise.all(pairs.map(async (pair) => {
                        try {
                            const res = await fetch(`${API_ENDPOINTS.CURRENCY}?api_key=${API_KEYS.CURRENCY_API_KEY}&from=${pair.from}&to=${pair.to}`, {
                                signal: AbortSignal.timeout(3000)
                            });
                            if (!res.ok) throw new Error('Network response was not ok');
                            const json = await res.json();
                            if (json.amount) {
                                currencyResults[`${pair.from}${pair.to}`] = json.amount;
                            }
                        } catch (innerErr) {
                            // Individual pair failure - ignore or set default
                        }
                    }));

                    // If we got results, use them. If empty (due to all failing), throw to hit fallback.
                    if (Object.keys(currencyResults).length > 0) {
                        setCurrencyData(currencyResults);
                    } else {
                        throw new Error("No currency data fetched");
                    }

                } catch (e) {
                    console.warn("Currency API failed, using fallback:", e);
                    setCurrencyData({ USDINR: 83.50, GBPUSD: 1.27, USDJPY: 148.5 }); // Mock Data
                }

            } catch (error) {
                console.error("Failed to fetch tickers:", error);
                // Last resort fallback
                setCryptoData(prev => prev || { BTC: 65000, ETH: 3500 });
                setCurrencyData(prev => prev || { USDINR: 83.50, GBPUSD: 1.27, USDJPY: 148.5 });
            }
        };

        fetchCrypto();
        const interval = setInterval(fetchCrypto, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [showTickers]);

    return (
        <div className={`home-page ${theme === 'light' ? 'light-theme' : ''}`}>
            <Web3Debug />
            <div className="watermark-overlay"></div>
            {/* Live Ticker Bar */}
            {showTickers && (
                <div className="ticker-bar">
                    <div className="ticker-left">
                        {cryptoData ? (
                            <>
                                <span className="ticker-label">CRYPTO (USD):</span>
                                <span className="ticker-item">BTC: ${cryptoData.BTC?.toFixed(2)}</span>
                                <span className="ticker-item">ETH: ${cryptoData.ETH?.toFixed(2)}</span>
                            </>
                        ) : (
                            <span className="ticker-loading">Loading Crypto...</span>
                        )}
                    </div>
                    <div className="ticker-right">
                        {currencyData ? (
                            <>
                                <span className="ticker-label">FOREX:</span>
                                <span className="ticker-item">USD/INR: {currencyData.USDINR}</span>
                                <span className="ticker-item">GBP/USD: {currencyData.GBPUSD}</span>
                                <span className="ticker-item">USD/JPY: {currencyData.USDJPY}</span>
                            </>
                        ) : (
                            <span className="ticker-loading">Loading Forex...</span>
                        )}
                    </div>
                </div>
            )}

            {/* Builder.io Announcement Slot */}
            <BuilderComponent model="home-announcement" />

            {/* Navigation Bar */}
            <nav className="home-nav">
                <div className="nav-content">
                    <div className="nav-logo" onClick={() => navigate('/')}>
                        <span className="logo-text">CDL</span>
                    </div>
                    <div className="nav-menu">
                        <a href="#features">Features</a>
                        <a href="#how-it-works">How It Works</a>
                        <a href="#about">About</a>
                        <a href="#contact">Contact</a>
                    </div>
                    <div className="nav-links">
                        <button
                            className="nav-btn nav-btn-toggle"
                            onClick={() => setShowTickers(!showTickers)}
                        >
                            {showTickers ? 'Hide Tickers' : 'Show Tickers'}
                        </button>
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
                        <button
                            className="nav-btn nav-btn-toggle"
                            onClick={toggleTheme}
                            style={{ marginLeft: '10px' }}
                        >
                            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                        </button>
                        <button
                            className="nav-btn nav-btn-toggle"
                            onClick={toggleApiMode}
                            style={{ marginLeft: '10px', backgroundColor: apiMode === 'cloud' ? '#6366f1' : 'rgba(255,255,255,0.1)' }}
                        >
                            {apiMode === 'cloud' ? '☁️ Cloud' : '💻 Local'}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Unlock Liquidity Without
                        <br />
                        <span className="gradient-text">Selling Your Crypto</span>
                    </h1>
                    <p className="hero-subtitle">
                        Get instant loans backed by your cryptocurrency. Keep your assets,
                        access cash. Simple, secure, and transparent.
                    </p>
                    <div className="hero-buttons">
                        <button
                            className="btn btn-primary btn-large"
                            onClick={() => navigate('/register')}
                        >
                            Apply Now →
                        </button>
                        <button
                            className="btn btn-secondary btn-large"
                            onClick={() => setIsCalculatorOpen(true)}
                        >
                            📊 Calculate Your Loan
                        </button>
                    </div>
                    <div className="hero-stats">
                        <div className="stat">
                            <div className="stat-value">$2.5B+</div>
                            <div className="stat-label">Loans Issued</div>
                        </div>
                        <div className="stat">
                            <div className="stat-value">4.9%</div>
                            <div className="stat-label">Starting APR</div>
                        </div>
                        <div className="stat">
                            <div className="stat-value">Only Live</div>
                            <div className="stat-label">Support</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose CDL Section */}
            <section className="why-choose" id="features">
                <h2 className="section-title">Why Choose CDL</h2>
                <p className="section-subtitle">
                    Experience the future of crypto-backed lending with our innovative platform designed
                    for modern investors.
                </p>
                <div className="features-grid">
                    <div className="feature-card" onClick={() => navigate('/feature/instant-funding')}>
                        <div className="feature-icon orange">⚡</div>
                        <h3>Instant Funding</h3>
                        <p>
                            Receive your loan within minutes of approval. No lengthy application process
                            or waiting periods.
                        </p>
                    </div>
                    <div className="feature-card" onClick={() => navigate('/feature/secure-insured')}>
                        <div className="feature-icon green">🛡️</div>
                        <h3>Secure & Insured</h3>
                        <p>
                            Your crypto assets are stored in industry-leading cold storage with comprehensive
                            insurance coverage.
                        </p>
                    </div>
                    <div className="feature-card" onClick={() => navigate('/feature/competitive-rates')}>
                        <div className="feature-icon blue">💰</div>
                        <h3>Competitive Rates</h3>
                        <p>
                            Starting from 4.9% APR with no hidden fees. Transparent pricing you can trust.
                        </p>
                    </div>
                    <div className="feature-card" onClick={() => navigate('/feature/flexible-terms')}>
                        <div className="feature-icon purple">⏰</div>
                        <h3>Flexible Terms</h3>
                        <p>
                            Choose repayment terms that work for you, from 6 months to 3 years with no
                            prepayment penalties.
                        </p>
                    </div>
                    <div className="feature-card" onClick={() => navigate('/feature/non-custodial')}>
                        <div className="feature-icon red">🔓</div>
                        <h3>Non-Custodial Options</h3>
                        <p>
                            Maintain control of your assets with our innovative smart contract-based lending
                            solutions.
                        </p>
                    </div>
                    <div className="feature-card" onClick={() => navigate('/feature/global-access')}>
                        <div className="feature-icon blue">🌐</div>
                        <h3>Global Access</h3>
                        <p>
                            Available worldwide with support for 50+ cryptocurrencies and stablecoins.
                        </p>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works" id="how-it-works">
                <h2 className="section-title white">How It Works</h2>
                <p className="section-subtitle white">
                    Getting a crypto-backed loan is simple. Follow these four easy steps to unlock your
                    capital.
                </p>
                <div className="steps-container">
                    <div className="step">
                        <div className="step-number">01</div>
                        <div className="step-icon">📄</div>
                        <h3>Submit Application</h3>
                        <p>Fill out our simple online form in under 5 minutes. Tell us about your crypto assets and desired loan amount.</p>
                    </div>
                    <div className="step">
                        <div className="step-number">02</div>
                        <div className="step-icon">🔒</div>
                        <h3>Secure Your Collateral</h3>
                        <p>Transfer your cryptocurrency to our secure, insured wallet. Your assets remain yours throughout the loan period.</p>
                    </div>
                    <div className="step">
                        <div className="step-number">03</div>
                        <div className="step-icon">💵</div>
                        <h3>Receive Funds</h3>
                        <p>Get approved instantly and receive your loan in USD, stablecoins, or your preferred currency within minutes.</p>
                    </div>
                    <div className="step">
                        <div className="step-number">04</div>
                        <div className="step-icon">✅</div>
                        <h3>Repay & Reclaim</h3>
                        <p>Make flexible repayments on your schedule. Once complete, your collateral is automatically released back to you.</p>
                    </div>
                </div>
                <div className="how-it-works-cta">
                    <button
                        className="btn btn-white btn-large"
                        onClick={() => navigate('/register')}
                    >
                        Start Your Application
                    </button>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <h2>Ready to Unlock Your Crypto's Value?</h2>
                <p>Join thousands of investors who are accessing instant liquidity without selling their crypto assets.</p>
                <div className="cta-buttons">
                    <button
                        className="btn btn-white btn-large"
                        onClick={() => navigate('/register')}
                    >
                        Apply Now →
                    </button>
                    <button
                        className="btn btn-outline btn-large"
                        onClick={() => setIsCalculatorOpen(true)}
                    >
                        📊 Calculate Your Loan
                    </button>
                </div>
                <div className="cta-trust">
                    <p className="trust-label">Secured & Trusted By</p>
                    <div className="trust-badges">
                        <span>Nobody</span>
                        <span>Only Project</span>
                        <span>Not Real</span>
                        <span>Developed</span>
                        <span>By KK</span>
                    </div>
                </div>
            </section>

            {/* Trusted Expertise Section */}
            <section className="expertise" id="about">
                <div className="expertise-content">
                    <div className="expertise-image">
                        <div className="image-placeholder">
                            <div className="placeholder-icon">👥</div>
                        </div>
                        <div className="security-badge">
                            <div className="badge-icon">🔐</div>
                            <div className="badge-content">
                                <div className="badge-title">Bank-Grade Security</div>
                                <div className="badge-subtitle">SOC 2 Certified</div>
                            </div>
                        </div>
                    </div>
                    <div className="expertise-text">
                        <h2>Trusted Expertise in Crypto Lending</h2>
                        <p>
                            With no experience in the crypto lending industry,
                            we've helped thousands of investors unlock their capital while
                            maintaining their crypto holdings.
                        </p>
                        <p>
                            Our team of financial experts and blockchain specialists ensures that every loan
                            is processed securely, efficiently, and with complete transparency. We're
                            committed to providing the best rates and terms in the industry.
                        </p>
                        <div className="expertise-stats">
                            <div className="expertise-stat">
                                <div className="expertise-stat-icon">🏆</div>
                                <div className="expertise-stat-content">
                                    <div className="expertise-stat-value">No Experience</div>
                                    <div className="expertise-stat-label">Industry Leader</div>
                                    <div className="expertise-stat-desc">Pioneering crypto lending</div>
                                </div>
                            </div>
                            <div className="expertise-stat">
                                <div className="expertise-stat-icon">👥</div>
                                <div className="expertise-stat-content">
                                    <div className="expertise-stat-value">50K+</div>
                                    <div className="expertise-stat-label">Active Users</div>
                                    <div className="expertise-stat-desc">Trusted worldwide</div>
                                </div>
                            </div>
                            <div className="expertise-stat">
                                <div className="expertise-stat-icon">📈</div>
                                <div className="expertise-stat-content">
                                    <div className="expertise-stat-value">99.8%</div>
                                    <div className="expertise-stat-label">Success Rate</div>
                                    <div className="expertise-stat-desc">Reliable platform</div>
                                </div>
                            </div>
                            <div className="expertise-stat">
                                <div className="expertise-stat-icon">🎧</div>
                                <div className="expertise-stat-content">
                                    <div className="expertise-stat-value">Only Live</div>
                                    <div className="expertise-stat-label">Support</div>
                                    <div className="expertise-stat-desc">Always here to help</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="home-footer" id="contact">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>CDL</h4>
                        <p>Professional crypto-backed lending solutions for modern investors.</p>
                    </div>
                    <div className="footer-section">
                        <h4>Products</h4>
                        <ul>
                            <li><a onClick={() => navigate('/disclaimer')}>Crypto Loans</a></li>
                            <li><a onClick={() => navigate('/disclaimer')}>Loan Calculator</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Company</h4>
                        <ul>
                            <li><a onClick={() => navigate('/disclaimer')}>About Us</a></li>
                            <li><a onClick={() => navigate('/disclaimer')}>Careers</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Support</h4>
                        <ul>
                            <li><a onClick={() => navigate('/disclaimer')}>Help Center</a></li>
                            <li><a onClick={() => navigate('/security')}>Security</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2025 CDL Platform. All rights reserved.</p>
                </div>
            </footer>

            {/* Loan Calculator Modal */}
            <LoanCalculator
                isOpen={isCalculatorOpen}
                onClose={() => setIsCalculatorOpen(false)}
            />
        </div>
    );
};

export default Home;
