import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { alunoService } from '../../services';

const RotaAluno = ({navigation, route}) => {
  const rota = route?.params?.rota || {
    id: 1,
    nome: 'Rota',
  };

  const [viagens, setViagens] = useState([]);
  const [presencasStatus, setPresencasStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingPresenca, setUpdatingPresenca] = useState(null);
  const isMountedRef = useRef(true);

  const loadViagens = async () => {
    try {
      // Load all trips for this route
      const todasViagens = await alunoService.listarViagens();
      // Filter trips for this route
      const viagensRota = todasViagens.filter((v) => v.rota_id === rota.id);
      setViagens(viagensRota || []);
      
      // Load presenca status for each trip in parallel
      const statusPromises = viagensRota.map(async (viagem) => {
        try {
          const presencaData = await alunoService.obterPresencaViagem(viagem.id);
          return { viagemId: viagem.id, presente: presencaData.presente || false };
        } catch (error) {
          console.error(`Error loading presenca for trip ${viagem.id}:`, error);
          return { viagemId: viagem.id, presente: false };
        }
      });
      
      const statusResults = await Promise.all(statusPromises);
      const statusMap = {};
      statusResults.forEach(({ viagemId, presente }) => {
        statusMap[viagemId] = presente;
      });
      setPresencasStatus(statusMap);
    } catch (error) {
      console.error('Error loading trips:', error);
      Alert.alert('Erro', 'Não foi possível carregar as viagens.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadViagens();
    return () => {
      isMountedRef.current = false;
    };
  }, [rota.id]);

  // Reload when screen comes into focus (user returns from detail screen)
  // This works for React Navigation, for web we rely on pull-to-refresh
  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      if (isMountedRef.current) {
        loadViagens();
      }
    });
    return unsubscribe;
  }, [navigation, rota.id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmado':
        return '#34a853';
      case 'Não confirmado':
        return '#fbbc04';
      case 'Encerrada':
        return '#666';
      case 'Cancelada':
        return '#ea4335';
      default:
        return '#999';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'Confirmado':
        return '#e8f5e9';
      case 'Não confirmado':
        return '#fff3cd';
      case 'Encerrada':
        return '#f5f5f5';
      case 'Cancelada':
        return '#ffebee';
      default:
        return '#f5f5f5';
    }
  };

  const handleConfirmarPresenca = async (viagemId, currentStatus) => {
    try {
      setUpdatingPresenca(viagemId);
      const novoStatus = currentStatus === 'Confirmado' ? false : true;
      await alunoService.alterarPresencaViagem(viagemId, novoStatus);
      
      // Update presenca status in state
      setPresencasStatus({
        ...presencasStatus,
        [viagemId]: novoStatus,
      });
    } catch (error) {
      console.error('Error updating presence:', error);
      Alert.alert(
        'Erro',
        error?.message || 'Não foi possível atualizar a presença.',
      );
    } finally {
      setUpdatingPresenca(null);
    }
  };

  const podeConfirmar = (viagem) => {
    // Check if trip has ended
    if (viagem.horario_fim) {
      const fimViagem = new Date(`${viagem.data}T${viagem.horario_fim}`);
      return new Date() < fimViagem;
    }
    return true;
  };

  const getStatusFromViagem = (viagem) => {
    // Check if trip has ended
    if (viagem.horario_fim) {
      const fimViagem = new Date(`${viagem.data}T${viagem.horario_fim}`);
      if (new Date() > fimViagem) {
        return 'Encerrada';
      }
    }
    // Check presenca status from state
    const presencaConfirmada = presencasStatus[viagem.id] || false;
    return presencaConfirmada ? 'Confirmado' : 'Não confirmado';
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadViagens();
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    // Handle ISO format or HH:MM format
    if (timeString.includes('T')) {
      return timeString.substring(11, 16);
    }
    return timeString.substring(0, 5);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a73e8" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{rota.nome}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Viagens</Text>

          {viagens.length > 0 ? (
            viagens.map((viagem) => {
              const status = getStatusFromViagem(viagem);
              const horarioInicio = formatTime(viagem.horario_inicio);
              const horarioFim = formatTime(viagem.horario_fim);
              const dataFormatada = formatDate(viagem.data);
              const isUpdating = updatingPresenca === viagem.id;

              return (
                <View key={viagem.id} style={styles.viagemCard}>
                  <View style={styles.viagemHeader}>
                    <View style={styles.viagemInfo}>
                      <View style={styles.viagemTipoContainer}>
                        <Text style={styles.viagemTipo}>{viagem.tipo}</Text>
                        <Text style={styles.viagemHorario}>
                          {horarioInicio}
                          {horarioFim && ` - ${horarioFim}`}
                        </Text>
                      </View>
                      <Text style={styles.viagemData}>{dataFormatada}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {backgroundColor: getStatusBgColor(status)},
                      ]}>
                      <Text
                        style={[
                          styles.statusText,
                          {color: getStatusColor(status)},
                        ]}>
                        {status}
                      </Text>
                    </View>
                  </View>

                  {podeConfirmar(viagem) && (
                    <TouchableOpacity
                      style={[
                        styles.confirmarButton,
                        status === 'Confirmado' &&
                          styles.confirmarButtonActive,
                        isUpdating && styles.confirmarButtonDisabled,
                      ]}
                      onPress={() => handleConfirmarPresenca(viagem.id, status)}
                      disabled={isUpdating}>
                      {isUpdating ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text
                          style={[
                            styles.confirmarButtonText,
                            status === 'Confirmado' &&
                              styles.confirmarButtonTextActive,
                          ]}>
                          {status === 'Confirmado'
                            ? 'Cancelar Presença'
                            : 'Confirmar Presença'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.detalhesButton}
                    onPress={() =>
                      navigation.navigate('DetalheViagem', {
                        rota,
                        viagem,
                      })
                    }>
                    <Text style={styles.detalhesButtonText}>
                      Ver Detalhes →
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Nenhuma viagem encontrada para esta rota
              </Text>
            </View>
          )}
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  viagemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  viagemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  viagemInfo: {
    flex: 1,
  },
  viagemTipoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  viagemTipo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a73e8',
  },
  viagemHorario: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viagemRota: {
    gap: 4,
  },
  viagemOrigem: {
    fontSize: 14,
    color: '#666',
  },
  viagemDestino: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  confirmarButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmarButtonActive: {
    backgroundColor: '#ea4335',
  },
  confirmarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmarButtonTextActive: {
    color: '#fff',
  },
  detalhesButton: {
    padding: 8,
    alignItems: 'center',
  },
  detalhesButtonText: {
    color: '#1a73e8',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viagemData: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  confirmarButtonDisabled: {
    opacity: 0.6,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default RotaAluno;


