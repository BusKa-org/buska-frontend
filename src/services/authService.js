import api from './api';
import { Storage, STORAGE_KEYS } from '../utils/storage';

export const authService = {
  /**
   * Login user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{access_token: string, user: object}>}
   */
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      const { access_token, user } = response.data;

      // Store token and user info
      await Storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
      await Storage.setItem(STORAGE_KEYS.USER, user);

      return { access_token, user };
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Register new user
   * @param {object} userData - {nome, email, password, role, municipio}
   * @returns {Promise<{message: string, user: object}>}
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', {
        nome: userData.nome.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        role: userData.role,
        municipio: userData.municipio.toUpperCase().trim(),
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Logout user
   */
  async logout() {
    console.log('authService: Removendo token...');
    await Storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    console.log('authService: Removendo usuário...');
    await Storage.removeItem(STORAGE_KEYS.USER);
    console.log('authService: Logout concluído');
  },

  /**
   * Get current user from storage
   */
  async getCurrentUser() {
    return await Storage.getItem(STORAGE_KEYS.USER);
  },

  /**
   * Update stored user data
   */
  async updateStoredUser(userData) {
    await Storage.setItem(STORAGE_KEYS.USER, userData);
  },

  /**
   * Get stored access token
   */
  async getAccessToken() {
    return await Storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    const token = await Storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return !!token;
  },

  /**
   * Handle API errors
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.error || 'An error occurred',
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      // Request made but no response received
      return {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        status: 0,
      };
    }
  },
};
