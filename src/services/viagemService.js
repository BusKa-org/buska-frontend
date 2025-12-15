import {apiGet, apiPost, apiPut, apiPatch} from '../utils/api';

/**
 * Trips Service
 * Handles trip-related operations
 */

/**
 * Get all trips
 * @param {Object} [filters] - Optional filters
 * @param {number} [filters.rota_id] - Filter by route
 * @param {number} [filters.motorista_id] - Filter by driver
 * @param {string} [filters.data] - Filter by date (YYYY-MM-DD)
 * @param {string} [filters.tipo] - Filter by type (IDA, VOLTA)
 * @returns {Promise<Array>} List of trips
 */
export const getViagens = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  if (filters.rota_id) {
    queryParams.append('rota_id', filters.rota_id);
  }
  if (filters.motorista_id) {
    queryParams.append('motorista_id', filters.motorista_id);
  }
  if (filters.data) {
    queryParams.append('data', filters.data);
  }
  if (filters.tipo) {
    queryParams.append('tipo', filters.tipo);
  }
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `/viagens?${queryString}` : '/viagens';
  
  return apiGet(endpoint);
};

/**
 * Get a single trip by ID
 * @param {number} viagemId - Trip ID
 * @returns {Promise<Object>} Trip data
 */
export const getViagem = async (viagemId) => {
  return apiGet(`/viagens/${viagemId}`);
};

/**
 * Create a new trip
 * @param {Object} viagemData - Trip data
 * @param {string} viagemData.data - Trip date (YYYY-MM-DD)
 * @param {string} viagemData.tipo - Trip type (IDA, VOLTA)
 * @param {number} viagemData.rota_id - Route ID
 * @param {number} viagemData.motorista_id - Driver ID
 * @returns {Promise<Object>} Created trip
 */
export const createViagem = async (viagemData) => {
  return apiPost('/viagens', viagemData);
};

/**
 * Start a trip
 * @param {number} viagemId - Trip ID
 * @returns {Promise<Object>} Updated trip
 */
export const startViagem = async (viagemId) => {
  return apiPatch(`/viagens/${viagemId}/start`, {});
};

/**
 * End a trip
 * @param {number} viagemId - Trip ID
 * @returns {Promise<Object>} Updated trip
 */
export const endViagem = async (viagemId) => {
  return apiPatch(`/viagens/${viagemId}/end`, {});
};

/**
 * Get upcoming trips for a student
 * @param {number} alunoId - Student ID
 * @returns {Promise<Array>} List of upcoming trips
 */
export const getProximasViagensAluno = async (alunoId) => {
  return apiGet(`/viagens/aluno/${alunoId}/proximas`);
};

/**
 * Get upcoming trips for a driver
 * @param {number} motoristaId - Driver ID
 * @returns {Promise<Array>} List of upcoming trips
 */
export const getProximasViagensMotorista = async (motoristaId) => {
  return apiGet(`/viagens/motorista/${motoristaId}/proximas`);
};

/**
 * Get trip details with students
 * @param {number} viagemId - Trip ID
 * @returns {Promise<Object>} Trip with student list
 */
export const getViagemDetalhes = async (viagemId) => {
  return apiGet(`/viagens/${viagemId}/detalhes`);
};


