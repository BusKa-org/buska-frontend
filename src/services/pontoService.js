import {apiGet, apiPost, apiPut, apiDelete} from '../utils/api';

/**
 * Points Service
 * Handles pickup point operations
 */

/**
 * Get all points for a route
 * @param {number} rotaId - Route ID
 * @returns {Promise<Array>} List of points
 */
export const getPontosByRota = async (rotaId) => {
  return apiGet(`/pontos/rota/${rotaId}`);
};

/**
 * Get a single point by ID
 * @param {number} pontoId - Point ID
 * @returns {Promise<Object>} Point data
 */
export const getPonto = async (pontoId) => {
  return apiGet(`/pontos/${pontoId}`);
};

/**
 * Create a new point
 * @param {Object} pontoData - Point data
 * @param {string} pontoData.nome - Point name
 * @param {number} pontoData.rota_id - Route ID
 * @param {number} pontoData.latitude - Latitude
 * @param {number} pontoData.longitude - Longitude
 * @returns {Promise<Object>} Created point
 */
export const createPonto = async (pontoData) => {
  return apiPost('/pontos', pontoData);
};

/**
 * Update a point
 * @param {number} pontoId - Point ID
 * @param {Object} pontoData - Updated point data
 * @returns {Promise<Object>} Updated point
 */
export const updatePonto = async (pontoId, pontoData) => {
  return apiPut(`/pontos/${pontoId}`, pontoData);
};

/**
 * Delete a point
 * @param {number} pontoId - Point ID
 * @returns {Promise<Object>} Success message
 */
export const deletePonto = async (pontoId) => {
  return apiDelete(`/pontos/${pontoId}`);
};

/**
 * Update multiple points for a route
 * @param {number} rotaId - Route ID
 * @param {Array} pontos - Array of point data
 * @returns {Promise<Object>} Success message
 */
export const updatePontosRota = async (rotaId, pontos) => {
  return apiPut(`/pontos/rota/${rotaId}`, {pontos});
};


