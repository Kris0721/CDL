import React from 'react';
import GhostCursor from '../Common/GhostCursor';
import './GhostCursorDemo.css';

/**
 * GhostCursor Demo Component
 * 
 * This demonstrates how to use the GhostCursor component in your CDL application.
 * You can integrate this into any page (Home, Dashboard, etc.)
 */
const GhostCursorDemo = () => {
    return (
        <div className="ghost-cursor-demo-container">
            <div className="demo-section" style={{ height: 600, position: 'relative' }}>
                {/* Purple Ghost Cursor - Default CDL Theme */}
                <GhostCursor
                    color="#B19EEF"
                    brightness={1}
                    edgeIntensity={0}
                    trailLength={50}
                    inertia={0.5}
                    grainIntensity={0.05}
                    bloomStrength={0.1}
                    bloomRadius={1.0}
                    bloomThreshold={0.025}
                    fadeDelayMs={1000}
                    fadeDurationMs={1500}
                />

                <div className="demo-content">
                    <h1>CDL - Crypto DeFi Lending</h1>
                    <p>Move your mouse to see the ghost cursor effect</p>
                    <div className="feature-cards">
                        <div className="card">
                            <h3>Secure Lending</h3>
                            <p>Decentralized and transparent</p>
                        </div>
                        <div className="card">
                            <h3>Competitive Rates</h3>
                            <p>6% - 10% APR based on duration</p>
                        </div>
                        <div className="card">
                            <h3>Fast Approval</h3>
                            <p>Quick loan processing</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alternative Color Schemes */}
            <div className="color-variants">
                <h2>Color Variants</h2>

                <div className="variant-row">
                    <div className="variant-box" style={{ height: 300, position: 'relative' }}>
                        <GhostCursor
                            color="#4ECDC4"
                            brightness={1.2}
                            trailLength={40}
                            bloomStrength={0.15}
                        />
                        <div className="variant-label">Cyan</div>
                    </div>

                    <div className="variant-box" style={{ height: 300, position: 'relative' }}>
                        <GhostCursor
                            color="#FF6B6B"
                            brightness={1}
                            trailLength={60}
                            bloomStrength={0.2}
                        />
                        <div className="variant-label">Red</div>
                    </div>

                    <div className="variant-box" style={{ height: 300, position: 'relative' }}>
                        <GhostCursor
                            color="#95E1D3"
                            brightness={1.1}
                            trailLength={50}
                            edgeIntensity={0.2}
                        />
                        <div className="variant-label">Mint</div>
                    </div>
                </div>
            </div>

            {/* Configuration Examples */}
            <div className="config-examples">
                <h2>Configuration Examples</h2>

                <div className="config-grid">
                    <div className="config-item">
                        <h3>Subtle Effect</h3>
                        <div style={{ height: 200, position: 'relative', background: '#1a1a2e' }}>
                            <GhostCursor
                                color="#B19EEF"
                                brightness={0.6}
                                trailLength={30}
                                bloomStrength={0.05}
                                grainIntensity={0.02}
                            />
                            <p className="config-desc">Low intensity, short trail</p>
                        </div>
                    </div>

                    <div className="config-item">
                        <h3>Intense Effect</h3>
                        <div style={{ height: 200, position: 'relative', background: '#1a1a2e' }}>
                            <GhostCursor
                                color="#B19EEF"
                                brightness={1.5}
                                trailLength={80}
                                bloomStrength={0.3}
                                grainIntensity={0.1}
                            />
                            <p className="config-desc">High intensity, long trail</p>
                        </div>
                    </div>

                    <div className="config-item">
                        <h3>Slow Fade</h3>
                        <div style={{ height: 200, position: 'relative', background: '#1a1a2e' }}>
                            <GhostCursor
                                color="#B19EEF"
                                brightness={1}
                                trailLength={50}
                                fadeDelayMs={2000}
                                fadeDurationMs={3000}
                                inertia={0.8}
                            />
                            <p className="config-desc">Longer persistence, smooth motion</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GhostCursorDemo;
