import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

const SelecaoFluxo = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Transporte Escolar</Text>
          <Text style={styles.subtitle}>Gestão Municipal</Text>
          <Text style={styles.description}>
            Selecione o tipo de usuário para acessar o sistema
          </Text>
        </View>

        <View style={styles.fluxosContainer}>
          <TouchableOpacity
            style={styles.fluxoCard}
            onPress={() => navigation.navigate('AlunoNavigator')}>
            <Text style={styles.fluxoIcon}>🎒</Text>
            <Text style={styles.fluxoTitle}>Aluno</Text>
            <Text style={styles.fluxoDescription}>
              Confirme sua presença e acompanhe sua rota
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fluxoCard}
            onPress={() => navigation.navigate('MotoristaNavigator')}>
            <Text style={styles.fluxoIcon}>🚌</Text>
            <Text style={styles.fluxoTitle}>Motorista</Text>
            <Text style={styles.fluxoDescription}>
              Gerencie suas rotas e viagens
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.fluxoCard, styles.fluxoCardDisabled]}>
            <Text style={styles.fluxoIcon}>👔</Text>
            <Text style={styles.fluxoTitle}>Gestor</Text>
            <Text style={styles.fluxoDescription}>
              Acompanhe relatórios e estatísticas
            </Text>
            <Text style={styles.comingSoon}>Em breve</Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a73e8',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  fluxosContainer: {
    gap: 16,
  },
  fluxoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a73e8',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fluxoCardDisabled: {
    borderColor: '#e0e0e0',
    opacity: 0.6,
  },
  fluxoIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  fluxoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  fluxoDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  comingSoon: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default SelecaoFluxo;


