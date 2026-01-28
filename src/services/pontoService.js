/**
 * Points Service
 * Handles pickup point operations using Axios API
 */

import api from './api';

/**
 * Get all points for a route
 * @param {string} rotaId - Route ID
 * @returns {Promise<Array>} List of points
 */
export const getPontosByRota = async (rotaId) => {
  const response = await api.get(`/pontos/rota/${rotaId}`);
  return response.data;
};

/**
 * Get a single point by ID
 * @param {string} pontoId - Point ID
 * @returns {Promise<Object>} Point data
 */
export const getPonto = async (pontoId) => {
  const response = await api.get(`/pontos/${pontoId}`);
  return response.data;
};

/**
 * Create a new point
 * @param {Object} pontoData - Point data
 * @param {string} pontoData.nome - Point name
 * @param {string} pontoData.rota_id - Route ID
 * @param {number} pontoData.latitude - Latitude
 * @param {number} pontoData.longitude - Longitude
 * @returns {Promise<Object>} Created point
 */
export const createPonto = async (pontoData) => {
  const response = await api.post('/pontos', pontoData);
  return response.data;
};

/**
 * Update a point
 * @param {string} pontoId - Point ID
 * @param {Object} pontoData - Updated point data
 * @returns {Promise<Object>} Updated point
 */
export const updatePonto = async (pontoId, pontoData) => {
  const response = await api.put(`/pontos/${pontoId}`, pontoData);
  return response.data;
};

/**
 * Delete a point
 * @param {string} pontoId - Point ID
 * @returns {Promise<Object>} Success message
 */
export const deletePonto = async (pontoId) => {
  const response = await api.delete(`/pontos/${pontoId}`);
  return response.data;
};

/**
 * Update multiple points for a route
 * @param {string} rotaId - Route ID
 * @param {Array} pontos - Array of point data
 * @returns {Promise<Object>} Success message
 */
export const updatePontosRota = async (rotaId, pontos) => {
  const response = await api.put(`/pontos/rota/${rotaId}`, { pontos });
  return response.data;
};

export default {
  getPontosByRota,
  getPonto,
  createPonto,
  updatePonto,
  deletePonto,
  updatePontosRota,
};
