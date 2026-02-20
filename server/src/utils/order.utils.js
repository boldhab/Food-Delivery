/**
 * Order Utility Functions
 * Contains reusable calculations and validations
 */

// Constants
const TAX_RATE = 0.08; // 8% tax
const DELIVERY_FEE = 5; // $5 delivery fee
const FREE_DELIVERY_THRESHOLD = 50; // Free delivery over $50

/**
 * Calculate tax and delivery fee
 * @param {number} subtotal - Order subtotal
 * @returns {Object} Calculated tax, deliveryFee, and total
 */
const calculateOrderTotals = (subtotal) => {
    const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
    const deliveryFee = subtotal > FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const total = parseFloat((subtotal + tax + deliveryFee).toFixed(2));

    return { tax, deliveryFee, total };
};

/**
 * Validate order status transition
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - Requested new status
 * @returns {boolean} Whether transition is valid
 */
const isValidStatusTransition = (currentStatus, newStatus) => {
    const allowedTransitions = {
        'pending': ['confirmed', 'cancelled', 'rejected'],
        'confirmed': ['preparing', 'cancelled', 'rejected'],
        'preparing': ['out_for_delivery', 'cancelled'],
        'out_for_delivery': ['delivered'],
        'delivered': [], // Terminal state
        'cancelled': [], // Terminal state
        'rejected': []   // Terminal state
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) || false;
};

/**
 * Get human-readable status description
 * @param {string} status - Order status
 * @returns {string} Description
 */
const getStatusDescription = (status) => {
    const descriptions = {
        'pending': 'Order placed and waiting for confirmation',
        'confirmed': 'Restaurant has accepted your order',
        'preparing': 'Your food is being prepared',
        'out_for_delivery': 'Your order is on the way',
        'delivered': 'Order has been delivered',
        'cancelled': 'Order was cancelled',
        'rejected': 'Order could not be accepted'
    };
    return descriptions[status] || status;
};

module.exports = {
    calculateOrderTotals,
    isValidStatusTransition,
    getStatusDescription,
    TAX_RATE,
    DELIVERY_FEE,
    FREE_DELIVERY_THRESHOLD
};