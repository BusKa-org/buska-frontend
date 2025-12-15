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
          <Text style={styles.backButtonText}>← Voltar</Text>
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
                trackColor={{false: '#e0e0e0', true: '#1a73e8'}}
                thumbColor="#fff"
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
                trackColor={{false: '#e0e0e0', true: '#1a73e8'}}
                thumbColor="#fff"
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
                trackColor={{false: '#e0e0e0', true: '#1a73e8'}}
                thumbColor="#fff"
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
                trackColor={{false: '#e0e0e0', true: '#1a73e8'}}
                thumbColor="#fff"
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
              <Text style={styles.logoutButtonText}>🚪 Sair</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#1a73e8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  accountSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  accountSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffebee',
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: '600',
  },
});

export default ConfigNotificacoesMotorista;


