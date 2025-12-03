import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

const DashboardMotorista = ({navigation}) => {
  // Dados mockados
  const proximaViagem = {
    id: 1,
    tipo: 'Manhã',
    horario: '07:30',
    origem: 'Centro',
    destino: 'Escola Municipal',
    alunosConfirmados: 18,
    totalAlunos: 25,
    status: 'A iniciar',
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, Carlos Silva! 👋</Text>
          <Text style={styles.subtitle}>Motorista - Rota Centro - Zona Norte</Text>
        </View>

        {/* Próxima Viagem */}
        <View style={styles.proximaViagemCard}>
          <Text style={styles.cardTitle}>Próxima Viagem do Dia</Text>
          <View style={styles.viagemInfo}>
            <View style={styles.viagemHeader}>
              <View>
                <Text style={styles.viagemTipo}>{proximaViagem.tipo}</Text>
                <Text style={styles.viagemHorario}>{proximaViagem.horario}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{proximaViagem.status}</Text>
              </View>
            </View>

            <View style={styles.rotaInfo}>
              <View style={styles.pontoRota}>
                <Text style={styles.pontoIcon}>📍</Text>
                <Text style={styles.pontoNome}>{proximaViagem.origem}</Text>
              </View>
              <View style={styles.linhaRota} />
              <View style={styles.pontoRota}>
                <Text style={styles.pontoIcon}>🎯</Text>
                <Text style={styles.pontoNome}>{proximaViagem.destino}</Text>
              </View>
            </View>

            <View style={styles.alunosInfo}>
              <Text style={styles.alunosText}>
                {proximaViagem.alunosConfirmados} de {proximaViagem.totalAlunos}{' '}
                alunos confirmados
              </Text>
              <View style={styles.alunosBar}>
                <View
                  style={[
                    styles.alunosBarFill,
                    {
                      width: `${
                        (proximaViagem.alunosConfirmados /
                          proximaViagem.totalAlunos) *
                        100
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Botões de Ação */}
          <View style={styles.acoesContainer}>
            <TouchableOpacity
              style={styles.verDetalhesButton}
              onPress={() =>
                navigation.navigate('DetalheViagemMotorista', {
                  viagem: proximaViagem,
                })
              }>
              <Text style={styles.verDetalhesButtonText}>Ver Detalhes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iniciarButton}
              onPress={() =>
                navigation.navigate('InicioFimViagem', {viagem: proximaViagem})
              }>
              <Text style={styles.iniciarButtonText}>Iniciar Viagem</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botões Rápidos */}
        <View style={styles.botoesRapidos}>
          <TouchableOpacity
            style={styles.botaoRapido}
            onPress={() => navigation.navigate('RotaMotorista')}>
            <Text style={styles.botaoRapidoIcon}>🚌</Text>
            <Text style={styles.botaoRapidoText}>Minhas Rotas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoRapido}
            onPress={() => navigation.navigate('ChatGestor')}>
            <Text style={styles.botaoRapidoIcon}>💬</Text>
            <Text style={styles.botaoRapidoText}>Chat Gestor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoRapido}
            onPress={() => navigation.navigate('ConfigNotificacoesMotorista')}>
            <Text style={styles.botaoRapidoIcon}>⚙️</Text>
            <Text style={styles.botaoRapidoText}>Configurações</Text>
          </TouchableOpacity>
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
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  viagemInfo: {
    marginBottom: 20,
  },
  viagemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
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
    backgroundColor: '#fff3cd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fbbc04',
    fontSize: 12,
    fontWeight: '600',
  },
  rotaInfo: {
    marginBottom: 16,
  },
  pontoRota: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pontoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  pontoNome: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  linhaRota: {
    width: 2,
    height: 20,
    backgroundColor: '#e0e0e0',
    marginLeft: 14,
    marginBottom: 8,
  },
  alunosInfo: {
    marginTop: 12,
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
  acoesContainer: {
    gap: 12,
  },
  verDetalhesButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  verDetalhesButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  iniciarButton: {
    backgroundColor: '#34a853',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  iniciarButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
  acessoRapido: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  rapidoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  rapidoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  rapidoText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default DashboardMotorista;

