import api from './api';

export const motoristaService = {
  /**
   * List all routes assigned to the motorista
   * @returns {Promise<Array>}
   */
  async listarRotas() {
    try {
      const response = await api.get('/motorista/rotas');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Create a new route
   * @param {string} nome
   * @returns {Promise<object>}
   */
  async criarRota(nome) {
    try {
      const response = await api.post('/motorista/rotas', {
        nome: nome.trim(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * List all points for a route
   * @param {number} rotaId
   * @returns {Promise<Array>}
   */
  async listarPontosRota(rotaId) {
    try {
      const response = await api.get(`/motorista/rotas/${rotaId}/pontos`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Add points to a route
   * @param {number} rotaId
   * @param {number} municipioId
   * @param {Array} pontos - Array of {nome, latitude, longitude}
   * @returns {Promise<object>}
   */
  async adicionarPontos(rotaId, municipioId, pontos) {
    try {
      const response = await api.post(`/motorista/rotas/${rotaId}/ponto`, {
        municipio_id: municipioId,
        pontos: pontos.map((p) => ({
          nome: p.nome.trim(),
          latitude: parseFloat(p.latitude),
          longitude: parseFloat(p.longitude),
        })),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * List all trips for the motorista's routes
   * @returns {Promise<Array>}
   */
  async listarViagens() {
    try {
      const response = await api.get('/motorista/viagens');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Create a new trip
   * @param {object} viagemData - {rota_id, data, horario_inicio, horario_fim?, tipo}
   * @returns {Promise<object>}
   */
  async criarViagem(viagemData) {
    try {
      const response = await api.post('/motorista/viagens', {
        rota_id: viagemData.rota_id,
        data: viagemData.data, // Format: "YYYY-MM-DD"
        horario_inicio: viagemData.horario_inicio, // Format: "HH:MM"
        horario_fim: viagemData.horario_fim, // Format: "HH:MM" (optional)
        tipo: viagemData.tipo, // "IDA" or "VOLTA"
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Start a trip
   * @param {number} viagemId
   * @returns {Promise<object>}
   */
  async iniciarViagem(viagemId) {
    try {
      const response = await api.post(`/motorista/viagens/${viagemId}/iniciar`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Finish a trip
   * @param {number} viagemId
   * @returns {Promise<object>}
   */
  async finalizarViagem(viagemId) {
    try {
      const response = await api.post(
        `/motorista/viagens/${viagemId}/finalizar`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * List confirmed students for a trip
   * @param {number} viagemId
   * @returns {Promise<object>}
   */
  async listarAlunosViagem(viagemId) {
    try {
      const response = await api.get(`/motorista/viagens/${viagemId}/alunos`);
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

