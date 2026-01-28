import React, {useState} from 'react';
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
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, borderRadius, shadows, textStyles, fontSize, fontWeight, lineHeight } from '../../theme';
import Icon, { IconNames } from '../../components/Icon';

const ConfigNotificacoesMotorista = ({navigation}) => {
  const { logout } = useAuth();
  const [notificacaoAlunos, setNotificacaoAlunos] = useState(true);
  const [notificacaoAtrasos, setNotificacaoAtrasos] = useState(true);
  const [notificacaoEmergencia, setNotificacaoEmergencia] = useState(true);
  const [notificacaoRotas, setNotificacaoRotas] = useState(true);

  const handleLogout = async () => {
    const isWeb = Platform.OS === 'web';
    
    if (isWeb) {
      const shouldLogout = window.confirm('Tem certeza que deseja sair?');
      if (shouldLogout) {
        await performLogout();
      }
    } else {
      Alert.alert(
        'Sair',
        'Tem certeza que deseja sair?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sair', style: 'destructive', onPress: performLogout },
        ],
        { cancelable: true }
      );
    }
  };

  const performLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Try again on error
      try {
        await logout();
      } catch (e) {
        // Silent fail - user will be redirected anyway
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name={IconNames.back} size="md" color={colors.secondary.contrast} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Configurações</Text>
            <Text style={styles.headerSubtitle}>Notificações e conta</Text>
          </View>
          <View style={styles.headerIcon}>
            <Icon name={IconNames.settings} size="lg" color={colors.secondary.contrast} />
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Notificação de Alunos */}
          <View style={styles.section}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>
                  Notificações de Alunos
                </Text>
                <Text style={styles.settingDescription}>
                  Receber notificações quando alunos confirmarem ou cancelarem
                  presença
                </Text>
              </View>
              <Switch
                value={notificacaoAlunos}
                onValueChange={setNotificacaoAlunos}
                trackColor={{false: colors.border.light, true: colors.secondary.main}}
                thumbColor={colors.background.paper}
              />
            </View>
          </View>

          {/* Notificação de Atrasos */}
          <View style={styles.section}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Notificações de Atrasos</Text>
                <Text style={styles.settingDescription}>
                  Receber alertas sobre possíveis atrasos na rota
                </Text>
              </View>
              <Switch
                value={notificacaoAtrasos}
                onValueChange={setNotificacaoAtrasos}
                trackColor={{false: colors.border.light, true: colors.secondary.main}}
                thumbColor={colors.background.paper}
              />
            </View>
          </View>

          {/* Notificação de Emergência */}
          <View style={styles.section}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>
                  Notificações de Emergência
                </Text>
                <Text style={styles.settingDescription}>
                  Receber alertas urgentes do gestor ou sistema
                </Text>
              </View>
              <Switch
                value={notificacaoEmergencia}
                onValueChange={setNotificacaoEmergencia}
                trackColor={{false: colors.border.light, true: colors.secondary.main}}
                thumbColor={colors.background.paper}
              />
            </View>
          </View>

          {/* Notificação de Rotas */}
          <View style={styles.section}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>
                  Notificações de Rotas
                </Text>
                <Text style={styles.settingDescription}>
                  Receber notificações sobre mudanças ou atualizações nas rotas
                </Text>
              </View>
              <Switch
                value={notificacaoRotas}
                onValueChange={setNotificacaoRotas}
                trackColor={{false: colors.border.light, true: colors.secondary.main}}
                thumbColor={colors.background.paper}
              />
            </View>
          </View>

          {/* Botão Salvar */}
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Salvar Configurações</Text>
          </TouchableOpacity>

          {/* Seção de Conta */}
          <View style={styles.accountSection}>
            <Text style={styles.accountSectionTitle}>Conta</Text>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
              testID="logout-button">
              <View style={styles.logoutButtonContent}>
                <Icon name={IconNames.logout} size="sm" color={colors.error.main} />
                <Text style={styles.logoutButtonText}>Sair</Text>
              </View>
            </TouchableOpacity>
          </View>
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
  section: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  settingDescription: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    lineHeight: fontSize.bodySmall * lineHeight.relaxed,
  },
  saveButton: {
    backgroundColor: colors.secondary.main,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    alignItems: 'center',
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  saveButtonText: {
    ...textStyles.button,
    color: colors.text.inverse,
  },
  accountSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  accountSectionTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.base,
  },
  logoutButton: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error.light,
    ...shadows.xs,
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  logoutButtonText: {
    ...textStyles.button,
    color: colors.error.main,
  },
});

export default ConfigNotificacoesMotorista;


