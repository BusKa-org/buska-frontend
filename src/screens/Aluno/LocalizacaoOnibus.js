import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';

const {width, height} = Dimensions.get('window');

const LocalizacaoOnibus = ({navigation, route}) => {
  const {rota, viagem} = route?.params || {
    rota: {
      id: 1,
      nome: 'Rota Centro - Zona Norte',
    },
    viagem: {
      horario: '07:30',
    },
  };

  const [distanciaAluno, setDistanciaAluno] = useState(850); // metros
  const [posicaoOnibus, setPosicaoOnibus] = useState({x: 100, y: 200});

  // Simula movimento do ônibus
  useEffect(() => {
    const interval = setInterval(() => {
      setPosicaoOnibus((prev) => ({
        x: prev.x + (Math.random() - 0.5) * 10,
        y: prev.y + (Math.random() - 0.5) * 10,
      }));
      setDistanciaAluno((prev) => Math.max(0, prev - Math.random() * 50));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Pontos da rota (coordenadas simuladas)
  const pontosRota = [
    {id: 1, nome: 'Centro', x: 50, y: 100, tipo: 'origem'},
    {id: 2, nome: 'Praça da República', x: width / 2, y: 150, tipo: 'parada'},
    {id: 3, nome: 'Avenida Principal', x: width - 100, y: 250, tipo: 'parada'},
    {
      id: 4,
      nome: 'Escola Municipal',
      x: width - 80,
      y: height - 200,
      tipo: 'destino',
    },
  ];

  // Posição do aluno (simulada)
  const posicaoAluno = {x: width - 100, y: height - 150};

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Localização do Ônibus</Text>
          <Text style={styles.headerSubtitle}>{rota.nome}</Text>
        </View>
      </View>

      {/* Mapa em Tela Cheia */}
      <View style={styles.mapaContainer}>
        {/* Pontos da Rota */}
        {pontosRota.map((ponto) => (
          <View
            key={ponto.id}
            style={[
              styles.pontoMapa,
              {
                left: ponto.x,
                top: ponto.y,
              },
              ponto.tipo === 'origem' && styles.pontoOrigem,
              ponto.tipo === 'destino' && styles.pontoDestino,
            ]}>
            <Text style={styles.pontoMapaIcon}>
              {ponto.tipo === 'origem'
                ? '📍'
                : ponto.tipo === 'destino'
                ? '🎯'
                : '•'}
            </Text>
            <Text style={styles.pontoMapaNome}>{ponto.nome}</Text>
          </View>
        ))}

        {/* Linha da Rota */}
        <View style={styles.rotaLine} />

        {/* Marcador do Ônibus */}
        <View
          style={[
            styles.onibusMarker,
            {
              left: posicaoOnibus.x,
              top: posicaoOnibus.y,
            },
          ]}>
          <Text style={styles.onibusIcon}>🚌</Text>
          <View style={styles.onibusPulse} />
        </View>

        {/* Marcador do Aluno */}
        <View
          style={[
            styles.alunoMarker,
            {
              left: posicaoAluno.x,
              top: posicaoAluno.y,
            },
          ]}>
          <Text style={styles.alunoIcon}>👤</Text>
        </View>

        {/* Linha entre ônibus e aluno */}
        <View style={styles.distanciaLine} />
      </View>

      {/* Painel de Informações */}
      <View style={styles.infoPanel}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Distância até você</Text>
            <Text style={styles.infoValue}>
              {distanciaAluno > 1000
                ? `${(distanciaAluno / 1000).toFixed(1)} km`
                : `${Math.round(distanciaAluno)} m`}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Tempo estimado</Text>
            <Text style={styles.infoValue}>
              {Math.round(distanciaAluno / 200)} min
            </Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Em movimento</Text>
          </View>
        </View>
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#1a73e8',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  mapaContainer: {
    flex: 1,
    backgroundColor: '#e8f5e9',
    position: 'relative',
  },
  pontoMapa: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 2,
  },
  pontoMapaIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  pontoMapaNome: {
    fontSize: 10,
    color: '#333',
    fontWeight: '500',
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pontoOrigem: {
    zIndex: 3,
  },
  pontoDestino: {
    zIndex: 3,
  },
  rotaLine: {
    position: 'absolute',
    width: width - 100,
    height: 2,
    backgroundColor: '#1a73e8',
    opacity: 0.3,
    left: 50,
    top: height / 2,
    transform: [{rotate: '15deg'}],
    zIndex: 1,
  },
  onibusMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  onibusIcon: {
    fontSize: 40,
  },
  onibusPulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1a73e8',
    opacity: 0.3,
    zIndex: -1,
  },
  alunoMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  alunoIcon: {
    fontSize: 32,
  },
  distanciaLine: {
    position: 'absolute',
    width: 2,
    height: 100,
    backgroundColor: '#ea4335',
    opacity: 0.5,
    left: width - 100,
    top: height - 150,
    zIndex: 4,
  },
  infoPanel: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34a853',
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#34a853',
    fontWeight: '600',
  },
});

export default LocalizacaoOnibus;


