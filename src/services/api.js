import axios from 'axios';
import { Storage, STORAGE_KEYS } from '../utils/storage';
import { API_BASE_URL } from '../config/api';

// Create axios instance with /v1 prefix
const api = axios.create({
  baseURL: `${API_BASE_URL}/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await Storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage
      await Storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      await Storage.removeItem(STORAGE_KEYS.USER);
    }
    return Promise.reject(error);
  }
);

export default api;
