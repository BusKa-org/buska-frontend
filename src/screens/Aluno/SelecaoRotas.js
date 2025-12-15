import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { alunoService } from '../../services';

const SelecaoRotas = ({navigation}) => {
  const [busca, setBusca] = useState('');
  const [rotasDisponiveis, setRotasDisponiveis] = useState([]);
  const [rotasInscritas, setRotasInscritas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subscribing, setSubscribing] = useState(null);

  const loadRotas = async () => {
    try {
      // Carregar todas as rotas disponíveis
      const rotas = await alunoService.listarRotas();
      
      // Carregar rotas em que o aluno já está inscrito
      const rotasInscritasData = await alunoService.listarMinhasRotas();
      
      setRotasDisponiveis(rotas || []);
      setRotasInscritas(rotasInscritasData || []);
    } catch (error) {
      console.error('Error loading routes:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar as rotas. Tente novamente.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRotas();
  }, []);

  // Filtrar rotas: excluir as que o aluno já está inscrito
  const rotasIdsInscritas = rotasInscritas.map((r) => r.id);
  const rotasDisponiveisFiltradas = rotasDisponiveis.filter(
    (rota) => !rotasIdsInscritas.includes(rota.id),
  );

  const rotasFiltradas = rotasDisponiveisFiltradas.filter(
    (rota) =>
      rota.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  const handleCadastrar = async (rota) => {
    try {
      setSubscribing(rota.id);
      await alunoService.gerenciarInscricaoRota(rota.id, 'inscrever');
      
      // Atualizar a lista de rotas inscritas e remover da lista de disponíveis
      const rotasInscritasAtualizadas = await alunoService.listarMinhasRotas();
      setRotasInscritas(rotasInscritasAtualizadas || []);
      
      // Remover a rota da lista de disponíveis
      setRotasDisponiveis(rotasDisponiveis.filter((r) => r.id !== rota.id));
      
      Alert.alert('Sucesso', 'Você foi cadastrado nesta rota!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error('Error subscribing to route:', error);
      Alert.alert(
        'Erro',
        error?.message || 'Não foi possível cadastrar na rota. Tente novamente.',
      );
    } finally {
      setSubscribing(null);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRotas();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Selecionar Rota</Text>
      </View>

      {/* Busca */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar rota ou bairro..."
          placeholderTextColor="#999"
          value={busca}
          onChangeText={setBusca}
        />
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
            <Text style={styles.sectionTitle}>
              Rotas Disponíveis ({rotasFiltradas.length})
            </Text>

            {rotasFiltradas.map((rota) => {
              const isSubscribing = subscribing === rota.id;

            return (
              <View key={rota.id} style={styles.rotaCard}>
                <View style={styles.rotaHeader}>
                  <View style={styles.rotaInfo}>
                    <Text style={styles.rotaNome}>{rota.nome}</Text>
                    <View style={styles.rotaMeta}>
                      <Text style={styles.rotaBairro}>
                        📍 {rota.municipio_nome || `Município ID: ${rota.municipio_id}`}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.rotaFooter}>
                  <TouchableOpacity
                    style={[
                      styles.cadastrarButton,
                      isSubscribing && styles.cadastrarButtonDisabled,
                    ]}
                    onPress={() => handleCadastrar(rota)}
                    disabled={isSubscribing}>
                    {isSubscribing ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.cadastrarButtonText}>
                        Cadastrar nesta rota
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {rotasFiltradas.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Nenhuma rota encontrada
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Tente buscar com outros termos
              </Text>
            </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  rotaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  rotaHeader: {
    marginBottom: 12,
  },
  rotaInfo: {
    marginBottom: 8,
  },
  rotaNome: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  rotaMeta: {
    gap: 4,
  },
  rotaBairro: {
    fontSize: 14,
    color: '#666',
  },
  rotaDistancia: {
    fontSize: 14,
    color: '#666',
  },
  rotaFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  vagasInfo: {
    marginBottom: 12,
  },
  vagasText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  vagasBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  vagasBarOk: {
    backgroundColor: '#e8f5e9',
  },
  vagasBarFull: {
    backgroundColor: '#ffebee',
  },
  vagasBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  vagasBarFillOk: {
    backgroundColor: '#34a853',
  },
  vagasBarFillFull: {
    backgroundColor: '#ea4335',
  },
  cadastrarButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  cadastrarButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  cadastrarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cadastrarButtonTextDisabled: {
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
});

export default SelecaoRotas;


