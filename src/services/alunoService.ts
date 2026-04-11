import { api } from '../api/client';
import type {
  RotaListResponse,
  RotaDetailResponse,
  RotaHorarioListResponse,
  ViagemAgendaAlunoResponse,
  ViagemAgendaAlunoListResponse,
  ViagemAlunoConfirmacaoResponse,
  PontoFlatResponse,
  PontoFlatListResponse,
  AlunoMeUpdateRequest,
  AlunoResponse,
} from '../types';
import { unwrapItems } from '../types';

// Normalized UI representation of a ViagemAgendaAlunoResponse
export type ViagemAgendaUI = {
  id: string | undefined;
  data: string | undefined;
  dia_semana: string | undefined;
  horario_inicio: string | undefined;
  tipo: string | undefined;
  rota_id: string | undefined;
  rota_nome: string | undefined;
  status_confirmacao: boolean | undefined;
  ponto_embarque_id: string | undefined;
  /** Trip operational status (AGENDADA | EM_ANDAMENTO | FINALIZADA | CANCELADA) */
  status_viagem: string | undefined;
  alunos_confirmados_count: number;
  total_alunos: number;
};

function normalizeViagemAgenda(viagem: ViagemAgendaAlunoResponse): ViagemAgendaUI {
  const raw = viagem as Record<string, unknown>;
  return {
    id: viagem.viagem_id,
    data: viagem.data,
    dia_semana: viagem.dia_semana,
    horario_inicio: viagem.horario_saida,
    tipo: viagem.sentido,
    rota_id: viagem.rota_id,
    rota_nome: viagem.rota_nome,
    status_confirmacao: viagem.status_confirmacao,
    ponto_embarque_id: viagem.ponto_embarque_id,
    status_viagem: (raw.status_viagem as string) ?? 'AGENDADA',
    alunos_confirmados_count: (raw.alunos_confirmados_count as number) ?? 0,
    total_alunos: (raw.total_alunos as number) ?? 0,
  };
}

export const alunoService = {
  /**
   * List all available routes
   * Backend: GET /v1/rotas/
   * Note: Backend filters by role - ALUNOs see routes they can subscribe to
   */
  async listarRotas(): Promise<RotaListResponse> {
    const response = await api.get<RotaListResponse>('/rotas/');
    return response.data;
  },

  /**
   * List routes the student is enrolled in
   * Backend: GET /v1/rotas/me
   */
  async listarMinhasRotas(): Promise<RotaListResponse> {
    const response = await api.get<RotaListResponse>('/rotas/me');
    return response.data;
  },

  /**
   * Get route details with points
   * Backend: GET /v1/rotas/{id}
   */
  async obterRota(rotaId: string): Promise<RotaDetailResponse> {
    const response = await api.get<RotaDetailResponse>(`/rotas/${rotaId}`);
    return response.data;
  },

  /**
   * Subscribe or unsubscribe from a route
   * Backend: POST /v1/rotas/{id}/inscricao
   * @param {string} rotaId - Route UUID
   * @param {string} acao - 'inscrever' or 'desinscrever'
   */
  async gerenciarInscricaoRota(
    rotaId: string,
    acao: 'inscrever' | 'desinscrever',
  ): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/rotas/${rotaId}/inscricao`, { acao });
    return response.data;
  },

  /**
   * List upcoming trips for student agenda
   * Backend: GET /v1/viagens/aluno/agenda
   * Normalizes backend response to frontend format
   */
  async listarViagens(): Promise<ViagemAgendaUI[]> {
    const response = await api.get<ViagemAgendaAlunoListResponse>('/viagens/aluno/agenda');
    return unwrapItems(response.data).map(normalizeViagemAgenda);
  },

  /**
   * List trips the student has confirmed presence
   * Uses same endpoint as listarViagens
   */
  async listarMinhasViagens(): Promise<ViagemAgendaUI[]> {
    return this.listarViagens();
  },

  /**
   * Get boarding points for a trip
   * Backend: GET /v1/viagens/{id}/pontos-embarque
   */
  async listarPontosEmbarque(viagemId: string): Promise<PontoFlatListResponse> {
    if (!viagemId) {
      return { items: [], total: 0 };
    }
    try {
      const response = await api.get<PontoFlatListResponse>(`/viagens/${viagemId}/pontos-embarque`);
      return response.data;
    } catch {
      return { items: [], total: 0 };
    }
  },

  /**
   * TODO: This endpoint is not right
   * Get presence/confirmation status for a trip
   */
  async obterPresencaViagem(
    viagemId: string,
  ): Promise<{ presente: boolean; ponto_embarque?: unknown }> {
    if (!viagemId) {
      return { presente: false };
    }
    try {
      // TODO: this endpoint returns PontoFlatListResponse per the spec —
      // confirm with backend whether confirmado/ponto_embarque fields exist here
      const response = await api.get<{ confirmado?: boolean; ponto_embarque?: unknown }>(
        `/viagens/${viagemId}/pontos-embarque`,
      );
      return {
        presente: response.data.confirmado ?? false,
        ponto_embarque: response.data.ponto_embarque,
      };
    } catch {
      return { presente: false };
    }
  },

  /**
   * Confirm or cancel presence in a trip
   * Backend: PUT /v1/viagens/{id}/confirmacao
   * @param {string} viagemId - Trip UUID
   * @param {boolean} confirmacao - Whether to confirm (true) or cancel (false)
   * @param {string} pontoEmbarqueId - Boarding point UUID (required for confirmation)
   */
  async alterarPresencaViagem(
    viagemId: string,
    confirmacao: boolean,
    pontoEmbarqueId: string | null = null,
  ): Promise<ViagemAlunoConfirmacaoResponse> {
    if (!viagemId) {
      throw new Error('ID da viagem é obrigatório');
    }
    const payload: { confirmacao: boolean; ponto_embarque_id?: string } = { confirmacao };
    if (confirmacao && pontoEmbarqueId) {
      payload.ponto_embarque_id = pontoEmbarqueId;
    }
    const response = await api.put<ViagemAlunoConfirmacaoResponse>(
      `/viagens/${viagemId}/confirmacao`,
      payload,
    );

    return response.data;
  },

  /**
   * List all points for a route
   * Backend: GET /v1/rotas/{id}/pontos
   */
  async listarPontosRota(rotaId: string): Promise<PontoFlatListResponse> {
    if (!rotaId) {
      return { items: [], total: 0 };
    }
    const response = await api.get<PontoFlatListResponse>(`/rotas/${rotaId}/pontos`);
    return response.data;
  },

  /**
   * Get route schedules
   * Backend: GET /v1/rotas/{id}/horarios
   */
  async listarHorariosRota(rotaId: string): Promise<RotaHorarioListResponse> {
    const response = await api.get<RotaHorarioListResponse>(`/rotas/${rotaId}/horarios`);
    return response.data;
  },

  /**
   * Update student profile
   * Backend: PUT /v1/alunos/me
   */
  async atualizarPerfil(dados: AlunoMeUpdateRequest): Promise<AlunoResponse> {
    const response = await api.put<AlunoResponse>('/alunos/me', dados);
    return response.data;
  },
};
