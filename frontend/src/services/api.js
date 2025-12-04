import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth endpoints
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    verifyOTP: (data) => api.post('/auth/verify-otp', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    refreshToken: (token) => api.post('/auth/refresh', { token }),
    updateProfile: (data) => api.put('/auth/update-profile', data),
};

// User endpoints
export const userAPI = {
    getProfile: (userId) => api.get(`/user/profile${userId ? `?userId=${userId}` : ''}`),
    uploadKYC: (data) => api.post('/user/kyc/upload', data),
    getKYCDocuments: (userId) => api.get(`/user/kyc/documents${userId ? `?userId=${userId}` : ''}`),
    updateKYCStatus: (data) => api.put('/user/kyc/status', data),
    updateWallet: (data) => api.put('/user/wallet', data),
};

// Loan endpoints
export const loanAPI = {
    requestLoan: (data) => api.post('/loans/request', data),
    getUserLoans: (params) => api.get('/loans/user', { params }),
    getLoan: (loanId) => api.get(`/loans/${loanId}`),
    calculateInterest: (loanId) => api.get(`/loans/${loanId}/calculate`),
    getLoanStats: () => api.get('/loans/stats'),
    repayLoan: (data) => api.post('/loans/repay', data),
    approveLoan: (data) => api.post('/loans/approve', data),
    rejectLoan: (data) => api.post('/loans/reject', data),
    disburseLoan: (data) => api.post('/loans/disburse', data),
};

// Transaction endpoints
export const transactionAPI = {
    getTransactions: (params) => api.get('/transactions', { params }),
    getTransaction: (transactionId) => api.get(`/transactions/${transactionId}`),
};

// Admin endpoints
export const adminAPI = {
    getAllLoans: (params) => api.get('/admin/loans', { params }),
    getAllUsers: (params) => api.get('/admin/users', { params }),
    getPlatformStats: () => api.get('/admin/stats'),
};

export default api;
