/**
 * Routes Service
 * Handles route-related operations using Axios API
 */

import { api } from '../api/client';

/**
 * Get all routes
 * @param {Object} [filters] - Optional filters
 * @param {string} [filters.municipio_id] - Filter by municipality
 * @param {string} [filters.motorista_id] - Filter by driver
 * @returns {Promise<Array>} List of routes
 */
export const getRotas = async (filters = {}) => {
  const params = {};
  if (filters.municipio_id) params.municipio_id = filters.municipio_id;
  if (filters.motorista_id) params.motorista_id = filters.motorista_id;
  
  const response = await api.get('/rotas/', { params });
  return response.data;
};

/**
 * Get a single route by ID
 * @param {string} rotaId - Route ID
 * @returns {Promise<Object>} Route data
 */
export const getRota = async (rotaId) => {
  const response = await api.get(`/rotas/${rotaId}`);
  return response.data;
};

/**
 * Create a new route
 * @param {Object} rotaData - Route data
 * @param {string} rotaData.nome - Route name
 * @param {string} [rotaData.municipio_id] - Municipality ID
 * @param {string} [rotaData.motorista_id] - Driver ID
 * @returns {Promise<Object>} Created route
 */
export const createRota = async (rotaData) => {
  const response = await api.post('/rotas/', rotaData);
  return response.data;
};

/**
 * Update a route
 * @param {string} rotaId - Route ID
 * @param {Object} rotaData - Updated route data
 * @returns {Promise<Object>} Updated route
 */
export const updateRota = async (rotaId, rotaData) => {
  const response = await api.put(`/rotas/${rotaId}`, rotaData);
  return response.data;
};

/**
 * Delete a route
 * @param {string} rotaId - Route ID
 * @returns {Promise<Object>} Success message
 */
export const deleteRota = async (rotaId) => {
  const response = await api.delete(`/rotas/${rotaId}`);
  return response.data;
};

/**
 * Get routes for a specific student
 * @param {string} alunoId - Student ID
 * @returns {Promise<Array>} List of routes
 */
export const getRotasByAluno = async (alunoId) => {
  const response = await api.get(`/rotas/aluno/${alunoId}`);
  return response.data;
};

/**
 * Assign a student to a route
 * @param {string} alunoId - Student ID
 * @param {string} rotaId - Route ID
 * @returns {Promise<Object>} Assignment data
 */
export const assignAlunoToRota = async (alunoId, rotaId) => {
  const response = await api.post('/rotas/alunos', { aluno_id: alunoId, rota_id: rotaId });
  return response.data;
};

/**
 * Remove a student from a route
 * @param {string} alunoId - Student ID
 * @param {string} rotaId - Route ID
 * @returns {Promise<Object>} Success message
 */
export const removeAlunoFromRota = async (alunoId, rotaId) => {
  const response = await api.delete(`/rotas/alunos/${alunoId}/${rotaId}`);
  return response.data;
};

/**
 * Get students assigned to a route
 * @param {string} rotaId - Route ID
 * @returns {Promise<Array>} List of students
 */
export const getAlunosByRota = async (rotaId) => {
  const response = await api.get(`/rotas/${rotaId}/alunos`);
  return response.data;
};

export default {
  getRotas,
  getRota,
  createRota,
  updateRota,
  deleteRota,
  getRotasByAluno,
  assignAlunoToRota,
  removeAlunoFromRota,
  getAlunosByRota,
};
