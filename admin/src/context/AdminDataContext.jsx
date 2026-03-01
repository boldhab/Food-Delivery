/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useCallback, useEffect, useMemo, useReducer } from 'react';
import { toast } from 'react-hot-toast';
import adminOrderService from '../../services/adminOrderService';
import adminFoodService from '../../services/adminFoodService';
import adminUserService from '../../services/adminUserService';
import adminStatsService from '../../services/adminStatsService';

// Types
export interface AdminStats {
    totalOrders: number;
    totalRevenue: number;
    totalUsers: number;
    totalFoods: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    averageOrderValue: number;
    popularItems: Array<{ id: string; name: string; count: number }>;
    revenueByDay: Array<{ date: string; revenue: number }>;
    ordersByStatus: Record<string, number>;
    recentActivity: Array<{
        id: string;
        type: 'order' | 'user' | 'food';
        action: string;
        timestamp: string;
        details: any;
    }>;
}

export interface Order {
    _id: string;
    orderNumber: string;
    customer: {
        _id: string;
        name: string;
        email: string;
        phone: string;
    };
    items: Array<{
        _id: string;
        name: string;
        quantity: number;
        price: number;
        specialInstructions?: string;
    }>;
    subtotal: number;
    deliveryFee: number;
    tax: number;
    totalAmount: number;
    orderStatus: string;
    paymentStatus: string;
    paymentMethod: string;
    deliveryAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        instructions?: string;
    };
    driver?: {
        _id: string;
        name: string;
        phone: string;
    };
    notes?: string;
    createdAt: string;
    updatedAt: string;
    estimatedDeliveryTime?: string;
    statusHistory: Array<{
        status: string;
        timestamp: string;
        note?: string;
        changedBy: string;
    }>;
}

export interface Food {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    cuisine: string;
    image: string;
    images?: string[];
    preparationTime: number;
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    isSpicy: boolean;
    isPopular: boolean;
    isFeatured: boolean;
    discount?: number;
    available: boolean;
    maxQuantity?: number;
    ingredients: string[];
    allergens: string[];
    nutritionalInfo?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
    };
    customizations?: Array<{
        name: string;
        options: Array<{
            name: string;
            price: number;
            available: boolean;
        }>;
        required: boolean;
        multiple: boolean;
    }>;
    tags: string[];
    restaurantId?: string;
    createdAt: string;
    updatedAt: string;
    orderCount: number;
    rating: number;
    totalReviews: number;
}

export interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: 'customer' | 'driver' | 'admin' | 'restaurant_owner';
    avatar?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    preferences?: {
        emailNotifications: boolean;
        pushNotifications: boolean;
        smsNotifications: boolean;
        darkMode: boolean;
        language: string;
    };
    status: 'active' | 'inactive' | 'suspended';
    emailVerified: boolean;
    phoneVerified: boolean;
    lastLogin: string;
    createdAt: string;
    updatedAt: string;
    totalOrders?: number;
    totalSpent?: number;
    favoriteItems?: string[];
    savedAddresses?: Array<{
        label: string;
        address: string;
        isDefault: boolean;
    }>;
}

export interface FilterOptions {
    search?: string;
    status?: string[];
    dateRange?: { start: string; end: string };
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    [key: string]: any;
}

