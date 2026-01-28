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
import { colors, spacing, borderRadius, shadows, textStyles } from '../../theme';
import Icon, { IconNames } from '../../components/Icon';

const ConfigNotificacoesAluno = ({navigation}) => {
  const { logout } = useAuth();
  const [lembretePresenca, setLembretePresenca] = useState(true);
  const [antecedenciaLembrete, setAntecedenciaLembrete] = useState(30);
  const [notificacaoAproximacao, setNotificacaoAproximacao] = useState(true);
  const [distanciaAproximacao, setDistanciaAproximacao] = useState(500);

  const opcoesAntecedencia = [15, 30, 45, 60];
  const opcoesDistancia = [200, 500, 1000, 1500];

  const handleLogout = async () => {
    const isWeb = Platform.OS === 'web';
    
    if (isWeb) {
      if (window.confirm('Tem certeza que deseja sair?')) {
        await performLogout();
      }
    } else {
      Alert.alert('Sair', 'Tem certeza que deseja sair?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: performLogout },
      ], { cancelable: true });
    }
  };

  const performLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name={IconNames.back} size="base" color={colors.secondary.main} />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Configurações</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Presence Reminder */}
          <View style={styles.section}>
            <View style={styles.settingRow}>
              <View style={styles.settingIconContainer}>
                <Icon name={IconNames.notifications} size="lg" color={colors.secondary.main} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Lembrete de Presença</Text>
                <Text style={styles.settingDescription}>
                  Receber notificações para confirmar sua presença antes da viagem
                </Text>
              </View>
              <Switch
                value={lembretePresenca}
                onValueChange={setLembretePresenca}
                trackColor={{false: colors.neutral[200], true: colors.secondary.main}}
                thumbColor={colors.background.paper}
              />
            </View>

            {lembretePresenca && (
              <View style={styles.subSetting}>
                <Text style={styles.subSettingTitle}>Antecedência do Lembrete</Text>
                <View style={styles.optionsContainer}>
                  {opcoesAntecedencia.map((minutos) => (
                    <TouchableOpacity
                      key={minutos}
                      style={[styles.optionButton, antecedenciaLembrete === minutos && styles.optionButtonActive]}
                      onPress={() => setAntecedenciaLembrete(minutos)}>
                      <Text style={[styles.optionText, antecedenciaLembrete === minutos && styles.optionTextActive]}>
                        {minutos} min
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Proximity Notification */}
          <View style={styles.section}>
            <View style={styles.settingRow}>
              <View style={styles.settingIconContainer}>
                <Icon name={IconNames.myLocation} size="lg" color={colors.success.main} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Notificação de Aproximação</Text>
                <Text style={styles.settingDescription}>
                  Receber notificação quando o ônibus estiver próximo
                </Text>
              </View>
              <Switch
                value={notificacaoAproximacao}
                onValueChange={setNotificacaoAproximacao}
                trackColor={{false: colors.neutral[200], true: colors.success.main}}
                thumbColor={colors.background.paper}
              />
            </View>

            {notificacaoAproximacao && (
              <View style={styles.subSetting}>
                <Text style={styles.subSettingTitle}>Distância para Notificação</Text>
                <View style={styles.optionsContainer}>
                  {opcoesDistancia.map((metros) => (
                    <TouchableOpacity
                      key={metros}
                      style={[styles.optionButton, distanciaAproximacao === metros && styles.optionButtonActive]}
                      onPress={() => setDistanciaAproximacao(metros)}>
                      <Text style={[styles.optionText, distanciaAproximacao === metros && styles.optionTextActive]}>
                        {metros}m
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton}>
            <Icon name={IconNames.checkCircle} size="md" color={colors.primary.contrast} />
            <Text style={styles.saveButtonText}>Salvar Configurações</Text>
          </TouchableOpacity>

          {/* Account Section */}
          <View style={styles.accountSection}>
            <Text style={styles.accountSectionTitle}>Conta</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
              <Icon name={IconNames.logout} size="md" color={colors.error.main} />
              <Text style={styles.logoutButtonText}>Sair da conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  header: {
    backgroundColor: colors.background.paper,
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  backButtonText: { ...textStyles.body, color: colors.secondary.main },
  title: { ...textStyles.h2, color: colors.text.primary },
  scrollView: { flex: 1 },
  content: { padding: spacing.base },
  section: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  settingRow: { flexDirection: 'row', alignItems: 'flex-start' },
  settingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingInfo: { flex: 1, marginRight: spacing.md },
  settingTitle: { ...textStyles.h5, color: colors.text.primary, marginBottom: spacing.xxs },
  settingDescription: { ...textStyles.bodySmall, color: colors.text.secondary, lineHeight: 20 },
  subSetting: { marginTop: spacing.base, paddingTop: spacing.base, borderTopWidth: 1, borderTopColor: colors.border.light },
  subSettingTitle: { ...textStyles.bodySmall, color: colors.text.primary, fontWeight: '600', marginBottom: spacing.md },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  optionButton: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  optionButtonActive: { backgroundColor: colors.secondary.main, borderColor: colors.secondary.main },
  optionText: { ...textStyles.bodySmall, color: colors.text.secondary, fontWeight: '500' },
  optionTextActive: { color: colors.primary.contrast },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  saveButtonText: { ...textStyles.button, color: colors.primary.contrast },
  accountSection: { marginTop: spacing.xl, paddingTop: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border.light },
  accountSectionTitle: { ...textStyles.h4, color: colors.text.primary, marginBottom: spacing.base },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error.light,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
  },
  logoutButtonText: { ...textStyles.button, color: colors.error.main },
});

export default ConfigNotificacoesAluno;
