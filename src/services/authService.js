import api from './api';
import { Storage, STORAGE_KEYS } from '../utils/storage';

export const authService = {
  /**
   * Login user
   * Backend: POST /v1/auth/login
   * Returns: { access_token, token_type }
   */
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      const { access_token } = response.data;

      // Store token
      await Storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);

      // Fetch user profile after login
      const userResponse = await api.get('/users/me');
      const user = userResponse.data;

      // Store user info
      await Storage.setItem(STORAGE_KEYS.USER, user);

      return { access_token, user };
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Register new student (public endpoint)
   * Backend: POST /v1/alunos/signup
   * Note: Only students can self-register. Drivers are created by Gestor.
   */
  async register(userData) {
    try {
      // For student registration
      const response = await api.post('/alunos/signup', {
        nome: userData.nome.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        cpf: userData.cpf || '00000000000', // Required by backend
        matricula: userData.matricula || 'AUTO-' + Date.now(), // Required by backend
        instituicao_id: userData.instituicao_id, // Required by backend - need to select institution
        telefone: userData.telefone,
        endereco_casa: userData.endereco_casa,
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
   * Refresh user data from server
   */
  async refreshUserData() {
    try {
      const response = await api.get('/users/me');
      const user = response.data;
      await Storage.setItem(STORAGE_KEYS.USER, user);
      return user;
    } catch (error) {
      throw this.handleError(error);
    }
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
   * Change password
   * Backend: POST /v1/users/change-password
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.post('/users/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Handle API errors
   */
  handleError(error) {
    if (error.response) {
      return {
        message: error.response.data?.message || error.response.data?.error || 'Ocorreu um erro',
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      return {
        message: 'Erro de conexão. Verifique sua internet.',
        status: 0,
      };
    } else {
      return {
        message: error.message || 'Ocorreu um erro inesperado',
        status: 0,
      };
    }
  },
};
