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
} from 'react-native';
import { alunoService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';

const DashboardAluno = ({navigation}) => {
  const [rotasCadastradas, setRotasCadastradas] = useState([]);
  const [proximaViagem, setProximaViagem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const getRoleLabel = (role) => {
    const roleMap = {
      'aluno': 'Aluno',
      'motorista': 'Motorista',
      'gestor': 'Gestor'
    };
    return roleMap[role] || role;
  };

  const getUserInfo = () => {
    const roleLabel = getRoleLabel(user?.role);
    const municipioInfo = user?.municipio 
      ? `${user.municipio.nome}${user.municipio.uf ? ` - ${user.municipio.uf}` : ''}`
      : '';
    return municipioInfo ? `${roleLabel} • ${municipioInfo}` : roleLabel;
  };

  const loadData = async () => {
    try {
      // Load enrolled routes
      const rotas = await alunoService.listarMinhasRotas();
      setRotasCadastradas(rotas || []);

      // Load all available trips (not just confirmed ones) to find the next one
      const todasViagens = await alunoService.listarViagens();
      
      if (todasViagens && todasViagens.length > 0 && rotas.length > 0) {
        // Filter trips for enrolled routes only
        const rotasIds = rotas.map(r => r.id);
        const viagensRotas = todasViagens.filter(v => rotasIds.includes(v.rota_id));
        
        // Sort by date and time, find the next upcoming trip
        const now = new Date();
        const upcomingTrips = viagensRotas
          .filter((v) => {
            try {
              const tripDate = new Date(v.data);
              const tripDateTime = v.horario_inicio 
                ? new Date(`${v.data}T${v.horario_inicio}`)
                : tripDate;
              return tripDateTime >= now;
            } catch (e) {
              return false;
            }
          })
          .sort((a, b) => {
            try {
              const dateA = new Date(`${a.data}T${a.horario_inicio || '00:00'}`);
              const dateB = new Date(`${b.data}T${b.horario_inicio || '00:00'}`);
              return dateA - dateB;
            } catch (e) {
              return 0;
            }
          });

        if (upcomingTrips.length > 0) {
          const nextTrip = upcomingTrips[0];
          
          // Check presenca status for this trip
          let presencaStatus = 'Não confirmado';
          try {
            const presencaData = await alunoService.obterPresencaViagem(nextTrip.id);
            presencaStatus = presencaData.presente ? 'Confirmado' : 'Não confirmado';
          } catch (error) {
            console.error('Error loading presenca status:', error);
          }
          
          setProximaViagem({
            id: nextTrip.id,
            horario: nextTrip.horario_inicio
              ? nextTrip.horario_inicio.substring(0, 5)
              : '--:--',
            tipo: nextTrip.tipo,
            status: presencaStatus,
            rota_id: nextTrip.rota_id,
            data: nextTrip.data,
          });
        } else {
          setProximaViagem(null);
        }
      } else {
        setProximaViagem(null);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setProximaViagem(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
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
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Olá, {user?.nome || 'Aluno'}! 👋
          </Text>
          <Text style={styles.subtitle}>
            {getUserInfo()}
          </Text>
        </View>

        {/* Próxima Viagem Destacada */}
        {proximaViagem && (
          <View style={styles.proximaViagemCard}>
            <Text style={styles.cardTitle}>Próxima Viagem</Text>
            <View style={styles.viagemInfo}>
              <View style={styles.viagemHeader}>
                <Text style={styles.viagemHorario}>{proximaViagem.horario}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    proximaViagem.status === 'Confirmado'
                      ? styles.statusConfirmado
                      : styles.statusNaoConfirmado,
                  ]}>
                  <Text style={styles.statusText}>{proximaViagem.status}</Text>
                </View>
              </View>
              <Text style={styles.viagemRota}>
                {rotasCadastradas.find((r) => r.id === proximaViagem.rota_id)
                  ?.nome || 'Rota'}
              </Text>
              <Text style={styles.viagemTipo}>{proximaViagem.tipo}</Text>
            </View>
            <TouchableOpacity
              style={styles.verDetalhesButton}
              onPress={() => {
                const rotaViagem = rotasCadastradas.find(
                  (r) => r.id === proximaViagem.rota_id
                );
                if (rotaViagem) {
                  navigation.navigate('DetalheViagem', {
                    rota: rotaViagem,
                    viagem: proximaViagem,
                  });
                }
              }}>
              <Text style={styles.verDetalhesText}>Ver Detalhes</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Botões Rápidos */}
        <View style={styles.botoesRapidos}>
          <TouchableOpacity
            style={styles.botaoRapido}
            onPress={() => navigation.navigate('MinhasRotas')}>
            <Text style={styles.botaoRapidoIcon}>🚌</Text>
            <Text style={styles.botaoRapidoText}>Minhas Rotas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoRapido}
            onPress={() => navigation.navigate('LocalizacaoOnibus')}>
            <Text style={styles.botaoRapidoIcon}>📍</Text>
            <Text style={styles.botaoRapidoText}>Mapa do Ônibus</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoRapido}
            onPress={() => navigation.navigate('Notificacoes')}>
            <Text style={styles.botaoRapidoIcon}>🔔</Text>
            <Text style={styles.botaoRapidoText}>Notificações</Text>
          </TouchableOpacity>
        </View>

        {/* Rotas Cadastradas */}
        <View style={styles.rotasSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rotas Cadastradas</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('SelecaoRotas')}>
              <Text style={styles.verTodasText}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {rotasCadastradas.length > 0 ? (
            rotasCadastradas.map((rota) => (
              <TouchableOpacity
                key={rota.id}
                style={styles.rotaCard}
                onPress={() => navigation.navigate('RotaAluno', {rota})}>
                <View style={styles.rotaInfo}>
                  <Text style={styles.rotaNome}>{rota.nome}</Text>
                  <Text style={styles.rotaBairro}>
                    {rota.municipio_nome || `Município ID: ${rota.municipio_id}`}
                  </Text>
                </View>
                <View style={styles.rotaStatus}>
                  <Text style={styles.rotaStatusText}>Cadastrado</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Você ainda não está cadastrado em nenhuma rota
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => navigation.navigate('SelecaoRotas')}>
                <Text style={styles.emptyStateButtonText}>
                  Ver rotas disponíveis
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Configurações */}
        <TouchableOpacity
          style={styles.configButton}
          onPress={() => navigation.navigate('ConfigNotificacoesAluno')}>
          <Text style={styles.configButtonText}>⚙️ Configurações</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  proximaViagemCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#1a73e8',
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 12,
  },
  viagemInfo: {
    marginBottom: 16,
  },
  viagemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  viagemHorario: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusConfirmado: {
    backgroundColor: '#34a853',
  },
  statusNaoConfirmado: {
    backgroundColor: '#fbbc04',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  viagemRota: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  viagemTipo: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  verDetalhesButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  verDetalhesText: {
    color: '#1a73e8',
    fontSize: 16,
    fontWeight: '600',
  },
  botoesRapidos: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  botaoRapido: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  botaoRapidoIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  botaoRapidoText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  rotasSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  verTodasText: {
    fontSize: 14,
    color: '#1a73e8',
    fontWeight: '600',
  },
  rotaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  rotaInfo: {
    flex: 1,
  },
  rotaNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  rotaBairro: {
    fontSize: 14,
    color: '#666',
  },
  rotaStatus: {
    alignItems: 'flex-end',
  },
  rotaStatusText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  rotaHorario: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a73e8',
  },
  configButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  configButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 24,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DashboardAluno;


