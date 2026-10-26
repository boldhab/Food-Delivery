import React from 'react';
import RevenueChart from '../../../components/charts/RevenueChart';
import OrdersChart from '../../../components/charts/OrdersChart';

const DashboardChartsSection = ({
    selectedDateRange,
    selectedMetric = 'revenue',
    setSelectedMetric,
    revenueByDay = [],
    normalizedOrdersByStatus = []
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Revenue Insights Chart */}
            <div className="lg:col-span-2">
                <RevenueChart
                    data={revenueByDay}
                    title="Revenue Insights"
                    subtitle={`${selectedDateRange?.label || 'Selected period'} financial performance`}
                    metrics={selectedMetric ? [selectedMetric] : ['revenue', 'orders']}
                    height={340}
                    showBrush={false}
                    variant="default"
                />
            </div>

            {/* Order Distribution Chart */}
            <div className="lg:col-span-1">
                <OrdersChart
                    data={normalizedOrdersByStatus}
                    title="Order Distribution"
                    subtitle="Fulfillment status breakdown"
                    height={340}
                    nameKey="status"
                    valueKey="count"
                    variant="default"
                />
            </div>
        </div>
    );
};

export default DashboardChartsSection;
