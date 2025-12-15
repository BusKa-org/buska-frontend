import {apiGet, apiPost, apiPut, apiDelete} from '../utils/api';

/**
 * Routes Service
 * Handles route-related operations
 */

/**
 * Get all routes
 * @param {Object} [filters] - Optional filters
 * @param {number} [filters.municipio_id] - Filter by municipality
 * @param {number} [filters.motorista_id] - Filter by driver
 * @returns {Promise<Array>} List of routes
 */
export const getRotas = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  if (filters.municipio_id) {
    queryParams.append('municipio_id', filters.municipio_id);
  }
  if (filters.motorista_id) {
    queryParams.append('motorista_id', filters.motorista_id);
  }
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `/rotas?${queryString}` : '/rotas';
  
  return apiGet(endpoint);
};

/**
 * Get a single route by ID
 * @param {number} rotaId - Route ID
 * @returns {Promise<Object>} Route data
 */
export const getRota = async (rotaId) => {
  return apiGet(`/rotas/${rotaId}`);
};

/**
 * Create a new route
 * @param {Object} rotaData - Route data
 * @param {string} rotaData.nome - Route name
 * @param {number} rotaData.municipio_id - Municipality ID
 * @param {number} rotaData.motorista_id - Driver ID
 * @returns {Promise<Object>} Created route
 */
export const createRota = async (rotaData) => {
  return apiPost('/rotas', rotaData);
};

/**
 * Update a route
 * @param {number} rotaId - Route ID
 * @param {Object} rotaData - Updated route data
 * @returns {Promise<Object>} Updated route
 */
export const updateRota = async (rotaId, rotaData) => {
  return apiPut(`/rotas/${rotaId}`, rotaData);
};

/**
 * Delete a route
 * @param {number} rotaId - Route ID
 * @returns {Promise<Object>} Success message
 */
export const deleteRota = async (rotaId) => {
  return apiDelete(`/rotas/${rotaId}`);
};

/**
 * Get routes for a specific student
 * @param {number} alunoId - Student ID
 * @returns {Promise<Array>} List of routes
 */
export const getRotasByAluno = async (alunoId) => {
  return apiGet(`/rotas/aluno/${alunoId}`);
};

/**
 * Assign a student to a route
 * @param {number} alunoId - Student ID
 * @param {number} rotaId - Route ID
 * @returns {Promise<Object>} Assignment data
 */
export const assignAlunoToRota = async (alunoId, rotaId) => {
  return apiPost('/rotas/alunos', {aluno_id: alunoId, rota_id: rotaId});
};

/**
 * Remove a student from a route
 * @param {number} alunoId - Student ID
 * @param {number} rotaId - Route ID
 * @returns {Promise<Object>} Success message
 */
export const removeAlunoFromRota = async (alunoId, rotaId) => {
  return apiDelete(`/rotas/alunos/${alunoId}/${rotaId}`);
};

/**
 * Get students assigned to a route
 * @param {number} rotaId - Route ID
 * @returns {Promise<Array>} List of students
 */
export const getAlunosByRota = async (rotaId) => {
  return apiGet(`/rotas/${rotaId}/alunos`);
};


