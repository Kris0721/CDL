import React from 'react';
import { useWeb3 } from '../../context/Web3Context';

const Web3Debug = () => {
    const { currentAccount, chainId, isConnecting, error, connectWallet } = useWeb3();

    // Only show in development or if explicitly enabled
    // For now we always show it as requested for verification

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            color: '#00ff41',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #00ff41',
            fontFamily: 'monospace',
            zIndex: 9999,
            maxWidth: '300px',
            fontSize: '12px',
            boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)'
        }}>
            <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
                Web3 Debug Panel
            </h4>

            <div style={{ marginBottom: '5px' }}>
                <strong style={{ color: '#fff' }}>Status: </strong>
                {isConnecting ? 'Connecting...' : (currentAccount ? 'Connected' : 'Disconnected')}
            </div>

            <div style={{ marginBottom: '5px' }}>
                <strong style={{ color: '#fff' }}>Account: </strong>
                {currentAccount ? (
                    <span title={currentAccount}>
                        {currentAccount.substring(0, 6)}...{currentAccount.substring(38)}
                    </span>
                ) : 'None'}
            </div>

            <div style={{ marginBottom: '5px' }}>
                <strong style={{ color: '#fff' }}>Chain ID: </strong>
                {chainId || 'Unknown'}
                {chainId === 11155111 && ' (Sepolia)'}
            </div>

            {error && (
                <div style={{ color: '#ff4444', marginTop: '5px', borderTop: '1px solid #333', paddingTop: '5px' }}>
                    <strong>Error: </strong> {error}
                </div>
            )}

            {!currentAccount && (
                <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    style={{
                        marginTop: '10px',
                        width: '100%',
                        padding: '5px',
                        background: '#00ff41',
                        color: 'black',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Connect Wallet
                </button>
            )}
        </div>
    );
};

export default Web3Debug;
