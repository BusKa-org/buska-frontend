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

const RotaMotorista = ({navigation, route}) => {
  const [rotas, setRotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const loadRotas = async () => {
    try {
      const rotasData = await motoristaService.listarRotas();
      setRotas(rotasData || []);
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
        <View style={styles.headerContent}>
          <Text style={styles.title}>Minhas Rotas</Text>
          <TouchableOpacity
            style={styles.criarRotaButton}
            onPress={() => navigation.navigate('CriarRota')}>
            <Text style={styles.criarRotaButtonText}>+ Nova Rota</Text>
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
            {rotas.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  Nenhuma rota cadastrada ainda
                </Text>
                <Text style={styles.emptySubtext}>
                  Crie sua primeira rota para começar
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => navigation.navigate('CriarRota')}>
                  <Text style={styles.emptyButtonText}>Criar Primeira Rota</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {rotas.map((rota) => (
                  <View key={rota.id} style={styles.rotaCard}>
                    <View style={styles.rotaHeader}>
                      <View style={styles.rotaInfo}>
                        <Text style={styles.rotaNome}>{rota.nome}</Text>
                        <Text style={styles.rotaId}>ID: {rota.id}</Text>
                      </View>
                    </View>

                    <View style={styles.rotaActions}>
                      <TouchableOpacity
                        style={styles.acaoButton}
                        onPress={() =>
                          navigation.navigate('DefinirPontosRota', {
                            rota: rota,
                            isNovaRota: false,
                          })
                        }>
                        <Text style={styles.acaoButtonText}>
                          📍 Gerenciar Pontos
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.acaoButton, styles.acaoButtonSecondary]}
                        onPress={() =>
                          navigation.navigate('CriarViagem', {
                            rota: rota,
                          })
                        }>
                        <Text style={styles.acaoButtonText}>
                          🚗 Criar Viagem
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
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
  criarRotaButton: {
    backgroundColor: '#34a853',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  criarRotaButtonText: {
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
  rotaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  rotaHeader: {
    marginBottom: 16,
  },
  rotaInfo: {
    marginBottom: 8,
  },
  rotaNome: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  rotaId: {
    fontSize: 12,
    color: '#999',
  },
  rotaActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  acaoButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  acaoButtonSecondary: {
    backgroundColor: '#34a853',
  },
  acaoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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

export default RotaMotorista;

