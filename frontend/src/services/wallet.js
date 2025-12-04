import { ethers } from 'ethers';

let provider = null;
let signer = null;

export const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
    }

    try {
        provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        signer = await provider.getSigner();

        localStorage.setItem('walletAddress', accounts[0]);
        return accounts[0];
    } catch (error) {
        console.error('Failed to connect wallet:', error);
        throw error;
    }
};

export const disconnectWallet = () => {
    provider = null;
    signer = null;
    localStorage.removeItem('walletAddress');
};

export const getWalletAddress = async () => {
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress && window.ethereum) {
        try {
            provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send('eth_accounts', []);
            if (accounts.length > 0) {
                return accounts[0];
            }
        } catch (error) {
            console.error('Failed to get wallet address:', error);
        }
    }
    return null;
};

export const getSigner = () => {
    return signer;
};

export const getProvider = () => {
    return provider;
};

export const getBalance = async (address) => {
    if (!provider) {
        throw new Error('Wallet not connected');
    }
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
};
