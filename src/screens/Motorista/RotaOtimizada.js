import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

const RotaOtimizada = ({navigation, route}) => {
  const {viagem} = route?.params || {};
  const [totalmenteOtimizada, setTotalmenteOtimizada] = useState(false);
  const [pontosOtimizados, setPontosOtimizados] = useState([]);

  const pontosForaDeOrdem = pontosOtimizados.filter(
    (p) => p.confirmadoAposInicio,
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Rota Otimizada</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Aviso se não estiver totalmente otimizada */}
          {pontosForaDeOrdem.length > 0 && (
            <View style={styles.avisoBox}>
              <Text style={styles.avisoIcon}>⚠️</Text>
              <View style={styles.avisoContent}>
                <Text style={styles.avisoTitle}>
                  Rota não totalmente otimizada
                </Text>
                <Text style={styles.avisoText}>
                  {pontosForaDeOrdem.length} ponto(s) com confirmações após o
                  início da viagem estão fora da ordem ideal.
                </Text>
              </View>
            </View>
          )}

          {totalmenteOtimizada && (
            <View style={styles.sucessoBox}>
              <Text style={styles.sucessoIcon}>✓</Text>
              <Text style={styles.sucessoText}>
                Rota totalmente otimizada!
              </Text>
            </View>
          )}

          {/* Lista de Pontos Ordenados */}
          <View style={styles.pontosContainer}>
            <Text style={styles.sectionTitle}>Ordem dos Pontos</Text>
            {pontosOtimizados.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum ponto disponível</Text>
            ) : (
              pontosOtimizados.map((ponto, index) => (
              <View
                key={ponto.id}
                style={[
                  styles.pontoCard,
                  ponto.confirmadoAposInicio && styles.pontoCardForaOrdem,
                  ponto.tipo === 'destino' && styles.pontoCardDestino,
                ]}>
                <View style={styles.pontoHeader}>
                  <View style={styles.ordemContainer}>
                    <Text style={styles.ordemNumero}>{ponto.ordem}</Text>
                    {ponto.tipo === 'destino' && (
                      <Text style={styles.destinoLabel}>Destino</Text>
                    )}
                  </View>
                  <View style={styles.pontoInfo}>
                    <Text style={styles.pontoNome}>{ponto.nome}</Text>
                    <View style={styles.alunosInfo}>
                      <Text style={styles.alunosText}>
                        {ponto.alunosConfirmados} aluno(s) confirmado(s)
                      </Text>
                      {ponto.confirmadoAposInicio && (
                        <View style={styles.foraOrdemBadge}>
                          <Text style={styles.foraOrdemText}>
                            Confirmado após início
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                {index < pontosOtimizados.length - 1 && (
                  <View style={styles.linhaConector}>
                    <Text style={styles.linhaConectorText}>↓</Text>
                  </View>
                )}
              </View>
              ))
            )}
          </View>

          {/* Informações Adicionais */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Informações da Rota</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total de pontos:</Text>
              <Text style={styles.infoValue}>{pontosOtimizados.length}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Alunos confirmados:</Text>
              <Text style={styles.infoValue}>
                {pontosOtimizados.reduce(
                  (sum, p) => sum + p.alunosConfirmados,
                  0,
                )}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pontos fora de ordem:</Text>
              <Text style={styles.infoValue}>{pontosForaDeOrdem.length}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.aceitarButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.aceitarButtonText}>Aceitar Rota</Text>
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
  avisoBox: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#fbbc04',
  },
  avisoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  avisoContent: {
    flex: 1,
  },
  avisoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },
  avisoText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  sucessoBox: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#34a853',
  },
  sucessoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sucessoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
  },
  pontosContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  pontoCard: {
    marginBottom: 8,
  },
  pontoCardForaOrdem: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fbbc04',
  },
  pontoCardDestino: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#34a853',
  },
  pontoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ordemContainer: {
    width: 50,
    alignItems: 'center',
    marginRight: 12,
  },
  ordemNumero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  destinoLabel: {
    fontSize: 10,
    color: '#34a853',
    fontWeight: '600',
    marginTop: 2,
  },
  pontoInfo: {
    flex: 1,
  },
  pontoNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  alunosInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alunosText: {
    fontSize: 14,
    color: '#666',
  },
  foraOrdemBadge: {
    backgroundColor: '#ea4335',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  foraOrdemText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  linhaConector: {
    alignItems: 'center',
    marginVertical: 4,
  },
  linhaConectorText: {
    fontSize: 20,
    color: '#1a73e8',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  aceitarButton: {
    backgroundColor: '#34a853',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  aceitarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
  },
});

export default RotaOtimizada;


