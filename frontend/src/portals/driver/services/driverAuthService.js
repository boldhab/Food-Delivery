import driverApi from "./driverApi";

const driverAuthService = {
  async login(email, password) {
    const response = await driverApi.post("/auth/login", { email, password });
    return response?.data?.data;
  },

  async apply(payload) {
    const response = await driverApi.post("/auth/driver-apply", payload);
    return response?.data?.data;
  },

  async checkStatus(query) {
    const response = await driverApi.post("/auth/driver-status", { query });
    return response?.data?.data;
  }
};

export default driverAuthService;
