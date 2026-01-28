import axios from 'axios';
import { Storage, STORAGE_KEYS } from '../utils/storage';
import { API_BASE_URL } from '../config/api';

// Lazy import to avoid circular dependencies
let errorUtils = null;
const getErrorUtils = () => {
  if (!errorUtils) {
    errorUtils = require('../utils/errors');
  }
  return errorUtils;
};

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
    try {
      const token = await Storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Error getting token:', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors consistently
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    try {
      const { parseApiError, requiresReauth } = getErrorUtils();
      
      // Parse the error
      const parsedError = parseApiError(error);
      
      // Handle authentication errors
      if (requiresReauth(parsedError)) {
        await Storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        await Storage.removeItem(STORAGE_KEYS.USER);
      }
      
      // Reject with the parsed error for consistent handling
      return Promise.reject(parsedError);
    } catch (parseError) {
      // If parsing fails, reject with original error
      console.error('Error parsing API error:', parseError);
      return Promise.reject(error);
    }
  }
);

export default api;
