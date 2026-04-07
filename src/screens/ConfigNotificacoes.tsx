import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, borderRadius, shadows, textStyles, fontSize, lineHeight } from '../theme';
import Icon, { IconNames } from '../components/Icon';

const roleLabel = (role?: string) => {
  const map: Record<string, string> = {
    aluno: 'Aluno',
    motorista: 'Motorista',
    gestor: 'Gestor',
  };

  return map[role?.toLowerCase() ?? ''] ?? role ?? '—';
};

const ConfigNotificacoes = ({ navigation }) => {
  const { user, logout } = useAuth();
  const role = user?.role?.toLowerCase();

  const isAluno = role === 'aluno';
  const isMotorista = role === 'motorista';

  const [notificacaoAlunos, setNotificacaoAlunos] = useState(true);
  const [notificacaoAtrasos, setNotificacaoAtrasos] = useState(true);
  const [notificacaoEmergencia, setNotificacaoEmergencia] = useState(true);
  const [notificacaoRotas, setNotificacaoRotas] = useState(true);

  const headerSubtitle = useMemo(() => {
    if (isAluno) return 'Perfil e notificações';
    return 'Notificações e conta';
  }, [isAluno]);

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const shouldLogout = window.confirm('Tem certeza que deseja sair?');
      if (shouldLogout) {
        await performLogout();
      }
      return;
    }

    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja encerrar a sessão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: performLogout },
      ],
      { cancelable: true }
    );
  };

  const performLogout = async () => {
    try {
      await logout();
    } catch {
      Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
    }
  };

  const handleSaveMotoristaSettings = () => {
    Alert.alert('Em breve', 'O salvamento das preferências será integrado ao backend.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name={IconNames.back} size="md" color={colors.secondary.contrast} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Configurações</Text>
            <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
          </View>

          <View style={styles.headerIcon}>
            <Icon name={IconNames.settings} size="lg" color={colors.secondary.contrast} />
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <AccountSection user={user} showProfileCard={isAluno} />

        <SectionHeader title="Notificações" />

        {isAluno ? (
          <AlunoNotificationSection user={user} />
        ) : isMotorista ? (
          <MotoristaNotificationSection
            values={{
              notificacaoAlunos,
              notificacaoAtrasos,
              notificacaoEmergencia,
              notificacaoRotas,
            }}
            onChange={{
              setNotificacaoAlunos,
              setNotificacaoAtrasos,
              setNotificacaoEmergencia,
              setNotificacaoRotas,
            }}
            onSave={handleSaveMotoristaSettings}
          />
        ) : (
          <GenericNotificationSection />
        )}

        <SectionHeader title="Conta" />

        <AccountInfoSection user={user} role={role} />

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Icon name={IconNames.logout} size="md" color={colors.error.main} />
          <Text style={styles.logoutButtonText}>Sair da conta</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const AccountSection = ({ user, showProfileCard }: { user: any; showProfileCard: boolean }) => {
  if (!showProfileCard) return null;

  return (
    <View style={styles.profileCard}>
      <View style={styles.avatarCircle}>
        <Icon name={IconNames.person} size="xl" color={colors.secondary.main} />
      </View>

      <View style={styles.profileInfo}>
        <Text style={styles.profileName} numberOfLines={1}>
          {user?.nome ?? '—'}
        </Text>
        <Text style={styles.profileEmail} numberOfLines={1}>
          {user?.email ?? '—'}
        </Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{roleLabel(user?.role)}</Text>
        </View>
      </View>
    </View>
  );
};

const AlunoNotificationSection = ({ user }: { user: any }) => {
  const notificationsEnabled = user?.receber_notificacoes !== false;

  return (
    <View style={styles.section}>
      <View style={styles.settingRow}>
        <View
          style={[
            styles.settingIconContainer,
            { backgroundColor: colors.secondary.lighter ?? colors.neutral[100] },
          ]}
        >
          <Icon name={IconNames.notifications} size="md" color={colors.secondary.main} />
        </View>

        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>Lembretes de viagem</Text>
          <Text style={styles.settingDescription}>
            {notificationsEnabled
              ? 'Ativado — recebes avisos 24 h e 10 min antes da partida'
              : 'Desativado — não recebes lembretes de viagem'}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            notificationsEnabled ? styles.statusOn : styles.statusOff,
          ]}
        >
          <Text style={styles.statusBadgeText}>
            {notificationsEnabled ? 'Ativo' : 'Inativo'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={[styles.settingRow, styles.settingRowDisabled]}>
        <View
          style={[
            styles.settingIconContainer,
            { backgroundColor: colors.neutral[100] },
          ]}
        >
          <Icon name={IconNames.myLocation} size="md" color={colors.neutral[400]} />
        </View>

        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, styles.settingTitleDisabled]}>
            Notificação de aproximação
          </Text>
          <Text style={styles.settingDescription}>
            Aviso quando o ônibus estiver próximo de ti
          </Text>
        </View>

        <View style={styles.soonBadge}>
          <Text style={styles.soonBadgeText}>Em breve</Text>
        </View>
      </View>
    </View>
  );
};

