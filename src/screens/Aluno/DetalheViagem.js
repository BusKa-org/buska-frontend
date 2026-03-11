import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { alunoService } from '../../services';
import { colors, spacing, borderRadius, shadows, textStyles } from '../../theme';
import Icon, { IconNames } from '../../components/Icon';

import MapaComponent from '../Motorista/MapaComponent'; 

const DetalheViagem = ({navigation, route}) => {
  const {rota, viagem} = route?.params || {};

  if (!rota || !viagem) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Icon name={IconNames.back} size="md" color={colors.secondary.contrast} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.title}>Detalhes da Viagem</Text>
            </View>
          </View>
        </View>
        <View style={styles.emptyContent}>
          <Icon name={IconNames.warning} size="xxl" color={colors.warning.main} />
          <Text style={styles.emptyText}>Dados da viagem não disponíveis</Text>
        </View>
      </SafeAreaView>
    );
  }

  const [situacaoViagem, setSituacaoViagem] = useState('não iniciada');
  const [presencaConfirmada, setPresencaConfirmada] = useState(viagem?.status_confirmacao || false);
  const [pontosRota, setPontosRota] = useState([]);
  const [carregandoPontos, setCarregandoPontos] = useState(true);

  // Update presence status when viagem changes
  useEffect(() => {
    setPresencaConfirmada(viagem?.status_confirmacao || false);
  }, [viagem?.status_confirmacao]);

  useEffect(() => {
    const carregarPontos = async () => {
      if (rota?.id) {
        try {
          setCarregandoPontos(true);
          const pontos = await alunoService.listarPontosRota(rota.id);
          setPontosRota(pontos || []);
        } catch (error) {
          setPontosRota([]);
        } finally {
          setCarregandoPontos(false);
        }
      } else {
        setCarregandoPontos(false);
      }
    };
    carregarPontos();
  }, [rota?.id]);

  const podeConfirmarPresenca = () => situacaoViagem === 'em andamento';

  // Get origin and destination from route points
  const getOrigem = () => {
    if (pontosRota.length > 0) {
      return pontosRota[0].apelido || pontosRota[0].nome || 'Ponto inicial';
    }
    return viagem?.origem || rota?.nome || 'Não informado';
  };

  const getDestino = () => {
    if (pontosRota.length > 1) {
      return pontosRota[pontosRota.length - 1].apelido || pontosRota[pontosRota.length - 1].nome || 'Ponto final';
    }
    return viagem?.destino || 'Não informado';
  };

  const handleConfirmarPresenca = async () => {
    try {
      // Get ponto_embarque_id from viagem or use first route point
      let pontoEmbarqueId = viagem.ponto_embarque_id;
      if (!pontoEmbarqueId && pontosRota.length > 0) {
        pontoEmbarqueId = pontosRota[0].id;
      }
      
      if (!pontoEmbarqueId) {
        Alert.alert('Erro', 'Não foi possível encontrar um ponto de embarque.');
        return;
      }
      
      setPresencaConfirmada(true);
      await alunoService.alterarPresencaViagem(viagem.id, true, pontoEmbarqueId);
      Alert.alert('Sucesso', 'Presença confirmada com sucesso!');
    } catch (error) {
      setPresencaConfirmada(false);
      Alert.alert('Erro', error.message || 'Não foi possível confirmar a presença.');
    }
  };

  const getSituacaoConfig = (situacao) => {
    switch (situacao) {
      case 'não iniciada': return { color: colors.text.hint, bg: colors.neutral[100] };
      case 'em andamento': return { color: colors.secondary.main, bg: colors.secondary.lighter };
      case 'finalizada': return { color: colors.success.main, bg: colors.success.light };
      default: return { color: colors.text.hint, bg: colors.neutral[100] };
    }
  };

  const situacaoConfig = getSituacaoConfig(situacaoViagem);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name={IconNames.back} size="md" color={colors.secondary.contrast} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Detalhes da Viagem</Text>
            <Text style={styles.headerSubtitle}>{viagem.tipo} • {viagem.horario}</Text>
          </View>
          <View style={styles.headerIcon}>
            <Icon name={IconNames.route} size="lg" color={colors.secondary.contrast} />
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Main Info Card */}
          <View style={styles.card}>
            <View style={styles.viagemHeader}>
              <View>
                <View style={styles.tipoBadge}>
                  <Text style={styles.viagemTipo}>{viagem.tipo}</Text>
                </View>
                <Text style={styles.viagemHorario}>{viagem.horario}</Text>
              </View>
              <View style={[styles.situacaoBadge, { backgroundColor: situacaoConfig.bg }]}>
                <Text style={[styles.situacaoText, { color: situacaoConfig.color }]}>
                  {situacaoViagem.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.rotaInfo}>
              <View style={styles.pontoRota}>
                <View style={[styles.pontoIcon, { backgroundColor: colors.secondary.lighter }]}>
                  <Icon name={IconNames.location} size="md" color={colors.secondary.main} />
                </View>
                <View style={styles.pontoInfo}>
                  <Text style={styles.pontoLabel}>Origem</Text>
                  <Text style={styles.pontoNome}>{getOrigem()}</Text>
                </View>
              </View>
              <View style={styles.linhaRota} />
              <View style={styles.pontoRota}>
                <View style={[styles.pontoIcon, { backgroundColor: colors.success.light }]}>
                  <Icon name="flag" size="md" color={colors.success.main} />
                </View>
                <View style={styles.pontoInfo}>
                  <Text style={styles.pontoLabel}>Destino</Text>
                  <Text style={styles.pontoNome}>{getDestino()}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Presence Status Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Status de Presença</Text>
            <View style={[
              styles.presencaStatus,
              presencaConfirmada ? styles.presencaConfirmada : styles.presencaNaoConfirmada,
            ]}>
              <Icon 
                name={presencaConfirmada ? IconNames.checkCircle : IconNames.warning} 
                size="lg" 
                color={presencaConfirmada ? colors.success.main : colors.warning.main} 
              />
              <Text style={[
                styles.presencaText,
                { color: presencaConfirmada ? colors.success.main : colors.warning.main }
              ]}>
                {presencaConfirmada ? 'Presença Confirmada' : 'Presença Não Confirmada'}
              </Text>
            </View>

            {podeConfirmarPresenca() && !presencaConfirmada && (
              <TouchableOpacity style={styles.confirmarButton} onPress={handleConfirmarPresenca}>
                <Icon name={IconNames.checkCircle} size="md" color={colors.primary.contrast} />
                <Text style={styles.confirmarButtonText}>Confirmar Presença</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Route Points Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pontos da Rota</Text>
            {carregandoPontos ? (
              <Text style={styles.loadingText}>Carregando pontos...</Text>
            ) : pontosRota.length > 0 ? (
              pontosRota.map((ponto, index) => (
                <View key={ponto.id} style={styles.pontoItem}>
                  <View style={styles.pontoItemLeft}>
                    <View style={[
                      styles.pontoItemIcon,
                      ponto.tipo === 'origem' && { backgroundColor: colors.secondary.lighter },
                      ponto.tipo === 'destino' && { backgroundColor: colors.success.light },
                    ]}>
                      <Icon 
                        name={ponto.tipo === 'origem' ? IconNames.location : ponto.tipo === 'destino' ? 'flag' : 'circle'} 
                        size="sm" 
                        color={ponto.tipo === 'origem' ? colors.secondary.main : ponto.tipo === 'destino' ? colors.success.main : colors.text.secondary} 
                      />
                    </View>
                    {index < pontosRota.length - 1 && <View style={styles.pontoItemLine} />}
                  </View>
                  <View style={styles.pontoItemRight}>
                    <Text style={styles.pontoItemNome}>{ponto.apelido}</Text>
                    <Text style={styles.pontoItemTipo}>
                      {ponto.tipo === 'origem' ? 'Origem' : ponto.tipo === 'destino' ? 'Destino' : 'Parada'}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Nenhum ponto cadastrado para esta rota</Text>
            )}
          </View>

          {/* Map Placeholder */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Mapa da Rota</Text>
            
            {carregandoPontos ? (
              <View style={styles.mapaPlaceholder}>
                <Text style={styles.mapaPlaceholderLabel}>Carregando mapa...</Text>
              </View>
            ) : pontosRota.length > 0 ? (
              <MapaComponent 
                pontosRota={pontosRota} 
                onPontoChegado={() => {
                  Alert.alert('Chegou!', 'Você se aproximou do ponto de embarque.');
                }} 
              />
            ) : (
              <View style={styles.mapaPlaceholder}>
                <Icon name={IconNames.map} size="huge" color={colors.neutral[300]} />
                <Text style={styles.mapaPlaceholderLabel}>Sem rota definida</Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <TouchableOpacity
            style={styles.localizacaoButton}
            onPress={() => navigation.navigate('LocalizacaoOnibus', { rota, viagem })}>
            <Icon name={IconNames.myLocation} size="md" color={colors.primary.contrast} />
            <Text style={styles.localizacaoButtonText}>Ver Localização do Ônibus</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  title: { ...textStyles.h3, color: colors.secondary.contrast },
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
  scrollView: { flex: 1 },
  content: { padding: spacing.base },
  card: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  cardTitle: { ...textStyles.h4, color: colors.text.primary, marginBottom: spacing.base },
  viagemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  tipoBadge: {
    backgroundColor: colors.secondary.lighter,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
    alignSelf: 'flex-start',
  },
  viagemTipo: { ...textStyles.caption, color: colors.secondary.dark, fontWeight: '600' },
  viagemHorario: { ...textStyles.display2, color: colors.text.primary },
  situacaoBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  situacaoText: { ...textStyles.caption, fontWeight: '600' },
  rotaInfo: { marginTop: spacing.sm },
  pontoRota: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  pontoIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  pontoInfo: { flex: 1 },
  pontoLabel: { ...textStyles.caption, color: colors.text.secondary, marginBottom: spacing.xxs },
  pontoNome: { ...textStyles.h5, color: colors.text.primary },
  linhaRota: { width: 2, height: 20, backgroundColor: colors.border.light, marginLeft: 19, marginBottom: spacing.md },
  presencaStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.base,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  presencaConfirmada: { backgroundColor: colors.success.light },
  presencaNaoConfirmada: { backgroundColor: colors.warning.light },
  presencaText: { ...textStyles.h5 },
  confirmarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    ...shadows.xs,
  },
  confirmarButtonText: { ...textStyles.button, color: colors.primary.contrast },
  pontoItem: { flexDirection: 'row', marginBottom: spacing.base },
  pontoItemLeft: { width: 40, alignItems: 'center', marginRight: spacing.md },
  pontoItemIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  pontoItemLine: { width: 2, flex: 1, backgroundColor: colors.border.light, marginTop: spacing.xs },
  pontoItemRight: { flex: 1 },
  pontoItemNome: { ...textStyles.body, color: colors.text.primary, marginBottom: spacing.xxs },
  pontoItemTipo: { ...textStyles.caption, color: colors.text.secondary },
  mapaPlaceholder: {
    height: 200,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
    gap: spacing.sm,
  },
  mapaPlaceholderLabel: { ...textStyles.body, color: colors.text.secondary },
  mapaPlaceholderSubtext: { ...textStyles.caption, color: colors.text.hint },
  localizacaoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  localizacaoButtonText: { ...textStyles.button, color: colors.primary.contrast },
  emptyContent: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.base },
  emptyText: { ...textStyles.body, color: colors.text.secondary, textAlign: 'center' },
  loadingText: { ...textStyles.bodySmall, color: colors.text.hint, textAlign: 'center', padding: spacing.base },
});

export default DetalheViagem;
