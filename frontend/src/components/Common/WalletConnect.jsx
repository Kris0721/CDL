import React, { useState, useEffect } from 'react';
import Button from '../shared/Button';
import { connectWallet, disconnectWallet, getWalletAddress } from '../../services/wallet';
import './WalletConnect.css';

const WalletConnect = () => {
    const [address, setAddress] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        const addr = await getWalletAddress();
        if (addr) {
            setAddress(addr);
            setIsConnected(true);
        }
    };

    const handleConnect = async () => {
        try {
            const addr = await connectWallet();
            setAddress(addr);
            setIsConnected(true);
        } catch (error) {
            console.error('Failed to connect wallet:', error);
        }
    };

    const handleDisconnect = () => {
        disconnectWallet();
        setAddress('');
        setIsConnected(false);
    };

    const formatAddress = (addr) => {
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };

    return (
        <div className="wallet-connect">
            {isConnected ? (
                <div className="wallet-info">
                    <span className="wallet-address">{formatAddress(address)}</span>
                    <button onClick={handleDisconnect} className="disconnect-btn">×</button>
                </div>
            ) : (
                <Button onClick={handleConnect} variant="outline" size="small">
                    Connect Wallet
                </Button>
            )}
        </div>
    );
};

export default WalletConnect;
