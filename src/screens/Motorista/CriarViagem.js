import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {motoristaService} from '../../services/motoristaService';
import {useAuth} from '../../contexts/AuthContext';

const CriarViagem = ({navigation, route}) => {
  const {user} = useAuth();
  const rotaParam = route?.params?.rota;
  
  const [rotas, setRotas] = useState([]);
  const [rotaSelecionada, setRotaSelecionada] = useState(rotaParam?.id || null);
  const [data, setData] = useState('');
  const [horarioInicio, setHorarioInicio] = useState('');
  const [horarioFim, setHorarioFim] = useState('');
  const [tipo, setTipo] = useState('IDA');
  const [loading, setLoading] = useState(false);
  const [loadingRotas, setLoadingRotas] = useState(true);

  useEffect(() => {
    const loadRotas = async () => {
      try {
        const rotasData = await motoristaService.listarRotas();
        setRotas(rotasData || []);
        
        // Se veio com rota pré-selecionada, garantir que está na lista
        if (rotaParam && rotasData) {
          const rotaExiste = rotasData.find((r) => r.id === rotaParam.id);
          if (rotaExiste) {
            setRotaSelecionada(rotaParam.id);
          }
        }
      } catch (error) {
        console.error('Error loading routes:', error);
        Alert.alert('Erro', 'Não foi possível carregar as rotas.');
      } finally {
        setLoadingRotas(false);
      }
    };

    loadRotas();
  }, []);

  const handleCriarViagem = async () => {
    console.log('handleCriarViagem called');
    console.log('rotaSelecionada:', rotaSelecionada);
    console.log('data:', data);
    console.log('horarioInicio:', horarioInicio);
    console.log('tipo:', tipo);
    
    if (!rotaSelecionada) {
      Alert.alert('Erro', 'Selecione uma rota');
      return;
    }

    if (!data.trim()) {
      Alert.alert('Erro', 'Informe a data da viagem');
      return;
    }

    if (!horarioInicio.trim()) {
      Alert.alert('Erro', 'Informe o horário de início');
      return;
    }

    if (!tipo) {
      Alert.alert('Erro', 'Selecione o tipo da viagem (IDA ou VOLTA)');
      return;
    }

    // Validar formato da data (YYYY-MM-DD)
    console.log('Validating data format...');
    const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dataRegex.test(data)) {
      console.log('Data validation failed');
      Alert.alert('Erro', 'Formato de data inválido. Use YYYY-MM-DD (ex: 2024-12-25)');
      return;
    }
    console.log('Data validation passed');

    // Normalizar horário para HH:MM (adicionar zero à esquerda se necessário)
    const normalizeHorario = (horario) => {
      const parts = horario.trim().split(':');
      if (parts.length === 2) {
        const horas = parts[0].padStart(2, '0');
        const minutos = parts[1].padStart(2, '0');
        return `${horas}:${minutos}`;
      }
      return horario;
    };

    // Validar formato do horário (HH:MM)
    console.log('Validating horario inicio format...');
    const horarioInicioNormalizado = normalizeHorario(horarioInicio);
    const horarioRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!horarioRegex.test(horarioInicioNormalizado)) {
      console.log('Horario inicio validation failed:', horarioInicioNormalizado);
      Alert.alert('Erro', 'Formato de horário inválido. Use HH:MM (ex: 08:30 ou 8:30)');
      return;
    }
    console.log('Horario inicio validation passed');

    if (horarioFim) {
      console.log('Validating horario fim format...');
      const horarioFimNormalizado = normalizeHorario(horarioFim);
      if (!horarioRegex.test(horarioFimNormalizado)) {
        console.log('Horario fim validation failed:', horarioFimNormalizado);
        Alert.alert('Erro', 'Formato de horário de fim inválido. Use HH:MM (ex: 17:00 ou 17:0)');
        return;
      }
      console.log('Horario fim validation passed');
    }

    try {
      setLoading(true);
      const viagemData = {
        rota_id: rotaSelecionada,
        data: data.trim(),
        horario_inicio: horarioInicioNormalizado,
        horario_fim: horarioFim ? normalizeHorario(horarioFim) : null,
        tipo: tipo,
      };
      console.log('All validations passed, creating viagem with data:', viagemData);
      console.log('Calling motoristaService.criarViagem...');
      const response = await motoristaService.criarViagem(viagemData);
      console.log('Viagem created successfully:', response);

      Alert.alert('Sucesso', 'Viagem criada com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            // Navegar para a lista de viagens
            navigation.navigate('ListaViagens');
          },
        },
      ]);
    } catch (error) {
      console.error('Error creating trip:', error);
      Alert.alert(
        'Erro',
        error?.message || 'Não foi possível criar a viagem. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Obter data de hoje no formato YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Criar Nova Viagem</Text>
      </View>

      {loadingRotas ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a73e8" />
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            {/* Seleção de Rota */}
            <View style={styles.section}>
              <Text style={styles.label}>Rota *</Text>
              {rotas.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    Você não possui rotas cadastradas
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => navigation.navigate('CriarRota')}>
                    <Text style={styles.emptyButtonText}>Criar Rota</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.rotasScroll}>
                  {rotas.map((rota) => (
                    <TouchableOpacity
                      key={rota.id}
                      style={[
                        styles.rotaOption,
                        rotaSelecionada === rota.id && styles.rotaOptionSelected,
                      ]}
                      onPress={() => setRotaSelecionada(rota.id)}>
                      <Text
                        style={[
                          styles.rotaOptionText,
                          rotaSelecionada === rota.id &&
                            styles.rotaOptionTextSelected,
                        ]}>
                        {rota.nome}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Data */}
            <View style={styles.section}>
              <Text style={styles.label}>Data *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD (ex: 2024-12-25)"
                placeholderTextColor="#999"
                value={data}
                onChangeText={setData}
                editable={!loading}
              />
              <Text style={styles.hint}>
                Data mínima: {getTodayDate()}
              </Text>
            </View>

            {/* Horário de Início */}
            <View style={styles.section}>
              <Text style={styles.label}>Horário de Início *</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM (ex: 08:30)"
                placeholderTextColor="#999"
                value={horarioInicio}
                onChangeText={setHorarioInicio}
                editable={!loading}
              />
            </View>

            {/* Horário de Fim */}
            <View style={styles.section}>
              <Text style={styles.label}>Horário de Fim (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM (ex: 17:00)"
                placeholderTextColor="#999"
                value={horarioFim}
                onChangeText={setHorarioFim}
                editable={!loading}
              />
            </View>

            {/* Tipo */}
            <View style={styles.section}>
              <Text style={styles.label}>Tipo *</Text>
              <View style={styles.tipoContainer}>
                <TouchableOpacity
                  style={[
                    styles.tipoOption,
                    tipo === 'IDA' && styles.tipoOptionSelected,
                  ]}
                  onPress={() => setTipo('IDA')}
                  disabled={loading}>
                  <Text
                    style={[
                      styles.tipoOptionText,
                      tipo === 'IDA' && styles.tipoOptionTextSelected,
                    ]}>
                    IDA
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tipoOption,
                    tipo === 'VOLTA' && styles.tipoOptionSelected,
                  ]}
                  onPress={() => setTipo('VOLTA')}
                  disabled={loading}>
                  <Text
                    style={[
                      styles.tipoOptionText,
                      tipo === 'VOLTA' && styles.tipoOptionTextSelected,
                    ]}>
                    VOLTA
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Botão Criar */}
            <TouchableOpacity
              style={[styles.button, (loading || !rotaSelecionada || rotas.length === 0) && styles.buttonDisabled]}
              onPress={() => {
                console.log('Button pressed');
                console.log('Button disabled?', loading || !rotaSelecionada || rotas.length === 0);
                handleCriarViagem();
              }}
              disabled={loading || !rotaSelecionada || rotas.length === 0}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Criar Viagem</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
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
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  rotasScroll: {
    marginTop: 8,
  },
  rotaOption: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  rotaOptionSelected: {
    borderColor: '#1a73e8',
    backgroundColor: '#e8f0fe',
  },
  rotaOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  rotaOptionTextSelected: {
    color: '#1a73e8',
    fontWeight: '600',
  },
  tipoContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tipoOption: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  tipoOptionSelected: {
    borderColor: '#1a73e8',
    backgroundColor: '#e8f0fe',
  },
  tipoOptionText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  tipoOptionTextSelected: {
    color: '#1a73e8',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#34a853',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CriarViagem;

