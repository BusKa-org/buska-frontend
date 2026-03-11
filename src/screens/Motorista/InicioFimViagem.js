import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius, shadows, textStyles, fontSize, fontWeight } from '../../theme';
import Icon, { IconNames } from '../../components/Icon';
import { motoristaService } from '../../services/motoristaService';
import { useToast } from '../../components/Toast';

const InicioFimViagem = ({navigation, route}) => {
  const viagemParam = route?.params?.viagem;
  const toast = useToast();
  
  const [viagem, setViagem] = useState(viagemParam);
  const [viagemIniciada, setViagemIniciada] = useState(viagemParam?.status === 'EM_ANDAMENTO');
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [tempoDecorrido, setTempoDecorrido] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  // Load fresh trip data on mount
  useEffect(() => {
    const loadTripStatus = async () => {
      if (!viagemParam?.id) {
        setLoadingStatus(false);
        return;
      }
      
      try {
        setLoadingStatus(true);
        const viagens = await motoristaService.listarViagens();
        const viagemAtual = viagens.find(v => v.id === viagemParam.id);
        
        if (viagemAtual) {
          setViagem(viagemAtual);
          const emAndamento = viagemAtual.status === 'EM_ANDAMENTO';
          setViagemIniciada(emAndamento);
          
          // Calculate elapsed time if trip is in progress
          if (emAndamento && viagemAtual.inicio_real) {
            const inicioDate = new Date(viagemAtual.inicio_real);
            const agora = new Date();
            const elapsedSeconds = Math.floor((agora - inicioDate) / 1000);
            setTempoDecorrido(Math.max(0, elapsedSeconds));
          }
        }
      } catch (error) {
        console.error('Error loading trip status:', error);
        // Fallback to param status
        setViagemIniciada(viagemParam?.status === 'EM_ANDAMENTO');
      } finally {
        setLoadingStatus(false);
      }
    };

    loadTripStatus();
  }, [viagemParam?.id]);

  // Timer effect for trip duration
  useEffect(() => {
    let id = null;
    if (viagemIniciada) {
      id = setInterval(() => {
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
      if (id) {
        clearInterval(id);
      }
    };
  }, [viagemIniciada]);

  // Helper functions
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

  const handleIniciarViagem = async () => {
    try {
      setLoading(true);
      await motoristaService.iniciarViagem(viagem?.id || viagemParam?.id);
      setViagemIniciada(true);
      setTempoDecorrido(0);
      toast.success('Viagem iniciada!');
    } catch (error) {
      console.error('Error starting trip:', error);
      toast.error(error?.message || 'Erro ao iniciar viagem');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizarViagem = async () => {
    try {
      setLoading(true);
      await motoristaService.finalizarViagem(viagem?.id || viagemParam?.id);
      toast.success('Viagem finalizada!');
      navigation.goBack();
    } catch (error) {
      console.error('Error finishing trip:', error);
      toast.error(error?.message || 'Erro ao finalizar viagem');
      setLoading(false);
    }
  };

  // Conditional renders AFTER all hooks
  if (!viagemParam) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Icon name={IconNames.back} size="md" color={colors.secondary.contrast} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.title}>Iniciar Viagem</Text>
            </View>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Icon name={IconNames.warning} size="xxl" color={colors.warning.main} />
          <Text style={styles.emptyContainerText}>Dados da viagem não disponíveis</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loadingStatus) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Icon name={IconNames.back} size="md" color={colors.secondary.contrast} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.title}>Carregando...</Text>
            </View>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.secondary.main} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, viagemIniciada && styles.headerEmAndamento]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={[styles.backButton, viagemIniciada && styles.backButtonDisabledStyle]}
            onPress={() => navigation.goBack()}
            disabled={viagemIniciada}>
            <Icon name={IconNames.back} size="md" color={viagemIniciada ? colors.success.light : colors.secondary.contrast} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>
              {viagemIniciada ? 'Em Andamento' : 'Iniciar Viagem'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {viagem.tipo} • {viagem.horario}
            </Text>
          </View>
          <View style={[styles.headerIcon, viagemIniciada && styles.headerIconEmAndamento]}>
            <Icon name={viagemIniciada ? IconNames.route : IconNames.schedule} size="lg" color={viagemIniciada ? colors.success.contrast : colors.secondary.contrast} />
          </View>
        </View>
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
            style={[styles.iniciarButton, loading && styles.buttonDisabled]}
            onPress={handleIniciarViagem}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator size="large" color={colors.text.inverse} />
            ) : (
              <>
                <Icon name={IconNames.play} size="xl" color={colors.text.inverse} />
                <Text style={styles.iniciarButtonText}>Iniciar Viagem</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.finalizarButton, loading && styles.buttonDisabled]}
            onPress={handleFinalizarViagem}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator size="large" color={colors.text.inverse} />
            ) : (
              <>
                <Icon name={IconNames.stop} size="xl" color={colors.text.inverse} />
                <Text style={styles.finalizarButtonText}>Finalizar Viagem</Text>
              </>
            )}
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
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
  },
  headerEmAndamento: {
    backgroundColor: colors.success.main,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonDisabledStyle: {
    backgroundColor: colors.success.dark,
    opacity: 0.5,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    ...textStyles.h3,
    color: colors.secondary.contrast,
  },
  headerSubtitle: {
    ...textStyles.bodySmall,
    color: colors.secondary.light,
    marginTop: spacing.xs,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconEmAndamento: {
    backgroundColor: colors.success.dark,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyContainerText: {
    ...textStyles.h4,
    color: colors.text.secondary,
    marginTop: spacing.md,
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
  buttonDisabled: {
    opacity: 0.6,
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


