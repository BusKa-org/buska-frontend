import api from './api';

export const gestorService = {
  /**
   * List all routes in the gestor's municipality
   * @returns {Promise<Array>}
   */
  async listarRotas() {
    try {
      const response = await api.get('/gestor/rotas');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * List all trips in the gestor's municipality
   * @returns {Promise<Array>}
   */
  async listarViagens() {
    try {
      const response = await api.get('/gestor/viagens');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Create a new trip
   * @param {object} viagemData - {rota_id, motorista_id, data, horario_inicio, horario_fim?, tipo}
   * @returns {Promise<object>}
   */
  async criarViagem(viagemData) {
    try {
      const response = await api.post('/gestor/viagens', {
        rota_id: viagemData.rota_id,
        motorista_id: viagemData.motorista_id,
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
   * List all drivers in the gestor's municipality
   * @returns {Promise<Array>}
   */
  async listarMotoristas() {
    try {
      const response = await api.get('/gestor/motoristas');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Create a new driver
   * @param {object} motoristaData - {nome, email, password}
   * @returns {Promise<object>}
   */
  async criarMotorista(motoristaData) {
    try {
      const response = await api.post('/gestor/motoristas', {
        nome: motoristaData.nome.trim(),
        email: motoristaData.email.trim().toLowerCase(),
        password: motoristaData.password,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get route reports
   * @returns {Promise<Array>}
   */
  async relatoriosRotas() {
    try {
      const response = await api.get('/gestor/relatorios');
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


