import api from './api';

export const alunoService = {
  /**
   * List all available routes in the aluno's municipality
   * @returns {Promise<Array>}
   */
  async listarRotas() {
    try {
      const response = await api.get('/aluno/rotas');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * List routes the aluno is enrolled in
   * @returns {Promise<Array>}
   */
  async listarMinhasRotas() {
    try {
      const response = await api.get('/aluno/me/rotas');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Subscribe or unsubscribe from a route
   * @param {number} rotaId
   * @param {string} acao - 'inscrever' or 'desinscrever'
   * @returns {Promise<object>}
   */
  async gerenciarInscricaoRota(rotaId, acao) {
    try {
      const response = await api.put(`/aluno/rotas/${rotaId}/inscricao`, {
        acao: acao.toLowerCase(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * List all available trips in the aluno's municipality
   * @returns {Promise<Array>}
   */
  async listarViagens() {
    try {
      const response = await api.get('/aluno/viagens');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * List trips the aluno is registered for
   * @returns {Promise<Array>}
   */
  async listarMinhasViagens() {
    try {
      const response = await api.get('/aluno/me/viagens');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get presence status for a trip
   * @param {number} viagemId
   * @returns {Promise<object>}
   */
  async obterPresencaViagem(viagemId) {
    try {
      const response = await api.get(`/aluno/viagens/${viagemId}/presenca`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Confirm or cancel presence in a trip
   * @param {number} viagemId
   * @param {boolean} presente
   * @returns {Promise<object>}
   */
  async alterarPresencaViagem(viagemId, presente) {
    try {
      const response = await api.put(`/aluno/viagens/${viagemId}/presenca`, {
        presente,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * List all points for a route the aluno is enrolled in
   * @param {number} rotaId
   * @returns {Promise<Array>}
   */
  async listarPontosRota(rotaId) {
    try {
      const response = await api.get(`/aluno/rotas/${rotaId}/pontos`);
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

