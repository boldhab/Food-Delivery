import axios from 'axios';

const DEFAULT_PRODUCTION_API_URL = 'https://food-delivery-9b1c.onrender.com/api';

const resolveApiUrl = () => {
    const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim();
    if (configuredUrl) return configuredUrl;

    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        return DEFAULT_PRODUCTION_API_URL;
    }

    return 'http://localhost:5000/api';
};

const API_URL = resolveApiUrl();

const adminApi = axios.create({
    baseURL: API_URL
});

adminApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

adminApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

export default adminApi;
