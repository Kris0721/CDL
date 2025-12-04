import api from './api';

export const getPlatformStats = async () => {
    const response = await api.get('/admin/stats');
    return response;
};

export const getAllUsers = async () => {
    const response = await api.get('/admin/users');
    return response;
};

export const updateUserStatus = async (userId, status) => {
    const response = await api.put(`/admin/users/${userId}/status`, { status });
    return response;
};

export const getPendingKYC = async () => {
    const response = await api.get('/admin/kyc/pending');
    return response;
};

export const approveKYC = async (userId) => {
    const response = await api.post(`/admin/kyc/${userId}/approve`);
    return response;
};

export const rejectKYC = async (userId, reason) => {
    const response = await api.post(`/admin/kyc/${userId}/reject`, { reason });
    return response;
};

export const updatePlatformFees = async (feePercentage) => {
    const response = await api.put('/admin/fees', { feePercentage });
    return response;
};

export const pauseProtocol = async () => {
    const response = await api.post('/admin/protocol/pause');
    return response;
};

export const resumeProtocol = async () => {
    const response = await api.post('/admin/protocol/resume');
    return response;
};
