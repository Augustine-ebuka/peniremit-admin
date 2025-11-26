import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://admin.staging.peniwallet.com"
});

// Add interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Optional: clear token
        localStorage.removeItem("token");

        // Redirect to login
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
