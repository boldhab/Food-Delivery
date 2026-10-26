import React from 'react';
import StatusBadge from '../../../components/common/StatusBadge';

const OrderStatusDistribution = ({ statusDistribution = [] }) => {
    if (!statusDistribution || statusDistribution.length === 0) return null;
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statusDistribution.map((item) => (
                <div
                    key={item.status}
                    className="bg-white dark:bg-slate-800 rounded-xl p-4
                             border border-slate-200 dark:border-slate-700
                             text-center"
                >
                    <StatusBadge status={item.status} type="order" size="sm" />
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                        {item.count}
                    </p>
                    <p className="text-xs text-slate-500">
                        {item.percentage}% of total
                    </p>
                </div>
            ))}
        </div>
    );
};

export default OrderStatusDistribution;
