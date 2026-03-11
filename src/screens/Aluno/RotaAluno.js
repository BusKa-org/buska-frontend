import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { alunoService } from '../../services';
import * as rotaService from '../../services/rotaService';
import * as veiculoService from '../../services/veiculoService';
import { colors, spacing, borderRadius, shadows, textStyles } from '../../theme';
import Icon, { IconNames } from '../../components/Icon';
import { useToast } from '../../components/Toast';

const RotaAluno = ({navigation, route}) => {
  const rota = route?.params?.rota; // Can be null to show all trips
  const toast = useToast();
  const [viagens, setViagens] = useState([]);
  const [presencasStatus, setPresencasStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingPresenca, setUpdatingPresenca] = useState(null);
  const [capacidadesRotas, setCapacidadesRotas] = useState({});
  const [alunosInfo, setAlunosInfo] = useState({
    totalAlunos: 0,
    alunosConfirmados: 0,
    capacidadeTotal: 0,
    vagasDisponiveis: 0,
    temEspaco: true,
  });
  const isMountedRef = useRef(true);

  const isAllTrips = !rota; // Show all trips mode
  const screenTitle = isAllTrips ? 'Minhas Viagens' : rota.nome;

  const loadViagens = async () => {
    try {
      const todasViagens = await alunoService.listarViagens();
      
      // Filter by route if a specific route is provided, otherwise show all
      const viagensFiltradas = isAllTrips 
        ? todasViagens 
        : todasViagens.filter((v) => v.rota_id === rota.id);
      
      setViagens(viagensFiltradas || []);
      
      // Use status_confirmacao from the agenda response directly
      const statusMap = {};
      viagensFiltradas.forEach((viagem) => {
        statusMap[viagem.id] = viagem.status_confirmacao || false;
      });
      setPresencasStatus(statusMap);
    } catch (error) {
      toast.error('Não foi possível carregar as viagens.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadViagens();
    return () => { isMountedRef.current = false; };
  }, [rota?.id]);

  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      if (isMountedRef.current) loadViagens();
    });
    return unsubscribe;
  }, [navigation, rota?.id]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Confirmado':
        return { color: colors.success.main, bg: colors.success.light, icon: IconNames.checkCircle };
      case 'Não confirmado':
        return { color: colors.warning.main, bg: colors.warning.light, icon: IconNames.warning };
      case 'Encerrada':
        return { color: colors.text.secondary, bg: colors.neutral[100], icon: IconNames.checkCircle };
      case 'Cancelada':
        return { color: colors.error.main, bg: colors.error.light, icon: IconNames.error };
      default:
        return { color: colors.text.hint, bg: colors.neutral[100], icon: IconNames.info };
    }
  };

  const handleConfirmarPresenca = async (viagem, currentStatus) => {
    try {
      setUpdatingPresenca(viagem.id);
      const novoStatus = currentStatus !== 'Confirmado';
      
      // Get boarding point ID
      let pontoEmbarqueId = viagem.ponto_embarque_id;
      
      if (novoStatus && !pontoEmbarqueId && viagem.rota_id) {
        try {
          const pontos = await alunoService.listarPontosRota(viagem.rota_id);
          if (pontos && pontos.length > 0) {
            pontoEmbarqueId = pontos[0].id;
          }
        } catch (e) {
          toast.error(`Erro ao buscar pontos da rota: ${e.message || 'erro desconhecido'}`);
          return;
        }
      }
      
      if (novoStatus && !pontoEmbarqueId) {
        toast.error(`Nenhum ponto de embarque disponível. Rota ID: ${viagem.rota_id || 'não definido'}`);
        return;
      }
      
      await alunoService.alterarPresencaViagem(viagem.id, novoStatus, pontoEmbarqueId);
      
      // Reload data from backend to get fresh status
      await loadViagens();
      
      toast.success(novoStatus ? 'Presença confirmada!' : 'Presença cancelada.');
    } catch (error) {
      const errorMessage = error?.message || error?.error || 'Não foi possível atualizar a presença.';
      toast.error(errorMessage);
    } finally {
      setUpdatingPresenca(null);
    }
  };

  const viagem = viagens && viagens.length > 0 ? viagens[0] : null;

  useEffect(() => {
    const calcularLotacaoDoVeiculo = async () => {
      if (!viagem) {
        setAlunosInfo({
          totalAlunos: 0,
          alunosConfirmados: 0,
          capacidadeTotal: 0,
          vagasDisponiveis: 0,
          temEspaco: true,
        });
        return;
      }
      
      const confirmados = viagem.alunos_confirmados_count || 0;
      const inscritos = viagem.total_alunos || 0;
      let capacidadeDoVeiculo = inscritos; 

      try {
        console.log(viagem);
        if (viagem.rota_id) {
          const rota = await rotaService.getRota(viagem.rota_id);
          console.log(rota);
          if (rota && rota.veiculo_id) {
            const veiculo = await veiculoService.getVeiculo(rota.veiculo_id);
            
            console.log(veiculo);
            if (veiculo && veiculo.capacidade) {
              capacidadeDoVeiculo = veiculo.capacidade;
            }
          }
        }
      } catch (error) {
        console.error("Erro ao calcular lotação", error);
      }

      const vagasRestantes = capacidadeDoVeiculo - confirmados;
      const aindaTemEspaco = confirmados < capacidadeDoVeiculo;

      setAlunosInfo({
        totalAlunos: inscritos,
        alunosConfirmados: confirmados,
        capacidadeTotal: capacidadeDoVeiculo,
        vagasDisponiveis: vagasRestantes > 0 ? vagasRestantes : 0,
        temEspaco: aindaTemEspaco,
      });
    };

    calcularLotacaoDoVeiculo();
  }, [viagem]);

  const podeConfirmar = (viagem) => {
    const isConfirmed = presencasStatus[viagem.id] ?? viagem.status_confirmacao;

    if (viagens && viagens.length > 0 && viagem.id === viagens[0].id) {
      if (!isConfirmed && !alunosInfo.temEspaco) {
        return false; 
      }
    }

    if (capacidadesRotas[viagem.rota_id] === false) return false;
    if (!viagem.data) return true;

    const [year, month, day] = viagem.data.split('-').map(Number);
    const tripDate = new Date(year, month - 1, day); 
    
    if (isNaN(tripDate.getTime())) return true;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tripDate >= today;
  };

  const getStatusFromViagem = (viagem) => {
    // Check local state first (for optimistic updates after confirm action)
    // Then fall back to status_confirmacao from backend
    const isConfirmed = presencasStatus[viagem.id] ?? viagem.status_confirmacao;
    return isConfirmed ? 'Confirmado' : 'Não confirmado';
  };

  const formatTime = (t) => t ? (t.includes('T') ? t.substring(11, 16) : t.substring(0, 5)) : '--:--';
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '';

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary.main} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name={IconNames.back} size="md" color={colors.secondary.contrast} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>{screenTitle}</Text>
            <Text style={styles.headerSubtitle}>{viagens.length} viagem{viagens.length !== 1 ? 'ns' : ''}</Text>
          </View>
          <View style={styles.headerIcon}>
            <Icon name={IconNames.route} size="lg" color={colors.secondary.contrast} />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadViagens(); }}
            colors={[colors.secondary.main]} tintColor={colors.secondary.main} />
        }>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Viagens</Text>

          {viagens.length > 0 ? viagens.map((viagem) => {
            const status = getStatusFromViagem(viagem);
            const statusConfig = getStatusConfig(status);
            const isUpdating = updatingPresenca === viagem.id;

            return (
              <View key={viagem.id} style={styles.viagemCard}>
                <View style={styles.viagemHeader}>
                  <View style={styles.viagemInfo}>
                    <View style={styles.viagemTipoContainer}>
                      <View style={styles.tipoBadge}>
                        <Text style={styles.viagemTipo}>{viagem.tipo}</Text>
                      </View>
                      <Text style={styles.viagemHorario}>{formatTime(viagem.horario_inicio)}</Text>
                    </View>
                    <View style={styles.dateRow}>
                      <Icon name={IconNames.calendarToday} size="sm" color={colors.text.secondary} />
                      <Text style={styles.viagemData}>{formatDate(viagem.data)}</Text>
                    </View>
                    {isAllTrips && viagem.rota_nome && (
                      <View style={styles.dateRow}>
                        <Icon name={IconNames.route} size="sm" color={colors.text.secondary} />
                        <Text style={styles.viagemData}>{viagem.rota_nome}</Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    <Icon name={statusConfig.icon} size="xs" color={statusConfig.color} />
                    <Text style={[styles.statusText, { color: statusConfig.color }]}>{status}</Text>
                  </View>
                </View>

                {podeConfirmar(viagem) && (
                  <TouchableOpacity
                    style={[
                      styles.confirmarButton,
                      status === 'Confirmado' && styles.confirmarButtonActive,
                      isUpdating && styles.confirmarButtonDisabled,
                    ]}
                    onPress={() => handleConfirmarPresenca(viagem, status)}
                    disabled={isUpdating}>
                    {isUpdating ? (
                      <ActivityIndicator color={colors.primary.contrast} />
                    ) : (
                      <>
                        <Icon 
                          name={status === 'Confirmado' ? IconNames.close : IconNames.checkCircle} 
                          size="md" 
                          color={colors.primary.contrast} 
                        />
                        <Text style={styles.confirmarButtonText}>
                          {status === 'Confirmado' ? 'Cancelar Presença' : 'Confirmar Presença'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.detalhesButton}
                  onPress={() => navigation.navigate('DetalheViagem', { 
                    rota: rota || { id: viagem.rota_id, nome: viagem.rota_nome }, 
                    viagem 
                  })}>
                  <Text style={styles.detalhesButtonText}>Ver Detalhes</Text>
                  <Icon name={IconNames.chevronRight} size="md" color={colors.secondary.main} />
                </TouchableOpacity>
              </View>
            );
          }) : (
            <View style={styles.emptyState}>
              <Icon name={IconNames.schedule} size="huge" color={colors.neutral[300]} />
              <Text style={styles.emptyStateText}>
                {isAllTrips 
                  ? 'Nenhuma viagem agendada nas suas rotas' 
                  : 'Nenhuma viagem encontrada para esta rota'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  header: {
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: { ...textStyles.h3, color: colors.secondary.contrast },
  headerSubtitle: {
    ...textStyles.bodySmall,
    color: colors.secondary.light,
    marginTop: spacing.xs,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: { flex: 1 },
  content: { padding: spacing.base },
  sectionTitle: { ...textStyles.h4, color: colors.text.primary, marginBottom: spacing.base },
  viagemCard: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  viagemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.base },
  viagemInfo: { flex: 1 },
  viagemTipoContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  tipoBadge: {
    backgroundColor: colors.secondary.lighter,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },
  viagemTipo: { ...textStyles.caption, color: colors.secondary.dark, fontWeight: '600' },
  viagemHorario: { ...textStyles.h3, color: colors.text.primary },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  viagemData: { ...textStyles.bodySmall, color: colors.text.secondary },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  statusText: { ...textStyles.caption, fontWeight: '600' },
  confirmarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  confirmarButtonActive: { backgroundColor: colors.error.main },
  confirmarButtonDisabled: { opacity: 0.6 },
  confirmarButtonText: { ...textStyles.button, color: colors.primary.contrast },
  detalhesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  detalhesButtonText: { ...textStyles.bodySmall, color: colors.secondary.main, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', padding: spacing.xxl, gap: spacing.base },
  emptyStateText: { ...textStyles.body, color: colors.text.secondary, textAlign: 'center' },
});

export default RotaAluno;
