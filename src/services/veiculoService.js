import api from './api';

export const veiculoService = {
  /**
   * Lista todos os veículos (ônibus) da frota
   * Rota Backend: GET /onibus/
   */
  listarVeiculos: async () => {
    try {
      const response = await api.get('/onibus/');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar veículos:', error);
      throw error;
    }
  },

  /**
   * Busca os detalhes de um veículo específico (ESSA É A FUNÇÃO QUE PRECISAMOS AGORA!)
   * Rota Backend: GET /onibus/<id>
   */
  getVeiculo: async (id) => {
    try {
      const response = await api.get(`/onibus/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar o veículo ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cadastra um novo veículo
   * Rota Backend: POST /onibus/
   */
  criarVeiculo: async (veiculoData) => {
    try {
      const response = await api.post('/onibus/', veiculoData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar veículo:', error);
      throw error;
    }
  },

  /**
   * Remove um veículo do sistema
   * Rota Backend: DELETE /onibus/<id>
   */
  deletarVeiculo: async (id) => {
    try {
      const response = await api.delete(`/onibus/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao deletar o veículo ${id}:`, error);
      throw error;
    }
  }
};

export const { listarVeiculos, getVeiculo, criarVeiculo, deletarVeiculo } = veiculoService;