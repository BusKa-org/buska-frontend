/**
 * Attendance Service
 * Handles student attendance/confirmation operations using Axios API
 */

import { api } from '../api/client';

/**
 * Get attendance records for a trip
 * @param {string} viagemId - Trip ID
 * @returns {Promise<Array>} List of attendance records
 */
export const getPresencasByViagem = async (viagemId) => {
  const response = await api.get(`/presencas/viagem/${viagemId}`);
  return response.data;
};

/**
 * Get attendance records for a student
 * @param {string} alunoId - Student ID
 * @returns {Promise<Array>} List of attendance records
 */
export const getPresencasByAluno = async (alunoId) => {
  const response = await api.get(`/presencas/aluno/${alunoId}`);
  return response.data;
};

/**
 * Confirm attendance for a student
 * @param {string} alunoId - Student ID
 * @param {string} viagemId - Trip ID
 * @returns {Promise<Object>} Attendance record
 */
export const confirmarPresenca = async (alunoId, viagemId) => {
  const response = await api.post('/presencas', {
    aluno_id: alunoId,
    viagem_id: viagemId,
    confirmada: true,
  });
  return response.data;
};

/**
 * Cancel attendance for a student
 * @param {string} alunoId - Student ID
 * @param {string} viagemId - Trip ID
 * @returns {Promise<Object>} Updated attendance record
 */
export const cancelarPresenca = async (alunoId, viagemId) => {
  const response = await api.patch(`/presencas/${alunoId}/${viagemId}`, {
    cancelada: true,
    confirmada: false,
  });
  return response.data;
};

/**
 * Update attendance status
 * @param {string} alunoId - Student ID
 * @param {string} viagemId - Trip ID
 * @param {Object} status - Status data
 * @param {boolean} [status.confirmada] - Confirmed status
 * @param {boolean} [status.cancelada] - Cancelled status
 * @returns {Promise<Object>} Updated attendance record
 */
export const updatePresenca = async (alunoId, viagemId, status) => {
  const response = await api.put(`/presencas/${alunoId}/${viagemId}`, status);
  return response.data;
};

/**
 * Get confirmed students for a trip
 * @param {string} viagemId - Trip ID
 * @returns {Promise<Array>} List of confirmed students
 */
export const getAlunosConfirmados = async (viagemId) => {
  const response = await api.get(`/presencas/viagem/${viagemId}/confirmados`);
  return response.data;
};

export default {
  getPresencasByViagem,
  getPresencasByAluno,
  confirmarPresenca,
  cancelarPresenca,
  updatePresenca,
  getAlunosConfirmados,
};
