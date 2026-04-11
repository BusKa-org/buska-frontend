import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { api } from '../../api/client';
import Icon from '../../components/Icon';
import { borderRadius, colors, shadows, spacing } from '../../theme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GuardianConsentInfo {
  nome: string;
  data_nascimento: string | null;
  is_minor: boolean;
  guardian_consented_at: string | null;
}

type ScreenState = 'loading' | 'ready' | 'submitting' | 'success' | 'refused' | 'error';

// ─── Component ────────────────────────────────────────────────────────────────

const ConsentimentoResponsavel = ({ route, navigation }: any) => {
  const token: string = route?.params?.token ?? '';

  const [state, setState] = useState<ScreenState>('loading');
  const [info, setInfo] = useState<GuardianConsentInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setErrorMsg('Link de consentimento inválido.');
      setState('error');
      return;
    }
    loadInfo();
  }, [token]);

  const loadInfo = async () => {
    setState('loading');
    try {
      const res = await api.get(`/alunos/guardian-consent/${token}`);
      setInfo(res.data);
      if (res.data.guardian_consented_at) {
        // Already consented
        setState('success');
      } else {
        setState('ready');
      }
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.message ?? e?.message ?? 'Link inválido ou expirado.');
      setState('error');
    }
  };

  const handleConsent = async () => {
    setState('submitting');
    try {
      await api.post(`/alunos/guardian-consent/${token}`);
      setState('success');
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.message ?? e?.message ?? 'Não foi possível registrar o consentimento.');
      setState('error');
    }
  };

  const handleRefuse = () => setState('refused');

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  // ─── Renders ────────────────────────────────────────────────────────────────

  const renderLoading = () => (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary?.main ?? '#0347D0'} />
      <Text style={styles.loadingText}>Carregando...</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.center}>
      <View style={styles.iconCircle}>
        <Icon name="error-outline" size="lg" color={colors.error.main} />
      </View>
      <Text style={styles.stateTitle}>Ops!</Text>
      <Text style={styles.stateBody}>{errorMsg}</Text>
      <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation?.goBack?.()}>
        <Text style={styles.secondaryBtnText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSuccess = () => (
    <View style={styles.center}>
      <View style={[styles.iconCircle, styles.iconCircleSuccess]}>
        <Icon name="check-circle" size="lg" color={colors.success?.main ?? '#22c55e'} />
      </View>
      <Text style={styles.stateTitle}>Autorização registrada!</Text>
      <Text style={styles.stateBody}>
        O cadastro de <Text style={styles.bold}>{info?.nome ?? 'o(a) estudante'}</Text> foi
        encaminhado para análise do gestor municipal.{'\n\n'}
        Você receberá uma notificação quando o cadastro for aprovado.
      </Text>
    </View>
  );

  const renderRefused = () => (
    <View style={styles.center}>
      <View style={styles.iconCircle}>
        <Icon name="cancel" size="lg" color={colors.error.main} />
      </View>
      <Text style={styles.stateTitle}>Solicitação recusada</Text>
      <Text style={styles.stateBody}>
        Você optou por não autorizar o cadastro. O estudante não poderá usar o BusKa até que um
        responsável legal autorize.
      </Text>
    </View>
  );

  const renderReady = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoMark}>
          <Icon name="directions-bus" size="lg" color="#0347D0" />
        </View>
        <Text style={styles.appName}>BusKa</Text>
        <Text style={styles.headerSub}>Transporte Escolar Municipal</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Autorização de cadastro</Text>
        <Text style={styles.cardBody}>
          O(A) estudante abaixo solicitou cadastro no BusKa. Como responsável legal, você precisa
          autorizar o uso do aplicativo antes que o cadastro seja analisado pelo gestor municipal.
        </Text>

        <View style={styles.infoBox}>
          <Row label="Nome do(a) estudante" value={info?.nome ?? '—'} />
          <Row label="Data de nascimento" value={formatDate(info?.data_nascimento ?? null)} />
        </View>

        <Text style={styles.warningText}>
          Ao autorizar, você declara ter ciência de que os dados do estudante serão utilizados para
          gerenciamento do transporte escolar municipal.
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleConsent}
          disabled={state === 'submitting'}
          activeOpacity={0.85}>
          {state === 'submitting' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="check-circle" size="md" color="#fff" />
              <Text style={styles.primaryBtnText}>Sim, autorizo o cadastro</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.refuseBtn}
          onPress={handleRefuse}
          disabled={state === 'submitting'}
          activeOpacity={0.85}>
          <Text style={styles.refuseBtnText}>Não autorizo</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {state === 'loading' && renderLoading()}
        {state === 'error' && renderError()}
        {state === 'success' && renderSuccess()}
        {state === 'refused' && renderRefused()}
        {(state === 'ready' || state === 'submitting') && renderReady()}
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Row helper ───────────────────────────────────────────────────────────────

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#EEF3FB',
  },
  scroll: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: colors.text.secondary,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.error.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleSuccess: {
    backgroundColor: 'rgba(34,197,94,0.12)',
  },
  stateTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: colors.text.primary,
    textAlign: 'center',
  },
  stateBody: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 340,
  },
  bold: {
    fontFamily: 'Inter-SemiBold',
    color: colors.text.primary,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(3,71,208,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  appName: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#0347D0',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.text.secondary,
  },

  // Card
  card: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.xl ?? 20,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadows.lg,
  },
  cardTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: colors.text.primary,
  },
  cardBody: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 21,
  },

  // Info box
  infoBox: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: colors.text.secondary,
    flex: 1,
  },
  rowValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: colors.text.primary,
    textAlign: 'right',
    flex: 1,
  },

  warningText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: colors.text.disabled,
    lineHeight: 18,
  },

  // Buttons
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: '#0347D0',
    ...shadows.sm,
  },
  primaryBtnText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#fff',
  },
  refuseBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  refuseBtnText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: colors.error.main,
  },
  secondaryBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[100],
    marginTop: spacing.sm,
  },
  secondaryBtnText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: colors.text.primary,
  },
});

export default ConsentimentoResponsavel;
