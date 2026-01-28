import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { colors, spacing, borderRadius, shadows, textStyles } from '../../theme';
import Icon, { IconNames } from '../../components/Icon';

const {width, height} = Dimensions.get('window');

const LocalizacaoOnibus = ({navigation, route}) => {
  const {rota, viagem} = route?.params || {};

  if (!rota || !viagem) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name={IconNames.back} size="base" color={colors.primary.contrast} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Localização do Ônibus</Text>
          </View>
        </View>
        <View style={styles.emptyContent}>
          <Icon name={IconNames.warning} size="huge" color={colors.neutral[300]} />
          <Text style={styles.emptyText}>Dados da rota não disponíveis</Text>
        </View>
      </SafeAreaView>
    );
  }

  const [distanciaAluno, setDistanciaAluno] = useState(1500);
  const [posicaoOnibus, setPosicaoOnibus] = useState({x: width / 2 - 20, y: height / 3});

  useEffect(() => {
    const interval = setInterval(() => {
      setPosicaoOnibus((prev) => ({
        x: Math.max(50, Math.min(width - 80, prev.x + (Math.random() - 0.5) * 10)),
        y: Math.max(50, Math.min(height / 2, prev.y + (Math.random() - 0.5) * 10)),
      }));
      setDistanciaAluno((prev) => Math.max(0, prev - Math.random() * 50));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name={IconNames.back} size="base" color={colors.primary.contrast} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Localização do Ônibus</Text>
          <Text style={styles.headerSubtitle}>{rota.nome}</Text>
        </View>
      </View>

      {/* Map Container */}
      <View style={styles.mapaContainer}>
        {/* Bus Marker */}
        <View style={[styles.onibusMarker, { left: posicaoOnibus.x, top: posicaoOnibus.y }]}>
          <View style={styles.onibusPulse} />
          <View style={styles.onibusIconContainer}>
            <Icon name={IconNames.bus} size="xl" color={colors.primary.contrast} />
          </View>
        </View>

        {/* Student Marker */}
        <View style={styles.alunoMarker}>
          <View style={styles.alunoIconContainer}>
            <Icon name={IconNames.person} size="lg" color={colors.secondary.main} />
          </View>
          <Text style={styles.alunoLabel}>Você</Text>
        </View>

        {/* Map Placeholder */}
        <View style={styles.mapPlaceholder}>
          <Icon name={IconNames.map} size="huge" color={colors.neutral[200]} />
          <Text style={styles.mapPlaceholderText}>Mapa em tempo real</Text>
        </View>
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
              {distanciaAluno > 1000 ? `${(distanciaAluno / 1000).toFixed(1)} km` : `${Math.round(distanciaAluno)} m`}
            </Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Icon name={IconNames.schedule} size="md" color={colors.secondary.main} />
            </View>
            <Text style={styles.infoLabel}>Tempo estimado</Text>
            <Text style={styles.infoValue}>{Math.max(1, Math.round(distanciaAluno / 200))} min</Text>
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
    backgroundColor: colors.primary.main,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
    elevation: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerInfo: { flex: 1 },
  headerTitle: { ...textStyles.h4, color: colors.primary.contrast },
  headerSubtitle: { ...textStyles.bodySmall, color: colors.secondary.light, marginTop: spacing.xxs },
  mapaContainer: {
    flex: 1,
    backgroundColor: colors.neutral[100],
    position: 'relative',
    overflow: 'hidden',
  },
  mapPlaceholder: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mapPlaceholderText: { ...textStyles.body, color: colors.neutral[400] },
  onibusMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  onibusIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  onibusPulse: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.main,
    opacity: 0.2,
  },
  alunoMarker: {
    position: 'absolute',
    bottom: 100,
    right: 40,
    alignItems: 'center',
    zIndex: 5,
  },
  alunoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary.lighter,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background.paper,
    ...shadows.md,
  },
  alunoLabel: { ...textStyles.caption, color: colors.text.primary, marginTop: spacing.xs, fontWeight: '600' },
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
