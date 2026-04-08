import React, {useState, useEffect, useRef} from 'react';
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
import { unwrapItems } from '../../types';

// Geolocation: use community package on native; fallback to global on web
let Geolocation = null;
try {
  Geolocation = require('@react-native-community/geolocation').default;
} catch (_) {
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    Geolocation = navigator.geolocation;
  }
}

const GPS_SEND_INTERVAL_MS = 20000; // send position every 20 seconds

const InicioFimViagem = ({navigation, route}) => {
  const viagemParam = route?.params?.viagem;
  const toast = useToast();
  
  const [viagem, setViagem] = useState(viagemParam);
  const [viagemIniciada, setViagemIniciada] = useState(viagemParam?.status === 'EM_ANDAMENTO');
  const [viagemPausada, setViagemPausada] = useState(false);
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
        const viagens = await motoristaService.listarViagens().then(unwrapItems);
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

  const handlePausarRetomar = () => {
    const novoStatusPausado = !viagemPausada;
    setViagemPausada(novoStatusPausado);
    
    if (novoStatusPausado) {
      toast.success('Viagem pausada!');
    } else {
      toast.success('Viagem retomada!');
    }
  };
  // Timer effect for trip duration
  useEffect(() => {
    let id = null;
    if (viagemIniciada && !viagemPausada) {
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
  }, [viagemIniciada, viagemPausada]);

  // Send motorista GPS position to backend while trip is active
  const viagemIdRef = useRef(viagem?.id || viagemParam?.id);
  viagemIdRef.current = viagem?.id || viagemParam?.id;

  useEffect(() => {
    if (!viagemIniciada || !viagemIdRef.current || !Geolocation) return;

    const sendPosition = () => {
      Geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          motoristaService
            .enviarLocalizacao(viagemIdRef.current, { latitude, longitude })
            .catch((err) => {
              console.warn('Erro ao enviar localização:', err?.message || err);
            });
        },
        (err) => {
          console.warn('Erro ao obter localização:', err?.message || err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    };

    sendPosition(); // send immediately when trip starts
    const gpsIntervalId = setInterval(sendPosition, GPS_SEND_INTERVAL_MS);

    return () => clearInterval(gpsIntervalId);
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
              <Icon name={IconNames.back} size="md" color={colors.primary.contrast} />
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
              <Icon name={IconNames.back} size="md" color={colors.primary.contrast} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.title}>Carregando...</Text>
            </View>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary.dark} />
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
            <Icon name={IconNames.back} size="md" color={viagemIniciada ? colors.success.light : colors.primary.contrast} />
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
            <Icon name={viagemIniciada ? IconNames.route : IconNames.schedule} size="lg" color={viagemIniciada ? colors.success.contrast : colors.primary.contrast} />
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
              <Icon name={IconNames.location} size="md" color={colors.primary.dark} />
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

        {/* Botões de Controle */}
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
          <View style={styles.controleViagemContainer}>
            {/* Botão Pausar / Retomar */}
            <TouchableOpacity
              style={[styles.pausarButton, viagemPausada && styles.retomarButton]}
              onPress={handlePausarRetomar}
              disabled={loading}>
              <Icon 
                name={viagemPausada ? IconNames.play : IconNames.pause}
                size="xl" 
                color={colors.text.inverse} 
              />
              <Text style={styles.pausarButtonText}>
                {viagemPausada ? 'Retomar Viagem' : 'Pausar Viagem'}
              </Text>
            </TouchableOpacity>

            {/* Botão Finalizar */}
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
          </View>
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
    backgroundColor: colors.primary.dark,
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
    backgroundColor: colors.primary.main,
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
    color: colors.primary.contrast,
  },
  headerSubtitle: {
    ...textStyles.bodySmall,
    color: 'rgba(255,255,255,0.75)',
    marginTop: spacing.xs,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main,
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
    color: colors.primary.dark,
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
    color: colors.primary.dark,
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
    backgroundColor: colors.primary.dark,
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


  controleViagemContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  pausarButton: {
    backgroundColor: colors.warning.main,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.xl,
  },
  retomarButton: {
    backgroundColor: colors.success.main,
  },
  pausarButtonText: {
    ...textStyles.button,
    color: colors.text.inverse,
    fontSize: fontSize.h3,
    fontWeight: fontWeight.bold,
  },
});

export default InicioFimViagem;


