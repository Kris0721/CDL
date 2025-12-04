export const web3Config = {
    chainId: parseInt(import.meta.env.REACT_APP_CHAIN_ID || '1'),
    chainName: import.meta.env.REACT_APP_CHAIN_NAME || 'Ethereum Mainnet',
    rpcUrl: import.meta.env.REACT_APP_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_KEY',
    blockExplorer: import.meta.env.REACT_APP_BLOCK_EXPLORER || 'https://etherscan.io',
    nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
    },

    // Contract Addresses
    contracts: {
        token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        lendingPool: import.meta.env.REACT_APP_LENDING_POOL_ADDRESS || '',
        loanManager: import.meta.env.REACT_APP_LOAN_MANAGER_ADDRESS || '',
        interestCalculator: import.meta.env.REACT_APP_INTEREST_CALCULATOR_ADDRESS || ''
    }
};

export default web3Config;
