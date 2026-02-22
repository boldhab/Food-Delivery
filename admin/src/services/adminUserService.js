import adminApi from './adminApi';

class AdminUserService {
    async getUsers(params = {}) {
        const response = await adminApi.get('/admin/users', { params });
        return response.data;
    }

    async getUserById(id) {
        const response = await adminApi.get(`/admin/users/${id}`);
        return response.data;
    }

    async updateUserStatus(id, data) {
        const response = await adminApi.put(`/admin/users/${id}/status`, data);
        return response.data;
    }
}

export default new AdminUserService();
