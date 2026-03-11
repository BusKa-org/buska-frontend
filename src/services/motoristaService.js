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
   * Add points to a route (batch)
   * Backend: POST /v1/rotas/{id}/pontos
   * @param {string} rotaId - Route UUID
   * @param {Array} pontos - Array of {ponto_id, ordem}
   */
  async adicionarPontosRota(rotaId, pontos) {
    try {
      const response = await api.post(`/rotas/${rotaId}/pontos`, {
        pontos: pontos.map((p, index) => ({
          ponto_id: String(p.id || p.ponto_id),
          ordem: p.ordem || index + 1,
        })),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * List points for a route
   * Backend: GET /v1/rotas/{id} - includes pontos in response
   * Normalizes nested structure to flat format
   */
  async listarPontosRota(rotaId) {
    try {
      const response = await api.get(`/rotas/${rotaId}`);
      const pontosRaw = response.data.pontos || [];
      
      // Normalize nested structure: {ponto: {...}, ordem} -> flat format
      return pontosRaw.map(item => ({
        id: item.ponto?.ponto_id || item.ponto?.id || item.ponto_id || item.id,
        nome: item.ponto?.apelido || item.apelido || item.nome || 'Ponto',
        latitude: item.ponto?.latitude ?? item.latitude,
        longitude: item.ponto?.longitude ?? item.longitude,
        ordem: item.ordem,
      })).filter(p => p.latitude !== undefined && p.longitude !== undefined);
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
   * List all trips in the prefeitura (for gestores)
   * Backend: GET /v1/viagens/
   * @param {object} filters - Optional filters { data_inicio, data_fim, status, motorista_id, rota_id }
   */
  async listarTodasViagens(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.data_inicio) params.append('data_inicio', filters.data_inicio);
      if (filters.data_fim) params.append('data_fim', filters.data_fim);
      if (filters.status) params.append('status', filters.status);
      if (filters.motorista_id) params.append('motorista_id', filters.motorista_id);
      if (filters.rota_id) params.append('rota_id', filters.rota_id);
      
      const queryString = params.toString();
      const url = queryString ? `/viagens/?${queryString}` : '/viagens/';
      const response = await api.get(url);
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
        acao: 'INICIAR',
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
        acao: 'FINALIZAR',
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Send current driver/bus GPS position (real-time tracking).
   * Backend: POST /v1/viagens/{id}/localizacao
   * @param {string} viagemId - Trip UUID
   * @param {object} position - { latitude: number, longitude: number }
   */
  async enviarLocalizacao(viagemId, position) {
    if (!viagemId || position?.latitude == null || position?.longitude == null) {
      throw new Error('viagemId e latitude/longitude são obrigatórios');
    }
    try {
      const response = await api.post(`/viagens/${viagemId}/localizacao`, {
        latitude: Number(position.latitude),
        longitude: Number(position.longitude),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get current driver/bus GPS position (real-time tracking).
   * Backend: GET /v1/viagens/{id}/localizacao
   * @param {string} viagemId - Trip UUID
   * @returns {Promise<{latitude: number, longitude: number}>} Current position
   */
  async obterLocalizacao(viagemId) {
    if (!viagemId) {
      throw new Error('viagemId é obrigatório');
    }
    
    try {
      const response = await api.get(`/viagens/${viagemId}/localizacao`);
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
    if (!viagemId) {
      return { total_alunos: 0, alunos_confirmados: 0 };
    }
    try {
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
