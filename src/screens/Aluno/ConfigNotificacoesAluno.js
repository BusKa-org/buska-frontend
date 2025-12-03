import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native';

const ConfigNotificacoesAluno = ({navigation}) => {
  const [lembretePresenca, setLembretePresenca] = useState(true);
  const [antecedenciaLembrete, setAntecedenciaLembrete] = useState(30); // minutos
  const [notificacaoAproximacao, setNotificacaoAproximacao] = useState(true);
  const [distanciaAproximacao, setDistanciaAproximacao] = useState(500); // metros

  const opcoesAntecedencia = [15, 30, 45, 60];
  const opcoesDistancia = [200, 500, 1000, 1500];

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
          {/* Lembrete de Presença */}
          <View style={styles.section}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Lembrete de Presença</Text>
                <Text style={styles.settingDescription}>
                  Receber notificações para confirmar sua presença antes da
                  viagem
                </Text>
              </View>
              <Switch
                value={lembretePresenca}
                onValueChange={setLembretePresenca}
                trackColor={{false: '#e0e0e0', true: '#1a73e8'}}
                thumbColor="#fff"
              />
            </View>

            {lembretePresenca && (
              <View style={styles.subSetting}>
                <Text style={styles.subSettingTitle}>
                  Antecedência do Lembrete
                </Text>
                <View style={styles.optionsContainer}>
                  {opcoesAntecedencia.map((minutos) => (
                    <TouchableOpacity
                      key={minutos}
                      style={[
                        styles.optionButton,
                        antecedenciaLembrete === minutos &&
                          styles.optionButtonActive,
                      ]}
                      onPress={() => setAntecedenciaLembrete(minutos)}>
                      <Text
                        style={[
                          styles.optionText,
                          antecedenciaLembrete === minutos &&
                            styles.optionTextActive,
                        ]}>
                        {minutos} min
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Notificação de Aproximação */}
          <View style={styles.section}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>
                  Notificação de Aproximação
                </Text>
                <Text style={styles.settingDescription}>
                  Receber notificação quando o ônibus estiver próximo
                </Text>
              </View>
              <Switch
                value={notificacaoAproximacao}
                onValueChange={setNotificacaoAproximacao}
                trackColor={{false: '#e0e0e0', true: '#1a73e8'}}
                thumbColor="#fff"
              />
            </View>

            {notificacaoAproximacao && (
              <View style={styles.subSetting}>
                <Text style={styles.subSettingTitle}>
                  Distância para Notificação
                </Text>
                <View style={styles.optionsContainer}>
                  {opcoesDistancia.map((metros) => (
                    <TouchableOpacity
                      key={metros}
                      style={[
                        styles.optionButton,
                        distanciaAproximacao === metros &&
                          styles.optionButtonActive,
                      ]}
                      onPress={() => setDistanciaAproximacao(metros)}>
                      <Text
                        style={[
                          styles.optionText,
                          distanciaAproximacao === metros &&
                            styles.optionTextActive,
                        ]}>
                        {metros}m
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Botão Salvar */}
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Salvar Configurações</Text>
          </TouchableOpacity>
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
  subSetting: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  subSettingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  optionButtonActive: {
    backgroundColor: '#1a73e8',
    borderColor: '#1a73e8',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#fff',
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
});

export default ConfigNotificacoesAluno;


