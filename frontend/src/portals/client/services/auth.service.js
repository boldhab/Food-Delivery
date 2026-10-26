import api from './api';

const authService = {
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    register: async (payload) => {
        const response = await api.post('/auth/register', payload);
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/auth/profile');
        return response.data;
    },

    updateProfile: async (payload) => {
        const response = await api.put('/auth/profile', payload);
        return response.data;
    },

    changePassword: async (payload) => {
        const response = await api.put('/auth/change-password', payload);
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async ({ token, newPassword }) => {
        const response = await api.post('/auth/reset-password', { token, newPassword });
        return response.data;
    },

    googleLogin: async (payload) => {
        const response = await api.post('/auth/google', payload);
        return response.data;
    },
};

export default authService;
