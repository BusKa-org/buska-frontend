import axios from 'axios';
import { Storage, STORAGE_KEYS } from '../utils/storage';
import { API_BASE_URL } from '../config/api';
import { parseApiError, requiresReauth, errorLogger } from '../utils/errors';

// Create axios instance with /v1 prefix
const api = axios.create({
  baseURL: `${API_BASE_URL}/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token and log requests
api.interceptors.request.use(
  async (config) => {
    const token = await Storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    errorLogger.debug('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
    });
    
    return config;
  },
  (error) => {
    errorLogger.error(error, { context: 'Request interceptor' });
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors consistently
api.interceptors.response.use(
  (response) => {
    // Log successful response in development
    errorLogger.debug('API Response:', {
      status: response.status,
      url: response.config?.url,
    });
    return response;
  },
  async (error) => {
    // Parse the error
    const parsedError = parseApiError(error);
    
    // Log the error
    errorLogger.apiError(parsedError, {
      method: error.config?.method,
      url: error.config?.url,
    });
    
    // Handle authentication errors
    if (requiresReauth(parsedError)) {
      await Storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      await Storage.removeItem(STORAGE_KEYS.USER);
      // Emit event for auth context to handle navigation
      // This will be picked up by the AuthContext
    }
    
    // Reject with the parsed error for consistent handling
    return Promise.reject(parsedError);
  }
);

export default api;
