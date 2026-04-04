import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { alunoService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, borderRadius, shadows, textStyles } from '../../theme';
import { Icon, IconNames, LoadingSpinner, EmptyState } from '../../components';
import { unwrapItems } from '../../types';

const DashboardAluno = ({navigation}) => {
  const [rotasCadastradas, setRotasCadastradas] = useState([]);
  const [proximaViagem, setProximaViagem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const getRoleLabel = (role) => {
    const roleMap = {
      'aluno': 'Aluno',
      'motorista': 'Motorista',
      'gestor': 'Gestor'
    };
    return roleMap[role] || role;
  };

  const getUserInfo = () => {
    const roleLabel = getRoleLabel(user?.role);
    const municipioInfo = user?.municipio 
      ? `${user.municipio.nome}${user.municipio.uf ? ` - ${user.municipio.uf}` : ''}`
      : '';
    return municipioInfo ? `${roleLabel} • ${municipioInfo}` : roleLabel;
  };

  const loadData = async () => {
    try {
      const rotas = await alunoService.listarMinhasRotas().then(unwrapItems);
      setRotasCadastradas(rotas);

      const todasViagens = await alunoService.listarViagens();
      
      if (todasViagens && todasViagens.length > 0 && rotas.length > 0) {
        const rotasIds = rotas.map(r => r.id);
        const viagensRotas = todasViagens.filter(v => rotasIds.includes(v.rota_id));
        
        const now = new Date();
        const upcomingTrips = viagensRotas
          .filter((v) => {
            try {
              const tripDate = new Date(v.data);
              const tripDateTime = v.horario_inicio 
                ? new Date(`${v.data}T${v.horario_inicio}`)
                : tripDate;
              return tripDateTime >= now;
            } catch (e) {
              return false;
            }
          })
          .sort((a, b) => {
            try {
              const dateA = new Date(`${a.data}T${a.horario_inicio || '00:00'}`);
              const dateB = new Date(`${b.data}T${b.horario_inicio || '00:00'}`);
              return dateA - dateB;
            } catch (e) {
              return 0;
            }
          });

        if (upcomingTrips.length > 0) {
          const nextTrip = upcomingTrips[0];
          
          // Use status_confirmacao directly from normalized trip data
          const presencaStatus = nextTrip.status_confirmacao ? 'Confirmado' : 'Não confirmado';
          
          setProximaViagem({
            // Include all trip data for navigation to DetalheViagem
            ...nextTrip,
            // Add formatted fields for display
            horario: nextTrip.horario_inicio
              ? nextTrip.horario_inicio.substring(0, 5)
              : '--:--',
            status: presencaStatus,
          });
        } else {
          setProximaViagem(null);
        }
      } else {
        setProximaViagem(null);
      }
    } catch (error) {
      // Silent fail - show empty state
      setProximaViagem(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner 
          fullScreen 
          message="Carregando suas informações..." 
          color={colors.secondary.main}
          accessibilityLabel="Carregando painel do aluno"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.secondary.main]}
            tintColor={colors.secondary.main}
          />
        }>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>
                Olá, {user?.nome || 'Aluno'}!
              </Text>
              <Text style={styles.subtitle}>
                {getUserInfo()}
              </Text>
            </View>
            <View style={styles.avatarContainer}>
              <Icon name={IconNames.person} size="xl" color={colors.primary.contrast} />
            </View>
          </View>
        </View>

        {/* Próxima Viagem Destacada */}
        {proximaViagem && (
          <View style={styles.proximaViagemCard}>
            <View style={styles.cardHeader}>
              <Icon name={IconNames.schedule} size="md" color={colors.secondary.light} />
              <Text style={styles.cardTitle}>Próxima Viagem</Text>
            </View>
            <View style={styles.viagemInfo}>
              <View style={styles.viagemHeader}>
                <Text style={styles.viagemHorario}>{proximaViagem.horario}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    proximaViagem.status === 'Confirmado'
                      ? styles.statusConfirmado
                      : styles.statusNaoConfirmado,
                  ]}>
                  <Icon 
                    name={proximaViagem.status === 'Confirmado' ? IconNames.checkCircle : IconNames.warning} 
                    size="xs" 
                    color={colors.text.inverse} 
                  />
                  <Text style={styles.statusText}>{proximaViagem.status}</Text>
                </View>
              </View>
              <Text style={styles.viagemRota}>
                {rotasCadastradas.find((r) => r.id === proximaViagem.rota_id)
                  ?.nome || 'Rota'}
              </Text>
              <Text style={styles.viagemTipo}>{proximaViagem.tipo}</Text>
            </View>
            <TouchableOpacity
              style={styles.verDetalhesButton}
              onPress={() => {
                const rotaViagem = rotasCadastradas.find(
                  (r) => r.id === proximaViagem.rota_id
                );
                if (rotaViagem) {
                  navigation.navigate('DetalheViagem', {
                    rota: rotaViagem,
                    viagem: proximaViagem,
                  });
                }
              }}>
              <Text style={styles.verDetalhesText}>Ver Detalhes</Text>
              <Icon name={IconNames.chevronRight} size="md" color={colors.primary.main} />
            </TouchableOpacity>
          </View>
        )}

        {/* Botões Rápidos */}
        <View style={styles.botoesRapidos}>
          <TouchableOpacity
            style={styles.botaoRapido}
            onPress={() => navigation.navigate('RotaAluno')}>
            <View style={[styles.botaoIconContainer, { backgroundColor: colors.secondary.lighter }]}>
              <Icon name={IconNames.bus} size="lg" color={colors.secondary.dark} />
            </View>
            <Text style={styles.botaoRapidoText}>Minhas Viagens</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botaoRapido, !proximaViagem && styles.botaoRapidoDisabled]}
            disabled={!proximaViagem}
            onPress={() => {
              if (proximaViagem) {
                const rotaViagem = rotasCadastradas.find(r => r.id === proximaViagem.rota_id);
                if (rotaViagem) {
                  navigation.navigate('LocalizacaoOnibus', { rota: rotaViagem, viagem: proximaViagem });
                }
              }
            }}>
            <View style={[styles.botaoIconContainer, { backgroundColor: colors.success.light }]}>
              <Icon name={IconNames.location} size="lg" color={colors.success.dark} />
            </View>
            <Text style={styles.botaoRapidoText}>Localização</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoRapido}
            onPress={() => navigation.navigate('Notificacoes')}>
            <View style={[styles.botaoIconContainer, { backgroundColor: colors.accent.light }]}>
              <Icon name={IconNames.notifications} size="lg" color={colors.accent.dark} />
            </View>
            <Text style={styles.botaoRapidoText}>Notificações</Text>
          </TouchableOpacity>
        </View>

        {/* Rotas Cadastradas */}
        <View style={styles.rotasSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rotas Cadastradas</Text>
            <TouchableOpacity
              style={styles.verTodasButton}
              onPress={() => navigation.navigate('SelecaoRotas')}>
              <Text style={styles.verTodasText}>Ver todas</Text>
              <Icon name={IconNames.chevronRight} size="sm" color={colors.secondary.main} />
            </TouchableOpacity>
          </View>

          {rotasCadastradas.length > 0 ? (
            rotasCadastradas.map((rota) => (
              <TouchableOpacity
                key={rota.id}
                style={styles.rotaCard}
                onPress={() => navigation.navigate('RotaAluno', {rota})}>
                <View style={styles.rotaIconContainer}>
                  <Icon name={IconNames.route} size="lg" color={colors.primary.main} />
                </View>
                <View style={styles.rotaInfo}>
                  <Text style={styles.rotaNome}>{rota.nome}</Text>
                  <Text style={styles.rotaBairro}>
                    {rota.municipio_nome 
                      ? `${rota.municipio_nome}${rota.municipio_uf ? ` - ${rota.municipio_uf}` : ''}`
                      : 'Município não informado'}
                  </Text>
                </View>
                <View style={styles.rotaStatus}>
                  <View style={styles.enrolledBadge}>
                    <Icon name={IconNames.checkCircle} size="xs" color={colors.success.main} />
                    <Text style={styles.rotaStatusText}>Cadastrado</Text>
                  </View>
                  <Icon name={IconNames.chevronRight} size="md" color={colors.neutral[400]} />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Icon name={IconNames.route} size="huge" color={colors.neutral[300]} />
              </View>
              <Text style={styles.emptyStateTitle}>Nenhuma rota cadastrada</Text>
              <Text style={styles.emptyStateText}>
                Você ainda não está inscrito em nenhuma rota de transporte escolar
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => navigation.navigate('SelecaoRotas')}>
                <Icon name={IconNames.add} size="md" color={colors.primary.contrast} />
                <Text style={styles.emptyStateButtonText}>
                  Ver rotas disponíveis
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Configurações */}
        <TouchableOpacity
          style={styles.configButton}
          onPress={() => navigation.navigate('ConfigNotificacoesAluno')}>
          <Icon name={IconNames.settings} size="base" color={colors.text.secondary} />
          <Text style={styles.configButtonText}>Configurações</Text>
          <Icon name={IconNames.chevronRight} size="md" color={colors.neutral[400]} />
        </TouchableOpacity>

        {/* Bottom spacing */}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  
  // Header
  header: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    ...textStyles.h2,
    color: colors.primary.contrast,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...textStyles.bodySmall,
    color: colors.secondary.light,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Próxima Viagem Card
  proximaViagemCard: {
    margin: spacing.base,
    marginTop: -spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.primary.lighter,
    borderRadius: borderRadius.xl,
    ...shadows.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...textStyles.caption,
    color: colors.secondary.light,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  viagemInfo: {
    marginBottom: spacing.base,
  },
  viagemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  viagemHorario: {
    ...textStyles.display2,
    color: colors.primary.contrast,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statusConfirmado: {
    backgroundColor: colors.success.main,
  },
  statusNaoConfirmado: {
    backgroundColor: colors.warning.main,
  },
  statusText: {
    ...textStyles.caption,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  viagemRota: {
    ...textStyles.h4,
    color: colors.primary.contrast,
    marginBottom: spacing.xs,
  },
  viagemTipo: {
    ...textStyles.bodySmall,
    color: colors.secondary.lighter,
  },
  verDetalhesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  verDetalhesText: {
    ...textStyles.button,
    color: colors.primary.main,
  },

  // Botões Rápidos
  botoesRapidos: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  botaoRapido: {
    flex: 1,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    alignItems: 'center',
    ...shadows.sm,
  },
  botaoRapidoDisabled: {
    opacity: 0.5,
  },
  botaoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  botaoRapidoText: {
    ...textStyles.caption,
    color: colors.text.primary,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Rotas Section
  rotasSection: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  sectionTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  verTodasButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  verTodasText: {
    ...textStyles.bodySmall,
    color: colors.secondary.main,
    fontWeight: '600',
  },

  // Rota Card
  rotaCard: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.sm,
  },
  rotaIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  rotaInfo: {
    flex: 1,
  },
  rotaNome: {
    ...textStyles.h5,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  rotaBairro: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  rotaStatus: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  enrolledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  rotaStatusText: {
    ...textStyles.caption,
    color: colors.success.main,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  emptyIconContainer: {
    marginBottom: spacing.base,
  },
  emptyStateTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.sm,
  },
  emptyStateButtonText: {
    ...textStyles.button,
    color: colors.primary.contrast,
  },

  // Config Button
  configButton: {
    marginHorizontal: spacing.base,
    padding: spacing.base,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.xs,
  },
  configButtonText: {
    ...textStyles.body,
    color: colors.text.secondary,
    flex: 1,
  },
});

export default DashboardAluno;
