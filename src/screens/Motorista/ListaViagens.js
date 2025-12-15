import React, {useState, useEffect} from 'react';
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
import {motoristaService} from '../../services/motoristaService';

const ListaViagens = ({navigation}) => {
  const [viagens, setViagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadViagens = async () => {
    try {
      setLoading(true);
      const viagensData = await motoristaService.listarViagens();
      console.log('Viagens recebidas:', viagensData);
      
      // Ordenar por data (mais recentes primeiro)
      const viagensOrdenadas = (viagensData || []).sort((a, b) => {
        const dataA = new Date(a.data);
        const dataB = new Date(b.data);
        return dataB - dataA;
      });
      
      console.log('Viagens ordenadas:', viagensOrdenadas);
      setViagens(viagensOrdenadas);
    } catch (error) {
      console.error('Error loading trips:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      Alert.alert(
        'Erro',
        error?.message || 'Não foi possível carregar as viagens. Tente novamente.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadViagens();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadViagens();
  };

  const getStatusViagem = (viagem) => {
    // horario_fim existe quando a viagem foi finalizada
    if (viagem.horario_fim) {
      return 'Finalizada';
    }
    // Por enquanto, todas as viagens sem horario_fim são "A iniciar"
    // O status "Em andamento" seria determinado quando a viagem é iniciada
    // mas isso requer verificar se horario_inicio foi atualizado pela API de iniciar
    return 'A iniciar';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'A iniciar':
        return '#fbbc04';
      case 'Em andamento':
        return '#1a73e8';
      case 'Finalizada':
        return '#34a853';
      default:
        return '#999';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return timeString.substring(0, 5);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Minhas Viagens</Text>
          <TouchableOpacity
            style={styles.criarViagemButton}
            onPress={() => navigation.navigate('CriarViagem')}>
            <Text style={styles.criarViagemButtonText}>+ Nova Viagem</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a73e8" />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <View style={styles.content}>
            {viagens.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  Nenhuma viagem cadastrada ainda
                </Text>
                <Text style={styles.emptySubtext}>
                  Crie sua primeira viagem para começar
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => navigation.navigate('CriarViagem')}>
                  <Text style={styles.emptyButtonText}>Criar Primeira Viagem</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {viagens.map((viagem) => {
                  console.log('Renderizando viagem:', viagem);
                  const status = getStatusViagem(viagem);
                  return (
                    <TouchableOpacity
                      key={viagem.id}
                      style={styles.viagemCard}
                      onPress={() =>
                        navigation.navigate('DetalheViagemMotorista', {
                          viagem,
                        })
                      }>
                      <View style={styles.viagemHeader}>
                        <View style={styles.viagemInfo}>
                          <Text style={styles.viagemTipo}>{viagem.tipo || 'N/A'}</Text>
                          <Text style={styles.viagemData}>
                            {viagem.data ? formatDate(viagem.data) : 'Data não disponível'}
                          </Text>
                          <Text style={styles.viagemHorario}>
                            {viagem.horario_inicio ? formatTime(viagem.horario_inicio) : '--:--'}
                            {viagem.horario_fim
                              ? ` - ${formatTime(viagem.horario_fim)}`
                              : ''}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            {backgroundColor: getStatusColor(status) + '20'},
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
                      <Text style={styles.rotaId}>Rota ID: {viagem.rota_id || 'N/A'}</Text>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  criarViagemButton: {
    backgroundColor: '#34a853',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  criarViagemButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  viagemInfo: {
    flex: 1,
  },
  viagemTipo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  viagemData: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  viagemHorario: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rotaId: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
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

export default ListaViagens;

