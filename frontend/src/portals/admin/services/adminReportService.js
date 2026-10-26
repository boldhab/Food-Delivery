import adminApi from './adminApi';

class AdminReportService {
    async getDashboardStats() {
        const response = await adminApi.get('/admin/dashboard/stats');
        return response?.data?.data || {};
    }

    async getSalesReport(params = {}) {
        const [salesResponse, stats] = await Promise.all([
            adminApi.get('/admin/dashboard/sales-report', { params }),
            this.getDashboardStats()
        ]);
        const sales = salesResponse?.data?.data || {};

        return {
            kpis: sales.kpis || {
                totalRevenue: Number(sales.salesData?.reduce((sum, d) => sum + (d.revenue || 0), 0) || 0),
                totalOrders: Number(sales.salesData?.reduce((sum, d) => sum + (d.orders || 0), 0) || 0),
                avgOrderValue: 0,
                conversionRate: 0,
                revenueChange: 0,
                ordersChange: 0,
                avgOrderValueChange: 0,
                conversionRateChange: 0
            },
            salesData: Array.isArray(sales.salesData)
                ? sales.salesData.map((entry) => ({
                    date: String(entry?.date ?? entry?._id ?? ''),
                    orders: Number(entry?.orders || 0),
                    revenue: Number(entry?.revenue || 0)
                }))
                : [],
            topSellingItems: Array.isArray(sales.topSellingItems) && sales.topSellingItems.length > 0
                ? sales.topSellingItems.map((item) => ({
                    name: item?.name || 'Unknown',
                    count: Number(item?.count ?? item?.orders ?? item?.quantity ?? 0),
                    orders: Number(item?.orders ?? item?.count ?? item?.quantity ?? 0),
                    revenue: Number(item?.revenue || 0)
                }))
                : Array.isArray(stats?.topSellingFoods)
                    ? stats.topSellingFoods.map((item) => ({
                        name: item?.name || 'Unknown',
                        count: Number(item?.quantity ?? item?.orders ?? 0),
                        orders: Number(item?.quantity ?? item?.orders ?? 0),
                        revenue: Number(item?.revenue || 0)
                    }))
                    : [],
            categoryDistribution: Array.isArray(sales.categoryDistribution) && sales.categoryDistribution.length > 0
                ? sales.categoryDistribution.map((entry) => ({
                    name: entry?.name || entry?._id || 'Uncategorized',
                    count: Number(entry?.count || 0),
                    value: Number(entry?.value ?? entry?.revenue ?? 0)
                }))
                : Array.isArray(sales.categorySales)
                    ? sales.categorySales.map((entry) => ({
                        name: entry?._id || entry?.name || 'Uncategorized',
                        count: Number(entry?.count || 0),
                        value: Number(entry?.revenue ?? entry?.value ?? 0)
                    }))
                    : [],
            hourlyOrders: Array.isArray(sales.hourlyOrders) && sales.hourlyOrders.length > 0
                ? sales.hourlyOrders.map((entry) => ({
                    hour: String(entry?.hour ?? entry?._id ?? ''),
                    orders: Number(entry?.orders || 0)
                }))
                : [],
            paymentMethodDistribution: Array.isArray(sales.paymentMethodDistribution) && sales.paymentMethodDistribution.length > 0
                ? sales.paymentMethodDistribution.map((entry) => ({
                    name: entry?.name || entry?._id || 'Unknown',
                    count: Number(entry?.count || 0),
                    value: Number(entry?.value ?? entry?.count ?? 0)
                }))
                : Array.isArray(stats?.paymentMethods)
                    ? stats.paymentMethods.map((entry) => ({
                        name: entry?._id || entry?.name || 'Unknown',
                        count: Number(entry?.count || 0),
                        value: Number(entry?.count || 0)
                    }))
                    : []
        };
    }

    async getInventoryReport(params = {}) {
        const response = await adminApi.get('/admin/foods/alerts', { params });
        const raw = response?.data?.data;
        const alerts = Array.isArray(raw) ? raw : (raw?.alerts || []);
        const items = Array.isArray(raw?.items) ? raw.items : alerts;
        const summary = raw?.summary || {
            totalMenuItems: items.length,
            activeItems: items.filter((f) => f.isAvailable).length,
            outOfStockCount: items.filter((f) => !f.isAvailable).length,
            lowVelocityCount: alerts.length,
            highDemandCount: items.filter((f) => f.orderCount >= 10).length
        };

        return {
            inventoryAlerts: alerts.map((item) => ({
                id: item?.foodId || item?._id || item?.id,
                item: item?.name || 'Unknown',
                category: item?.category || 'General',
                price: Number(item?.price || 0),
                current: Number(item?.quantity ?? item?.orderCount ?? 0),
                orderCount: Number(item?.orderCount || 0),
                threshold: Number(item?.threshold || 5),
                isAvailable: item?.isAvailable !== false,
                status: item?.status || (item?.isAvailable === false ? 'Out of Stock' : 'Low Velocity')
            })),
            items,
            summary
        };
    }

    async getUserReport(params = {}) {
        void params;
        const stats = await this.getDashboardStats();
        return { ...stats };
    }

