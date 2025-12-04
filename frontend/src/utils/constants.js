// API Configuration
export const API_URL = import.meta.env.REACT_APP_API_URL || 'https://api.defi-lending.com';
export const WS_URL = import.meta.env.REACT_APP_WS_URL || 'wss://api.defi-lending.com';

// Blockchain Configuration
export const CHAIN_ID = import.meta.env.REACT_APP_CHAIN_ID || '1';
export const RPC_URL = import.meta.env.REACT_APP_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_KEY';

// Contract Addresses
export const LENDING_POOL_ADDRESS = import.meta.env.REACT_APP_LENDING_POOL_ADDRESS || '';
export const LOAN_MANAGER_ADDRESS = import.meta.env.REACT_APP_LOAN_MANAGER_ADDRESS || '';

// Loan Constants
export const LOAN_DURATIONS = {
    30: { days: 30, apr: 6 },
    60: { days: 60, apr: 7.5 },
    90: { days: 90, apr: 8.5 },
    180: { days: 180, apr: 10 }
};

export const MIN_LOAN_AMOUNT = 100;
export const MAX_LOAN_AMOUNT = 100000;

// Status Constants
export const LOAN_STATUS = {
    PENDING: 'pending',
    ACTIVE: 'active',
    REPAID: 'repaid',
    DEFAULTED: 'defaulted'
};

export const USER_ROLES = {
    MAINTAINER: 'maintainer',
    LENDER: 'lender',
    BORROWER: 'borrower'
};
