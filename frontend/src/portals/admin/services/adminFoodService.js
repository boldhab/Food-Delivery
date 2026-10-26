import adminApi from './adminApi';

class AdminFoodService {
    buildPayload(data = {}) {
        const payload = {};

        if (Object.prototype.hasOwnProperty.call(data, 'name')) {
            payload.name = data.name;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'description')) {
            payload.description = data.description;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'price')) {
            payload.price = Number(data.price);
        }
        if (Object.prototype.hasOwnProperty.call(data, 'category')) {
            payload.category = data.category;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'preparationTime')) {
            payload.preparationTime = Number(data.preparationTime);
        }
        if (Object.prototype.hasOwnProperty.call(data, 'isVegetarian')) {
            payload.isVegetarian = Boolean(data.isVegetarian);
        }
        if (Object.prototype.hasOwnProperty.call(data, 'isPopular')) {
            payload.isPopular = Boolean(data.isPopular);
        }
        if (Object.prototype.hasOwnProperty.call(data, 'isAvailable')) {
            payload.isAvailable = Boolean(data.isAvailable);
        } else if (Object.prototype.hasOwnProperty.call(data, 'available')) {
            payload.isAvailable = Boolean(data.available);
        }

        if (typeof data.image === 'string' && data.image) {
            payload.image = data.image;
        }

        return payload;
    }

    toMultipart(data = {}) {
        const payload = this.buildPayload(data);
        const formData = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });

        if (typeof File !== 'undefined' && data.image instanceof File) {
            formData.append('image', data.image);
        }

        return formData;
    }

    async getFoods(params = {}) {
        const response = await adminApi.get('/admin/foods', { params });
        return response.data;
    }

    async getFoodsWithStats(params = {}) {
        return this.getFoods(params);
    }

    async getFoodById(id) {
        const response = await adminApi.get(`/admin/foods/${id}`);
        return response.data;
    }

    async getInventoryAlerts() {
        const response = await adminApi.get('/admin/foods/alerts');
        return response.data;
    }

    async createFood(data) {
        const response = await adminApi.post('/foods', this.toMultipart(data));
        return response.data;
    }

    async updateFood(id, data) {
        const response = await adminApi.put(`/foods/${id}`, this.toMultipart(data));
        return response.data;
    }

    async deleteFood(id) {
        const response = await adminApi.delete(`/admin/foods/${id}`);
        return response.data;
    }

    async toggleAvailability(id) {
        const response = await adminApi.patch(`/foods/${id}/toggle-availability`);
        return response.data;
    }

    async updateFoodAvailability(id, available) {
        if (typeof available === 'boolean') {
            return this.updateFood(id, { isAvailable: available });
        }
        return this.toggleAvailability(id);
    }

    async bulkUpdateFoods(ids = [], updates = {}) {
        const results = await Promise.all(ids.map((id) => this.updateFood(id, updates)));
        return {
            success: true,
            data: results
        };
    }

    async bulkDeleteFoods(ids = []) {
        const results = await Promise.all(ids.map((id) => this.deleteFood(id)));
        return {
            success: true,
            data: results
        };
    }
}

export default new AdminFoodService();
