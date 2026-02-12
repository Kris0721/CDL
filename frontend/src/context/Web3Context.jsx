import React, { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';

// Create Web3 Context
const Web3Context = createContext();

// Custom hook to use Web3 context
export const useWeb3 = () => {
    const context = useContext(Web3Context);
    if (!context) {
        throw new Error('useWeb3 must be used within a Web3Provider');
    }
    return context;
};

// Helper function to ensure Sepolia network
const ensureSepoliaNetwork = async () => {
    try {
        console.log("Web3Provider: Ensuring Sepolia network...");
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }], // Sepolia chain ID
        });
        console.log("Web3Provider: Successfully switched to Sepolia");
    } catch (switchError) {
        console.log("Web3Provider: Switch error code:", switchError.code);
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
            try {
                console.log("Web3Provider: Adding Sepolia network to MetaMask...");
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: '0xaa36a7',
                            chainName: 'Sepolia Test Network',
                            nativeCurrency: {
                                name: 'SepoliaETH',
                                symbol: 'ETH',
                                decimals: 18,
                            },
                            rpcUrls: ['https://eth-sepolia.g.alchemy.com/v2/demo'],
                            blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                        },
                    ],
                });
                console.log("Web3Provider: Sepolia network added successfully");
            } catch (addError) {
                console.error("Web3Provider: Failed to add Sepolia network", addError);
                throw new Error("Failed to add Sepolia network");
            }
        } else if (switchError.code === 4001) {
            // User rejected the request
            console.log("Web3Provider: User rejected network switch");
            throw new Error("Please switch to Sepolia network to use this app");
        } else {
            throw switchError;
        }
    }
};

// Web3 Provider Component
export const Web3Provider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);

    // Initialize Web3 on mount
    useEffect(() => {
        const initWeb3 = async () => {
            console.log("Web3Provider: Initializing...");
            if (window.ethereum) {
                console.log("Web3Provider: window.ethereum detected");
                const ethersProvider = new ethers.BrowserProvider(window.ethereum);
                setProvider(ethersProvider);
                console.log("Web3Provider: Ethers Provider created");

                try {
                    const network = await ethersProvider.getNetwork();
                    console.log("Web3Provider: Network detected", network.chainId, network.name);
                    const currentChainId = Number(network.chainId);
                    setChainId(currentChainId);

                    // Check if already connected
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    console.log("Web3Provider: Existing accounts checking...", accounts);

                    if (accounts.length > 0) {
                        // If wallet is connected but not on Sepolia, switch to Sepolia
                        if (currentChainId !== 11155111) { // 11155111 is Sepolia chain ID in decimal
                            console.log("Web3Provider: Connected wallet is not on Sepolia, switching...");
                            try {
                                await ensureSepoliaNetwork();
                                // Reload to get fresh provider on correct network
                                window.location.reload();
                                return;
                            } catch (err) {
                                console.error("Web3Provider: Failed to switch to Sepolia", err);
                                setError("Please switch to Sepolia network");
                                return;
                            }
                        }

                        setCurrentAccount(accounts[0]);
                        const ethersSigner = await ethersProvider.getSigner();
                        setSigner(ethersSigner);
                        console.log("Web3Provider: Connected with account", accounts[0], "on Sepolia");
                    } else {
                        console.log("Web3Provider: No existing accounts connected");
                    }
                } catch (err) {
                    console.error("Web3Provider: Failed to load blockchain data", err);
                }

                // Listen for account changes
                window.ethereum.on('accountsChanged', async (accounts) => {
                    console.log("Web3Provider: Accounts changed", accounts);
                    if (accounts.length > 0) {
                        setCurrentAccount(accounts[0]);
                        const ethersSigner = await ethersProvider.getSigner();
                        setSigner(ethersSigner);
                    } else {
                        setCurrentAccount(null);
                        setSigner(null);
                    }
                });

                // Listen for chain changes
                window.ethereum.on('chainChanged', (newChainId) => {
                    console.log("Web3Provider: Chain changed to", newChainId);
                    // Start fresh on chain change
                    window.location.reload();
                });
            } else {
                console.warn("Web3Provider: window.ethereum NOT detected");
            }
        };

        initWeb3();

        return () => {
            if (window.ethereum) {
                window.ethereum.removeAllListeners();
            }
        };
    }, []);

    // Connect Wallet Function
    const connectWallet = async () => {
        if (!window.ethereum) {
            setError("MetaMask is not installed!");
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            console.log("Web3Provider: Requesting account access...");
            // Request account access FIRST
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log("Web3Provider: Accounts granted:", accounts);

            // Then switch to Sepolia using the helper function
            await ensureSepoliaNetwork();

            const ethersProvider = new ethers.BrowserProvider(window.ethereum);
            const ethersSigner = await ethersProvider.getSigner();

            setCurrentAccount(accounts[0]);
            setSigner(ethersSigner);
            setProvider(ethersProvider);

            const network = await ethersProvider.getNetwork();
            setChainId(Number(network.chainId));

            console.log("Web3Provider: Wallet connected successfully on Sepolia");

        } catch (err) {
            console.error("Web3Provider: Error connecting wallet:", err);
            setError(err.message || "Failed to connect wallet.");
        } finally {
            setIsConnecting(false);
        }
    };

    const value = {
        currentAccount,
        provider,
        signer,
        chainId,
        connectWallet,
        isConnecting,
        error
    };

    return (
        <Web3Context.Provider value={value}>
            {children}
        </Web3Context.Provider>
    );
};
