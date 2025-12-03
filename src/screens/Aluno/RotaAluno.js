import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

const RotaAluno = ({navigation, route}) => {
  const rota = route?.params?.rota || {
    id: 1,
    nome: 'Rota Centro - Zona Norte',
    bairro: 'Centro',
  };

  // Dados mockados - viagens do dia
  const [viagens, setViagens] = useState([
    {
      id: 1,
      tipo: 'Manhã',
      horario: '07:30',
      status: 'Confirmado',
      origem: 'Centro',
      destino: 'Escola Municipal',
    },
    {
      id: 2,
      tipo: 'Tarde',
      horario: '13:00',
      status: 'Não confirmado',
      origem: 'Centro',
      destino: 'Escola Municipal',
    },
    {
      id: 3,
      tipo: 'Noite',
      horario: '17:30',
      status: 'Encerrada',
      origem: 'Escola Municipal',
      destino: 'Centro',
    },
  ]);

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

  const handleConfirmarPresenca = (viagemId) => {
    setViagens(
      viagens.map((v) =>
        v.id === viagemId
          ? {
              ...v,
              status:
                v.status === 'Confirmado' ? 'Não confirmado' : 'Confirmado',
            }
          : v,
      ),
    );
  };

  const podeConfirmar = (viagem) => {
    return (
      viagem.status !== 'Encerrada' &&
      viagem.status !== 'Cancelada'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{rota.nome}</Text>
        <Text style={styles.subtitle}>{rota.bairro}</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Viagens do Dia</Text>

          {viagens.map((viagem) => (
            <View key={viagem.id} style={styles.viagemCard}>
              <View style={styles.viagemHeader}>
                <View style={styles.viagemInfo}>
                  <View style={styles.viagemTipoContainer}>
                    <Text style={styles.viagemTipo}>{viagem.tipo}</Text>
                    <Text style={styles.viagemHorario}>{viagem.horario}</Text>
                  </View>
                  <View style={styles.viagemRota}>
                    <Text style={styles.viagemOrigem}>
                      📍 {viagem.origem}
                    </Text>
                    <Text style={styles.viagemDestino}>
                      🎯 {viagem.destino}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {backgroundColor: getStatusBgColor(viagem.status)},
                  ]}>
                  <Text
                    style={[
                      styles.statusText,
                      {color: getStatusColor(viagem.status)},
                    ]}>
                    {viagem.status}
                  </Text>
                </View>
              </View>

              {podeConfirmar(viagem) && (
                <TouchableOpacity
                  style={[
                    styles.confirmarButton,
                    viagem.status === 'Confirmado' &&
                      styles.confirmarButtonActive,
                  ]}
                  onPress={() => handleConfirmarPresenca(viagem.id)}>
                  <Text
                    style={[
                      styles.confirmarButtonText,
                      viagem.status === 'Confirmado' &&
                        styles.confirmarButtonTextActive,
                    ]}>
                    {viagem.status === 'Confirmado'
                      ? 'Cancelar Presença'
                      : 'Confirmar Presença'}
                  </Text>
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
                <Text style={styles.detalhesButtonText}>Ver Detalhes →</Text>
              </TouchableOpacity>
            </View>
          ))}
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
});

export default RotaAluno;


