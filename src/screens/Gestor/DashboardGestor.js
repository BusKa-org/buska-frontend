import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { gestorService } from '../../services/gestorService';
import { unwrapItems } from '../../types';
import {
  borderRadius,
  colors,
  fontWeight,
  shadows,
  spacing,
  textStyles,
} from '../../theme';
import Icon, { IconNames } from '../../components/Icon';
import { useToast } from '../../components/Toast';

const GESTOR_COLOR = colors.roles.gestor;
const GESTOR_DARK  = colors.accent.dark;

const today = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

// ─── Metric Card ────────────────────────────────────────────────────────────

const MetricCard = ({ icon, label, value, loading, accentColor }) => (
  <View style={[metricStyles.card, { borderLeftColor: accentColor ?? GESTOR_COLOR }]}>
    <View style={[metricStyles.iconWrap, { backgroundColor: (accentColor ?? GESTOR_COLOR) + '18' }]}>
      <Icon name={icon} size="md" color={accentColor ?? GESTOR_COLOR} />
    </View>
    {loading ? (
      <ActivityIndicator size="small" color={accentColor ?? GESTOR_COLOR} style={{ marginTop: spacing.xs }} />
    ) : (
      <Text style={metricStyles.value}>{value ?? '—'}</Text>
    )}
    <Text style={metricStyles.label}>{label}</Text>
  </View>
);

const metricStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    borderLeftWidth: 3,
    alignItems: 'flex-start',
    ...shadows.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  value: {
    ...textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  label: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
});

// ─── Stat Row ────────────────────────────────────────────────────────────────

const StatItem = ({ label, value, loading }) => (
  <View style={statStyles.item}>
    {loading ? (
      <ActivityIndicator size="small" color={GESTOR_COLOR} />
    ) : (
      <Text style={statStyles.value}>{value ?? '—'}</Text>
    )}
    <Text style={statStyles.label}>{label}</Text>
  </View>
);

