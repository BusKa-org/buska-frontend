import {apiGet, apiPost, apiPut, apiPatch} from '../utils/api';

/**
 * Notifications Service
 * Handles notification operations
 */

/**
 * Get notifications for current user
 * @param {Object} [filters] - Optional filters
 * @param {boolean} [filters.enviada] - Filter by sent status
 * @returns {Promise<Array>} List of notifications
 */
export const getNotificacoes = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  if (filters.enviada !== undefined) {
    queryParams.append('enviada', filters.enviada);
  }
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `/notificacoes?${queryString}` : '/notificacoes';
  
  return apiGet(endpoint);
};

/**
 * Get a single notification by ID
 * @param {number} notificacaoId - Notification ID
 * @returns {Promise<Object>} Notification data
 */
export const getNotificacao = async (notificacaoId) => {
  return apiGet(`/notificacoes/${notificacaoId}`);
};

/**
 * Create a new notification
 * @param {Object} notificacaoData - Notification data
 * @param {number} notificacaoData.usuario_id - User ID
 * @param {string} notificacaoData.titulo - Notification title
 * @param {string} notificacaoData.mensagem - Notification message
 * @returns {Promise<Object>} Created notification
 */
export const createNotificacao = async (notificacaoData) => {
  return apiPost('/notificacoes', notificacaoData);
};

/**
 * Mark notification as read/sent
 * @param {number} notificacaoId - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
export const markNotificacaoAsSent = async (notificacaoId) => {
  return apiPatch(`/notificacoes/${notificacaoId}`, {enviada: true});
};

/**
 * Update notification settings for user
 * @param {number} usuarioId - User ID
 * @param {Object} settings - Notification settings
 * @returns {Promise<Object>} Updated settings
 */
export const updateNotificacaoSettings = async (usuarioId, settings) => {
  return apiPut(`/notificacoes/usuario/${usuarioId}/settings`, settings);
};


