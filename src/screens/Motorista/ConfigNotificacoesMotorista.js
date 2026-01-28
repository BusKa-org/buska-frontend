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
    console.log('handleLogout chamado');
    
    // Usar window.confirm na web, Alert.alert no mobile
    const isWeb = Platform.OS === 'web';
    
    let shouldLogout = false;
    
    if (isWeb) {
      // Na web, usar window.confirm que funciona melhor
      shouldLogout = window.confirm('Tem certeza que deseja sair?');
      console.log('Confirmação web:', shouldLogout);
    } else {
      // No mobile, usar Alert
      return new Promise((resolve) => {
        Alert.alert(
          'Sair',
          'Tem certeza que deseja sair?',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => {
                console.log('Logout cancelado');
                resolve(false);
              },
            },
            {
              text: 'Sair',
              style: 'destructive',
              onPress: async () => {
                shouldLogout = true;
                resolve(true);
              },
            },
          ],
          { 
            cancelable: true,
            onDismiss: () => {
              console.log('Alert fechado sem ação');
              resolve(false);
            }
          }
        );
      }).then(async (confirmed) => {
        if (confirmed) {
          await performLogout();
        }
      });
    }
    
    if (shouldLogout) {
      await performLogout();
    }
  };

  const performLogout = async () => {
    console.log('Iniciando logout...');
    try {
      await logout();
      console.log('Logout concluído');
    } catch (error) {
      console.error('Erro no logout:', error);
      // Mesmo em caso de erro, tentar limpar o estado novamente
      try {
        await logout();
      } catch (e) {
        console.error('Erro ao tentar logout novamente:', e);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name={IconNames.back} size="md" color={colors.secondary.main} />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Configurações de Notificação</Text>
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
              onPress={() => {
                console.log('Botão Sair pressionado!');
                handleLogout();
              }}
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
    backgroundColor: colors.background.paper,
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    ...shadows.sm,
  },
  backButton: {
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backButtonText: {
    ...textStyles.body,
    color: colors.secondary.main,
  },
  title: {
    ...textStyles.h2,
    color: colors.text.primary,
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
    lineHeight: lineHeight.relaxed,
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


