import adminApi from './adminApi';

class AdminSettingsService {
  async getSettings() {
    const response = await adminApi.get('/admin/settings');
    return response.data;
  }

  async updateSettings(payload) {
    const response = await adminApi.put('/admin/settings', payload);
    return response.data;
  }
}

export default new AdminSettingsService();
