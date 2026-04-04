import { api } from '../api/client';
import type { RotaListResponse } from '../types';

export const gestorService = {
  /**
   * List all routes in the municipality
   * Backend: GET /v1/rotas/
   * GESTOR sees all routes in their prefeitura
   */
  async listarRotas(): Promise<RotaListResponse> {
    const response = await api.get<RotaListResponse>('/rotas/');
    return response.data;
  },

  /**
   * List all trips with optional filters
   * Backend: GET /v1/viagens/
   * @param {object} filters - { data_inicio?, data_fim?, status?, motorista_id?, rota_id? }
   */
  async listarViagens(filters = {}) {
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
   * Create a new trip
   * Backend: POST /v1/viagens/
   * @param {object} viagemData - { rota_id, horario_id, data, motorista_id?, veiculo_id? }
   */
  async criarViagem(viagemData) {
    try {
      const response = await api.post('/viagens/', {
        rota_id: viagemData.rota_id,
        horario_id: viagemData.horario_id,
        data: viagemData.data,
        motorista_id: viagemData.motorista_id,
        veiculo_id: viagemData.veiculo_id,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Generate trips in batch for a date
   * Backend: POST /v1/viagens/gerar-lote
   * @param {string} data - Date in YYYY-MM-DD format
   */
  async gerarViagensBatch(data) {
    try {
      const response = await api.post('/viagens/gerar-lote', { data });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * List all users (drivers, students, gestors)
   * Backend: GET /v1/users/
   */
  async listarUsuarios() {
    try {
      const response = await api.get('/users/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * List all drivers
   * Backend: GET /v1/users/ and filter by role
   */
  async listarMotoristas() {
    try {
      const response = await api.get('/users/');
      // Filter by motorista role
      return (response.data || []).filter(u => u.role === 'motorista');
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * List all students
   * Backend: GET /v1/alunos/
   */
  async listarAlunos() {
    try {
      const response = await api.get('/alunos/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Create a new driver
   * Backend: POST /v1/users/motoristas
   * @param {object} motoristaData - { nome, email, password, cpf, cnh, telefone?, salario? }
   */
  async criarMotorista(motoristaData) {
    try {
      const response = await api.post('/users/motoristas', {
        nome: motoristaData.nome.trim(),
        email: motoristaData.email.trim().toLowerCase(),
        password: motoristaData.password,
        cpf: motoristaData.cpf,
        cnh: motoristaData.cnh,
        telefone: motoristaData.telefone,
        salario: motoristaData.salario,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Create a new route
   * Backend: POST /v1/rotas/
   */
  async criarRota(rotaData) {
    try {
      const response = await api.post('/rotas/', {
        nome: rotaData.nome,
        motorista_padrao_id: rotaData.motorista_padrao_id,
        veiculo_padrao_id: rotaData.veiculo_padrao_id,
        pontos: rotaData.pontos,
        horarios: rotaData.horarios,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * List all buses
   * Backend: GET /v1/onibus/
   */
  async listarOnibus() {
    try {
      const response = await api.get('/onibus/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Create a new bus
   * Backend: POST /v1/onibus/
   */
  async criarOnibus(onibusData) {
    try {
      const response = await api.post('/onibus/', {
        placa: onibusData.placa,
        modelo: onibusData.modelo,
        capacidade: onibusData.capacidade,
        ano: onibusData.ano,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Delete a bus
   * Backend: DELETE /v1/onibus/{id}
   */
  async excluirOnibus(onibusId) {
    try {
      const response = await api.delete(`/onibus/${onibusId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * List all institutions
   * Backend: GET /v1/instituicoes/
   */
  async listarInstituicoes() {
    try {
      const response = await api.get('/instituicoes/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Create a new institution
   * Backend: POST /v1/instituicoes/
   */
  async criarInstituicao(instituicaoData) {
    try {
      const response = await api.post('/instituicoes/', {
        nome: instituicaoData.nome,
        tipo: instituicaoData.tipo,
        endereco: instituicaoData.endereco,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Delete an institution
   * Backend: DELETE /v1/instituicoes/{id}
   */
  async excluirInstituicao(instituicaoId) {
    try {
      const response = await api.delete(`/instituicoes/${instituicaoId}`);
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
