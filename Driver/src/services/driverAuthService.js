import driverApi from "./driverApi";

const driverAuthService = {
  async login(email, password) {
    const response = await driverApi.post("/auth/login", { email, password });
    return response?.data?.data;
  }
};

export default driverAuthService;