const statStyles = StyleSheet.create({
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  value: {
    ...textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  label: {
    ...textStyles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

// ─── Quick Action ─────────────────────────────────────────────────────────────

const QuickAction = ({ icon, label, onPress, accent }) => (
  <TouchableOpacity style={qaStyles.item} onPress={onPress} activeOpacity={0.7}>
    <View style={[qaStyles.iconWrap, { backgroundColor: (accent ?? GESTOR_COLOR) + '18' }]}>
      <Icon name={icon} size="lg" color={accent ?? GESTOR_COLOR} />
    </View>
    <Text style={qaStyles.label} numberOfLines={2}>{label}</Text>
  </TouchableOpacity>
);

const qaStyles = StyleSheet.create({
  item: {
    width: '30%',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...textStyles.caption,
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: fontWeight.medium,
  },
});

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_LABEL = {
  AGENDADA: 'Agendada',
  EM_ANDAMENTO: 'Em andamento',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
};

const STATUS_COLOR = {
  AGENDADA: colors.warning.main,
  EM_ANDAMENTO: colors.info.main,
  FINALIZADA: colors.success.main,
  CANCELADA: colors.error.main,
};

// ─── Main Component ───────────────────────────────────────────────────────────

const DashboardGestor = ({ navigation }) => {
  const { user, logout } = useAuth();
  const toast = useToast();

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja encerrar sua sessão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => logout(),
        },
      ],
    );
  };

  const [loadingCounts, setLoadingCounts] = useState(true);
  const [loadingRelatorio, setLoadingRelatorio] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [counts, setCounts] = useState({
    viagens: null,
    motoristas: null,
    onibus: null,
    alunos: null,
  });

  const [relatorio, setRelatorio] = useState(null);
  const [recentes, setRecentes] = useState([]);

  const loadData = useCallback(async () => {
    try {
      setLoadingCounts(true);
      setLoadingRelatorio(true);

      const dataHoje = today();
      const data7Dias = daysAgo(7);

      const [viagensHoje, motoristas, onibus, alunos, relatorioData] = await Promise.all([
        gestorService.listarViagens({ data_inicio: dataHoje, data_fim: dataHoje })
          .then(unwrapItems).catch(() => []),
        gestorService.listarMotoristas()
          .then(unwrapItems).catch(() => []),
        gestorService.listarOnibus()
          .then(unwrapItems).catch(() => []),
        gestorService.listarAlunos()
          .then(unwrapItems).catch(() => []),
        gestorService.obterRelatorio(data7Dias, dataHoje).catch(() => null),
      ]);

      setCounts({
        viagens: viagensHoje.length,
        motoristas: motoristas.length,
        onibus: onibus.length,
        alunos: alunos.length,
      });
      setRelatorio(relatorioData);
    } catch (e) {
      toast.error('Erro ao carregar dados do painel.');
    } finally {
      setLoadingCounts(false);
      setLoadingRelatorio(false);
    }
  }, []);

  const loadRecentes = useCallback(async () => {
    try {
      const viagens = await gestorService.listarViagens().then(unwrapItems).catch(() => []);
      setRecentes(
        viagens
          .sort((a, b) => new Date(b.data) - new Date(a.data))
          .slice(0, 5),
      );
    } catch {}
  }, []);

  useEffect(() => {
    loadData();
    loadRecentes();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadData(), loadRecentes()]);
    setRefreshing(false);
  };

  const navigateToTab = (tabName) => {
    try {
      navigation.navigate(tabName);
    } catch {
      navigation.getParent?.()?.navigate(tabName);
    }
  };

  const getUserInitials = () => {
    const name = user?.nome ?? '';
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'G';
  };

  const getMunicipio = () => {
    const m = user?.municipio;
    if (!m) return '';
    return m.uf ? `${m.nome} · ${m.uf}` : m.nome;
  };

  const formatDate = (ds) => {
    if (!ds) return '';
    const [y, mo, d] = ds.split('T')[0].split('-');
    return `${d}/${mo}/${y}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[GESTOR_COLOR]}
            tintColor={GESTOR_COLOR}
          />
        }>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Olá, {user?.nome?.split(' ')[0] ?? 'Gestor'}!</Text>
              <Text style={styles.headerSub}>
                {getMunicipio() ? `Gestor · ${getMunicipio()}` : 'Painel do Gestor'}
              </Text>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getUserInitials()}</Text>
              </View>
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleLogout}
                activeOpacity={0.7}>
                <Icon name="logout" size="sm" color="rgba(255,255,255,0.85)" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.content}>

          {/* ── Métricas de hoje ──────────────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Hoje</Text>
          <View style={styles.metricsRow}>
            <MetricCard
              icon={IconNames.bus}
              label="Viagens"
              value={counts.viagens}
              loading={loadingCounts}
              accentColor={GESTOR_COLOR}
            />
            <MetricCard
              icon={IconNames.person}
              label="Motoristas"
              value={counts.motoristas}
              loading={loadingCounts}
              accentColor={colors.secondary.main}
            />
          </View>
          <View style={[styles.metricsRow, { marginTop: spacing.sm }]}>
            <MetricCard
              icon={IconNames.group}
              label="Alunos"
              value={counts.alunos}
              loading={loadingCounts}
              accentColor={colors.success.main}
            />
            <MetricCard
              icon={IconNames.bus}
              label="Ônibus"
              value={counts.onibus}
              loading={loadingCounts}
              accentColor={colors.info.main}
            />
          </View>

          {/* ── Relatório 7 dias ──────────────────────────────────────────── */}
          <View style={styles.relatorioCard}>
            <View style={styles.relatorioHeader}>
              <Icon name={IconNames.chart} size="md" color={GESTOR_COLOR} />
              <Text style={styles.relatorioTitle}>Últimos 7 dias</Text>
            </View>
            <View style={styles.statsRow}>
              <StatItem
                label="Viagens realizadas"
                value={relatorio?.viagens_realizadas}
                loading={loadingRelatorio}
              />
              <View style={styles.statDivider} />
              <StatItem
                label="Alunos transportados"
                value={relatorio?.alunos_transportados}
                loading={loadingRelatorio}
              />
              <View style={styles.statDivider} />
              <StatItem
                label="Km rodados"
                value={relatorio?.km_total_rodado != null
                  ? `${Number(relatorio.km_total_rodado).toFixed(0)} km`
                  : null}
                loading={loadingRelatorio}
              />
              <View style={styles.statDivider} />
              <StatItem
                label="Vagas desperdiçadas"
                value={relatorio?.vagas_desperdicadas}
                loading={loadingRelatorio}
              />
            </View>
          </View>

          {/* ── Ações rápidas ─────────────────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Ações rápidas</Text>
          <View style={styles.qaGrid}>
            <QuickAction
              icon={IconNames.add}
              label="Criar Viagem"
              onPress={() => navigateToTab('ViagensTab')}
              accent={GESTOR_COLOR}
            />
            <QuickAction
              icon={IconNames.calendarToday}
              label="Gerar Lote"
              onPress={() => navigateToTab('ViagensTab')}
              accent={GESTOR_COLOR}
            />
            <QuickAction
              icon={IconNames.route}
              label="Nova Rota"
              onPress={() => navigateToTab('RotasTab')}
              accent={colors.secondary.main}
            />
            <QuickAction
              icon={IconNames.person}
              label="Motoristas"
              onPress={() => navigateToTab('EquipeTab')}
              accent={colors.secondary.main}
            />
            <QuickAction
              icon={IconNames.bus}
              label="Frota"
              onPress={() => navigateToTab('FrotaTab')}
              accent={colors.info.main}
            />
            <QuickAction
              icon={IconNames.group}
              label="Alunos"
              onPress={() => navigateToTab('EquipeTab')}
              accent={colors.success.main}
            />
          </View>

          {/* ── Viagens recentes ─────────────────────────────────────────── */}
          {recentes.length > 0 && (
            <>
              <View style={styles.recentesHeader}>
                <Text style={styles.sectionTitle}>Viagens recentes</Text>
                <TouchableOpacity onPress={() => navigateToTab('ViagensTab')}>
                  <Text style={styles.verTodas}>Ver todas</Text>
                </TouchableOpacity>
              </View>
              {recentes.map(v => {
                const cor = STATUS_COLOR[v.status] ?? colors.text.hint;
                return (
                  <TouchableOpacity
                    key={v.id}
                    style={styles.recenteCard}
                    onPress={() => navigateToTab('ViagensTab')}
                    activeOpacity={0.7}>
                    <View style={styles.recenteLeft}>
                      <Text style={styles.recenteRota} numberOfLines={1}>
                        {v.rota_nome ?? 'Rota'}
                      </Text>
                      <Text style={styles.recenteData}>
                        {formatDate(v.data)}{v.horario_inicio ? ` · ${v.horario_inicio.substring(0, 5)}` : ''}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: cor + '20' }]}>
                      <Text style={[styles.statusText, { color: cor }]}>
                        {STATUS_LABEL[v.status] ?? v.status}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scroll: { flex: 1 },
  header: {
    backgroundColor: colors.primary.dark,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    ...textStyles.h2,
    color: '#FFFFFF',
    fontWeight: fontWeight.bold,
  },
  headerSub: {
    ...textStyles.bodySmall,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xxs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...textStyles.h4,
    color: '#FFFFFF',
    fontWeight: fontWeight.bold,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.base,
    marginTop: -spacing.xl,
  },
  sectionTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
    marginTop: spacing.base,
  },
  metricsRow: {
    flexDirection: 'row',
    marginHorizontal: -spacing.xs,
  },
  relatorioCard: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginTop: spacing.base,
    ...shadows.sm,
  },
  relatorioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    paddingBottom: spacing.md,
  },
  relatorioTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.light,
  },
  qaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    ...shadows.sm,
  },
  recentesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.base,
  },
  verTodas: {
    ...textStyles.bodySmall,
    color: GESTOR_COLOR,
    fontWeight: fontWeight.semiBold,
  },
  recenteCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.xs,
  },
  recenteLeft: { flex: 1, marginRight: spacing.md },
  recenteRota: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
  },
  recenteData: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...textStyles.caption,
    fontWeight: fontWeight.semiBold,
  },
});

export default DashboardGestor;
