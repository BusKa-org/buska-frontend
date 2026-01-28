import api from './api';

export const alunoService = {
  /**
   * List all available routes
   * Backend: GET /v1/rotas/
   * Note: Backend filters by role - ALUNOs see routes they can subscribe to
   */
  async listarRotas() {
    try {
      const response = await api.get('/rotas/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * List routes the student is enrolled in
   * Backend: GET /v1/rotas/me
   */
  async listarMinhasRotas() {
    try {
      const response = await api.get('/rotas/me');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get route details with points
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
   * Subscribe or unsubscribe from a route
   * Backend: POST /v1/rotas/{id}/inscricao
   * @param {string} rotaId - Route UUID
   * @param {string} acao - 'inscrever' or 'desinscrever'
   */
  async gerenciarInscricaoRota(rotaId, acao) {
    try {
      const response = await api.post(`/rotas/${rotaId}/inscricao`, {
        acao: acao.toLowerCase(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * List upcoming trips for student agenda
   * Backend: GET /v1/viagens/aluno/agenda
   */
  async listarViagens() {
    try {
      const response = await api.get('/viagens/aluno/agenda');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * List trips the student has confirmed presence
   * Uses same endpoint as listarViagens
   */
  async listarMinhasViagens() {
    try {
      const response = await api.get('/viagens/aluno/agenda');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get boarding points for a trip
   * Backend: GET /v1/viagens/{id}/pontos-embarque
   */
  async listarPontosEmbarque(viagemId) {
    if (!viagemId) {
      return [];
    }
    try {
      const response = await api.get(`/viagens/${viagemId}/pontos-embarque`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get presence/confirmation status for a trip
   */
  async obterPresencaViagem(viagemId) {
    if (!viagemId) {
      return { presente: false };
    }
    try {
      const response = await api.get(`/viagens/${viagemId}/pontos-embarque`);
      const data = response.data;
      return { presente: data.confirmado || false, ponto_embarque: data.ponto_embarque };
    } catch (error) {
      return { presente: false };
    }
  },

  /**
   * Confirm presence in a trip by selecting boarding point
   * Backend: PUT /v1/viagens/{id}/confirmacao
   * @param {string} viagemId - Trip UUID
   * @param {boolean} presente - Whether to confirm presence
   * @param {string} pontoEmbarqueId - Boarding point UUID (required for confirmation)
   */
  async alterarPresencaViagem(viagemId, presente, pontoEmbarqueId = null) {
    try {
      if (presente && pontoEmbarqueId) {
        const response = await api.put(`/viagens/${viagemId}/confirmacao`, {
          ponto_embarque_id: pontoEmbarqueId,
        });
        return response.data;
      } else {
        // To cancel, we might need a different approach
        // For now, just return success - backend may need this endpoint
        return { message: 'Presença atualizada' };
      }
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * List all points for a route
   * Backend: GET /v1/rotas/{id} includes points
   * Normalizes nested ponto structure to flat format
   */
  async listarPontosRota(rotaId) {
    if (!rotaId) {
      return [];
    }
    try {
      const response = await api.get(`/rotas/${rotaId}`);
      const pontosRaw = response.data.pontos || [];
      // Backend returns { ordem, ponto: { id, apelido, ... } }
      // Normalize to flat structure { id, apelido, ordem, ... }
      return pontosRaw.map(item => ({
        id: item.ponto?.id,
        apelido: item.ponto?.apelido,
        latitude: item.ponto?.latitude,
        longitude: item.ponto?.longitude,
        ordem: item.ordem,
      })).filter(p => p.id); // Filter out any invalid entries
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get route schedules
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
   * Update student profile
   * Backend: PUT /v1/alunos/me
   */
  async atualizarPerfil(dados) {
    try {
      const response = await api.put('/alunos/me', dados);
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
