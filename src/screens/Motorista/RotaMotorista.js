import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

const RotaMotorista = ({navigation, route}) => {
  // Dados mockados - viagens do dia
  const viagens = [
    {
      id: 1,
      tipo: 'Manhã',
      horario: '07:30',
      origem: 'Centro',
      destino: 'Escola Municipal',
      status: 'A iniciar',
      alunosConfirmados: 18,
      totalAlunos: 25,
    },
    {
      id: 2,
      tipo: 'Tarde',
      horario: '13:00',
      origem: 'Centro',
      destino: 'Escola Municipal',
      status: 'A iniciar',
      alunosConfirmados: 15,
      totalAlunos: 25,
    },
    {
      id: 3,
      tipo: 'Noite',
      horario: '17:30',
      origem: 'Escola Municipal',
      destino: 'Centro',
      status: 'Finalizada',
      alunosConfirmados: 22,
      totalAlunos: 25,
    },
  ];

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
        <Text style={styles.title}>Rotas do Dia</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {viagens.map((viagem) => (
            <View key={viagem.id} style={styles.viagemCard}>
              <View style={styles.viagemHeader}>
                <View style={styles.viagemInfo}>
                  <View style={styles.viagemTipoContainer}>
                    <Text style={styles.viagemTipo}>{viagem.tipo}</Text>
                    <Text style={styles.viagemHorario}>{viagem.horario}</Text>
                  </View>
                  <View style={styles.rotaInfo}>
                    <View style={styles.pontoRota}>
                      <Text style={styles.pontoIcon}>📍</Text>
                      <Text style={styles.pontoNome}>{viagem.origem}</Text>
                    </View>
                    <View style={styles.linhaRota} />
                    <View style={styles.pontoRota}>
                      <Text style={styles.pontoIcon}>🎯</Text>
                      <Text style={styles.pontoNome}>{viagem.destino}</Text>
                    </View>
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

              <View style={styles.alunosInfo}>
                <Text style={styles.alunosText}>
                  {viagem.alunosConfirmados} de {viagem.totalAlunos} alunos
                  confirmados
                </Text>
                <View style={styles.alunosBar}>
                  <View
                    style={[
                      styles.alunosBarFill,
                      {
                        width: `${
                          (viagem.alunosConfirmados / viagem.totalAlunos) * 100
                        }%`,
                      },
                    ]}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.detalhesButton}
                onPress={() =>
                  navigation.navigate('DetalheViagemMotorista', {viagem})
                }>
                <Text style={styles.detalhesButtonText}>Ver Detalhes →</Text>
              </TouchableOpacity>

              {viagem.status === 'A iniciar' && (
                <TouchableOpacity
                  style={styles.acaoButton}
                  onPress={() =>
                    navigation.navigate('InicioFimViagem', {viagem})
                  }>
                  <Text style={styles.acaoButtonText}>Iniciar Viagem</Text>
                </TouchableOpacity>
              )}

              {viagem.status === 'Em andamento' && (
                <TouchableOpacity
                  style={styles.acaoButton}
                  onPress={() =>
                    navigation.navigate('ListaAlunosConfirmados', {viagem})
                  }>
                  <Text style={styles.acaoButtonText}>
                    Ver Alunos Confirmados
                  </Text>
                </TouchableOpacity>
              )}

              {viagem.status === 'Finalizada' && (
                <View style={styles.finalizadaInfo}>
                  <Text style={styles.finalizadaText}>✓ Viagem finalizada</Text>
                </View>
              )}
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
  rotaInfo: {
    marginTop: 8,
  },
  pontoRota: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pontoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  pontoNome: {
    fontSize: 14,
    color: '#666',
  },
  linhaRota: {
    width: 2,
    height: 16,
    backgroundColor: '#e0e0e0',
    marginLeft: 12,
    marginBottom: 8,
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
  alunosInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
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
  detalhesButton: {
    padding: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  detalhesButtonText: {
    color: '#1a73e8',
    fontSize: 14,
    fontWeight: '500',
  },
  acaoButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  acaoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  finalizadaInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    alignItems: 'center',
  },
  finalizadaText: {
    color: '#34a853',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RotaMotorista;

