import api from './api';

export const userService = {
  /**
   * Get current user profile
   * @returns {Promise<object>}
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/user/me');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Update user profile
   * @param {object} userData - {nome?, email?, password?, municipio?}
   * @returns {Promise<object>}
   */
  async updateUser(userData) {
    try {
      const updateData = {};
      if (userData.nome) updateData.nome = userData.nome.trim();
      if (userData.email) updateData.email = userData.email.trim().toLowerCase();
      if (userData.password) updateData.password = userData.password;
      if (userData.municipio)
        updateData.municipio = userData.municipio.toUpperCase().trim();

      const response = await api.put('/user/update', updateData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * List all users (restricted to gestor role)
   * @returns {Promise<Array>}
   */
  async listUsers() {
    try {
      const response = await api.get('/user/list');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  handleError(error) {
    if (error.response) {
      return {
        message: error.response.data?.error || 'An error occurred',
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      return {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    } else {
      return {
        message: error.message || 'An unexpected error occurred',
        status: 0,
      };
    }
  },
};


