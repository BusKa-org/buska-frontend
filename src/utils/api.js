import {Platform} from 'react-native';
import {getCookie, setCookie, removeCookie} from './cookie';

// API Configuration
// webpack.DefinePlugin will replace __API_URL__ at build time with the actual URL string
// eslint-disable-next-line no-undef
const API_BASE_URL = __API_URL__ || 'http://localhost:5000/api';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'user';

/**
 * Get the stored JWT token
 */
export const getToken = () => {
  return getCookie(TOKEN_KEY);
};

/**
 * Store the JWT token
 */
export const setToken = (token) => {
  setCookie(TOKEN_KEY, token, {days: 1}); // Token expires in 1 day
};

/**
 * Remove the stored JWT token
 */
export const removeToken = () => {
  removeCookie(TOKEN_KEY);
};

/**
 * Get the stored user data
 */
export const getUser = () => {
  const userStr = getCookie(USER_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
};

/**
 * Store user data
 */
export const setUser = (user) => {
  setCookie(USER_KEY, JSON.stringify(user), {days: 30});
};

/**
 * Remove stored user data
 */
export const removeUser = () => {
  removeCookie(USER_KEY);
};

/**
 * Make an API request
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise} Response data
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    // If unauthorized, clear token and user
    if (response.status === 401) {
      removeToken();
      removeUser();
      throw new Error('Unauthorized. Please login again.');
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || 'An error occurred');
    }

    return data;
  } catch (error) {
    // Handle network errors
    if (error.message === 'Failed to fetch' || error.message.includes('Network')) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};

/**
 * GET request
 */
export const apiGet = (endpoint, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'GET',
  });
};

/**
 * POST request
 */
export const apiPost = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * PUT request
 */
export const apiPut = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * PATCH request
 */
export const apiPatch = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

/**
 * DELETE request
 */
export const apiDelete = (endpoint, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'DELETE',
  });
};