export interface PaginationState {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

export interface CacheState {
    orders: Map<string, { data: Order; timestamp: number }>;
    foods: Map<string, { data: Food; timestamp: number }>;
    users: Map<string, { data: User; timestamp: number }>;
}

// Action types
type Action =
    | { type: 'SET_STATS'; payload: AdminStats }
    | { type: 'UPDATE_STATS'; payload: Partial<AdminStats> }
    | { type: 'SET_ORDERS'; payload: { data: Order[]; pagination: PaginationState } }
    | { type: 'ADD_ORDER'; payload: Order }
    | { type: 'UPDATE_ORDER'; payload: Order }
    | { type: 'REMOVE_ORDER'; payload: string }
    | { type: 'SET_FOODS'; payload: { data: Food[]; pagination: PaginationState } }
    | { type: 'ADD_FOOD'; payload: Food }
    | { type: 'UPDATE_FOOD'; payload: Food }
    | { type: 'REMOVE_FOOD'; payload: string }
    | { type: 'SET_USERS'; payload: { data: User[]; pagination: PaginationState } }
    | { type: 'ADD_USER'; payload: User }
    | { type: 'UPDATE_USER'; payload: User }
    | { type: 'REMOVE_USER'; payload: string }
    | { type: 'SET_LOADING'; payload: { key: string; value: boolean } }
    | { type: 'SET_ERROR'; payload: { key: string; error: string | null } }
    | { type: 'SET_FILTERS'; payload: Partial<FilterOptions> }
    | { type: 'CLEAR_FILTERS' }
    | { type: 'INVALIDATE_CACHE'; payload: { type: 'orders' | 'foods' | 'users' } }
    | { type: 'SET_LAST_UPDATED'; payload: { type: string; timestamp: number } };

// State interface
interface AdminDataState {
    stats: AdminStats | null;
    orders: Order[];
    foods: Food[];
    users: User[];
    loading: Record<string, boolean>;
    errors: Record<string, string | null>;
    filters: FilterOptions;
    pagination: {
        orders: PaginationState;
        foods: PaginationState;
        users: PaginationState;
    };
    cache: CacheState;
    lastUpdated: Record<string, number>;
}

// Initial state
const initialState: AdminDataState = {
    stats: null,
    orders: [],
    foods: [],
    users: [],
    loading: {},
    errors: {},
    filters: {
        page: 1,
        limit: 10,
        sortOrder: 'desc'
    },
    pagination: {
        orders: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 },
        foods: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 },
        users: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 }
    },
    cache: {
        orders: new Map(),
        foods: new Map(),
        users: new Map()
    },
    lastUpdated: {}
};

// Reducer
function adminDataReducer(state: AdminDataState, action: Action): AdminDataState {
    switch (action.type) {
        case 'SET_STATS':
            return { ...state, stats: action.payload };

        case 'UPDATE_STATS':
            return {
                ...state,
                stats: state.stats ? { ...state.stats, ...action.payload } : null
            };

        case 'SET_ORDERS':
            return {
                ...state,
                orders: action.payload.data,
                pagination: {
                    ...state.pagination,
                    orders: action.payload.pagination
                }
            };

        case 'ADD_ORDER':
            return {
                ...state,
                orders: [action.payload, ...state.orders]
            };

        case 'UPDATE_ORDER':
            return {
                ...state,
                orders: state.orders.map(order =>
                    order._id === action.payload._id ? action.payload : order
                )
            };

        case 'REMOVE_ORDER':
            return {
                ...state,
                orders: state.orders.filter(order => order._id !== action.payload)
            };

        case 'SET_FOODS':
            return {
                ...state,
                foods: action.payload.data,
                pagination: {
                    ...state.pagination,
                    foods: action.payload.pagination
                }
            };

        case 'ADD_FOOD':
            return {
                ...state,
                foods: [action.payload, ...state.foods]
            };

        case 'UPDATE_FOOD':
            return {
                ...state,
                foods: state.foods.map(food =>
                    food._id === action.payload._id ? action.payload : food
                )
            };

        case 'REMOVE_FOOD':
            return {
                ...state,
                foods: state.foods.filter(food => food._id !== action.payload)
            };

        case 'SET_USERS':
            return {
                ...state,
                users: action.payload.data,
                pagination: {
                    ...state.pagination,
                    users: action.payload.pagination
                }
            };

        case 'ADD_USER':
            return {
                ...state,
                users: [action.payload, ...state.users]
            };

        case 'UPDATE_USER':
            return {
                ...state,
                users: state.users.map(user =>
                    user._id === action.payload._id ? action.payload : user
                )
            };

        case 'REMOVE_USER':
            return {
                ...state,
                users: state.users.filter(user => user._id !== action.payload)
            };

        case 'SET_LOADING':
            return {
                ...state,
                loading: { ...state.loading, [action.payload.key]: action.payload.value }
            };

        case 'SET_ERROR':
            return {
                ...state,
                errors: { ...state.errors, [action.payload.key]: action.payload.error }
            };

        case 'SET_FILTERS':
            return {
                ...state,
                filters: { ...state.filters, ...action.payload, page: 1 }
            };

        case 'CLEAR_FILTERS':
            return {
                ...state,
                filters: { page: 1, limit: state.filters.limit, sortOrder: 'desc' }
            };

        case 'INVALIDATE_CACHE': {
            const newCache = { ...state.cache };
            newCache[action.payload.type] = new Map();
            return { ...state, cache: newCache };
        }

        case 'SET_LAST_UPDATED':
            return {
                ...state,
                lastUpdated: { ...state.lastUpdated, [action.payload.type]: action.payload.timestamp }
            };

        default:
            return state;
    }
}

// Context interface
interface AdminDataContextType {
    // State
    state: AdminDataState;
    
