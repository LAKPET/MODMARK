import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

// Create an axios instance with common configuration
const api = axios.create({
  baseURL: apiUrl,
});

// Add a request interceptor to include auth token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication API functions
export const authAPI = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;

      // Store user data in localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("FirstName", user.first_name);
      localStorage.setItem("LastName", user.last_name);
      localStorage.setItem("Username", user.username);
      localStorage.setItem("UserRole", user.role);
      localStorage.setItem("UserId", user.id);

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", {
        personal_num: parseInt(userData.personal_num, 10),
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        username: userData.username,
        password: userData.password,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post("/auth/logout");

      // Clear all auth-related data from localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("FirstName");
      localStorage.removeItem("LastName");
      localStorage.removeItem("Username");
      localStorage.removeItem("UserRole");
      localStorage.removeItem("UserId");

      return { success: true };
    } catch (error) {
      throw error;
    }
  },

  // Check if user is authenticated
  checkAuth: async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) return null;

      // Optional: Verify token validity with backend
      // const response = await api.get("/auth/verify");
      // return response.data;

      // Return user data from localStorage
      return {
        username: localStorage.getItem("Username"),
        firstName: localStorage.getItem("FirstName"),
        lastName: localStorage.getItem("LastName"),
        role: localStorage.getItem("UserRole"),
        id: localStorage.getItem("UserId"),
      };
    } catch (error) {
      // Clear localStorage on auth error
      localStorage.removeItem("authToken");
      throw error;
    }
  },
};

export default authAPI;
