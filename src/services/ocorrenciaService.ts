import { api } from '../api/client';
import type {
  OcorrenciaCreateRequest,
  OcorrenciaResponse,
} from '../types';

export const criarOcorrencia = async (
  data: OcorrenciaCreateRequest,
): Promise<OcorrenciaResponse> => {
  const response = await api.post<OcorrenciaResponse>('/ocorrencias', data);
  return response.data;
};

export const listarOcorrencias = async (
  status?: 'ABERTA' | 'RESOLVIDA',
): Promise<OcorrenciaResponse[]> => {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  const response = await api.get<OcorrenciaResponse[]>('/ocorrencias', { params });
  return response.data;
};

export const resolverOcorrencia = async (
  ocorrenciaId: string,
): Promise<OcorrenciaResponse> => {
  const response = await api.patch<OcorrenciaResponse>(
    `/ocorrencias/${ocorrenciaId}/resolver`,
  );
  return response.data;
};

const ocorrenciaService = {
  criarOcorrencia,
  listarOcorrencias,
  resolverOcorrencia,
};

export default ocorrenciaService;
