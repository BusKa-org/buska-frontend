import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, borderRadius, shadows, textStyles } from '../../theme';
import Icon, { IconNames } from '../../components/Icon';

const roleLabel = (role) => {
  const map = { aluno: 'Aluno', motorista: 'Motorista', gestor: 'Gestor' };
  return map[role?.toLowerCase()] ?? role ?? '—';
};

const ConfigNotificacoesAluno = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Tem certeza que deseja sair?')) performLogout();
    } else {
      Alert.alert(
        'Sair da conta',
        'Tem certeza que deseja encerrar a sessão?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sair', style: 'destructive', onPress: performLogout },
        ],
        { cancelable: true },
      );
    }
  };

  const performLogout = async () => {
    try {
      await logout();
    } catch {
      Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name={IconNames.back} size="md" color={colors.secondary.contrast} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Configurações</Text>
            <Text style={styles.headerSubtitle}>Perfil e notificações</Text>
          </View>
          <View style={styles.headerIcon}>
            <Icon name={IconNames.settings} size="lg" color={colors.secondary.contrast} />
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>

        {/* Profile card */}
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

        {/* Notification settings */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Notificações</Text>
        </View>

        <View style={styles.section}>
          {/* Lembretes de viagem */}
          <View style={styles.settingRow}>
            <View style={[styles.settingIconContainer, { backgroundColor: colors.secondary.lighter ?? colors.neutral[100] }]}>
              <Icon name={IconNames.notifications} size="md" color={colors.secondary.main} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Lembretes de viagem</Text>
              <Text style={styles.settingDescription}>
                {user?.receber_notificacoes !== false
                  ? 'Ativado — recebes avisos 24 h e 10 min antes da partida'
                  : 'Desativado — não recebes lembretes de viagem'}
              </Text>
            </View>
            <View style={[
              styles.statusBadge,
              user?.receber_notificacoes !== false ? styles.statusOn : styles.statusOff,
            ]}>
              <Text style={styles.statusBadgeText}>
                {user?.receber_notificacoes !== false ? 'Ativo' : 'Inativo'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Em breve */}
          <View style={[styles.settingRow, styles.settingRowDisabled]}>
            <View style={[styles.settingIconContainer, { backgroundColor: colors.neutral[100] }]}>
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

        {/* Account */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Conta</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Icon name={IconNames.badge} size="md" color={colors.text.secondary} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Matrícula</Text>
              <Text style={styles.infoValue}>{user?.matricula ?? '—'}</Text>
            </View>
          </View>

          {user?.instituicao?.nome ? (
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
          ) : null}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Icon name={IconNames.logout} size="md" color={colors.error.main} />
          <Text style={styles.logoutButtonText}>Sair da conta</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xxl }} />
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
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  backButton: {
    width: 40, height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary.dark,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitleContainer: { flex: 1, marginLeft: spacing.md },
  title: { ...textStyles.h3, color: colors.secondary.contrast },
  headerSubtitle: { ...textStyles.bodySmall, color: colors.secondary.light, marginTop: spacing.xs },
  headerIcon: {
    width: 44, height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary.dark,
    justifyContent: 'center', alignItems: 'center',
  },

  scrollView: { flex: 1 },
  content: { padding: spacing.base },

  // Profile card
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
    width: 56, height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.md,
  },
  profileInfo: { flex: 1 },
  profileName: { ...textStyles.h4, color: colors.text.primary },
  profileEmail: { ...textStyles.bodySmall, color: colors.text.secondary, marginTop: 2 },
  roleBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  roleBadgeText: { ...textStyles.caption, color: colors.secondary.contrast, fontWeight: '600' },

  // Section
  sectionHeader: { marginBottom: spacing.sm, marginTop: spacing.xs },
  sectionTitle: { ...textStyles.h5, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  section: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  divider: { height: 1, backgroundColor: colors.border.light, marginVertical: spacing.md },

  // Setting rows
  settingRow: { flexDirection: 'row', alignItems: 'center' },
  settingRowDisabled: { opacity: 0.5 },
  settingIconContainer: {
    width: 40, height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.md,
  },
  settingInfo: { flex: 1, marginRight: spacing.sm },
  settingTitle: { ...textStyles.bodySmall, fontWeight: '600', color: colors.text.primary },
  settingTitleDisabled: { color: colors.text.secondary },
  settingDescription: { ...textStyles.caption, color: colors.text.secondary, marginTop: 2, lineHeight: 16 },

  // Status badges
  statusBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  statusOn: { backgroundColor: colors.success.light ?? '#e6f4ea' },
  statusOff: { backgroundColor: colors.neutral[100] },
  statusBadgeText: { ...textStyles.caption, fontWeight: '700', color: colors.success.dark ?? colors.text.primary },
  soonBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[200],
  },
  soonBadgeText: { ...textStyles.caption, color: colors.text.secondary, fontWeight: '600' },

  // Info rows
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  infoText: { flex: 1 },
  infoLabel: { ...textStyles.caption, color: colors.text.secondary },
  infoValue: { ...textStyles.body, color: colors.text.primary, fontWeight: '500' },

  // Logout
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error.light,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    ...shadows.sm,
  },
  logoutButtonText: { ...textStyles.button, color: colors.error.main },
});

export default ConfigNotificacoesAluno;