    async getDriverReport(params = {}) {
        try {
            const response = await adminApi.get('/admin/dashboard/driver-report', { params });
            const data = response?.data?.data || {};
            if (Array.isArray(data.driverPerformance)) {
                return {
                    fleetSummary: data.fleetSummary || {},
                    driverPerformance: data.driverPerformance
                };
            }
        } catch (err) {
            console.warn('Driver report API error, attempting fallback:', err?.message);
        }

        let drivers = [];
        try {
            const response = await adminApi.get('/admin/drivers/available');
            drivers = response?.data?.data || [];
        } catch {
            const fallback = await adminApi.get('/admin/users', { params: { role: 'driver', limit: 100 } });
            drivers = fallback?.data?.data?.users || [];
        }

        const driverPerformance = Array.isArray(drivers)
            ? drivers.map((d) => {
                const completed = Number(d?.driverProfile?.completedDeliveries || 0);
                const rating = Number(d?.driverProfile?.rating || 5.0);
                return {
                    driverId: d?.id,
                    driver: d?.name || 'Driver',
                    email: d?.email || '',
                    phone: d?.phone || '',
                    vehicleType: d?.driverProfile?.vehicleType || 'Courier',
                    plateNumber: d?.driverProfile?.plateNumber || '',
                    isAvailable: d?.driverProfile?.isAvailable ?? true,
                    deliveries: completed,
                    rating: rating,
                    earnings: completed * 8.5,
                    codCollected: 0
                };
            })
            : [];

        const totalEarnings = driverPerformance.reduce((sum, d) => sum + d.earnings, 0);
        const totalDeliveries = driverPerformance.reduce((sum, d) => sum + d.deliveries, 0);

        return {
            fleetSummary: {
                totalDrivers: driverPerformance.length,
                activeDrivers: driverPerformance.filter((d) => d.isAvailable).length,
                totalDeliveries,
                totalEarnings,
                totalCodCollected: 0,
                avgRating: 5.0
            },
            driverPerformance
        };
    }

    async getFinancialReport(params = {}) {
        try {
            const response = await adminApi.get('/admin/dashboard/financial-report', { params });
            return response?.data?.data || {};
        } catch (err) {
            console.warn('Financial report API error, falling back to stats:', err?.message);
            const stats = await this.getDashboardStats();
            return {
                summary: {
                    gmv: stats?.totalRevenue || 0,
                    foodSubtotal: (stats?.totalRevenue || 0) * 0.85,
                    taxesCollected: (stats?.totalRevenue || 0) * 0.08,
                    deliveryFeesCollected: (stats?.totalRevenue || 0) * 0.07,
                    platformNetRevenue: (stats?.totalRevenue || 0) * 0.15,
                    courierPayouts: (stats?.totalRevenue || 0) * 0.07,
                    cancelledLoss: 0,
                    totalOrders: stats?.totalOrders || 0
                },
                paymentBreakdown: { cardRevenue: 0, codRevenue: 0, cardPercent: 50, codPercent: 50 },
                dailyCashflow: [],
                driverCashBalances: []
            };
        }
    }

    async getSlaReport(params = {}) {
        try {
            const response = await adminApi.get('/admin/dashboard/sla-report', { params });
            return response?.data?.data || {};
        } catch (err) {
            console.warn('SLA report API error:', err?.message);
            return {
                kpis: {
                    totalDelivered: 0,
                    onTimeRate: 95,
                    avgFulfillmentMinutes: 30,
                    avgPrepMinutes: 18,
                    avgTransitMinutes: 12,
                    delayedOrdersCount: 0,
                    targetSlaMinutes: 45
                },
                cycleStages: [
                    { stage: 'Order Processing', minutes: 3, percent: 10 },
                    { stage: 'Kitchen Prep', minutes: 18, percent: 55 },
                    { stage: 'Courier Transit', minutes: 12, percent: 35 }
                ],
                hourlyDelays: [],
                delayedOrders: []
            };
        }
    }

    async updateFoodStock(foodId, data) {
        const response = await adminApi.put(`/admin/foods/${foodId}/stock`, data);
        return response?.data?.data;
    }

    async getAnalyticsReport(params = {}) {
        void params;
        const stats = await this.getDashboardStats();
        return { ...stats };
    }

    async getReportData(type = 'sales', filters = {}) {
        let days = 30;
        if (filters.dateRange === 'today') days = 1;
        else if (filters.dateRange === 'yesterday') days = 2;
        else if (filters.dateRange === 'last7days') days = 7;
        else if (filters.dateRange === 'last30days') days = 30;
        else if (filters.dateRange === 'thisMonth') days = 30;
        else if (filters.dateRange === 'lastMonth') days = 60;
        else if (filters.dateRange === 'custom' && filters.customStart && filters.customEnd) {
            const start = new Date(filters.customStart);
            const end = new Date(filters.customEnd);
            const diffTime = Math.abs(end - start);
            days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        }

        const params = {
            days,
            startDate: filters.dateRange === 'custom' && filters.customStart ? filters.customStart : undefined,
            endDate: filters.dateRange === 'custom' && filters.customEnd ? filters.customEnd : undefined,
            period: 'daily',
            category: filters.category,
            status: filters.status,
            paymentMethod: filters.paymentMethod,
            minAmount: filters.minAmount,
            maxAmount: filters.maxAmount
        };

        switch (type) {
            case 'sales':
                return this.getSalesReport(params);
            case 'inventory':
                return this.getInventoryReport(params);
            case 'drivers':
                return this.getDriverReport(params);
            case 'sla':
                return this.getSlaReport(params);
            case 'financial':
                return this.getFinancialReport(params);
            case 'users':
                return this.getUserReport(params);
            case 'analytics':
                return this.getAnalyticsReport(params);
            default:
                return this.getSalesReport(params);
        }
    }
}

export default new AdminReportService();
