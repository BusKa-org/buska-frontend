import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius, shadows, textStyles } from '../../theme';
import Icon, { IconNames } from '../../components/Icon';
import { motoristaService } from '../../services/motoristaService';
import MapaLocalizacaoMotorista from './MapaLocalizacaoMotorista';

// Geolocation: same as InicioFimViagem (native vs web)
let Geolocation = null;
try {
  Geolocation = require('@react-native-community/geolocation').default;
} catch (_) {
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    Geolocation = navigator.geolocation;
  }
}

/** Distância em metros entre dois pontos (fórmula de Haversine). */
function distanciaHaversineMetros(lat1, lon1, lat2, lon2) {
  const R = 6371000; // raio da Terra em metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Tempo estimado em minutos: distância linear a 25 km/h. */
function tempoEstimadoMinutos(distanciaMetros) {
  const km = distanciaMetros / 1000;
  const horas = km / 25;
  return Math.max(1, Math.round(horas * 60));
}

const LocalizacaoOnibus = ({ navigation, route }) => {
  const { rota, viagem } = route?.params || {};

  const [posicaoMotorista, setPosicaoMotorista] = useState(null);
  const [posicaoAluno, setPosicaoAluno] = useState(null);
  const [loading, setLoading] = useState(true);
  const [distanciaMetros, setDistanciaMetros] = useState(null);

  const viagemId = viagem?.id ?? viagem?.viagem_id;

  // Busca posição do motorista (API) e do aluno (GPS); recalcula distância quando ambas existem
  useEffect(() => {
    const obterMinhaPosicao = () => {
      if (!Geolocation) return;
      Geolocation.getCurrentPosition(
        (pos) => {
          setPosicaoAluno({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    };

    const buscarLocalizacao = async () => {
      if (!viagemId) return;

      try {
        const dadosLocalizacao = await motoristaService.obterLocalizacao(viagemId);
        const motorista = {
          latitude: dadosLocalizacao.latitude,
          longitude: dadosLocalizacao.longitude,
        };
        setPosicaoMotorista(motorista);
        obterMinhaPosicao();
      } catch (error) {
        console.log('Erro ao buscar localização do motorista:', error);
      } finally {
        setLoading(false);
      }
    };

    buscarLocalizacao();
    const interval = setInterval(buscarLocalizacao, 5000);
    return () => clearInterval(interval);
  }, [viagemId]);

  // Recalcula distância (e tempo) quando temos as duas posições
  useEffect(() => {
    if (!posicaoMotorista || !posicaoAluno) return;
    const metros = distanciaHaversineMetros(
      posicaoAluno.latitude,
      posicaoAluno.longitude,
      posicaoMotorista.latitude,
      posicaoMotorista.longitude
    );
    setDistanciaMetros(metros);
  }, [posicaoMotorista, posicaoAluno]);

  // Validação inicial (Se não houver rota ou viagem)
  if (!rota || !viagem) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Icon name={IconNames.back} size="md" color={colors.secondary.contrast} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Localização do Ônibus</Text>
            </View>
          </View>
        </View>
        <View style={styles.emptyContent}>
          <Icon name={IconNames.warning} size="xxl" color={colors.warning.main} />
          <Text style={styles.emptyText}>Dados da rota não disponíveis</Text>
        </View>
      </SafeAreaView>
    );
  }

  // pontosRota para o mapa: array com a posição do motorista (latitude/longitude)
  const pontosRotaMapa = posicaoMotorista
    ? [{ latitude: posicaoMotorista.latitude, longitude: posicaoMotorista.longitude }]
    : [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name={IconNames.back} size="md" color={colors.secondary.contrast} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Localização</Text>
            <Text style={styles.headerSubtitle}>{rota.nome}</Text>
          </View>
          <View style={styles.headerIcon}>
            <Icon name={IconNames.bus} size="lg" color={colors.secondary.contrast} />
          </View>
        </View>
      </View>

      {/* Map Container - mapa com localização do motorista em tempo real */}
      <View style={styles.mapaContainer}>
        {loading ? (
          <View style={styles.mapLoading}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={styles.mapLoadingText}>Buscando localização do ônibus...</Text>
          </View>
        ) : (
          <MapaLocalizacaoMotorista pontosRota={pontosRotaMapa} />
        )}
      </View>

      {/* Info Panel */}
      <View style={styles.infoPanel}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Icon name="straighten" size="md" color={colors.secondary.main} />
            </View>
            <Text style={styles.infoLabel}>Distância até você</Text>
            <Text style={styles.infoValue}>
              {distanciaMetros == null
                ? '—'
                : distanciaMetros >= 1000
                  ? `${(distanciaMetros / 1000).toFixed(1)} km`
                  : `${Math.round(distanciaMetros)} m`}
            </Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Icon name={IconNames.schedule} size="md" color={colors.secondary.main} />
            </View>
            <Text style={styles.infoLabel}>Tempo estimado (25 km/h)</Text>
            <Text style={styles.infoValue}>
              {distanciaMetros == null ? '—' : `${tempoEstimadoMinutos(distanciaMetros)} min`}
            </Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Em movimento</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  header: {
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
    zIndex: 100,
    elevation: 10,
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
  headerTitleContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  headerTitle: { ...textStyles.h3, color: colors.secondary.contrast },
  headerSubtitle: { ...textStyles.bodySmall, color: colors.secondary.light, marginTop: spacing.xs },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapaContainer: {
    flex: 1,
    backgroundColor: colors.neutral[100],
    position: 'relative',
    overflow: 'hidden',
  },
  mapLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  mapLoadingText: { ...textStyles.body, color: colors.text.secondary },
  infoPanel: {
    backgroundColor: colors.background.paper,
    padding: spacing.lg,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    ...shadows.lg,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.lg },
  infoItem: { alignItems: 'center', flex: 1 },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.secondary.lighter,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoLabel: { ...textStyles.caption, color: colors.text.secondary, marginBottom: spacing.xxs },
  infoValue: { ...textStyles.h3, color: colors.secondary.main },
  infoDivider: { width: 1, backgroundColor: colors.border.light, marginHorizontal: spacing.base },
  statusContainer: { alignItems: 'center' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success.light,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success.main,
    marginRight: spacing.sm,
  },
  statusText: { ...textStyles.bodySmall, color: colors.success.dark, fontWeight: '600' },
  emptyContent: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.base },
  emptyText: { ...textStyles.body, color: colors.text.secondary },
});

export default LocalizacaoOnibus;
