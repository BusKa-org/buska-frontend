import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

const InicioFimViagem = ({navigation, route}) => {
  const viagem = route?.params?.viagem || {
    id: 1,
    tipo: 'Manhã',
    horario: '07:30',
    origem: 'Centro',
    destino: 'Escola Municipal',
  };

  const [viagemIniciada, setViagemIniciada] = useState(false);
  const [tempoDecorrido, setTempoDecorrido] = useState(0); // em segundos
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    if (viagemIniciada) {
      const id = setInterval(() => {
        setTempoDecorrido((prev) => prev + 1);
      }, 1000);
      setIntervalId(id);
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [viagemIniciada]);

  const formatarTempo = (segundos) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;

    if (horas > 0) {
      return `${horas.toString().padStart(2, '0')}:${minutos
        .toString()
        .padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    }
    return `${minutos.toString().padStart(2, '0')}:${segs
      .toString()
      .padStart(2, '0')}`;
  };

  const handleIniciarViagem = () => {
    setViagemIniciada(true);
    setTempoDecorrido(0);
  };

  const handleFinalizarViagem = () => {
    setViagemIniciada(false);
    // Aqui você salvaria os dados da viagem
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={viagemIniciada}>
          <Text
            style={[
              styles.backButtonText,
              viagemIniciada && styles.backButtonDisabled,
            ]}>
            ← Voltar
          </Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {viagemIniciada ? 'Viagem em Andamento' : 'Iniciar Viagem'}
        </Text>
      </View>

      <View style={styles.content}>
        {/* Informações da Viagem */}
        <View style={styles.viagemInfo}>
          <Text style={styles.viagemTipo}>{viagem.tipo}</Text>
          <Text style={styles.viagemHorario}>{viagem.horario}</Text>
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

        {/* Cronômetro */}
        {viagemIniciada && (
          <View style={styles.cronometroContainer}>
            <Text style={styles.cronometroLabel}>Tempo decorrido</Text>
            <Text style={styles.cronometro}>{formatarTempo(tempoDecorrido)}</Text>
          </View>
        )}

        {/* Botão Principal */}
        {!viagemIniciada ? (
          <TouchableOpacity
            style={styles.iniciarButton}
            onPress={handleIniciarViagem}>
            <Text style={styles.iniciarButtonIcon}>▶</Text>
            <Text style={styles.iniciarButtonText}>Iniciar Viagem</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.finalizarButton}
            onPress={handleFinalizarViagem}>
            <Text style={styles.finalizarButtonIcon}>■</Text>
            <Text style={styles.finalizarButtonText}>Finalizar Viagem</Text>
          </TouchableOpacity>
        )}

        {/* Ações Adicionais */}
        {viagemIniciada && (
          <View style={styles.acoesContainer}>
            <TouchableOpacity
              style={styles.acaoButton}
              onPress={() =>
                navigation.navigate('ListaAlunosConfirmados', {viagem})
              }>
              <Text style={styles.acaoButtonText}>
                Ver Alunos Confirmados
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acaoButton}
              onPress={() =>
                navigation.navigate('RotaOtimizada', {viagem})
              }>
              <Text style={styles.acaoButtonText}>Ver Rota Otimizada</Text>
            </TouchableOpacity>
          </View>
        )}
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
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#1a73e8',
  },
  backButtonDisabled: {
    color: '#999',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  viagemInfo: {
    alignItems: 'center',
    marginBottom: 48,
  },
  viagemTipo: {
    fontSize: 18,
    color: '#1a73e8',
    fontWeight: '600',
    marginBottom: 8,
  },
  viagemHorario: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  rotaInfo: {
    width: '100%',
    alignItems: 'center',
  },
  pontoRota: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pontoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  pontoNome: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  linhaRota: {
    width: 2,
    height: 20,
    backgroundColor: '#e0e0e0',
    marginBottom: 12,
  },
  cronometroContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  cronometroLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  cronometro: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#1a73e8',
    fontFamily: 'monospace',
  },
  iniciarButton: {
    backgroundColor: '#34a853',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iniciarButtonIcon: {
    fontSize: 48,
    color: '#fff',
    marginBottom: 8,
  },
  iniciarButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  finalizarButton: {
    backgroundColor: '#ea4335',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  finalizarButtonIcon: {
    fontSize: 48,
    color: '#fff',
    marginBottom: 8,
  },
  finalizarButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  acoesContainer: {
    gap: 12,
  },
  acaoButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  acaoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default InicioFimViagem;


