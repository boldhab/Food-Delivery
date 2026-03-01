import { useState } from 'react';
import { FiCheckCircle, FiPrinter } from 'react-icons/fi';
import adminOrderService from '../../services/adminOrderService';

const ORDER_STATUSES = [
    'pending',
    'confirmed',
    'preparing',
    'out_for_delivery',
    'delivered',
    'cancelled'
];

const OrderStatusUpdate = ({ order, onUpdate, onNotify, onPrint, onViewDetails }) => {
    const [status, setStatus] = useState(order?.orderStatus || 'pending');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!order?._id) return;
        setSaving(true);
        try {
            await adminOrderService.updateOrderStatus(order._id, { status });
            onNotify?.('success', 'Order status updated');
            await onUpdate?.();
        } catch (error) {
            onNotify?.('error', 'Failed to update order status');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1">
                    <p className="text-sm text-slate-500 mb-1">Order Status</p>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full md:w-72 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    >
                        {ORDER_STATUSES.map((item) => (
                            <option key={item} value={item}>
                                {item.replaceAll('_', ' ')}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-3 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
                    >
                        <FiCheckCircle className="w-4 h-4" />
                        <span>{saving ? 'Saving...' : 'Update'}</span>
                    </button>
                    <button
                        onClick={onPrint}
                        className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 flex items-center gap-2"
                    >
                        <FiPrinter className="w-4 h-4" />
                        <span>Print</span>
                    </button>
                    <button
                        onClick={onViewDetails}
                        className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600"
                    >
                        View
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderStatusUpdate;