    // Stats
    fetchStats: (forceRefresh?: boolean) => Promise<AdminStats | null>;
    updateStats: (stats: Partial<AdminStats>) => void;
    
    // Orders
    fetchOrders: (filters?: FilterOptions, forceRefresh?: boolean) => Promise<Order[]>;
    fetchOrderById: (id: string, forceRefresh?: boolean) => Promise<Order | null>;
    createOrder: (orderData: Partial<Order>) => Promise<Order | null>;
    updateOrder: (id: string, orderData: Partial<Order>) => Promise<Order | null>;
    deleteOrder: (id: string) => Promise<boolean>;
    updateOrderStatus: (id: string, status: string, note?: string) => Promise<Order | null>;
    
    // Foods
    fetchFoods: (filters?: FilterOptions, forceRefresh?: boolean) => Promise<Food[]>;
    fetchFoodById: (id: string, forceRefresh?: boolean) => Promise<Food | null>;
    createFood: (foodData: Partial<Food>) => Promise<Food | null>;
    updateFood: (id: string, foodData: Partial<Food>) => Promise<Food | null>;
    deleteFood: (id: string) => Promise<boolean>;
    updateFoodAvailability: (id: string, available: boolean) => Promise<Food | null>;
    
    // Users
    fetchUsers: (filters?: FilterOptions, forceRefresh?: boolean) => Promise<User[]>;
    fetchUserById: (id: string, forceRefresh?: boolean) => Promise<User | null>;
    createUser: (userData: Partial<User>) => Promise<User | null>;
    updateUser: (id: string, userData: Partial<User>) => Promise<User | null>;
    deleteUser: (id: string) => Promise<boolean>;
    updateUserStatus: (id: string, status: string) => Promise<User | null>;
    
    // Filters
    setFilters: (filters: Partial<FilterOptions>) => void;
    clearFilters: () => void;
    
    // Loading states
    isLoading: (key: string) => boolean;
    getError: (key: string) => string | null;
    
    // Pagination
    pagination: PaginationState;
    goToPage: (page: number) => void;
    setPageSize: (size: number) => void;
    
    // Cache management
    invalidateCache: (type: 'orders' | 'foods' | 'users') => void;
    clearAllCache: () => void;
    
    // Batch operations
    bulkUpdateOrders: (ids: string[], updates: Partial<Order>) => Promise<void>;
    bulkDeleteOrders: (ids: string[]) => Promise<void>;
    bulkUpdateFoods: (ids: string[], updates: Partial<Food>) => Promise<void>;
    bulkDeleteFoods: (ids: string[]) => Promise<void>;
    bulkUpdateUsers: (ids: string[], updates: Partial<User>) => Promise<void>;
    bulkDeleteUsers: (ids: string[]) => Promise<void>;
    
    // Export
    exportData: (type: 'orders' | 'foods' | 'users', format: 'csv' | 'excel' | 'pdf') => Promise<void>;
    
    // Real-time updates
    subscribeToUpdates: (callback: (data: any) => void) => () => void;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

// Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const useAdminDataContext = () => {
    const context = useContext(AdminDataContext);
    if (!context) {
        throw new Error('useAdminDataContext must be used within AdminDataProvider');
    }
    return context;
};

