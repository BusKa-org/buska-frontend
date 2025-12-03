import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';

const SelecaoRotas = ({navigation}) => {
  const [busca, setBusca] = useState('');

  // Dados mockados - todas as rotas disponíveis no município
  const rotasDisponiveis = [
    {
      id: 1,
      nome: 'Rota Centro - Zona Norte',
      bairroOrigem: 'Centro',
      distancia: '2.5 km',
      alunosCadastrados: 25,
      capacidade: 40,
    },
    {
      id: 2,
      nome: 'Rota Centro - Zona Sul',
      bairroOrigem: 'Centro',
      distancia: '3.2 km',
      alunosCadastrados: 18,
      capacidade: 40,
    },
    {
      id: 3,
      nome: 'Rota Jardim América - Centro',
      bairroOrigem: 'Jardim América',
      distancia: '1.8 km',
      alunosCadastrados: 32,
      capacidade: 40,
    },
    {
      id: 4,
      nome: 'Rota Vila Nova - Escola Municipal',
      bairroOrigem: 'Vila Nova',
      distancia: '4.1 km',
      alunosCadastrados: 15,
      capacidade: 40,
    },
    {
      id: 5,
      nome: 'Rota Bela Vista - Zona Leste',
      bairroOrigem: 'Bela Vista',
      distancia: '2.9 km',
      alunosCadastrados: 28,
      capacidade: 40,
    },
  ];

  const rotasFiltradas = rotasDisponiveis.filter(
    (rota) =>
      rota.nome.toLowerCase().includes(busca.toLowerCase()) ||
      rota.bairroOrigem.toLowerCase().includes(busca.toLowerCase()),
  );

  const handleCadastrar = (rota) => {
    // Simulação de cadastro
    console.log('Cadastrar na rota:', rota);
    // Aqui você mostraria uma confirmação e depois voltaria para o dashboard
    navigation.goBack();
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

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>
            Rotas Disponíveis ({rotasFiltradas.length})
          </Text>

          {rotasFiltradas.map((rota) => {
            const vagasDisponiveis = rota.capacidade - rota.alunosCadastrados;
            const temVagas = vagasDisponiveis > 0;

            return (
              <View key={rota.id} style={styles.rotaCard}>
                <View style={styles.rotaHeader}>
                  <View style={styles.rotaInfo}>
                    <Text style={styles.rotaNome}>{rota.nome}</Text>
                    <View style={styles.rotaMeta}>
                      <Text style={styles.rotaBairro}>
                        📍 {rota.bairroOrigem}
                      </Text>
                      <Text style={styles.rotaDistancia}>
                        📏 {rota.distancia} da sua casa
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.rotaFooter}>
                  <View style={styles.vagasInfo}>
                    <Text style={styles.vagasText}>
                      {vagasDisponiveis} vagas disponíveis
                    </Text>
                    <View
                      style={[
                        styles.vagasBar,
                        temVagas ? styles.vagasBarOk : styles.vagasBarFull,
                      ]}>
                      <View
                        style={[
                          styles.vagasBarFill,
                          {
                            width: `${(rota.alunosCadastrados / rota.capacidade) * 100}%`,
                          },
                          temVagas ? styles.vagasBarFillOk : styles.vagasBarFillFull,
                        ]}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.cadastrarButton,
                      !temVagas && styles.cadastrarButtonDisabled,
                    ]}
                    onPress={() => handleCadastrar(rota)}
                    disabled={!temVagas}>
                    <Text
                      style={[
                        styles.cadastrarButtonText,
                        !temVagas && styles.cadastrarButtonTextDisabled,
                      ]}>
                      {temVagas ? 'Cadastrar nesta rota' : 'Sem vagas'}
                    </Text>
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
});

export default SelecaoRotas;


