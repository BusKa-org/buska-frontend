import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {motoristaService} from '../../services/motoristaService';
import { colors, spacing, borderRadius, shadows, textStyles, fontWeight } from '../../theme';
import Icon, { IconNames } from '../../components/Icon';
import { useToast } from '../../components/Toast';

// Google Maps-style Route Map Component
const RotaMapaSimples = ({ pontos }) => {
  const MAP_HEIGHT = 280;
  const PADDING = 40;

  // Calculate bounds and positions
  const { positions, hasValidPoints, bounds } = useMemo(() => {
    const validPontos = pontos.filter(p => 
      p.latitude != null && p.longitude != null &&
      !isNaN(Number(p.latitude)) && !isNaN(Number(p.longitude))
    );

    if (validPontos.length === 0) {
      return { positions: [], hasValidPoints: false, bounds: null };
    }

    const lats = validPontos.map(p => Number(p.latitude));
    const lngs = validPontos.map(p => Number(p.longitude));
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const latRange = maxLat - minLat || 0.01;
    const lngRange = maxLng - minLng || 0.01;
    
    // Use percentage-based positioning for responsiveness
    const positions = validPontos.map((ponto, index) => {
      const lat = Number(ponto.latitude);
      const lng = Number(ponto.longitude);
      
      const xPercent = 10 + ((lng - minLng) / lngRange) * 80;
      const yPercent = 10 + ((maxLat - lat) / latRange) * 80;
      
      return { 
        ...ponto, 
        xPercent, 
        yPercent, 
        index: index + 1,
        isFirst: index === 0,
        isLast: index === validPontos.length - 1,
      };
    });

    return { 
      positions, 
      hasValidPoints: true,
      bounds: { minLat, maxLat, minLng, maxLng }
    };
  }, [pontos]);

  const [selectedPoint, setSelectedPoint] = useState(null);

  if (!hasValidPoints) {
    return (
      <View style={mapStyles.container}>
        <View style={mapStyles.emptyMap}>
          <View style={mapStyles.emptyMapIcon}>
            <Icon name={IconNames.map} size="huge" color="#9CA3AF" />
          </View>
          <Text style={mapStyles.emptyTitle}>Mapa da Rota</Text>
          <Text style={mapStyles.emptyText}>Adicione pontos para visualizar a rota</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={mapStyles.container}>
      <View style={mapStyles.header}>
        <Text style={mapStyles.title}>Mapa da Rota</Text>
        <Text style={mapStyles.subtitle}>{positions.length} pontos</Text>
      </View>
      
      <View style={mapStyles.mapWrapper}>
        <View style={mapStyles.mapArea}>
          {/* Terrain-like background */}
          <View style={mapStyles.terrainBase} />
          <View style={mapStyles.terrainOverlay} />
          
          {/* Subtle roads pattern */}
          <View style={mapStyles.roadsPattern}>
            <View style={[mapStyles.road, { top: '30%', width: '100%' }]} />
            <View style={[mapStyles.road, { top: '60%', width: '100%' }]} />
            <View style={[mapStyles.roadVertical, { left: '25%', height: '100%' }]} />
            <View style={[mapStyles.roadVertical, { left: '75%', height: '100%' }]} />
          </View>

          {/* Route path with glow effect */}
          {positions.length > 1 && (
            <svg 
              style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 5 }}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Glow/shadow line */}
              <polyline
                points={positions.map(p => `${p.xPercent},${p.yPercent}`).join(' ')}
                fill="none"
                stroke="rgba(66, 133, 244, 0.3)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Main route line */}
              <polyline
                points={positions.map(p => `${p.xPercent},${p.yPercent}`).join(' ')}
                fill="none"
                stroke="#4285F4"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}

          {/* Google Maps style pin markers */}
          {positions.map((pos) => (
            <TouchableOpacity
              key={pos.id}
              style={[
                mapStyles.pinContainer,
                { left: `${pos.xPercent}%`, top: `${pos.yPercent}%` },
              ]}
              onPress={() => setSelectedPoint(selectedPoint === pos.id ? null : pos.id)}
              activeOpacity={0.8}
            >
              {/* Pin shadow */}
              <View style={mapStyles.pinShadow} />
              
              {/* Pin body */}
              <View style={[
                mapStyles.pin,
                pos.isFirst && mapStyles.pinStart,
                pos.isLast && mapStyles.pinEnd,
                !pos.isFirst && !pos.isLast && mapStyles.pinMiddle,
              ]}>
                <Text style={mapStyles.pinText}>{pos.index}</Text>
              </View>
              
              {/* Pin pointer */}
              <View style={[
                mapStyles.pinPointer,
                pos.isFirst && mapStyles.pinPointerStart,
                pos.isLast && mapStyles.pinPointerEnd,
                !pos.isFirst && !pos.isLast && mapStyles.pinPointerMiddle,
              ]} />
              
              {/* Tooltip on selection */}
              {selectedPoint === pos.id && (
                <View style={mapStyles.tooltip}>
                  <Text style={mapStyles.tooltipText} numberOfLines={1}>
                    {pos.nome || pos.apelido}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}

          {/* Map controls (decorative) */}
          <View style={mapStyles.mapControls}>
            <View style={mapStyles.controlButton}>
              <Text style={mapStyles.controlText}>+</Text>
            </View>
            <View style={mapStyles.controlDivider} />
            <View style={mapStyles.controlButton}>
              <Text style={mapStyles.controlText}>−</Text>
            </View>
          </View>

          {/* Google logo placeholder */}
          <View style={mapStyles.attribution}>
            <Text style={mapStyles.attributionText}>Rota Escolar</Text>
          </View>
        </View>
      </View>

      {/* Route info */}
      <View style={mapStyles.routeInfo}>
        <View style={mapStyles.routeInfoItem}>
          <View style={[mapStyles.infoDot, { backgroundColor: '#34A853' }]} />
          <Text style={mapStyles.infoLabel}>
            {positions[0]?.nome || positions[0]?.apelido || 'Início'}
          </Text>
        </View>
        <View style={mapStyles.routeInfoDivider}>
          <View style={mapStyles.routeInfoLine} />
          <Text style={mapStyles.routeInfoPoints}>{positions.length - 2 > 0 ? `+${positions.length - 2}` : ''}</Text>
          <View style={mapStyles.routeInfoLine} />
        </View>
        <View style={mapStyles.routeInfoItem}>
          <View style={[mapStyles.infoDot, { backgroundColor: '#EA4335' }]} />
          <Text style={mapStyles.infoLabel}>
            {positions[positions.length - 1]?.nome || positions[positions.length - 1]?.apelido || 'Fim'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const mapStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.base,
    ...shadows.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  subtitle: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  mapWrapper: {
    padding: spacing.sm,
  },
  mapArea: {
    width: '100%',
    height: 220,
    borderRadius: borderRadius.md,
    position: 'relative',
    overflow: 'hidden',
  },
  terrainBase: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#E8F0E8',
  },
  terrainOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #F0F4E8 0%, #E8F0E8 50%, #E0E8E0 100%)',
  },
  roadsPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  road: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
  roadVertical: {
    position: 'absolute',
    width: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.6,
  },
  pinContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
    marginLeft: -14,
    marginTop: -38,
  },
  pinShadow: {
    position: 'absolute',
    bottom: -4,
    width: 10,
    height: 5,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  pin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...shadows.md,
  },
  pinStart: {
    backgroundColor: '#34A853', // Google green
  },
  pinEnd: {
    backgroundColor: '#EA4335', // Google red
  },
  pinMiddle: {
    backgroundColor: '#4285F4', // Google blue
  },
  pinText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pinPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  pinPointerStart: {
    borderTopColor: '#34A853',
  },
  pinPointerEnd: {
    borderTopColor: '#EA4335',
  },
  pinPointerMiddle: {
    borderTopColor: '#4285F4',
  },
  tooltip: {
    position: 'absolute',
    top: -30,
    backgroundColor: '#3C4043',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    maxWidth: 120,
    ...shadows.sm,
  },
  tooltipText: {
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  mapControls: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.xl,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xs,
    ...shadows.sm,
  },
  controlButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlText: {
    fontSize: 18,
    color: '#5F6368',
    fontWeight: '300',
  },
  controlDivider: {
    height: 1,
    backgroundColor: '#E8EAED',
  },
  attribution: {
    position: 'absolute',
    bottom: spacing.xs,
    left: spacing.sm,
  },
  attributionText: {
    fontSize: 10,
    color: '#70757A',
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  routeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  infoDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...shadows.xs,
  },
  infoLabel: {
    ...textStyles.bodySmall,
    color: colors.text.primary,
    flex: 1,
  },
  routeInfoDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  routeInfoLine: {
    width: 20,
    height: 2,
    backgroundColor: '#DADCE0',
  },
  routeInfoPoints: {
    ...textStyles.caption,
    color: colors.text.hint,
    paddingHorizontal: spacing.xs,
  },
  emptyMap: {
    padding: spacing.xxxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyMapIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    ...textStyles.h4,
    color: colors.text.secondary,
  },
  emptyText: {
    ...textStyles.caption,
    color: colors.text.hint,
    textAlign: 'center',
  },
});

const DefinirPontosRota = ({navigation, route}) => {
  const params = route?.params || {};
  const {rota: rotaParam, viagem, isNovaRota} = params;
  
  // Determine route ID from params
  const rotaId = rotaParam?.id || viagem?.rota_id;
  const rotaNome = rotaParam?.nome || viagem?.rota_nome || 'Rota';
  
  const toast = useToast();
  
  const [pontosRota, setPontosRota] = useState([]);
  const [pontosDisponiveis, setPontosDisponiveis] = useState([]);
  const [novoPontoNome, setNovoPontoNome] = useState('');
  const [novoPontoLat, setNovoPontoLat] = useState('');
  const [novoPontoLon, setNovoPontoLon] = useState('');
  const [mostrarFormNovoPonto, setMostrarFormNovoPonto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [adicionando, setAdicionando] = useState(null); // Track which point is being added

  // Load existing points
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        
        // Load available points (municipality points) and deduplicate
        const todosOsPontos = await motoristaService.listarPontos();
        const pontosUnicos = [];
        const idsVistos = new Set();
        for (const ponto of (todosOsPontos || [])) {
          const pontoId = String(ponto.id);
          if (!idsVistos.has(pontoId)) {
            idsVistos.add(pontoId);
            pontosUnicos.push(ponto);
          }
        }
        setPontosDisponiveis(pontosUnicos);
        
        // Load route points if editing existing route
        if (rotaId && !isNovaRota) {
          const pontosData = await motoristaService.listarPontosRota(rotaId);
          setPontosRota(pontosData || []);
        }
      } catch (error) {
        console.error('Error loading points:', error);
        toast.error('Não foi possível carregar os pontos.');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [rotaId, isNovaRota]);

  // Track added point IDs to prevent duplicates
  const pontosRotaIds = useMemo(() => 
    new Set(pontosRota.map(p => String(p.id))), 
    [pontosRota]
  );

  const handleAdicionarPontoExistente = (ponto) => {
    const pontoIdStr = String(ponto.id);
    
    // Prevent double-clicks
    if (adicionando === pontoIdStr) {
      return;
    }
    
    // Check using memoized Set for instant lookup
    if (pontosRotaIds.has(pontoIdStr)) {
      toast.warning('Este ponto já está na rota.');
      return;
    }
    
    // Lock this point while adding
    setAdicionando(pontoIdStr);
    
    setPontosRota(prev => {
      // Double-check inside updater to handle race conditions
      if (prev.some(p => String(p.id) === pontoIdStr)) {
        return prev;
      }
      return [...prev, {
        ...ponto,
        ordem: prev.length + 1,
      }];
    });
    
    toast.success(`${ponto.nome || ponto.apelido} adicionado!`);
    
    // Unlock after a short delay
    setTimeout(() => setAdicionando(null), 300);
  };

  const handleCriarNovoPonto = async () => {
    if (!novoPontoNome.trim()) {
      toast.error('Informe o nome do ponto.');
      return;
    }

    const lat = parseFloat(novoPontoLat);
    const lon = parseFloat(novoPontoLon);

    if (isNaN(lat) || isNaN(lon)) {
      toast.error('Latitude e longitude devem ser números válidos.');
      return;
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      toast.error('Coordenadas fora do intervalo válido.');
      return;
    }

    try {
      setSalvando(true);
      
      // Create point in backend
      const novoPonto = await motoristaService.criarPonto({
        apelido: novoPontoNome.trim(),
        latitude: lat,
        longitude: lon,
      });
      
      // Add to local list
      setPontosRota([...pontosRota, {
        id: novoPonto.id,
        nome: novoPontoNome.trim(),
        latitude: lat,
        longitude: lon,
        ordem: pontosRota.length + 1,
        isNew: true,
      }]);
      
      // Clear form
      setNovoPontoNome('');
      setNovoPontoLat('');
      setNovoPontoLon('');
      setMostrarFormNovoPonto(false);
      
      toast.success('Ponto criado e adicionado!');
    } catch (error) {
      toast.error(error?.message || 'Erro ao criar ponto.');
    } finally {
      setSalvando(false);
    }
  };

  const handleRemoverPonto = (pontoId) => {
    // Use window.confirm for web compatibility (Alert.alert doesn't work well on web)
    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm('Remover este ponto da rota?')) {
        setPontosRota(prev => prev.filter(p => p.id !== pontoId));
        toast.info('Ponto removido.');
      }
    } else {
      // Fallback for native
      Alert.alert(
        'Remover Ponto',
        'Tem certeza que deseja remover este ponto da rota?',
        [
          {text: 'Cancelar', style: 'cancel'},
          {
            text: 'Remover',
            style: 'destructive',
            onPress: () => {
              setPontosRota(prev => prev.filter(p => p.id !== pontoId));
              toast.info('Ponto removido.');
            },
          },
        ],
      );
    }
  };

  const handleMoverPonto = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= pontosRota.length) return;
    
    const newPontos = [...pontosRota];
    [newPontos[index], newPontos[newIndex]] = [newPontos[newIndex], newPontos[index]];
    
    // Update ordem
    newPontos.forEach((p, i) => { p.ordem = i + 1; });
    setPontosRota(newPontos);
  };

  const handleSalvarPontos = async () => {
    if (!rotaId) {
      toast.error('Rota não encontrada.');
      return;
    }

    if (pontosRota.length === 0) {
      toast.error('Adicione pelo menos um ponto.');
      return;
    }

    try {
      setSalvando(true);
      
      // Send all points in a single batch request
      await motoristaService.adicionarPontosRota(rotaId, pontosRota);
      
      toast.success('Pontos salvos com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving points:', error);
      toast.error(error?.message || 'Erro ao salvar pontos.');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary.main} />
          <Text style={styles.loadingText}>Carregando pontos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name={IconNames.back} size="md" color={colors.secondary.main} />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pontos da Rota</Text>
        <Text style={styles.subtitle}>{rotaNome}</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          
          {/* Route Map Visualization */}
          <RotaMapaSimples pontos={pontosRota} />
          
          {/* Current Route Points */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Pontos na Rota ({pontosRota.length})</Text>
            </View>
            
            {pontosRota.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name={IconNames.route} size="huge" color={colors.neutral[300]} />
                <Text style={styles.emptyText}>Nenhum ponto adicionado</Text>
                <Text style={styles.emptySubtext}>
                  Selecione pontos existentes ou crie novos abaixo
                </Text>
              </View>
            ) : (
              pontosRota.map((ponto, index) => (
                <View key={`${ponto.id}-${index}`} style={styles.pontoItem}>
                  {/* Drag handle */}
                  <View style={styles.dragHandle}>
                    <Icon name={IconNames.moreVert} size="sm" color={colors.neutral[400]} />
                  </View>
                  
                  <View style={styles.pontoOrdem}>
                    <Text style={styles.pontoOrdemText}>{index + 1}</Text>
                  </View>
                  
                  <View style={styles.pontoInfo}>
                    <Text style={styles.pontoNome}>{ponto.nome || ponto.apelido}</Text>
                    {ponto.latitude != null && ponto.longitude != null && (
                      <Text style={styles.pontoCoords}>
                        {Number(ponto.latitude).toFixed(5)}, {Number(ponto.longitude).toFixed(5)}
                      </Text>
                    )}
                  </View>
                  
                  {/* Move buttons */}
                  <View style={styles.pontoMoveActions}>
                    <TouchableOpacity 
                      style={[styles.moveButton, index === 0 && styles.moveButtonDisabled]}
                      onPress={() => handleMoverPonto(index, -1)}
                      disabled={index === 0}>
                      <Icon 
                        name={IconNames.expandLess} 
                        size="md" 
                        color={index === 0 ? colors.neutral[300] : colors.secondary.main} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.moveButton, index === pontosRota.length - 1 && styles.moveButtonDisabled]}
                      onPress={() => handleMoverPonto(index, 1)}
                      disabled={index === pontosRota.length - 1}>
                      <Icon 
                        name={IconNames.expandMore} 
                        size="md" 
                        color={index === pontosRota.length - 1 ? colors.neutral[300] : colors.secondary.main} 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Remove button */}
                  <TouchableOpacity 
                    style={styles.removeButtonStyled}
                    onPress={() => handleRemoverPonto(ponto.id)}>
                    <Icon name={IconNames.delete} size="sm" color={colors.error.main} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          {/* Available Points */}
          {pontosDisponiveis.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Pontos Disponíveis</Text>
              <Text style={styles.cardSubtitle}>Toque para adicionar à rota</Text>
              
              <View style={styles.pontosGrid}>
                {pontosDisponiveis.slice(0, 15).map(ponto => {
                  const pontoIdStr = String(ponto.id);
                  const isAdded = pontosRotaIds.has(pontoIdStr);
                  const isAdding = adicionando === pontoIdStr;
                  const isDisabled = isAdded || isAdding;
                  
                  return (
                    <TouchableOpacity
                      key={ponto.id}
                      style={[
                        styles.pontoChip, 
                        isAdded && styles.pontoChipAdded,
                        isAdding && styles.pontoChipAdding,
                      ]}
                      onPress={() => handleAdicionarPontoExistente(ponto)}
                      disabled={isDisabled}>
                      <Icon 
                        name={isAdded ? IconNames.checkCircle : IconNames.add} 
                        size="xs" 
                        color={isAdded ? colors.success.main : colors.secondary.main} 
                      />
                      <Text style={[styles.pontoChipText, isAdded && styles.pontoChipTextAdded]} numberOfLines={1}>
                        {ponto.apelido || ponto.nome}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Create New Point */}
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.cardHeaderButton}
              onPress={() => setMostrarFormNovoPonto(!mostrarFormNovoPonto)}>
              <View style={styles.cardHeaderLeft}>
                <Icon name={IconNames.add} size="md" color={colors.success.main} />
                <Text style={styles.cardTitle}>Criar Novo Ponto</Text>
              </View>
              <Icon 
                name={mostrarFormNovoPonto ? IconNames.expandLess : IconNames.expandMore} 
                size="md" 
                color={colors.text.secondary} 
              />
            </TouchableOpacity>
            
            {mostrarFormNovoPonto && (
              <View style={styles.formContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Nome do ponto (ex: Escola Municipal)"
                  placeholderTextColor={colors.text.hint}
                  value={novoPontoNome}
                  onChangeText={setNovoPontoNome}
                />
                <View style={styles.coordRow}>
                  <TextInput
                    style={[styles.input, styles.inputHalf]}
                    placeholder="Latitude"
                    placeholderTextColor={colors.text.hint}
                    value={novoPontoLat}
                    onChangeText={setNovoPontoLat}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.inputHalf]}
                    placeholder="Longitude"
                    placeholderTextColor={colors.text.hint}
                    value={novoPontoLon}
                    onChangeText={setNovoPontoLon}
                    keyboardType="numeric"
                  />
                </View>
                <TouchableOpacity
                  style={[styles.createButton, salvando && styles.buttonDisabled]}
                  onPress={handleCriarNovoPonto}
                  disabled={salvando}>
                  {salvando ? (
                    <ActivityIndicator size="small" color={colors.text.inverse} />
                  ) : (
                    <>
                      <Icon name={IconNames.add} size="sm" color={colors.text.inverse} />
                      <Text style={styles.createButtonText}>Criar e Adicionar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (salvando || pontosRota.length === 0) && styles.buttonDisabled,
          ]}
          onPress={handleSalvarPontos}
          disabled={salvando || pontosRota.length === 0}>
          {salvando ? (
            <ActivityIndicator color={colors.text.inverse} />
          ) : (
            <>
              <Icon name={IconNames.checkCircle} size="md" color={colors.text.inverse} />
              <Text style={styles.saveButtonText}>
                Salvar Rota ({pontosRota.length} pontos)
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.base,
    ...textStyles.body,
    color: colors.text.secondary,
  },
  header: {
    backgroundColor: colors.background.paper,
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    ...shadows.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  backButtonText: {
    ...textStyles.body,
    color: colors.secondary.main,
  },
  title: {
    ...textStyles.h2,
    color: colors.text.primary,
  },
  subtitle: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.base,
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  cardHeader: {
    marginBottom: spacing.md,
  },
  cardHeaderButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  cardSubtitle: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...textStyles.caption,
    color: colors.text.hint,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  pontoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginHorizontal: -spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.background.paper,
  },
  dragHandle: {
    padding: spacing.xs,
    marginRight: spacing.xs,
    opacity: 0.5,
  },
  pontoOrdem: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  pontoOrdemText: {
    ...textStyles.caption,
    color: colors.text.inverse,
    fontWeight: fontWeight.bold,
  },
  pontoInfo: {
    flex: 1,
  },
  pontoNome: {
    ...textStyles.body,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
  },
  pontoCoords: {
    ...textStyles.caption,
    color: colors.text.hint,
    marginTop: spacing.xxs,
  },
  pontoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pontoMoveActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  moveButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  moveButtonDisabled: {
    opacity: 0.3,
  },
  removeButton: {
    padding: spacing.sm,
  },
  removeButtonStyled: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.error.light,
  },
  pontosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pontoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.secondary.lighter,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    maxWidth: '48%',
  },
  pontoChipAdded: {
    backgroundColor: colors.success.light,
    opacity: 0.7,
  },
  pontoChipAdding: {
    opacity: 0.5,
  },
  pontoChipText: {
    ...textStyles.caption,
    color: colors.secondary.dark,
    fontWeight: fontWeight.medium,
  },
  pontoChipTextAdded: {
    color: colors.success.dark,
    textDecorationLine: 'line-through',
  },
  formContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  input: {
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...textStyles.body,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing.sm,
  },
  coordRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inputHalf: {
    flex: 1,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.success.main,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  createButtonText: {
    ...textStyles.button,
    color: colors.text.inverse,
  },
  footer: {
    padding: spacing.base,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    ...shadows.md,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.secondary.main,
    padding: spacing.base,
    borderRadius: borderRadius.md,
  },
  saveButtonText: {
    ...textStyles.button,
    color: colors.text.inverse,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default DefinirPontosRota;
