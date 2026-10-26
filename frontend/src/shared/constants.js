// Core Shared Constants & Utilities for Food Delivery Ecosystem

const ROLES = Object.freeze({
  USER: 'user',
  ADMIN: 'admin',
  DRIVER: 'driver'
});

const ORDER_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected'
});

const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
});

const PAYMENT_METHODS = Object.freeze({
  COD: 'cash_on_delivery',
  CARD: 'card',
  ONLINE: 'online'
});

const FOOD_CATEGORIES = Object.freeze([
  'Wat & Stews',
  'Tibs & Grills',
  'Kitfo & Specialties',
  'Vegetarian & Fasting',
  'Traditional Breakfast',
  'Beverages & Coffee',
  'Desserts & Sweets'
]);

const formatCurrency = (amount, currency = 'ETB') => {
  const formatted = (Number(amount) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${formatted} ${currency}`;
};

const getStatusBadge = (status) => {
  const map = {
    pending: { label: 'Pending', color: 'yellow', bg: '#fef3c7', text: '#92400e' },
    confirmed: { label: 'Confirmed', color: 'blue', bg: '#dbeafe', text: '#1e40af' },
    preparing: { label: 'Preparing', color: 'indigo', bg: '#e0e7ff', text: '#3730a3' },
    out_for_delivery: { label: 'Out for Delivery', color: 'purple', bg: '#f3e8ff', text: '#6b21a8' },
    delivered: { label: 'Delivered', color: 'green', bg: '#dcfce7', text: '#166534' },
    cancelled: { label: 'Cancelled', color: 'red', bg: '#fee2e2', text: '#991b1b' },
    rejected: { label: 'Rejected', color: 'gray', bg: '#f3f4f6', text: '#374151' }
  };
  return map[status] || { label: status, color: 'gray', bg: '#f3f4f6', text: '#374151' };
};

export {
  ROLES,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  FOOD_CATEGORIES,
  formatCurrency,
  getStatusBadge
};

export default {
  ROLES,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  FOOD_CATEGORIES,
  formatCurrency,
  getStatusBadge
};
