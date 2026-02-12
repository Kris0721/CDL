import api from './api';

// Mock users for development/testing
const mockUsers = [
    {
        email: 'kris7ind@gmail.com',
        password: 'Latur@2012',
        role: 'maintainer',
        token: 'mock-token-maintainer-kris',
        name: 'Kris',
        walletAddress: '0xc7ec40d0562d73f881b8e6223267bdabf60b6821'
    },
    // Permanent Default Accounts
    {
        email: 'maintainer@cdl.com',
        password: 'admin123',
        role: 'maintainer',
        token: 'mock-token-maintainer-default',
        name: 'System Maintainer',
        walletAddress: '0xAdminWalletAddress123456789'
    },
    {
        email: 'lender@cdl.com',
        password: 'lender123',
        role: 'lender',
        token: 'mock-token-lender-default',
        name: 'Crypto Whale',
        walletAddress: '0x23e5c170066540dd241bf0a3505be482a1619e50'
    },
    {
        email: 'borrower@cdl.com',
        password: 'borrower123',
        role: 'borrower',
        token: 'mock-token-borrower-default',
        name: 'Active Trader',
        walletAddress: '0x0c6024f0d49b897ee29ad85047602cfdf7d34fab'
    },
    // Test Accounts
    {
        email: 'lender@test.com',
        password: 'Test@123',
        role: 'lender',
        token: 'mock-token-lender',
        name: 'Test Lender',
        walletAddress: '0x23e5c170066540dd241bf0a3505be482a1619e50'
    },
    {
        email: 'borrower@test.com',
        password: 'Test@123',
        role: 'borrower',
        token: 'mock-token-borrower',
        name: 'Test Borrower',
        walletAddress: '0x0c6024f0d49b897ee29ad85047602cfdf7d34fab'
    }
];

export const login = async (email, password) => {
    try {
        // Try real backend first
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    } catch (error) {
        // If backend is not available (404, network error, etc.), use mock authentication
        console.warn('Backend unavailable, using mock authentication:', error.message);

        // Check mock users
        const user = mockUsers.find(u => u.email === email && u.password === password);

        if (user) {
            return {
                token: user.token,
                role: user.role,
                name: user.name,
                email: user.email
            };
        } else {
            throw new Error('Invalid email or password');
        }
    }
};

export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};



export const resendOTP = async (email) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response;
};

export const resetPassword = async (email) => {
    const response = await api.post('/auth/reset-password', { email });
    return response;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
};
