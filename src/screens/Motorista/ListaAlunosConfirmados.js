import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

const ListaAlunosConfirmados = ({navigation, route}) => {
  const viagem = route?.params?.viagem || {
    id: 1,
    tipo: 'Manhã',
    horario: '07:30',
  };

  // Dados mockados - alunos confirmados
  const [alunos, setAlunos] = useState([
    {
      id: 1,
      nome: 'João Silva',
      pontoEmbarque: 'Centro - Rua Principal',
      confirmadoAntes: true,
      foto: null,
    },
    {
      id: 2,
      nome: 'Maria Santos',
      pontoEmbarque: 'Centro - Praça da República',
      confirmadoAntes: true,
      foto: null,
    },
    {
      id: 3,
      nome: 'Pedro Oliveira',
      pontoEmbarque: 'Avenida Principal',
      confirmadoAntes: false, // Confirmado após início da viagem
      foto: null,
    },
    {
      id: 4,
      nome: 'Ana Costa',
      pontoEmbarque: 'Centro - Rua Principal',
      confirmadoAntes: true,
      foto: null,
    },
    {
      id: 5,
      nome: 'Lucas Ferreira',
      pontoEmbarque: 'Praça da República',
      confirmadoAntes: false, // Confirmado após início da viagem
      foto: null,
    },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Alunos Confirmados</Text>
        <Text style={styles.subtitle}>
          {viagem.tipo} - {viagem.horario}
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.resumo}>
            <Text style={styles.resumoText}>
              {alunos.length} alunos confirmados
            </Text>
            <Text style={styles.resumoSubtext}>
              {alunos.filter((a) => !a.confirmadoAntes).length} confirmações
              após início
            </Text>
          </View>

          {alunos.map((aluno) => (
            <View
              key={aluno.id}
              style={[
                styles.alunoCard,
                !aluno.confirmadoAntes && styles.alunoCardNovo,
              ]}>
              <View style={styles.alunoHeader}>
                <View style={styles.alunoAvatar}>
                  {aluno.foto ? (
                    <Text style={styles.alunoFoto}>📷</Text>
                  ) : (
                    <Text style={styles.alunoInicial}>
                      {aluno.nome.charAt(0)}
                    </Text>
                  )}
                </View>
                <View style={styles.alunoInfo}>
                  <View style={styles.alunoNomeContainer}>
                    <Text style={styles.alunoNome}>{aluno.nome}</Text>
                    {!aluno.confirmadoAntes && (
                      <View style={styles.novoBadge}>
                        <Text style={styles.novoBadgeText}>NOVO</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.pontoContainer}>
                    <Text style={styles.pontoIcon}>📍</Text>
                    <Text style={styles.pontoEmbarque}>
                      {aluno.pontoEmbarque}
                    </Text>
                  </View>
                </View>
                <View style={styles.confirmadoIcon}>
                  <Text style={styles.confirmadoIconText}>✓</Text>
                </View>
              </View>
            </View>
          ))}

          {alunos.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Nenhum aluno confirmado ainda
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
  resumo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resumoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  resumoSubtext: {
    fontSize: 14,
    color: '#666',
  },
  alunoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  alunoCardNovo: {
    borderColor: '#1a73e8',
    borderWidth: 2,
    backgroundColor: '#e3f2fd',
  },
  alunoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alunoAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1a73e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alunoFoto: {
    fontSize: 24,
  },
  alunoInicial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  alunoInfo: {
    flex: 1,
  },
  alunoNomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  alunoNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  novoBadge: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  novoBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  pontoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pontoIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  pontoEmbarque: {
    fontSize: 14,
    color: '#666',
  },
  confirmadoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#34a853',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmadoIconText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
});

export default ListaAlunosConfirmados;


