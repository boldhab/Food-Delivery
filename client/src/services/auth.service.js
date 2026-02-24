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
};

export default authService;
