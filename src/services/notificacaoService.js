/**
 * Notifications Service
 * Handles notification operations using Axios API
 */

import api from './api';

/**
 * Get notifications for current user
 * @param {Object} [filters] - Optional filters
 * @param {boolean} [filters.enviada] - Filter by sent status
 * @returns {Promise<Array>} List of notifications
 */
export const getNotificacoes = async (filters = {}) => {
  const params = {};
  if (filters.enviada !== undefined) {
    params.enviada = filters.enviada;
  }
  
  const response = await api.get('/notificacoes', { params });
  return response.data;
};

/**
 * Get a single notification by ID
 * @param {string} notificacaoId - Notification ID
 * @returns {Promise<Object>} Notification data
 */
export const getNotificacao = async (notificacaoId) => {
  const response = await api.get(`/notificacoes/${notificacaoId}`);
  return response.data;
};

/**
 * Create a new notification
 * @param {Object} notificacaoData - Notification data
 * @param {string} notificacaoData.usuario_id - User ID
 * @param {string} notificacaoData.titulo - Notification title
 * @param {string} notificacaoData.mensagem - Notification message
 * @returns {Promise<Object>} Created notification
 */
export const createNotificacao = async (notificacaoData) => {
  const response = await api.post('/notificacoes', notificacaoData);
  return response.data;
};

/**
 * Mark notification as read/sent
 * @param {string} notificacaoId - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
export const markNotificacaoAsSent = async (notificacaoId) => {
  const response = await api.patch(`/notificacoes/${notificacaoId}/lida`);
  return response.data;
};

/**
 * Update notification settings for user
 * @param {string} usuarioId - User ID
 * @param {Object} settings - Notification settings
 * @returns {Promise<Object>} Updated settings
 */
export const updateNotificacaoSettings = async (usuarioId, settings) => {
  const response = await api.put(`/notificacoes/usuario/${usuarioId}/settings`, settings);
  return response.data;
};

export default {
  getNotificacoes,
  getNotificacao,
  createNotificacao,
  markNotificacaoAsSent,
  updateNotificacaoSettings,
};
