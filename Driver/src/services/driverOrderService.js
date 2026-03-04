import driverApi from "./driverApi";

const driverOrderService = {
  async getAvailableOrders() {
    const response = await driverApi.get("/orders/driver/available");
    return response?.data?.data || [];
  },
  async getMyDeliveries(status = "") {
    const response = await driverApi.get("/orders/driver/my-deliveries", {
      params: status ? { status } : {}
    });
    return response?.data?.data || [];
  },
  async getOrderById(id) {
    const response = await driverApi.get(`/orders/${id}`);
    return response?.data?.data;
  },
  async acceptOrder(id, note = "") {
    return driverApi.put(`/orders/driver/${id}/accept`, { note });
  },
  async declineOrder(id, note = "") {
    return driverApi.put(`/orders/driver/${id}/decline`, { note });
  },
  async checkIn(id) {
    return driverApi.put(`/orders/driver/${id}/check-in`);
  },
  async pickup(id, payload) {
    return driverApi.put(`/orders/driver/${id}/pickup`, payload);
  },
  async startTransit(id, payload) {
    return driverApi.put(`/orders/driver/${id}/transit`, payload);
  },
  async completeDelivery(id, payload) {
    return driverApi.put(`/orders/driver/${id}/delivered`, payload);
  },
  async submitPostDelivery(id, payload) {
    return driverApi.put(`/orders/driver/${id}/post-delivery`, payload);
  },
  async submitCompliance(id, payload) {
    return driverApi.put(`/orders/driver/${id}/compliance`, payload);
  }
};

export default driverOrderService;
