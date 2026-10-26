import { useState, useCallback, useEffect, useMemo, useReducer } from "react";
import { toast } from "react-hot-toast";
import adminOrderService from "../services/adminOrderService";
import adminFoodService from "../services/adminFoodService";
import adminUserService from "../services/adminUserService";
import adminStatsService from "../services/adminStatsService";
import { exportReport } from "../utils/reportExport";
import { getSocket } from "../../../shared/socket";
import { AdminDataContext, useAdminDataContext } from "./adminDataContextCore";
const initialState = {
  stats: null,
  orders: [],
  foods: [],
  users: [],
  loading: {},
  errors: {},
  filters: {
    page: 1,
    limit: 10,
    sortOrder: "desc"
  },
  pagination: {
    orders: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 },
    foods: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 },
    users: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 }
  },
  cache: {
    orders: /* @__PURE__ */ new Map(),
    foods: /* @__PURE__ */ new Map(),
    users: /* @__PURE__ */ new Map()
  },
  lastUpdated: {}
};
const normalizePaginationPayload = (pagination, fallback) => {
  const source = pagination || {};
  const base = fallback || {};
  return {
    currentPage: Number(source.currentPage ?? source.page ?? base.currentPage ?? 1),
    totalPages: Number(source.totalPages ?? source.pages ?? base.totalPages ?? 1),
    totalItems: Number(source.totalItems ?? source.total ?? base.totalItems ?? 0),
    itemsPerPage: Number(source.itemsPerPage ?? source.limit ?? base.itemsPerPage ?? 10)
  };
};
function adminDataReducer(state, action) {
  switch (action.type) {
    case "SET_STATS":
      return { ...state, stats: action.payload };
    case "UPDATE_STATS":
      return {
        ...state,
        stats: state.stats ? { ...state.stats, ...action.payload } : null
      };
    case "SET_ORDERS":
      return {
        ...state,
        orders: Array.isArray(action.payload.data) ? action.payload.data : [],
        pagination: {
          ...state.pagination,
          orders: normalizePaginationPayload(action.payload.pagination, state.pagination.orders)
        }
      };
    case "ADD_ORDER":
      return {
        ...state,
        orders: [action.payload, ...state.orders]
      };
    case "UPDATE_ORDER":
      return {
        ...state,
        orders: state.orders.map(
          (order) => order._id === action.payload._id ? action.payload : order
        )
      };
    case "REMOVE_ORDER":
      return {
        ...state,
        orders: state.orders.filter((order) => order._id !== action.payload)
      };
    case "SET_FOODS":
      return {
        ...state,
        foods: Array.isArray(action.payload.data) ? action.payload.data : [],
        pagination: {
          ...state.pagination,
          foods: normalizePaginationPayload(action.payload.pagination, state.pagination.foods)
        }
      };
    case "ADD_FOOD":
      return {
        ...state,
        foods: [action.payload, ...state.foods]
      };
    case "UPDATE_FOOD": {
      const payloadId = action.payload?._id || action.payload?.id;
      return {
        ...state,
        foods: state.foods.map((food) => {
          const foodId = food._id || food.id;
          if (foodId === payloadId) {
            const isAvail = action.payload.isAvailable ?? action.payload.available ?? food.available ?? food.isAvailable;
            return {
              ...food,
              ...action.payload,
              _id: food._id || action.payload._id || action.payload.id,
              id: food.id || action.payload.id || action.payload._id,
              available: isAvail,
              isAvailable: isAvail
            };
          }
          return food;
        })
      };
    }
    case "REMOVE_FOOD":
      return {
        ...state,
        foods: state.foods.filter((food) => food._id !== action.payload)
      };
    case "SET_USERS":
      return {
        ...state,
        users: Array.isArray(action.payload.data) ? action.payload.data : [],
        pagination: {
          ...state.pagination,
          users: normalizePaginationPayload(action.payload.pagination, state.pagination.users)
        }
      };
    case "ADD_USER":
      return {
        ...state,
        users: [action.payload, ...state.users]
      };
    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map(
          (user) => user._id === action.payload._id ? action.payload : user
        )
      };
    case "REMOVE_USER":
      return {
        ...state,
        users: state.users.filter((user) => user._id !== action.payload)
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value }
      };
    case "SET_ERROR":
      return {
        ...state,
        errors: { ...state.errors, [action.payload.key]: action.payload.error }
      };
    case "SET_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload, page: 1 }
      };
    case "SET_ENTITY_PAGINATION":
      return {
        ...state,
        pagination: {
          ...state.pagination,
          [action.payload.type]: {
            ...state.pagination[action.payload.type],
            ...action.payload.pagination
          }
        }
      };
    case "CLEAR_FILTERS":
      return {
        ...state,
        filters: { page: 1, limit: state.filters.limit, sortOrder: "desc" }
      };
    case "INVALIDATE_CACHE": {
      const newCache = { ...state.cache };
      newCache[action.payload.type] = /* @__PURE__ */ new Map();
      return { ...state, cache: newCache };
    }
    case "SET_LAST_UPDATED":
      return {
        ...state,
        lastUpdated: { ...state.lastUpdated, [action.payload.type]: action.payload.timestamp }
      };
    default:
      return state;
  }
}
const CACHE_DURATION = 5 * 60 * 1e3;
const AdminDataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(adminDataReducer, initialState);
  const [subscribers, setSubscribers] = useState([]);
  const isCacheValid = useCallback((type) => {
    const lastUpdated = state.lastUpdated[type];
    if (!lastUpdated) return false;
    return Date.now() - lastUpdated < CACHE_DURATION;
  }, [state.lastUpdated]);
  const setLoading = useCallback((key, value2) => {
    dispatch({ type: "SET_LOADING", payload: { key, value: value2 } });
  }, []);
  const setError = useCallback((key, error) => {
    dispatch({ type: "SET_ERROR", payload: { key, error } });
  }, []);
  const notifySubscribers = useCallback((data) => {
    subscribers.forEach((callback) => callback(data));
  }, [subscribers]);
  const fetchStats = useCallback(async (filters = {}, forceRefresh = false) => {
    const hasFilters = filters && Object.keys(filters).length > 0;
    if (!forceRefresh && !hasFilters && isCacheValid("stats") && state.stats) {
      return state.stats;
    }
    setLoading("stats", true);
    setError("stats", null);
    try {
      const response = await adminStatsService.getStats(filters);
      dispatch({ type: "SET_STATS", payload: response.data });
      dispatch({ type: "SET_LAST_UPDATED", payload: { type: "stats", timestamp: Date.now() } });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch stats";
      setError("stats", errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading("stats", false);
    }
  }, [state.stats, isCacheValid, setLoading, setError]);
  const fetchOrders = useCallback(async (filters, forceRefresh = false) => {
    const cacheKey = "orders-list";
    if (!forceRefresh && isCacheValid(cacheKey)) {
      return state.orders;
    }
    setLoading("orders", true);
    setError("orders", null);
    try {
      const response = await adminOrderService.getOrders({
        ...state.filters,
        ...filters
      });
      const orders =
        Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : Array.isArray(response?.orders) ? response.orders : Array.isArray(response?.data?.orders) ? response.data.orders : [];
      const pagination =
        response?.pagination || response?.data?.pagination || state.pagination.orders;
      dispatch({
        type: "SET_ORDERS",
        payload: {
          data: orders,
          pagination
        }
      });
      dispatch({ type: "SET_LAST_UPDATED", payload: { type: cacheKey, timestamp: Date.now() } });
      orders.forEach((order) => {
        state.cache.orders.set(order._id, { data: order, timestamp: Date.now() });
      });
      return orders;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch orders";
      setError("orders", errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setLoading("orders", false);
    }
  }, [state.filters, state.orders, state.cache.orders, state.pagination.orders, isCacheValid, setLoading, setError]);
  const fetchOrderById = useCallback(async (id, forceRefresh = false) => {
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
      state.cache.orders.set(id, { data: response.data, timestamp: Date.now() });
      dispatch({ type: "UPDATE_ORDER", payload: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch order";
      setError(`order-${id}`, errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(`order-${id}`, false);
    }
  }, [state.cache.orders, setLoading, setError]);
  const createOrder = useCallback(async (orderData) => {
    setLoading("createOrder", true);
    setError("createOrder", null);
    try {
      const response = await adminOrderService.createOrder(orderData);
      dispatch({ type: "ADD_ORDER", payload: response.data });
      dispatch({ type: "INVALIDATE_CACHE", payload: { type: "orders" } });
      toast.success("Order created successfully");
      notifySubscribers({ type: "order_created", data: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to create order";
      setError("createOrder", errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading("createOrder", false);
    }
  }, [setLoading, setError, notifySubscribers]);
  const updateOrder = useCallback(async (id, orderData) => {
    setLoading(`updateOrder-${id}`, true);
    setError(`updateOrder-${id}`, null);
    try {
      const response = await adminOrderService.updateOrder(id, orderData);
      dispatch({ type: "UPDATE_ORDER", payload: response.data });
      dispatch({ type: "INVALIDATE_CACHE", payload: { type: "orders" } });
      toast.success("Order updated successfully");
      notifySubscribers({ type: "order_updated", data: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update order";
      setError(`updateOrder-${id}`, errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(`updateOrder-${id}`, false);
    }
  }, [setLoading, setError, notifySubscribers]);
  const deleteOrder = useCallback(async (id) => {
    setLoading(`deleteOrder-${id}`, true);
    setError(`deleteOrder-${id}`, null);
    try {
      await adminOrderService.deleteOrder(id);
      dispatch({ type: "REMOVE_ORDER", payload: id });
      dispatch({ type: "INVALIDATE_CACHE", payload: { type: "orders" } });
      toast.success("Order deleted successfully");
      notifySubscribers({ type: "order_deleted", data: { id } });
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to delete order";
      setError(`deleteOrder-${id}`, errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(`deleteOrder-${id}`, false);
    }
  }, [setLoading, setError, notifySubscribers]);
  const updateOrderStatus = useCallback(async (id, status, note) => {
    setLoading(`updateStatus-${id}`, true);
    setError(`updateStatus-${id}`, null);
    try {
      const response = await adminOrderService.updateOrderStatus(id, { status, note });
      dispatch({ type: "UPDATE_ORDER", payload: response.data });
      dispatch({ type: "INVALIDATE_CACHE", payload: { type: "orders" } });
      toast.success(`Order status updated to ${status}`);
      notifySubscribers({ type: "order_status_updated", data: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update order status";
      setError(`updateStatus-${id}`, errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(`updateStatus-${id}`, false);
    }
  }, [setLoading, setError, notifySubscribers]);
  const fetchFoods = useCallback(async (filters, forceRefresh = false) => {
    const cacheKey = "foods-list";
    if (!forceRefresh && isCacheValid(cacheKey)) {
      return state.foods;
    }
    setLoading("foods", true);
    setError("foods", null);
    try {
      const response = await adminFoodService.getFoods({
        ...state.filters,
        ...filters
      });
      const foods =
        Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : Array.isArray(response?.foods) ? response.foods : Array.isArray(response?.data?.foods) ? response.data.foods : [];
      const pagination =
        response?.pagination || response?.data?.pagination || state.pagination.foods;
      dispatch({
        type: "SET_FOODS",
        payload: {
          data: foods,
          pagination
        }
      });
      dispatch({ type: "SET_LAST_UPDATED", payload: { type: cacheKey, timestamp: Date.now() } });
      foods.forEach((food) => {
        state.cache.foods.set(food._id, { data: food, timestamp: Date.now() });
      });
      return foods;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch foods";
      setError("foods", errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setLoading("foods", false);
    }
  }, [state.filters, state.foods, state.cache.foods, state.pagination.foods, isCacheValid, setLoading, setError]);
  const fetchFoodById = useCallback(async (id, forceRefresh = false) => {
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
      dispatch({ type: "UPDATE_FOOD", payload: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch food";
      setError(`food-${id}`, errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(`food-${id}`, false);
    }
  }, [state.cache.foods, setLoading, setError]);
  const createFood = useCallback(async (foodData) => {
    setLoading("createFood", true);
    setError("createFood", null);
    try {
      const response = await adminFoodService.createFood(foodData);
      dispatch({ type: "ADD_FOOD", payload: response.data });
      dispatch({ type: "INVALIDATE_CACHE", payload: { type: "foods" } });
      toast.success("Food item created successfully");
      notifySubscribers({ type: "food_created", data: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to create food";
      setError("createFood", errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading("createFood", false);
    }
  }, [setLoading, setError, notifySubscribers]);
  const updateFood = useCallback(async (id, foodData) => {
    setLoading(`updateFood-${id}`, true);
    setError(`updateFood-${id}`, null);
    try {
      const response = await adminFoodService.updateFood(id, foodData);
      dispatch({ type: "UPDATE_FOOD", payload: response.data });
      dispatch({ type: "INVALIDATE_CACHE", payload: { type: "foods" } });
      toast.success("Food item updated successfully");
      notifySubscribers({ type: "food_updated", data: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update food";
      setError(`updateFood-${id}`, errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(`updateFood-${id}`, false);
    }
  }, [setLoading, setError, notifySubscribers]);
  const deleteFood = useCallback(async (id) => {
    setLoading(`deleteFood-${id}`, true);
    setError(`deleteFood-${id}`, null);
    try {
      await adminFoodService.deleteFood(id);
      dispatch({ type: "REMOVE_FOOD", payload: id });
      dispatch({ type: "INVALIDATE_CACHE", payload: { type: "foods" } });
      toast.success("Food item deleted successfully");
      notifySubscribers({ type: "food_deleted", data: { id } });
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to delete food";
      setError(`deleteFood-${id}`, errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(`deleteFood-${id}`, false);
    }
  }, [setLoading, setError, notifySubscribers]);
  const updateFoodAvailability = useCallback(async (id, available) => {
    setLoading(`updateAvailability-${id}`, true);
    setError(`updateAvailability-${id}`, null);
    try {
      const response = await adminFoodService.updateFoodAvailability(id, available);
      dispatch({ type: "UPDATE_FOOD", payload: response.data });
      dispatch({ type: "INVALIDATE_CACHE", payload: { type: "foods" } });
      toast.success(`Food marked as ${available ? "available" : "unavailable"}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update availability";
      setError(`updateAvailability-${id}`, errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(`updateAvailability-${id}`, false);
    }
  }, [setLoading, setError]);
  const fetchUsers = useCallback(async (filters, forceRefresh = false) => {
    const cacheKey = "users-list";
    if (!forceRefresh && isCacheValid(cacheKey)) {
      return state.users;
    }
    setLoading("users", true);
    setError("users", null);
    try {
      const response = await adminUserService.getUsers({
        ...state.filters,
        ...filters
      });
      const users =
        Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : Array.isArray(response?.users) ? response.users : Array.isArray(response?.data?.users) ? response.data.users : [];
      const pagination =
        response?.pagination || response?.data?.pagination || state.pagination.users;
      dispatch({
        type: "SET_USERS",
        payload: {
          data: users,
          pagination
        }
      });
      dispatch({ type: "SET_LAST_UPDATED", payload: { type: cacheKey, timestamp: Date.now() } });
      users.forEach((user) => {
        state.cache.users.set(user._id, { data: user, timestamp: Date.now() });
      });
      return users;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch users";
      setError("users", errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setLoading("users", false);
    }
  }, [state.filters, state.users, state.cache.users, state.pagination.users, isCacheValid, setLoading, setError]);
  const fetchUserById = useCallback(async (id, forceRefresh = false) => {
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
      dispatch({ type: "UPDATE_USER", payload: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch user";
      setError(`user-${id}`, errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(`user-${id}`, false);
    }
  }, [state.cache.users, setLoading, setError]);
  const createUser = useCallback(async (userData) => {
    setLoading("createUser", true);
    setError("createUser", null);
    try {
      const response = await adminUserService.createUser(userData);
      dispatch({ type: "ADD_USER", payload: response.data });
      dispatch({ type: "INVALIDATE_CACHE", payload: { type: "users" } });
      toast.success("User created successfully");
      notifySubscribers({ type: "user_created", data: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to create user";
      setError("createUser", errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading("createUser", false);
    }
  }, [setLoading, setError, notifySubscribers]);
  const updateUser = useCallback(async (id, userData) => {
    setLoading(`updateUser-${id}`, true);
    setError(`updateUser-${id}`, null);
    try {
      const response = await adminUserService.updateUser(id, userData);
      dispatch({ type: "UPDATE_USER", payload: response.data });
      dispatch({ type: "INVALIDATE_CACHE", payload: { type: "users" } });
      toast.success("User updated successfully");
      notifySubscribers({ type: "user_updated", data: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update user";
      setError(`updateUser-${id}`, errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(`updateUser-${id}`, false);
    }
  }, [setLoading, setError, notifySubscribers]);
  const deleteUser = useCallback(async (id) => {
    setLoading(`deleteUser-${id}`, true);
    setError(`deleteUser-${id}`, null);
    try {
      await adminUserService.deleteUser(id);
      dispatch({ type: "REMOVE_USER", payload: id });
      dispatch({ type: "INVALIDATE_CACHE", payload: { type: "users" } });
      toast.success("User deleted successfully");
      notifySubscribers({ type: "user_deleted", data: { id } });
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to delete user";
      setError(`deleteUser-${id}`, errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(`deleteUser-${id}`, false);
    }
  }, [setLoading, setError, notifySubscribers]);
  const updateUserStatus = useCallback(async (id, status) => {
    setLoading(`updateUserStatus-${id}`, true);
    setError(`updateUserStatus-${id}`, null);
    try {
      const response = await adminUserService.updateUserStatus(id, status);
      dispatch({ type: "UPDATE_USER", payload: response.data });
      dispatch({ type: "INVALIDATE_CACHE", payload: { type: "users" } });
      toast.success(`User status updated to ${status}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update user status";
      setError(`updateUserStatus-${id}`, errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(`updateUserStatus-${id}`, false);
    }
  }, [setLoading, setError]);
  const setFilters = useCallback((newFilters) => {
    dispatch({ type: "SET_FILTERS", payload: newFilters });
  }, []);
  const clearFilters = useCallback(() => {
    dispatch({ type: "CLEAR_FILTERS" });
  }, []);
  const isLoading = useCallback((key) => {
    return !!state.loading[key];
  }, [state.loading]);
  const getError = useCallback((key) => {
    return state.errors[key] || null;
  }, [state.errors]);
  const goToPage = useCallback((arg1, arg2) => {
    if (typeof arg1 === "string" && arg2 !== undefined) {
      const type = arg1;
      const page = Number(arg2);
      dispatch({
        type: "SET_ENTITY_PAGINATION",
        payload: { type, pagination: { currentPage: page } }
      });
      dispatch({ type: "SET_FILTERS", payload: { page } });
    } else {
      const page = Number(arg1);
      dispatch({ type: "SET_FILTERS", payload: { page } });
      dispatch({
        type: "SET_ENTITY_PAGINATION",
        payload: { type: "orders", pagination: { currentPage: page } }
      });
    }
  }, []);
  const setPageSize = useCallback((arg1, arg2) => {
    if (typeof arg1 === "string" && arg2 !== undefined) {
      const type = arg1;
      const size = Number(arg2);
      dispatch({
        type: "SET_ENTITY_PAGINATION",
        payload: { type, pagination: { itemsPerPage: size, currentPage: 1 } }
      });
      dispatch({ type: "SET_FILTERS", payload: { limit: size, page: 1 } });
    } else {
      const size = Number(arg1);
      dispatch({ type: "SET_FILTERS", payload: { limit: size, page: 1 } });
      dispatch({
        type: "SET_ENTITY_PAGINATION",
        payload: { type: "orders", pagination: { itemsPerPage: size, currentPage: 1 } }
      });
    }
  }, []);
  const invalidateCache = useCallback((type) => {
    dispatch({ type: "INVALIDATE_CACHE", payload: { type } });
  }, []);
  const clearAllCache = useCallback(() => {
    dispatch({ type: "INVALIDATE_CACHE", payload: { type: "orders" } });
    dispatch({ type: "INVALIDATE_CACHE", payload: { type: "foods" } });
    dispatch({ type: "INVALIDATE_CACHE", payload: { type: "users" } });
  }, []);
  const bulkUpdateOrders = useCallback(async (ids, updates) => {
    setLoading("bulkUpdateOrders", true);
    try {
      await adminOrderService.bulkUpdateOrders(ids, updates);
      await fetchOrders(state.filters, true);
      toast.success(`${ids.length} orders updated successfully`);
    } catch {
      toast.error("Failed to update orders");
    } finally {
      setLoading("bulkUpdateOrders", false);
    }
  }, [state.filters, fetchOrders, setLoading]);
  const bulkDeleteOrders = useCallback(async (ids) => {
    setLoading("bulkDeleteOrders", true);
    try {
      await adminOrderService.bulkDeleteOrders(ids);
      await fetchOrders(state.filters, true);
      toast.success(`${ids.length} orders deleted successfully`);
    } catch {
      toast.error("Failed to delete orders");
    } finally {
      setLoading("bulkDeleteOrders", false);
    }
  }, [state.filters, fetchOrders, setLoading]);
  const bulkUpdateFoods = useCallback(async (ids, updates) => {
    setLoading("bulkUpdateFoods", true);
    try {
      await adminFoodService.bulkUpdateFoods(ids, updates);
      await fetchFoods(state.filters, true);
      toast.success(`${ids.length} food items updated successfully`);
    } catch {
      toast.error("Failed to update food items");
    } finally {
      setLoading("bulkUpdateFoods", false);
    }
  }, [state.filters, fetchFoods, setLoading]);
  const bulkDeleteFoods = useCallback(async (ids) => {
    setLoading("bulkDeleteFoods", true);
    try {
      await adminFoodService.bulkDeleteFoods(ids);
      await fetchFoods(state.filters, true);
      toast.success(`${ids.length} food items deleted successfully`);
    } catch {
      toast.error("Failed to delete food items");
    } finally {
      setLoading("bulkDeleteFoods", false);
    }
  }, [state.filters, fetchFoods, setLoading]);
  const bulkUpdateUsers = useCallback(async (ids, updates) => {
    setLoading("bulkUpdateUsers", true);
    try {
      await adminUserService.bulkUpdateUsers(ids, updates);
      await fetchUsers(state.filters, true);
      toast.success(`${ids.length} users updated successfully`);
    } catch {
      toast.error("Failed to update users");
    } finally {
      setLoading("bulkUpdateUsers", false);
    }
  }, [state.filters, fetchUsers, setLoading]);
  const bulkDeleteUsers = useCallback(async (ids) => {
    setLoading("bulkDeleteUsers", true);
    try {
      await adminUserService.bulkDeleteUsers(ids);
      await fetchUsers(state.filters, true);
      toast.success(`${ids.length} users deleted successfully`);
    } catch {
      toast.error("Failed to delete users");
    } finally {
      setLoading("bulkDeleteUsers", false);
    }
  }, [state.filters, fetchUsers, setLoading]);
  const exportData = useCallback(async (type, format, options = {}) => {
    setLoading(`export-${type}`, true);
    try {
      const queryParams = { ...options.params };
      if (options.selectedIds && options.selectedIds.length > 0) {
        queryParams.ids = options.selectedIds.join(',');
      }
      if (options.limit) {
        queryParams.limit = options.limit;
      }
      if (options.filters) {
        if (options.filters.status && options.filters.status !== 'all') queryParams.status = options.filters.status;
        if (options.filters.paymentStatus && options.filters.paymentStatus !== 'all') queryParams.paymentStatus = options.filters.paymentStatus;
        if (options.filters.category && options.filters.category !== 'All') queryParams.category = options.filters.category;
        if (options.filters.search) queryParams.search = options.filters.search;
        if (options.filters.dateRange) queryParams.dateRange = options.filters.dateRange;
        if (options.filters.startDate) queryParams.startDate = options.filters.startDate;
        if (options.filters.endDate) queryParams.endDate = options.filters.endDate;
        if (options.filters.sortBy) queryParams.sortBy = options.filters.sortBy;
        if (options.filters.sortOrder) queryParams.sortOrder = options.filters.sortOrder;
        if (options.filters.role && options.filters.role !== 'all') queryParams.role = options.filters.role;
        if (options.filters.isAvailable !== undefined) queryParams.isAvailable = options.filters.isAvailable;
        if (options.filters.limit) queryParams.limit = options.filters.limit;
      }

      const res = await adminStatsService.exportData(type, format, queryParams);
      const blob = res.data;

      // Distinguish a real downloadable file from a JSON error response returned inside a blob
      if (blob?.type && blob.type.includes('application/json') && format !== 'json') {
        const text = await blob.text();
        let errMsg = 'Failed to generate export';
        try {
          const parsed = JSON.parse(text);
          if (parsed.message) errMsg = parsed.message;
        } catch (_) {
          // ignore parsing error if response is not JSON
        }
        throw new Error(errMsg);
      }

      // Extract safe filename from Content-Disposition header if available
      let filename = `${type}_export_${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'xlsx' : format}`;
      const disposition = res?.headers?.['content-disposition'];
      if (disposition) {
        const match = disposition.match(/filename\*?=['"]?(?:UTF-8'')?([^;'"]+)/i);
        if (match && match[1]) {
          filename = decodeURIComponent(match[1]);
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 2000);

      const scopeLabel = options.selectedIds?.length > 0
        ? ` (${options.selectedIds.length} selected items)`
        : '';
      toast.success(`Exported ${type}${scopeLabel} as ${format.toUpperCase()}`);
    } catch (err) {
      let errorMessage = `Failed to export ${type}`;
      const status = err.response?.status;

      // Check if Axios error contains a Blob error payload
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          if (json.message) errorMessage = json.message;
        } catch (_) {
          // ignore parsing error if response is not JSON
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Security check: NEVER bypass authorization or validation errors with a local fallback
      if (status === 401 || status === 403 || status === 400) {
        toast.error(errorMessage);
        return;
      }

      // Fallback to client-side report generator ONLY on true network disconnect / offline scenarios
      try {
        const clientPayload = {
          orders: state.orders || [],
          foods: state.foods || [],
          users: state.users || [],
          kpis: state.stats || {}
        };
        exportReport(type, clientPayload, format, options?.filters || {});
        toast.success(`Network offline: Data exported locally as ${format.toUpperCase()}`);
      } catch (fallbackErr) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(`export-${type}`, false);
    }
  }, [state.orders, state.foods, state.users, state.stats, setLoading]);
  const subscribeToUpdates = useCallback((callback) => {
    setSubscribers((prev) => [...prev, callback]);
    return () => {
      setSubscribers((prev) => prev.filter((cb) => cb !== callback));
    };
  }, []);
  useEffect(() => {
    const socket = getSocket();

    const joinAdmins = () => {
      socket.emit("join_admins");
    };

    if (socket.connected) {
      joinAdmins();
    } else {
      socket.once("connect", joinAdmins);
    }

    const handleNewOrder = (orderData) => {
      notifySubscribers({ type: "order_created", data: orderData });
      dispatch({ type: "INVALIDATE_CACHE", payload: { type: "orders" } });
      dispatch({ type: "INVALIDATE_CACHE", payload: { type: "stats" } });
    };

    const handleOrderUpdated = (orderData) => {
      notifySubscribers({ type: "order_updated", data: orderData });
      dispatch({ type: "INVALIDATE_CACHE", payload: { type: "orders" } });
      dispatch({ type: "INVALIDATE_CACHE", payload: { type: "stats" } });
    };

    socket.on("new_order_placed", handleNewOrder);
    socket.on("admin_order_updated", handleOrderUpdated);

    return () => {
      socket.off("new_order_placed", handleNewOrder);
      socket.off("admin_order_updated", handleOrderUpdated);
    };
  }, [notifySubscribers]);
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats(true);
    }, 3e4);
    return () => clearInterval(interval);
  }, [fetchStats]);
  const value = useMemo(() => ({
    state,
    fetchStats,
    updateStats: (stats) => dispatch({ type: "UPDATE_STATS", payload: stats }),
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
    // Pagination (discrete + legacy alias)
    pagination: state.pagination.orders,
    orderPagination: state.pagination.orders,
    foodPagination: state.pagination.foods,
    userPagination: state.pagination.users,
    allPagination: state.pagination,
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
  return <AdminDataContext.Provider value={value}>
            {children}
        </AdminDataContext.Provider>;
};
export {
  AdminDataProvider,
  AdminDataContext as default,
  useAdminDataContext
};
