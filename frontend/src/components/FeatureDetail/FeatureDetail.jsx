import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './FeatureDetail.css';

const featureData = {
    'instant-funding': {
        title: 'Instant Funding',
        icon: '⚡',
        color: 'orange',
        description: 'Get your loan approved and funded within minutes, not days.',
        benefits: [
            'Approval in under 5 minutes',
            'Funds transferred immediately after collateral confirmation',
            'No lengthy paperwork or credit checks',
            'Automated smart contract execution',
            '24/7 processing - even on weekends and holidays'
        ],
        details: `Our instant funding process leverages blockchain technology and smart contracts to eliminate traditional banking delays. Once your crypto collateral is confirmed on the blockchain, our automated system immediately processes your loan and transfers funds to your designated account.

Unlike traditional lenders who may take days or weeks to process applications, our decentralized platform operates continuously, ensuring you get access to capital exactly when you need it.`
    },
    'secure-insured': {
        title: 'Secure & Insured',
        icon: '🛡️',
        color: 'green',
        description: 'Your crypto assets are protected with industry-leading security measures.',
        benefits: [
            'Cold storage for 95% of all assets',
            'Multi-signature wallet protection',
            'Comprehensive insurance coverage',
            'SOC 2 Type II certified infrastructure',
            'Regular third-party security audits'
        ],
        details: `Security is our top priority. We employ bank-grade security measures to protect your crypto assets throughout the loan period. The majority of collateral is stored in cold wallets, completely offline and protected from cyber threats.

Our insurance coverage ensures that even in the unlikely event of a security breach, your assets remain protected. We partner with leading crypto insurance providers to offer comprehensive coverage that gives you complete peace of mind.`
    },
    'competitive-rates': {
        title: 'Competitive Rates',
        icon: '💰',
        color: 'blue',
        description: 'Enjoy some of the lowest interest rates in the crypto lending industry.',
        benefits: [
            'Starting from 4.9% APR',
            'No hidden fees or charges',
            'Transparent pricing structure',
            'Rate discounts for larger loans',
            'Lower rates for stable collateral types'
        ],
        details: `We believe in transparent, fair pricing. Our competitive rates start at just 4.9% APR, significantly lower than traditional personal loans or credit cards. The exact rate you receive depends on factors like your loan-to-value ratio and the type of crypto you use as collateral.

There are absolutely no hidden fees - what you see is what you get. No origination fees, no prepayment penalties, and no surprise charges. We make money when you succeed, not by nickel-and-diming you with fees.`
    },
    'flexible-terms': {
        title: 'Flexible Terms',
        icon: '⏰',
        color: 'purple',
        description: 'Choose repayment terms that work for your financial situation.',
        benefits: [
            'Terms from 6 months to 3 years',
            'No prepayment penalties',
            'Flexible payment schedules',
            'Option to extend your loan term',
            'Interest-only payment options available'
        ],
        details: `We understand that everyone's financial situation is unique. That's why we offer flexible loan terms ranging from 6 months to 3 years, allowing you to choose a repayment schedule that fits your budget and goals.

Want to pay off your loan early? Go ahead - we never charge prepayment penalties. Need more time? You can request a term extension. We even offer interest-only payment options for borrowers who want to minimize their monthly obligations while maintaining their loan.`
    },
    'non-custodial': {
        title: 'Non-Custodial Options',
        icon: '🔓',
        color: 'red',
        description: 'Maintain control of your assets with our smart contract-based solutions.',
        benefits: [
            'Smart contract escrow system',
            'You retain ownership of your crypto',
            'Transparent on-chain transactions',
            'Automatic collateral release upon repayment',
            'No third-party custody required'
        ],
        details: `For users who prefer to maintain maximum control over their assets, we offer non-custodial lending options powered by smart contracts. Your collateral is locked in a transparent, audited smart contract rather than transferred to our custody.

This means you retain ownership of your crypto throughout the loan period, with the smart contract automatically managing the collateral and releasing it back to you upon full repayment. Everything happens on-chain, providing complete transparency and eliminating counterparty risk.`
    },
    'global-access': {
        title: 'Global Access',
        icon: '🌐',
        color: 'blue',
        description: 'Access crypto-backed loans from anywhere in the world.',
        benefits: [
            'Available in 150+ countries',
            'Support for 50+ cryptocurrencies',
            'Multiple fiat currency options',
            'No geographic restrictions',
            'Multilingual customer support'
        ],
        details: `Cryptocurrency knows no borders, and neither do we. Our platform is accessible to users worldwide, offering truly global access to crypto-backed lending. Whether you're in New York, Tokyo, London, or anywhere in between, you can access our services.

We support a wide range of cryptocurrencies as collateral, from major assets like Bitcoin and Ethereum to popular altcoins and stablecoins. Receive your loan in your preferred fiat currency or stablecoin, making it easy to use the funds however you need.`
    }
};

const FeatureDetail = () => {
    const navigate = useNavigate();
    const { featureId } = useParams();
    const feature = featureData[featureId];

    if (!feature) {
        return (
            <div className="feature-detail-page">
                <div className="feature-not-found">
                    <h1>Feature Not Found</h1>
                    <button onClick={() => navigate('/')}>Back to Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="feature-detail-page">
            <nav className="feature-nav">
                <div className="nav-content">
                    <div className="nav-logo" onClick={() => navigate('/')}>
                        <span className="logo-text">CDL</span>
                    </div>
                    <button className="back-btn" onClick={() => navigate('/')}>
                        ← Back to Home
                    </button>
                </div>
            </nav>

            <div className="feature-hero">
                <div className={`feature-hero-icon ${feature.color}`}>
                    {feature.icon}
                </div>
                <h1>{feature.title}</h1>
                <p className="feature-hero-description">{feature.description}</p>
            </div>

            <div className="feature-content">
                <section className="feature-section">
                    <h2>Key Benefits</h2>
                    <div className="benefits-grid">
                        {feature.benefits.map((benefit, index) => (
                            <div key={index} className="benefit-item">
                                <div className="benefit-icon">✓</div>
                                <div className="benefit-text">{benefit}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="feature-section">
                    <h2>How It Works</h2>
                    <div className="feature-details">
                        {feature.details.split('\n\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                </section>

                <section className="feature-cta">
                    <h2>Ready to Get Started?</h2>
                    <p>Experience the benefits of {feature.title.toLowerCase()} with CDL</p>
                    <div className="cta-buttons">
                        <button
                            className="btn btn-primary btn-large"
                            onClick={() => navigate('/register')}
                        >
                            Apply Now →
                        </button>
                        <button
                            className="btn btn-secondary btn-large"
                            onClick={() => navigate('/')}
                        >
                            Learn More
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default FeatureDetail;
