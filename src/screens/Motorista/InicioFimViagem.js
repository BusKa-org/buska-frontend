import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { colors, spacing, borderRadius, shadows, textStyles, fontSize, fontWeight } from '../../theme';
import Icon, { IconNames } from '../../components/Icon';

const InicioFimViagem = ({navigation, route}) => {
  const viagem = route?.params?.viagem;

  if (!viagem) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name={IconNames.back} size="md" color={viagemIniciada ? colors.text.hint : colors.secondary.main} />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Iniciar Viagem</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.emptyText}>Dados da viagem não disponíveis</Text>
        </View>
      </SafeAreaView>
    );
  }

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
              <Icon name={IconNames.location} size="md" color={colors.secondary.main} />
              <Text style={styles.pontoNome}>{viagem.origem}</Text>
            </View>
            <View style={styles.linhaRota} />
            <View style={styles.pontoRota}>
              <Icon name={IconNames.location} size="md" color={colors.accent.main} />
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
            <Icon name={IconNames.play} size="xl" color={colors.text.inverse} />
            <Text style={styles.iniciarButtonText}>Iniciar Viagem</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.finalizarButton}
            onPress={handleFinalizarViagem}>
            <Icon name={IconNames.stop} size="xl" color={colors.text.inverse} />
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
    backgroundColor: colors.background.default,
  },
  header: {
    backgroundColor: colors.background.paper,
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    ...shadows.sm,
  },
  backButton: {
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backButtonText: {
    ...textStyles.body,
    color: colors.secondary.main,
  },
  backButtonDisabled: {
    color: colors.text.hint,
  },
  title: {
    ...textStyles.h2,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  viagemInfo: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  viagemTipo: {
    ...textStyles.h4,
    color: colors.secondary.main,
    fontWeight: fontWeight.semiBold,
    marginBottom: spacing.sm,
  },
  viagemHorario: {
    fontSize: fontSize.display1,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
  rotaInfo: {
    width: '100%',
    alignItems: 'center',
  },
  pontoRota: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  pontoNome: {
    ...textStyles.h4,
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
  },
  linhaRota: {
    width: 2,
    height: spacing.lg,
    backgroundColor: colors.border.light,
    marginBottom: spacing.md,
  },
  cronometroContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  cronometroLabel: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  cronometro: {
    fontSize: fontSize.display1,
    fontWeight: fontWeight.bold,
    color: colors.secondary.main,
    fontFamily: 'monospace',
  },
  iniciarButton: {
    backgroundColor: colors.success.main,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
    ...shadows.xl,
  },
  iniciarButtonText: {
    ...textStyles.button,
    color: colors.text.inverse,
    fontSize: fontSize.h3,
    fontWeight: fontWeight.bold,
  },
  finalizarButton: {
    backgroundColor: colors.error.main,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
    ...shadows.xl,
  },
  finalizarButtonText: {
    ...textStyles.button,
    color: colors.text.inverse,
    fontSize: fontSize.h3,
    fontWeight: fontWeight.bold,
  },
  acoesContainer: {
    gap: spacing.md,
  },
  acaoButton: {
    backgroundColor: colors.secondary.main,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    alignItems: 'center',
    ...shadows.sm,
  },
  acaoButtonText: {
    ...textStyles.button,
    color: colors.text.inverse,
  },
  emptyText: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default InicioFimViagem;


