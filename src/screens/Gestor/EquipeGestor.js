import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { gestorService } from '../../services/gestorService';
import { unwrapItems } from '../../types';
import { useFetch } from '../../hooks';
import { borderRadius, colors, fontWeight, shadows, spacing, textStyles } from '../../theme';
import Icon, { IconNames } from '../../components/Icon';
import { useToast } from '../../components/Toast';
import { LoadingView, ErrorView } from '../../components/LoadingState';

const GESTOR_COLOR = colors.roles.gestor;
const SEGMENT = { MOTORISTAS: 0, ALUNOS: 1 };

// ─── Avatar ────────────────────────────────────────────────────────────────

const Avatar = ({ name, color }) => {
  const initials = (name ?? '')
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';
  return (
    <View style={[avatarStyles.wrap, { backgroundColor: (color ?? GESTOR_COLOR) + '20' }]}>
      <Text style={[avatarStyles.text, { color: color ?? GESTOR_COLOR }]}>{initials}</Text>
    </View>
  );
};

const avatarStyles = StyleSheet.create({
  wrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    ...textStyles.body,
    fontWeight: fontWeight.bold,
  },
});

// ─── Main Component ───────────────────────────────────────────────────────────

const EquipeGestor = () => {
  const toast = useToast();
  const [segmento, setSegmento] = useState(SEGMENT.MOTORISTAS);
  const [busca, setBusca] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Form state
  const [form, setForm] = useState({
    nome: '', email: '', password: '', cpf: '', cnh: '',
  });

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  // ─── Fetch ──────────────────────────────────────────────────────────────

  const fetchMotoristas = useCallback(async () => {
    const data = await gestorService.listarMotoristas().then(unwrapItems);
    return data ?? [];
  }, []);

  const fetchAlunos = useCallback(async () => {
    const data = await gestorService.listarAlunos().then(unwrapItems);
    return data ?? [];
  }, []);

  const {
    data: motoristas, isLoading: loadingM, isError: errorM, error: errM, refetch: refetchM,
  } = useFetch(fetchMotoristas, [], { showErrorToast: true });

  const {
    data: alunos, isLoading: loadingA, isError: errorA, error: errA, refetch: refetchA,
  } = useFetch(fetchAlunos, [], { showErrorToast: true });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchM(), refetchA()]);
    setRefreshing(false);
  };

  // ─── Filtered lists ──────────────────────────────────────────────────────

  const motoristasFiltered = useMemo(() => {
    const q = busca.toLowerCase();
    return (motoristas ?? []).filter(
      m => m.nome?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q),
    );
  }, [motoristas, busca]);

  const alunosFiltered = useMemo(() => {
    const q = busca.toLowerCase();
    return (alunos ?? []).filter(
      a => a.nome?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q),
    );
  }, [alunos, busca]);

  // ─── Create motorista ────────────────────────────────────────────────────

  const handleCriarMotorista = async () => {
    if (!form.nome.trim() || !form.email.trim() || !form.password.trim() || !form.cpf.trim() || !form.cnh.trim()) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }
    try {
      setSalvando(true);
      await gestorService.criarMotorista({
        nome: form.nome.trim(),
        email: form.email.trim(),
        password: form.password.trim(),
        cpf: form.cpf.trim(),
        cnh: form.cnh.trim(),
      });
      toast.success('Motorista cadastrado com sucesso!');
      setForm({ nome: '', email: '', password: '', cpf: '', cnh: '' });
      setMostrarForm(false);
      await refetchM();
    } catch (e) {
      toast.error(e?.message ?? 'Erro ao cadastrar motorista.');
    } finally {
      setSalvando(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  const isLoading = segmento === SEGMENT.MOTORISTAS ? loadingM : loadingA;
  const isError = segmento === SEGMENT.MOTORISTAS ? errorM : errorA;
  const errMsg = segmento === SEGMENT.MOTORISTAS ? errM?.message : errA?.message;
  const onRetry = segmento === SEGMENT.MOTORISTAS ? refetchM : refetchA;
  const total = segmento === SEGMENT.MOTORISTAS ? (motoristas ?? []).length : (alunos ?? []).length;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Equipe</Text>
              <Text style={styles.headerSub}>{total} {segmento === SEGMENT.MOTORISTAS ? 'motorista(s)' : 'aluno(s)'}</Text>
            </View>
            {segmento === SEGMENT.MOTORISTAS && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setMostrarForm(!mostrarForm)}>
                <Icon name={mostrarForm ? IconNames.close : IconNames.add} size="md" color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Segment + Search */}
        <View style={styles.controls}>
          <View style={styles.segment}>
            {[{ id: SEGMENT.MOTORISTAS, label: 'Motoristas' }, { id: SEGMENT.ALUNOS, label: 'Alunos' }].map(s => (
              <TouchableOpacity
                key={s.id}
                style={[styles.segBtn, segmento === s.id && styles.segBtnActive]}
                onPress={() => { setSegmento(s.id); setBusca(''); setMostrarForm(false); }}>
                <Text style={[styles.segBtnText, segmento === s.id && styles.segBtnTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.searchRow}>
            <Icon name={IconNames.search} size="sm" color={colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Buscar ${segmento === SEGMENT.MOTORISTAS ? 'motorista' : 'aluno'}...`}
              placeholderTextColor={colors.text.hint}
              value={busca}
              onChangeText={setBusca}
            />
            {busca.length > 0 && (
              <TouchableOpacity onPress={() => setBusca('')}>
                <Icon name={IconNames.close} size="sm" color={colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Create form */}
        {mostrarForm && segmento === SEGMENT.MOTORISTAS && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Cadastrar Motorista</Text>
            {[
              { field: 'nome', placeholder: 'Nome completo *', keyboardType: 'default' },
              { field: 'email', placeholder: 'E-mail *', keyboardType: 'email-address' },
              { field: 'password', placeholder: 'Senha *', secure: true },
              { field: 'cpf', placeholder: 'CPF *', keyboardType: 'numeric' },
              { field: 'cnh', placeholder: 'CNH *', keyboardType: 'default' },
            ].map(({ field, placeholder, keyboardType, secure }) => (
              <TextInput
                key={field}
                style={styles.formInput}
                placeholder={placeholder}
                placeholderTextColor={colors.text.hint}
                value={form[field]}
                onChangeText={v => setField(field, v)}
                keyboardType={keyboardType}
                secureTextEntry={secure}
                autoCapitalize={field === 'email' ? 'none' : 'words'}
              />
            ))}
            <TouchableOpacity
              style={[styles.formBtn, salvando && styles.formBtnDisabled]}
              onPress={handleCriarMotorista}
              disabled={salvando}>
              {salvando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Icon name={IconNames.checkCircle} size="sm" color="#FFFFFF" />
                  <Text style={styles.formBtnText}>Cadastrar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* List */}
        {isLoading ? (
          <LoadingView message="Carregando..." />
        ) : isError ? (
          <ErrorView message={errMsg ?? 'Erro ao carregar'} onRetry={onRetry} />
        ) : (
          <ScrollView
            style={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[GESTOR_COLOR]}
                tintColor={GESTOR_COLOR}
              />
            }>
            <View style={styles.listContent}>
              {segmento === SEGMENT.MOTORISTAS
                ? motoristasFiltered.length === 0
                  ? <EmptyState label="motoristas" busca={busca} />
                  : motoristasFiltered.map(m => (
                    <PessoaCard
                      key={m.id}
                      nome={m.nome}
                      detalhe={m.email}
                      extra={m.cnh ? `CNH: ${m.cnh}` : undefined}
                      color={GESTOR_COLOR}
                    />
                  ))
                : alunosFiltered.length === 0
                  ? <EmptyState label="alunos" busca={busca} />
                  : alunosFiltered.map(a => (
                    <PessoaCard
                      key={a.id}
                      nome={a.nome}
                      detalhe={a.email}
                      color={colors.success.main}
                    />
                  ))
              }
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const PessoaCard = ({ nome, detalhe, extra, color }) => (
  <View style={cardStyles.card}>
    <Avatar name={nome} color={color} />
    <View style={cardStyles.info}>
      <Text style={cardStyles.nome} numberOfLines={1}>{nome ?? '—'}</Text>
      {detalhe && <Text style={cardStyles.detalhe} numberOfLines={1}>{detalhe}</Text>}
      {extra && <Text style={cardStyles.extra} numberOfLines={1}>{extra}</Text>}
    </View>
  </View>
);

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    ...shadows.xs,
  },
  info: { flex: 1 },
  nome: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: fontWeight.semiBold,
  },
  detalhe: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  extra: {
    ...textStyles.caption,
    color: colors.text.hint,
    marginTop: spacing.xxs,
  },
});

const EmptyState = ({ label, busca }) => (
  <View style={emptyStyles.wrap}>
    <Icon name={IconNames.group} size="huge" color={colors.neutral[300]} />
    <Text style={emptyStyles.text}>
      {busca ? `Nenhum ${label} encontrado` : `Nenhum ${label} cadastrado`}
    </Text>
  </View>
);

const emptyStyles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  text: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    backgroundColor: colors.primary.dark,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...textStyles.h2,
    color: '#FFFFFF',
    fontWeight: fontWeight.bold,
  },
  headerSub: {
    ...textStyles.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xxs,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    backgroundColor: colors.background.paper,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    marginTop: -spacing.md,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    ...shadows.xs,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.full,
    padding: 3,
    marginBottom: spacing.md,
  },
  segBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  segBtnActive: {
    backgroundColor: GESTOR_COLOR,
  },
  segBtnText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontWeight: fontWeight.medium,
  },
  segBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: fontWeight.semiBold,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 40,
    ...textStyles.body,
    color: colors.text.primary,
  },
  formCard: {
    backgroundColor: colors.background.paper,
    margin: spacing.base,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: GESTOR_COLOR + '40',
    ...shadows.sm,
  },
  formTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  formInput: {
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...textStyles.body,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing.sm,
  },
  formBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary.main,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
  },
  formBtnDisabled: { opacity: 0.6 },
  formBtnText: {
    ...textStyles.button,
    color: '#FFFFFF',
  },
  list: { flex: 1 },
  listContent: {
    padding: spacing.base,
  },
});

export default EquipeGestor;