export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(adminDataReducer, initialState);
    const [subscribers, setSubscribers] = useState<((data: any) => void)[]>([]);

    // Helper to check cache
    const isCacheValid = useCallback((type: string, id?: string): boolean => {
        const lastUpdated = state.lastUpdated[type];
        if (!lastUpdated) return false;
        return Date.now() - lastUpdated < CACHE_DURATION;
    }, [state.lastUpdated]);

    // Helper to set loading state
    const setLoading = useCallback((key: string, value: boolean) => {
        dispatch({ type: 'SET_LOADING', payload: { key, value } });
    }, []);

    // Helper to set error
    const setError = useCallback((key: string, error: string | null) => {
        dispatch({ type: 'SET_ERROR', payload: { key, error } });
    }, []);

    // Notify subscribers
    const notifySubscribers = useCallback((data: any) => {
        subscribers.forEach(callback => callback(data));
    }, [subscribers]);

    // Stats
    const fetchStats = useCallback(async (forceRefresh = false): Promise<AdminStats | null> => {
        if (!forceRefresh && isCacheValid('stats') && state.stats) {
            return state.stats;
        }

        setLoading('stats', true);
        setError('stats', null);

        try {
            const response = await adminStatsService.getStats();
            dispatch({ type: 'SET_STATS', payload: response.data });
            dispatch({ type: 'SET_LAST_UPDATED', payload: { type: 'stats', timestamp: Date.now() } });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch stats';
            setError('stats', errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setLoading('stats', false);
        }
    }, [state.stats, isCacheValid, setLoading, setError]);

    // Orders
    const fetchOrders = useCallback(async (filters?: FilterOptions, forceRefresh = false): Promise<Order[]> => {
        const cacheKey = 'orders-list';
        if (!forceRefresh && isCacheValid(cacheKey)) {
            return state.orders;
        }

        setLoading('orders', true);
        setError('orders', null);

        try {
            const response = await adminOrderService.getOrders({
                ...state.filters,
                ...filters
            });
            
            dispatch({
                type: 'SET_ORDERS',
                payload: {
                    data: response.data,
                    pagination: response.pagination
                }
            });
            
            dispatch({ type: 'SET_LAST_UPDATED', payload: { type: cacheKey, timestamp: Date.now() } });
            
            // Cache individual orders
            response.data.forEach((order: Order) => {
                state.cache.orders.set(order._id, { data: order, timestamp: Date.now() });
            });
            
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch orders';
            setError('orders', errorMessage);
            toast.error(errorMessage);
            return [];
        } finally {
            setLoading('orders', false);
        }
    }, [state.filters, state.orders, state.cache.orders, isCacheValid, setLoading, setError]);

    const fetchOrderById = useCallback(async (id: string, forceRefresh = false): Promise<Order | null> => {
        // Check cache
        if (!forceRefresh && state.cache.orders.has(id)) {
            const cached = state.cache.orders.get(id);
            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                return cached.data;
            }
        }

        setLoading(`order-${id}`, true);
        setError(`order-${id}`, null);

        try {
            const response = await adminOrderService.getOrderById(id);
            
            // Update cache
            state.cache.orders.set(id, { data: response.data, timestamp: Date.now() });
            
            // Update in orders list if present
            dispatch({ type: 'UPDATE_ORDER', payload: response.data });
            
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch order';
            setError(`order-${id}`, errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setLoading(`order-${id}`, false);
        }
    }, [state.cache.orders, setLoading, setError]);

    const createOrder = useCallback(async (orderData: Partial<Order>): Promise<Order | null> => {
        setLoading('createOrder', true);
        setError('createOrder', null);

        try {
            const response = await adminOrderService.createOrder(orderData);
            dispatch({ type: 'ADD_ORDER', payload: response.data });
            dispatch({ type: 'INVALIDATE_CACHE', payload: { type: 'orders' } });
            toast.success('Order created successfully');
            notifySubscribers({ type: 'order_created', data: response.data });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to create order';
            setError('createOrder', errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setLoading('createOrder', false);
        }
    }, [setLoading, setError, notifySubscribers]);

    const updateOrder = useCallback(async (id: string, orderData: Partial<Order>): Promise<Order | null> => {
        setLoading(`updateOrder-${id}`, true);
        setError(`updateOrder-${id}`, null);

        try {
            const response = await adminOrderService.updateOrder(id, orderData);
            dispatch({ type: 'UPDATE_ORDER', payload: response.data });
            dispatch({ type: 'INVALIDATE_CACHE', payload: { type: 'orders' } });
            toast.success('Order updated successfully');
            notifySubscribers({ type: 'order_updated', data: response.data });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to update order';
            setError(`updateOrder-${id}`, errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setLoading(`updateOrder-${id}`, false);
        }
    }, [setLoading, setError, notifySubscribers]);

    const deleteOrder = useCallback(async (id: string): Promise<boolean> => {
        setLoading(`deleteOrder-${id}`, true);
        setError(`deleteOrder-${id}`, null);

        try {
            await adminOrderService.deleteOrder(id);
            dispatch({ type: 'REMOVE_ORDER', payload: id });
            dispatch({ type: 'INVALIDATE_CACHE', payload: { type: 'orders' } });
            toast.success('Order deleted successfully');
            notifySubscribers({ type: 'order_deleted', data: { id } });
            return true;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to delete order';
            setError(`deleteOrder-${id}`, errorMessage);
            toast.error(errorMessage);
            return false;
        } finally {
            setLoading(`deleteOrder-${id}`, false);
        }
    }, [setLoading, setError, notifySubscribers]);

    const updateOrderStatus = useCallback(async (id: string, status: string, note?: string): Promise<Order | null> => {
        setLoading(`updateStatus-${id}`, true);
        setError(`updateStatus-${id}`, null);

        try {
            const response = await adminOrderService.updateOrderStatus(id, { status, note });
            dispatch({ type: 'UPDATE_ORDER', payload: response.data });
            dispatch({ type: 'INVALIDATE_CACHE', payload: { type: 'orders' } });
            toast.success(`Order status updated to ${status}`);
            notifySubscribers({ type: 'order_status_updated', data: response.data });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to update order status';
            setError(`updateStatus-${id}`, errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setLoading(`updateStatus-${id}`, false);
        }
    }, [setLoading, setError, notifySubscribers]);

    // Foods (similar pattern)
    const fetchFoods = useCallback(async (filters?: FilterOptions, forceRefresh = false): Promise<Food[]> => {
        const cacheKey = 'foods-list';
        if (!forceRefresh && isCacheValid(cacheKey)) {
            return state.foods;
        }

        setLoading('foods', true);
        setError('foods', null);

        try {
            const response = await adminFoodService.getFoods({
                ...state.filters,
                ...filters
            });
            
            dispatch({
                type: 'SET_FOODS',
                payload: {
                    data: response.data,
                    pagination: response.pagination
                }
            });
            
            dispatch({ type: 'SET_LAST_UPDATED', payload: { type: cacheKey, timestamp: Date.now() } });
            
            response.data.forEach((food: Food) => {
                state.cache.foods.set(food._id, { data: food, timestamp: Date.now() });
            });
            
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch foods';
            setError('foods', errorMessage);
            toast.error(errorMessage);
            return [];
        } finally {
            setLoading('foods', false);
        }
    }, [state.filters, state.foods, state.cache.foods, isCacheValid, setLoading, setError]);

    const fetchFoodById = useCallback(async (id: string, forceRefresh = false): Promise<Food | null> => {
        if (!forceRefresh && state.cache.foods.has(id)) {
            const cached = state.cache.foods.get(id);
            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                return cached.data;
            }
        }

        setLoading(`food-${id}`, true);
        setError(`food-${id}`, null);

        try {
            const response = await adminFoodService.getFoodById(id);
            state.cache.foods.set(id, { data: response.data, timestamp: Date.now() });
            dispatch({ type: 'UPDATE_FOOD', payload: response.data });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch food';
            setError(`food-${id}`, errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setLoading(`food-${id}`, false);
        }
    }, [state.cache.foods, setLoading, setError]);

    const createFood = useCallback(async (foodData: Partial<Food>): Promise<Food | null> => {
        setLoading('createFood', true);
        setError('createFood', null);

        try {
            const response = await adminFoodService.createFood(foodData);
            dispatch({ type: 'ADD_FOOD', payload: response.data });
            dispatch({ type: 'INVALIDATE_CACHE', payload: { type: 'foods' } });
            toast.success('Food item created successfully');
            notifySubscribers({ type: 'food_created', data: response.data });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to create food';
            setError('createFood', errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setLoading('createFood', false);
        }
    }, [setLoading, setError, notifySubscribers]);

    const updateFood = useCallback(async (id: string, foodData: Partial<Food>): Promise<Food | null> => {
        setLoading(`updateFood-${id}`, true);
        setError(`updateFood-${id}`, null);

        try {
            const response = await adminFoodService.updateFood(id, foodData);
            dispatch({ type: 'UPDATE_FOOD', payload: response.data });
            dispatch({ type: 'INVALIDATE_CACHE', payload: { type: 'foods' } });
            toast.success('Food item updated successfully');
            notifySubscribers({ type: 'food_updated', data: response.data });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to update food';
            setError(`updateFood-${id}`, errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setLoading(`updateFood-${id}`, false);
        }
    }, [setLoading, setError, notifySubscribers]);

    const deleteFood = useCallback(async (id: string): Promise<boolean> => {
        setLoading(`deleteFood-${id}`, true);
        setError(`deleteFood-${id}`, null);

        try {
            await adminFoodService.deleteFood(id);
            dispatch({ type: 'REMOVE_FOOD', payload: id });
            dispatch({ type: 'INVALIDATE_CACHE', payload: { type: 'foods' } });
            toast.success('Food item deleted successfully');
            notifySubscribers({ type: 'food_deleted', data: { id } });
            return true;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to delete food';
            setError(`deleteFood-${id}`, errorMessage);
            toast.error(errorMessage);
            return false;
        } finally {
            setLoading(`deleteFood-${id}`, false);
        }
    }, [setLoading, setError, notifySubscribers]);

    const updateFoodAvailability = useCallback(async (id: string, available: boolean): Promise<Food | null> => {
        setLoading(`updateAvailability-${id}`, true);
        setError(`updateAvailability-${id}`, null);

        try {
            const response = await adminFoodService.updateFoodAvailability(id, available);
            dispatch({ type: 'UPDATE_FOOD', payload: response.data });
            dispatch({ type: 'INVALIDATE_CACHE', payload: { type: 'foods' } });
            toast.success(`Food marked as ${available ? 'available' : 'unavailable'}`);
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to update availability';
            setError(`updateAvailability-${id}`, errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setLoading(`updateAvailability-${id}`, false);
        }
    }, [setLoading, setError]);

    // Users (similar pattern)
    const fetchUsers = useCallback(async (filters?: FilterOptions, forceRefresh = false): Promise<User[]> => {
        const cacheKey = 'users-list';
        if (!forceRefresh && isCacheValid(cacheKey)) {
            return state.users;
        }

        setLoading('users', true);
        setError('users', null);

        try {
            const response = await adminUserService.getUsers({
                ...state.filters,
                ...filters
            });
            
            dispatch({
                type: 'SET_USERS',
                payload: {
                    data: response.data,
                    pagination: response.pagination
                }
            });
            
            dispatch({ type: 'SET_LAST_UPDATED', payload: { type: cacheKey, timestamp: Date.now() } });
            
            response.data.forEach((user: User) => {
                state.cache.users.set(user._id, { data: user, timestamp: Date.now() });
            });
            
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch users';
            setError('users', errorMessage);
            toast.error(errorMessage);
            return [];
        } finally {
            setLoading('users', false);
        }
    }, [state.filters, state.users, state.cache.users, isCacheValid, setLoading, setError]);

    const fetchUserById = useCallback(async (id: string, forceRefresh = false): Promise<User | null> => {
        if (!forceRefresh && state.cache.users.has(id)) {
            const cached = state.cache.users.get(id);
            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                return cached.data;
            }
        }

        setLoading(`user-${id}`, true);
        setError(`user-${id}`, null);

        try {
            const response = await adminUserService.getUserById(id);
            state.cache.users.set(id, { data: response.data, timestamp: Date.now() });
            dispatch({ type: 'UPDATE_USER', payload: response.data });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch user';
            setError(`user-${id}`, errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setLoading(`user-${id}`, false);
        }
    }, [state.cache.users, setLoading, setError]);

    const createUser = useCallback(async (userData: Partial<User>): Promise<User | null> => {
        setLoading('createUser', true);
        setError('createUser', null);

        try {
            const response = await adminUserService.createUser(userData);
            dispatch({ type: 'ADD_USER', payload: response.data });
            dispatch({ type: 'INVALIDATE_CACHE', payload: { type: 'users' } });
            toast.success('User created successfully');
            notifySubscribers({ type: 'user_created', data: response.data });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to create user';
            setError('createUser', errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setLoading('createUser', false);
        }
    }, [setLoading, setError, notifySubscribers]);

    const updateUser = useCallback(async (id: string, userData: Partial<User>): Promise<User | null> => {
        setLoading(`updateUser-${id}`, true);
        setError(`updateUser-${id}`, null);

        try {
            const response = await adminUserService.updateUser(id, userData);
            dispatch({ type: 'UPDATE_USER', payload: response.data });
            dispatch({ type: 'INVALIDATE_CACHE', payload: { type: 'users' } });
            toast.success('User updated successfully');
            notifySubscribers({ type: 'user_updated', data: response.data });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to update user';
            setError(`updateUser-${id}`, errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setLoading(`updateUser-${id}`, false);
        }
    }, [setLoading, setError, notifySubscribers]);

    const deleteUser = useCallback(async (id: string): Promise<boolean> => {
        setLoading(`deleteUser-${id}`, true);
        setError(`deleteUser-${id}`, null);

        try {
            await adminUserService.deleteUser(id);
            dispatch({ type: 'REMOVE_USER', payload: id });
            dispatch({ type: 'INVALIDATE_CACHE', payload: { type: 'users' } });
            toast.success('User deleted successfully');
            notifySubscribers({ type: 'user_deleted', data: { id } });
            return true;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to delete user';
            setError(`deleteUser-${id}`, errorMessage);
            toast.error(errorMessage);
            return false;
        } finally {
            setLoading(`deleteUser-${id}`, false);
        }
    }, [setLoading, setError, notifySubscribers]);

    const updateUserStatus = useCallback(async (id: string, status: string): Promise<User | null> => {
        setLoading(`updateUserStatus-${id}`, true);
        setError(`updateUserStatus-${id}`, null);

        try {
            const response = await adminUserService.updateUserStatus(id, status);
            dispatch({ type: 'UPDATE_USER', payload: response.data });
            dispatch({ type: 'INVALIDATE_CACHE', payload: { type: 'users' } });
            toast.success(`User status updated to ${status}`);
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to update user status';
            setError(`updateUserStatus-${id}`, errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setLoading(`updateUserStatus-${id}`, false);
        }
    }, [setLoading, setError]);

    // Filters
    const setFilters = useCallback((newFilters: Partial<FilterOptions>) => {
        dispatch({ type: 'SET_FILTERS', payload: newFilters });
    }, []);

    const clearFilters = useCallback(() => {
        dispatch({ type: 'CLEAR_FILTERS' });
    }, []);

    // Loading state helper
    const isLoading = useCallback((key: string): boolean => {
        return !!state.loading[key];
    }, [state.loading]);

    const getError = useCallback((key: string): string | null => {
        return state.errors[key] || null;
    }, [state.errors]);

    // Pagination
    const goToPage = useCallback((page: number) => {
        dispatch({ type: 'SET_FILTERS', payload: { page } });
    }, []);

    const setPageSize = useCallback((size: number) => {
        dispatch({ type: 'SET_FILTERS', payload: { limit: size, page: 1 } });
    }, []);

    // Cache management
    const invalidateCache = useCallback((type: 'orders' | 'foods' | 'users') => {
        dispatch({ type: 'INVALIDATE_CACHE', payload: { type } });
    }, []);

    const clearAllCache = useCallback(() => {
        dispatch({ type: 'INVALIDATE_CACHE', payload: { type: 'orders' } });
        dispatch({ type: 'INVALIDATE_CACHE', payload: { type: 'foods' } });
        dispatch({ type: 'INVALIDATE_CACHE', payload: { type: 'users' } });
    }, []);

    // Batch operations
    const bulkUpdateOrders = useCallback(async (ids: string[], updates: Partial<Order>) => {
        setLoading('bulkUpdateOrders', true);
        try {
            await adminOrderService.bulkUpdateOrders(ids, updates);
            await fetchOrders(state.filters, true);
            toast.success(`${ids.length} orders updated successfully`);
        } catch (error: any) {
            toast.error('Failed to update orders');
        } finally {
            setLoading('bulkUpdateOrders', false);
        }
    }, [state.filters, fetchOrders]);

    const bulkDeleteOrders = useCallback(async (ids: string[]) => {
        setLoading('bulkDeleteOrders', true);
        try {
            await adminOrderService.bulkDeleteOrders(ids);
            await fetchOrders(state.filters, true);
            toast.success(`${ids.length} orders deleted successfully`);
        } catch (error: any) {
            toast.error('Failed to delete orders');
        } finally {
            setLoading('bulkDeleteOrders', false);
        }
    }, [state.filters, fetchOrders]);

    const bulkUpdateFoods = useCallback(async (ids: string[], updates: Partial<Food>) => {
        setLoading('bulkUpdateFoods', true);
        try {
            await adminFoodService.bulkUpdateFoods(ids, updates);
            await fetchFoods(state.filters, true);
            toast.success(`${ids.length} food items updated successfully`);
        } catch (error: any) {
            toast.error('Failed to update food items');
        } finally {
            setLoading('bulkUpdateFoods', false);
        }
    }, [state.filters, fetchFoods]);

    const bulkDeleteFoods = useCallback(async (ids: string[]) => {
        setLoading('bulkDeleteFoods', true);
        try {
            await adminFoodService.bulkDeleteFoods(ids);
            await fetchFoods(state.filters, true);
            toast.success(`${ids.length} food items deleted successfully`);
        } catch (error: any) {
            toast.error('Failed to delete food items');
        } finally {
            setLoading('bulkDeleteFoods', false);
        }
    }, [state.filters, fetchFoods]);

    const bulkUpdateUsers = useCallback(async (ids: string[], updates: Partial<User>) => {
        setLoading('bulkUpdateUsers', true);
        try {
            await adminUserService.bulkUpdateUsers(ids, updates);
            await fetchUsers(state.filters, true);
            toast.success(`${ids.length} users updated successfully`);
        } catch (error: any) {
            toast.error('Failed to update users');
        } finally {
            setLoading('bulkUpdateUsers', false);
        }
    }, [state.filters, fetchUsers]);

    const bulkDeleteUsers = useCallback(async (ids: string[]) => {
        setLoading('bulkDeleteUsers', true);
        try {
            await adminUserService.bulkDeleteUsers(ids);
            await fetchUsers(state.filters, true);
            toast.success(`${ids.length} users deleted successfully`);
        } catch (error: any) {
            toast.error('Failed to delete users');
        } finally {
            setLoading('bulkDeleteUsers', false);
        }
    }, [state.filters, fetchUsers]);

    // Export data
    const exportData = useCallback(async (type: 'orders' | 'foods' | 'users', format: 'csv' | 'excel' | 'pdf') => {
        setLoading(`export-${type}`, true);
        try {
            const blob = await adminStatsService.exportData(type, format);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}-${new Date().toISOString()}.${format}`;
            a.click();
            toast.success(`Data exported as ${format.toUpperCase()}`);
        } catch (error: any) {
            toast.error(`Failed to export ${type}`);
        } finally {
            setLoading(`export-${type}`, false);
        }
    }, [setLoading]);

    // Real-time updates
    const subscribeToUpdates = useCallback((callback: (data: any) => void) => {
        setSubscribers(prev => [...prev, callback]);
        return () => {
            setSubscribers(prev => prev.filter(cb => cb !== callback));
        };
    }, []);

    // Setup WebSocket connection for real-time updates
    useEffect(() => {
        // Connect to WebSocket for real-time updates
        const ws = new WebSocket(process.env.REACT_APP_WS_URL || 'ws://localhost:3001');

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            notifySubscribers(data);
            
            // Handle different types of updates
            switch (data.type) {
                case 'order_created':
                case 'order_updated':
                case 'order_deleted':
                    dispatch({ type: 'INVALIDATE_CACHE', payload: { type: 'orders' } });
                    break;
                case 'food_created':
                case 'food_updated':
                case 'food_deleted':
                    dispatch({ type: 'INVALIDATE_CACHE', payload: { type: 'foods' } });
                    break;
                case 'user_created':
                case 'user_updated':
                case 'user_deleted':
                    dispatch({ type: 'INVALIDATE_CACHE', payload: { type: 'users' } });
                    break;
                default:
                    break;
            }
        };

        return () => {
            ws.close();
        };
    }, [notifySubscribers]);

    // Auto-refresh stats periodically
    useEffect(() => {
        const interval = setInterval(() => {
            fetchStats(true);
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, [fetchStats]);

    const value = useMemo(() => ({
        state,
        fetchStats,
        updateStats: (stats: Partial<AdminStats>) => dispatch({ type: 'UPDATE_STATS', payload: stats }),
        
        // Orders
        fetchOrders,
        fetchOrderById,
        createOrder,
        updateOrder,
        deleteOrder,
        updateOrderStatus,
        
        // Foods
        fetchFoods,
        fetchFoodById,
        createFood,
        updateFood,
        deleteFood,
        updateFoodAvailability,
        
        // Users
        fetchUsers,
        fetchUserById,
        createUser,
        updateUser,
        deleteUser,
        updateUserStatus,
        
        // Filters
        setFilters,
        clearFilters,
        
        // Loading states
        isLoading,
        getError,
        
        // Pagination
        pagination: state.pagination.orders,
        goToPage,
        setPageSize,
        
        // Cache
        invalidateCache,
        clearAllCache,
        
        // Batch operations
        bulkUpdateOrders,
        bulkDeleteOrders,
        bulkUpdateFoods,
        bulkDeleteFoods,
        bulkUpdateUsers,
        bulkDeleteUsers,
        
        // Export
        exportData,
        
        // Real-time updates
        subscribeToUpdates
    }), [
        state,
        fetchStats,
        fetchOrders,
        fetchOrderById,
        createOrder,
        updateOrder,
        deleteOrder,
        updateOrderStatus,
        fetchFoods,
        fetchFoodById,
        createFood,
        updateFood,
        deleteFood,
        updateFoodAvailability,
        fetchUsers,
        fetchUserById,
        createUser,
        updateUser,
        deleteUser,
        updateUserStatus,
        setFilters,
        clearFilters,
        isLoading,
        getError,
        goToPage,
        setPageSize,
        invalidateCache,
        clearAllCache,
        bulkUpdateOrders,
        bulkDeleteOrders,
        bulkUpdateFoods,
        bulkDeleteFoods,
        bulkUpdateUsers,
        bulkDeleteUsers,
        exportData,
        subscribeToUpdates
    ]);

    return (
        <AdminDataContext.Provider value={value}>
            {children}
        </AdminDataContext.Provider>
    );
};

export default AdminDataContext;