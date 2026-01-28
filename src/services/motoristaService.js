import api from './api';

export const motoristaService = {
  /**
   * List routes assigned to the driver
   * Backend: GET /v1/rotas/me
   */
  async listarRotas() {
    try {
      const response = await api.get('/rotas/me');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get route details
   * Backend: GET /v1/rotas/{id}
   */
  async obterRota(rotaId) {
    try {
      const response = await api.get(`/rotas/${rotaId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Create a new route
   * Backend: POST /v1/rotas/
   * @param {object} rotaData - { nome, pontos?, horarios? }
   */
  async criarRota(rotaData) {
    try {
      const payload = {
        nome: typeof rotaData === 'string' ? rotaData.trim() : rotaData.nome.trim(),
      };
      
      if (rotaData.pontos) {
        payload.pontos = rotaData.pontos;
      }
      if (rotaData.horarios) {
        payload.horarios = rotaData.horarios;
      }
      
      const response = await api.post('/rotas/', payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Update a route
   * Backend: PUT /v1/rotas/{id}
   */
  async atualizarRota(rotaId, dados) {
    try {
      const response = await api.put(`/rotas/${rotaId}`, dados);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Delete a route
   * Backend: DELETE /v1/rotas/{id}
   */
  async excluirRota(rotaId) {
    try {
      const response = await api.delete(`/rotas/${rotaId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * List all points in the municipality
   * Backend: GET /v1/pontos/
   */
  async listarPontos() {
    try {
      const response = await api.get('/pontos/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Create a new point
   * Backend: POST /v1/pontos/
   * @param {object} pontoData - { apelido?, latitude, longitude }
   */
  async criarPonto(pontoData) {
    try {
      const response = await api.post('/pontos/', {
        apelido: pontoData.nome || pontoData.apelido,
        latitude: parseFloat(pontoData.latitude),
        longitude: parseFloat(pontoData.longitude),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Add points to a route
   * Backend: POST /v1/rotas/{id}/pontos
   * @param {string} rotaId - Route UUID
   * @param {string} pontoId - Point UUID
   * @param {number} ordem - Order in the route
   */
  async adicionarPontoRota(rotaId, pontoId, ordem) {
    try {
      const response = await api.post(`/rotas/${rotaId}/pontos`, {
        ponto_id: pontoId,
        ordem: ordem,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * List points for a route
   * Backend: GET /v1/rotas/{id} - includes pontos in response
   */
  async listarPontosRota(rotaId) {
    try {
      const response = await api.get(`/rotas/${rotaId}`);
      return response.data.pontos || [];
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * List trips assigned to the driver
   * Backend: GET /v1/viagens/minhas
   */
  async listarViagens() {
    try {
      const response = await api.get('/viagens/minhas');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Create a new trip (requires GESTOR role in backend)
   * Backend: POST /v1/viagens/
   * @param {object} viagemData - { rota_id, horario_id, data, motorista_id?, veiculo_id? }
   */
  async criarViagem(viagemData) {
    try {
      const response = await api.post('/viagens/', {
        rota_id: viagemData.rota_id,
        horario_id: viagemData.horario_id,
        data: viagemData.data, // Format: "YYYY-MM-DD"
        motorista_id: viagemData.motorista_id,
        veiculo_id: viagemData.veiculo_id,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Start a trip
   * Backend: PUT /v1/viagens/{id}/acao
   */
  async iniciarViagem(viagemId) {
    try {
      const response = await api.put(`/viagens/${viagemId}/acao`, {
        acao: 'iniciar',
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Finish a trip
   * Backend: PUT /v1/viagens/{id}/acao
   */
  async finalizarViagem(viagemId) {
    try {
      const response = await api.put(`/viagens/${viagemId}/acao`, {
        acao: 'finalizar',
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * List confirmed students for a trip
   * Note: Backend may need this endpoint added
   * For now, try getting trip details
   */
  async listarAlunosViagem(viagemId) {
    try {
      // Try to get boarding points which should include confirmed students
      const response = await api.get(`/viagens/${viagemId}/pontos-embarque`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * List route schedules
   * Backend: GET /v1/rotas/{id}/horarios
   */
  async listarHorariosRota(rotaId) {
    try {
      const response = await api.get(`/rotas/${rotaId}/horarios`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Add schedule to a route
   * Backend: POST /v1/rotas/{id}/horarios
   * @param {string} rotaId - Route UUID
   * @param {object} horarioData - { horario_saida, sentido, dias }
   */
  async adicionarHorarioRota(rotaId, horarioData) {
    try {
      const response = await api.post(`/rotas/${rotaId}/horarios`, {
        horario_saida: horarioData.horario_saida,
        sentido: horarioData.sentido, // IDA, VOLTA, or CIRCULAR
        dias: horarioData.dias, // ['SEG', 'TER', ...]
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

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
