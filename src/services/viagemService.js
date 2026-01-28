/**
 * Trips Service
 * Handles trip-related operations using Axios API
 */

import api from './api';

/**
 * Get all trips
 * @param {Object} [filters] - Optional filters
 * @param {string} [filters.rota_id] - Filter by route
 * @param {string} [filters.motorista_id] - Filter by driver
 * @param {string} [filters.data] - Filter by date (YYYY-MM-DD)
 * @param {string} [filters.tipo] - Filter by type (IDA, VOLTA)
 * @returns {Promise<Array>} List of trips
 */
export const getViagens = async (filters = {}) => {
  const params = {};
  if (filters.rota_id) params.rota_id = filters.rota_id;
  if (filters.motorista_id) params.motorista_id = filters.motorista_id;
  if (filters.data) params.data = filters.data;
  if (filters.tipo) params.tipo = filters.tipo;
  
  const response = await api.get('/viagens/', { params });
  return response.data;
};

/**
 * Get a single trip by ID
 * @param {string} viagemId - Trip ID
 * @returns {Promise<Object>} Trip data
 */
export const getViagem = async (viagemId) => {
  const response = await api.get(`/viagens/${viagemId}`);
  return response.data;
};

/**
 * Create a new trip
 * @param {Object} viagemData - Trip data
 * @param {string} viagemData.data - Trip date (YYYY-MM-DD)
 * @param {string} viagemData.tipo - Trip type (IDA, VOLTA)
 * @param {string} viagemData.rota_id - Route ID
 * @param {string} [viagemData.motorista_id] - Driver ID
 * @returns {Promise<Object>} Created trip
 */
export const createViagem = async (viagemData) => {
  const response = await api.post('/viagens/', viagemData);
  return response.data;
};

/**
 * Start a trip
 * @param {string} viagemId - Trip ID
 * @returns {Promise<Object>} Updated trip
 */
export const startViagem = async (viagemId) => {
  const response = await api.patch(`/viagens/${viagemId}/start`);
  return response.data;
};

/**
 * End a trip
 * @param {string} viagemId - Trip ID
 * @returns {Promise<Object>} Updated trip
 */
export const endViagem = async (viagemId) => {
  const response = await api.patch(`/viagens/${viagemId}/end`);
  return response.data;
};

/**
 * Get upcoming trips for a student
 * @param {string} alunoId - Student ID
 * @returns {Promise<Array>} List of upcoming trips
 */
export const getProximasViagensAluno = async (alunoId) => {
  const response = await api.get(`/viagens/aluno/${alunoId}/proximas`);
  return response.data;
};

/**
 * Get upcoming trips for a driver
 * @param {string} motoristaId - Driver ID
 * @returns {Promise<Array>} List of upcoming trips
 */
export const getProximasViagensMotorista = async (motoristaId) => {
  const response = await api.get(`/viagens/motorista/${motoristaId}/proximas`);
  return response.data;
};

/**
 * Get trip details with students
 * @param {string} viagemId - Trip ID
 * @returns {Promise<Object>} Trip with student list
 */
export const getViagemDetalhes = async (viagemId) => {
  const response = await api.get(`/viagens/${viagemId}/detalhes`);
  return response.data;
};

export default {
  getViagens,
  getViagem,
  createViagem,
  startViagem,
  endViagem,
  getProximasViagensAluno,
  getProximasViagensMotorista,
  getViagemDetalhes,
};
