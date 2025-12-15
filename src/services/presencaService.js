import {apiGet, apiPost, apiPut, apiPatch} from '../utils/api';

/**
 * Attendance Service
 * Handles student attendance/confirmation operations
 */

/**
 * Get attendance records for a trip
 * @param {number} viagemId - Trip ID
 * @returns {Promise<Array>} List of attendance records
 */
export const getPresencasByViagem = async (viagemId) => {
  return apiGet(`/presencas/viagem/${viagemId}`);
};

/**
 * Get attendance records for a student
 * @param {number} alunoId - Student ID
 * @returns {Promise<Array>} List of attendance records
 */
export const getPresencasByAluno = async (alunoId) => {
  return apiGet(`/presencas/aluno/${alunoId}`);
};

/**
 * Confirm attendance for a student
 * @param {number} alunoId - Student ID
 * @param {number} viagemId - Trip ID
 * @returns {Promise<Object>} Attendance record
 */
export const confirmarPresenca = async (alunoId, viagemId) => {
  return apiPost('/presencas', {
    aluno_id: alunoId,
    viagem_id: viagemId,
    confirmada: true,
  });
};

/**
 * Cancel attendance for a student
 * @param {number} alunoId - Student ID
 * @param {number} viagemId - Trip ID
 * @returns {Promise<Object>} Updated attendance record
 */
export const cancelarPresenca = async (alunoId, viagemId) => {
  return apiPatch(`/presencas/${alunoId}/${viagemId}`, {
    cancelada: true,
    confirmada: false,
  });
};

/**
 * Update attendance status
 * @param {number} alunoId - Student ID
 * @param {number} viagemId - Trip ID
 * @param {Object} status - Status data
 * @param {boolean} [status.confirmada] - Confirmed status
 * @param {boolean} [status.cancelada] - Cancelled status
 * @returns {Promise<Object>} Updated attendance record
 */
export const updatePresenca = async (alunoId, viagemId, status) => {
  return apiPut(`/presencas/${alunoId}/${viagemId}`, status);
};

/**
 * Get confirmed students for a trip
 * @param {number} viagemId - Trip ID
 * @returns {Promise<Array>} List of confirmed students
 */
export const getAlunosConfirmados = async (viagemId) => {
  return apiGet(`/presencas/viagem/${viagemId}/confirmados`);
};