const MotoristaNotificationSection = ({
  values,
  onChange,
  onSave,
}: {
  values: {
    notificacaoAlunos: boolean;
    notificacaoAtrasos: boolean;
    notificacaoEmergencia: boolean;
    notificacaoRotas: boolean;
  };
  onChange: {
    setNotificacaoAlunos: (value: boolean) => void;
    setNotificacaoAtrasos: (value: boolean) => void;
    setNotificacaoEmergencia: (value: boolean) => void;
    setNotificacaoRotas: (value: boolean) => void;
  };
  onSave: () => void;
}) => {
  return (
    <>
      <View style={styles.section}>
        <View style={styles.settingRowTopAligned}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Notificações de Alunos</Text>
            <Text style={styles.settingDescription}>
              Receber notificações quando alunos confirmarem ou cancelarem presença
            </Text>
          </View>
          <Switch
            value={values.notificacaoAlunos}
            onValueChange={onChange.setNotificacaoAlunos}
            trackColor={{ false: colors.border.light, true: colors.secondary.main }}
            thumbColor={colors.background.paper}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.settingRowTopAligned}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Notificações de Atrasos</Text>
            <Text style={styles.settingDescription}>
              Receber alertas sobre possíveis atrasos na rota
            </Text>
          </View>
          <Switch
            value={values.notificacaoAtrasos}
            onValueChange={onChange.setNotificacaoAtrasos}
            trackColor={{ false: colors.border.light, true: colors.secondary.main }}
            thumbColor={colors.background.paper}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.settingRowTopAligned}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Notificações de Emergência</Text>
            <Text style={styles.settingDescription}>
              Receber alertas urgentes do gestor ou sistema
            </Text>
          </View>
          <Switch
            value={values.notificacaoEmergencia}
            onValueChange={onChange.setNotificacaoEmergencia}
            trackColor={{ false: colors.border.light, true: colors.secondary.main }}
            thumbColor={colors.background.paper}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.settingRowTopAligned}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Notificações de Rotas</Text>
            <Text style={styles.settingDescription}>
              Receber notificações sobre mudanças ou atualizações nas rotas
            </Text>
          </View>
          <Switch
            value={values.notificacaoRotas}
            onValueChange={onChange.setNotificacaoRotas}
            trackColor={{ false: colors.border.light, true: colors.secondary.main }}
            thumbColor={colors.background.paper}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveButtonText}>Salvar Configurações</Text>
      </TouchableOpacity>
    </>
  );
};

const GenericNotificationSection = () => {
  return (
    <View style={styles.section}>
      <Text style={styles.settingTitle}>Preferências de notificação</Text>
      <Text style={styles.settingDescription}>
        As configurações específicas deste perfil serão disponibilizadas em breve.
      </Text>
    </View>
  );
};

const AccountInfoSection = ({
  user,
  role,
}: {
  user: any;
  role?: string;
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.infoRow}>
        <Icon name={IconNames.person} size="md" color={colors.text.secondary} />
        <View style={styles.infoText}>
          <Text style={styles.infoLabel}>Nome</Text>
          <Text style={styles.infoValue}>{user?.nome ?? '—'}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <Icon name={IconNames.badge} size="md" color={colors.text.secondary} />
        <View style={styles.infoText}>
          <Text style={styles.infoLabel}>
            {role === 'aluno' ? 'Matrícula' : 'Perfil'}
          </Text>
          <Text style={styles.infoValue}>
            {role === 'aluno' ? user?.matricula ?? '—' : roleLabel(user?.role)}
          </Text>
        </View>
      </View>

      {!!user?.email && (
        <>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Icon name={IconNames.notifications} size="md" color={colors.text.secondary} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>
        </>
      )}

      {!!user?.instituicao?.nome && (
        <>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Icon name={IconNames.home} size="md" color={colors.text.secondary} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Instituição</Text>
              <Text style={styles.infoValue}>{user.instituicao.nome}</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },

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
  title: {
    ...textStyles.h3,
    color: colors.secondary.contrast,
  },
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

  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.base,
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  profileEmail: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  roleBadgeText: {
    ...textStyles.caption,
    color: colors.secondary.contrast,
    fontWeight: '600',
  },

  sectionHeader: {
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...textStyles.h5,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  section: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.md,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingRowTopAligned: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  settingRowDisabled: {
    opacity: 0.5,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.base,
  },
  settingTitle: {
    ...textStyles.inputLabel,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  settingTitleDisabled: {
    color: colors.text.secondary,
  },
  settingDescription: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    lineHeight: fontSize.bodySmall * lineHeight.relaxed,
  },

  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  statusOn: {
    backgroundColor: colors.success.light ?? '#e6f4ea',
  },
  statusOff: {
    backgroundColor: colors.neutral[100],
  },
  statusBadgeText: {
    ...textStyles.caption,
    fontWeight: '700',
    color: colors.success.dark ?? colors.text.primary,
  },
  soonBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[200],
  },
  soonBadgeText: {
    ...textStyles.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  infoValue: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '500',
  },

  saveButton: {
    backgroundColor: colors.secondary.main,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  saveButtonText: {
    ...textStyles.button,
    color: colors.text.inverse,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error.light,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    ...shadows.sm,
  },
  logoutButtonText: {
    ...textStyles.button,
    color: colors.error.main,
  },
});

export default ConfigNotificacoes;