import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

const DashboardAluno = ({navigation}) => {
  // Dados mockados
  const rotasCadastradas = [
    {
      id: 1,
      nome: 'Rota Centro - Zona Norte',
      bairro: 'Centro',
      proximaViagem: {
        horario: '07:30',
        tipo: 'Manhã',
        status: 'Confirmado',
      },
    },
    {
      id: 2,
      nome: 'Rota Centro - Zona Sul',
      bairro: 'Centro',
      proximaViagem: {
        horario: '13:00',
        tipo: 'Tarde',
        status: 'Não confirmado',
      },
    },
  ];

  const proximaViagem = rotasCadastradas[0]?.proximaViagem;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, João Silva! 👋</Text>
          <Text style={styles.subtitle}>Bem-vindo ao transporte escolar</Text>
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
                {rotasCadastradas[0].nome}
              </Text>
              <Text style={styles.viagemTipo}>{proximaViagem.tipo}</Text>
            </View>
            <TouchableOpacity
              style={styles.verDetalhesButton}
              onPress={() =>
                navigation.navigate('DetalheViagem', {
                  rota: rotasCadastradas[0],
                  viagem: proximaViagem,
                })
              }>
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

          {rotasCadastradas.map((rota) => (
            <TouchableOpacity
              key={rota.id}
              style={styles.rotaCard}
              onPress={() => navigation.navigate('RotaAluno', {rota})}>
              <View style={styles.rotaInfo}>
                <Text style={styles.rotaNome}>{rota.nome}</Text>
                <Text style={styles.rotaBairro}>{rota.bairro}</Text>
              </View>
              <View style={styles.rotaStatus}>
                <Text style={styles.rotaStatusText}>
                  {rota.proximaViagem.status}
                </Text>
                <Text style={styles.rotaHorario}>
                  {rota.proximaViagem.horario}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
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
});

export default DashboardAluno;


