import axios from "axios";
import { routes } from "@/utils/routes";
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://admin.staging.peniwallet.com"
});

// Add interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(error,"errrorrrr")
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Optional: clear token
        localStorage.removeItem("token");
        localStorage.removeItem("persist:root");

        // Redirect to login
        window.location.href = routes.home;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
