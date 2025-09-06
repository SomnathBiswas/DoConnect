import axios,{InternalAxiosRequestConfig} from 'axios';

// const API_URL = 'http://localhost:5081/api/Auth'; 
const authApi = axios.create({
  baseURL: 'http://localhost:5081/api/Auth',
});

authApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("authToken") || localStorage.getItem("adminToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const Auth = {
  registerUser: async (username: string, password: string) => {
    const response = await authApi.post("/register", {
      username,
      password,
      role: "User"   
    });
    return response.data;
  },

  // Admin Registration
  registerAdmin: async (username: string, password: string) => {
    const response = await authApi.post("/register", {
      username,
      password,
      role: "Admin"   
    });
    return response.data;
  },


  login: async (username: string, password: string, isAdmin = false) => {
    const response = await authApi.post("/login", { username, password });
    const token = response.data.token;

    if (isAdmin) {
      localStorage.setItem("adminToken", token);
    } else {
      localStorage.setItem("authToken", token);
    }

    return response.data;
  },

  logout: (isAdmin = false) => {
    if (isAdmin) {
      localStorage.removeItem("adminToken");
    } else {
      localStorage.removeItem("authToken");
    }
  }
};

