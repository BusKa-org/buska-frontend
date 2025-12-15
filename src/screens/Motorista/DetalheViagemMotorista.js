import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {motoristaService} from '../../services/motoristaService';

const DetalheViagemMotorista = ({navigation, route}) => {
  const {viagem} = route?.params || {};

  if (!viagem) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Detalhes da Viagem</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.emptyText}>Dados da viagem não disponíveis</Text>
        </View>
      </SafeAreaView>
    );
  }

  const [situacaoViagem, setSituacaoViagem] = useState(viagem.status);
  const [pontosRota, setPontosRota] = useState([]);
  const [alunosInfo, setAlunosInfo] = useState({
    totalAlunos: 0,
    alunosConfirmados: 0,
  });
  const [loadingAlunos, setLoadingAlunos] = useState(true);

  useEffect(() => {
    const loadAlunosInfo = async () => {
      if (!viagem?.id) return;
      
      try {
        setLoadingAlunos(true);
        const data = await motoristaService.listarAlunosViagem(viagem.id);
        setAlunosInfo({
          totalAlunos: data.total_alunos || 0,
          alunosConfirmados: data.alunos_confirmados || 0,
        });
      } catch (error) {
        console.error('Error loading alunos info:', error);
        // Não mostrar erro, apenas deixar como 0
        setAlunosInfo({
          totalAlunos: 0,
          alunosConfirmados: 0,
        });
      } finally {
        setLoadingAlunos(false);
      }
    };

    loadAlunosInfo();
  }, [viagem?.id]);

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

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'A iniciar':
        return '#fff3cd';
      case 'Em andamento':
        return '#e3f2fd';
      case 'Finalizada':
        return '#e8f5e9';
      default:
        return '#f5f5f5';
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
        <Text style={styles.title}>Detalhes da Viagem</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Informações Principais */}
          <View style={styles.card}>
            <View style={styles.viagemHeader}>
              <View>
                <Text style={styles.viagemTipo}>{viagem.tipo}</Text>
                <Text style={styles.viagemHorario}>{viagem.horario}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {backgroundColor: getStatusBgColor(situacaoViagem)},
                ]}>
                <Text
                  style={[
                    styles.statusText,
                    {color: getStatusColor(situacaoViagem)},
                  ]}>
                  {situacaoViagem}
                </Text>
              </View>
            </View>

            <View style={styles.rotaInfo}>
              <View style={styles.pontoRota}>
                <View style={styles.pontoIcon}>
                  <Text style={styles.pontoIconText}>📍</Text>
                </View>
                <View style={styles.pontoInfo}>
                  <Text style={styles.pontoLabel}>Origem</Text>
                  <Text style={styles.pontoNome}>{viagem.origem}</Text>
                </View>
              </View>

              <View style={styles.linhaRota} />

              <View style={styles.pontoRota}>
                <View style={styles.pontoIcon}>
                  <Text style={styles.pontoIconText}>🎯</Text>
                </View>
                <View style={styles.pontoInfo}>
                  <Text style={styles.pontoLabel}>Destino</Text>
                  <Text style={styles.pontoNome}>{viagem.destino}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Informações de Alunos */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Alunos Confirmados</Text>
            {loadingAlunos ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#1a73e8" />
              </View>
            ) : (
              <View style={styles.alunosInfo}>
                <Text style={styles.alunosText}>
                  {alunosInfo.alunosConfirmados} de {alunosInfo.totalAlunos} alunos
                  confirmados
                </Text>
                {alunosInfo.totalAlunos > 0 ? (
                  <View style={styles.alunosBar}>
                    <View
                      style={[
                        styles.alunosBarFill,
                        {
                          width: `${
                            (alunosInfo.alunosConfirmados / alunosInfo.totalAlunos) * 100
                          }%`,
                        },
                      ]}
                    />
                  </View>
                ) : (
                  <Text style={styles.emptyAlunosText}>
                    Nenhum aluno inscrito nesta rota
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.verAlunosButton}
              onPress={() =>
                navigation.navigate('ListaAlunosConfirmados', {viagem})
              }>
              <Text style={styles.verAlunosButtonText}>
                Ver Lista Completa de Alunos
              </Text>
            </TouchableOpacity>
          </View>

          {/* Pontos da Rota */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pontos da Rota</Text>
            {pontosRota.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum ponto cadastrado</Text>
            ) : (
              pontosRota.map((ponto, index) => (
              <View key={ponto.id} style={styles.pontoItem}>
                <View style={styles.pontoItemLeft}>
                  <View
                    style={[
                      styles.pontoItemIcon,
                      ponto.tipo === 'origem' && styles.pontoItemIconOrigem,
                      ponto.tipo === 'destino' && styles.pontoItemIconDestino,
                    ]}>
                    <Text style={styles.pontoItemIconText}>
                      {ponto.tipo === 'origem'
                        ? '📍'
                        : ponto.tipo === 'destino'
                        ? '🎯'
                        : '•'}
                    </Text>
                  </View>
                  {index < pontosRota.length - 1 && (
                    <View style={styles.pontoItemLine} />
                  )}
                </View>
                <View style={styles.pontoItemRight}>
                  <Text style={styles.pontoItemNome}>{ponto.nome}</Text>
                  <Text style={styles.pontoItemTipo}>
                    {ponto.tipo === 'origem'
                      ? 'Origem'
                      : ponto.tipo === 'destino'
                      ? 'Destino'
                      : 'Parada'}
                    {ponto.alunos > 0 && ` • ${ponto.alunos} aluno(s)`}
                  </Text>
                </View>
              </View>
              ))
            )}
          </View>

          {/* Mapa Simplificado */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Mapa da Rota</Text>
            <View style={styles.mapaPlaceholder}>
              <Text style={styles.mapaPlaceholderText}>🗺️</Text>
              <Text style={styles.mapaPlaceholderLabel}>
                Mapa com pontos da rota
              </Text>
              <Text style={styles.mapaPlaceholderSubtext}>
                (Em implementação)
              </Text>
            </View>
          </View>

          {/* Configurações da Rota */}
          {situacaoViagem === 'A iniciar' && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Configurações da Rota</Text>
              <TouchableOpacity
                style={styles.definirPontosButton}
                onPress={() =>
                  navigation.navigate('DefinirPontosRota', {
                    viagem,
                    rota: viagem?.rota_id ? {id: viagem.rota_id} : null,
                    isNovaRota: false,
                  })
                }>
                <Text style={styles.definirPontosButtonText}>
                  📍 Definir Pontos da Rota
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Ações */}
          {situacaoViagem === 'A iniciar' && (
            <TouchableOpacity
              style={styles.iniciarButton}
              onPress={() =>
                navigation.navigate('InicioFimViagem', {viagem})
              }>
              <Text style={styles.iniciarButtonText}>Iniciar Viagem</Text>
            </TouchableOpacity>
          )}

          {situacaoViagem === 'Em andamento' && (
            <TouchableOpacity
              style={styles.verRotaOtimizadaButton}
              onPress={() =>
                navigation.navigate('RotaOtimizada', {viagem})
              }>
              <Text style={styles.verRotaOtimizadaButtonText}>
                Ver Rota Otimizada
              </Text>
            </TouchableOpacity>
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
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  viagemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  viagemTipo: {
    fontSize: 16,
    color: '#1a73e8',
    fontWeight: '600',
    marginBottom: 4,
  },
  viagemHorario: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rotaInfo: {
    marginTop: 8,
  },
  pontoRota: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pontoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pontoIconText: {
    fontSize: 20,
  },
  pontoInfo: {
    flex: 1,
  },
  pontoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  pontoNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  linhaRota: {
    width: 2,
    height: 20,
    backgroundColor: '#e0e0e0',
    marginLeft: 20,
    marginBottom: 12,
  },
  alunosInfo: {
    marginBottom: 16,
  },
  alunosText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  alunosBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  alunosBarFill: {
    height: '100%',
    backgroundColor: '#34a853',
    borderRadius: 4,
  },
  verAlunosButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  verAlunosButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  pontoItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  pontoItemLeft: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  pontoItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pontoItemIconOrigem: {
    backgroundColor: '#e3f2fd',
  },
  pontoItemIconDestino: {
    backgroundColor: '#e8f5e9',
  },
  pontoItemIconText: {
    fontSize: 16,
  },
  pontoItemLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 4,
  },
  pontoItemRight: {
    flex: 1,
  },
  pontoItemNome: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  pontoItemTipo: {
    fontSize: 12,
    color: '#666',
  },
  mapaPlaceholder: {
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  mapaPlaceholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  mapaPlaceholderLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  mapaPlaceholderSubtext: {
    fontSize: 12,
    color: '#999',
  },
  iniciarButton: {
    backgroundColor: '#34a853',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  iniciarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  verRotaOtimizadaButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  verRotaOtimizadaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  definirPontosButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  definirPontosButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyAlunosText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default DetalheViagemMotorista;

