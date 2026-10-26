import axios from "axios";

const driverApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
});

driverApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("driverToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

driverApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("driverToken");
      localStorage.removeItem("driverUser");
      window.location.href = "/driver/login";
    }
    return Promise.reject(error);
  }
);

export default driverApi;
