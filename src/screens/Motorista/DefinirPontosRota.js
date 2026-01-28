import React, {useState, useEffect} from 'react';
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
import {useAuth} from '../../contexts/AuthContext';
import { colors, spacing, borderRadius, shadows, textStyles, fontSize, fontWeight } from '../../theme';
import Icon, { IconNames } from '../../components/Icon';

const DefinirPontosRota = ({navigation, route}) => {
  const params = route?.params || {};
  const {viagem, rota: rotaParam, isNovaRota} = params;
  
  // Se vier de viagem, tentar extrair rota_id e criar objeto rota mínimo
  const rota = rotaParam || (viagem?.rota_id ? {id: viagem.rota_id} : null);
  
  console.log('DefinirPontosRota - params:', params);
  console.log('DefinirPontosRota - rota:', rota);
  console.log('DefinirPontosRota - viagem:', viagem);
  
  const {user} = useAuth();
  
  const [pontosPreDefinidos, setPontosPreDefinidos] = useState([]);
  const [pontosRota, setPontosRota] = useState([]);
  const [novoPontoNome, setNovoPontoNome] = useState('');
  const [novoPontoLat, setNovoPontoLat] = useState('');
  const [novoPontoLon, setNovoPontoLon] = useState('');
  const [mostrarFormNovoPonto, setMostrarFormNovoPonto] = useState(false);
  const [editandoPonto, setEditandoPonto] = useState(null);
  const [limiteExcedido, setLimiteExcedido] = useState(false);
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const handleEditarPonto = (ponto) => {
    setEditandoPonto(ponto.id);
    // Verificar se está dentro do limite de 2km dos colégios
    // Temporariamente desabilitado - validação de distância não está implementada corretamente
    // if (pontosPreDefinidos.length > 0) {
    //   const distancia = Math.sqrt(
    //     Math.pow(ponto.x - pontosPreDefinidos[0].x, 2) +
    //       Math.pow(ponto.y - pontosPreDefinidos[0].y, 2),
    //   );
    //   if (distancia > 200) {
    //     // Simulação de 2km (200 unidades)
    //     setLimiteExcedido(true);
    //     Alert.alert(
    //       'Limite Excedido',
    //       'O ponto está a mais de 2km dos colégios. Por favor, ajuste a posição.',
    //     );
    //   } else {
    //     setLimiteExcedido(false);
    //   }
    // }
    setLimiteExcedido(false);
  };

  useEffect(() => {
    const carregarPontos = async () => {
      // Se for uma nova rota, não precisa carregar pontos existentes
      if (isNovaRota || !rota?.id) {
        return;
      }

      try {
        setLoading(true);
        const pontosData = await motoristaService.listarPontosRota(rota.id);
        
        // Converter os pontos do formato da API para o formato usado no componente
        const pontosFormatados = pontosData.map((p, index) => ({
          id: p.id || Date.now() + index,
          nome: p.nome,
          latitude: p.latitude,
          longitude: p.longitude,
          x: 50 + Math.random() * 200, // Posição simulada no mapa
          y: 50 + Math.random() * 200,
          editavel: true,
        }));
        
        setPontosRota(pontosFormatados);
        console.log('Pontos carregados:', pontosFormatados);
      } catch (error) {
        console.error('Error loading points:', error);
        // Não mostrar erro se não houver pontos ainda
        if (error?.status !== 404) {
          Alert.alert(
            'Erro',
            'Não foi possível carregar os pontos da rota. Você pode adicionar novos pontos.',
          );
        }
      } finally {
        setLoading(false);
      }
    };

    carregarPontos();
  }, [rota?.id, isNovaRota]);

  const handleAdicionarPonto = () => {
    if (!novoPontoNome.trim() || !novoPontoLat || !novoPontoLon) {
      Alert.alert('Erro', 'Preencha todos os campos do ponto');
      return;
    }

    const lat = parseFloat(novoPontoLat);
    const lon = parseFloat(novoPontoLon);

    if (isNaN(lat) || isNaN(lon)) {
      Alert.alert('Erro', 'Latitude e longitude devem ser números válidos');
      return;
    }

    if (lat < -90 || lat > 90) {
      Alert.alert('Erro', 'Latitude deve estar entre -90 e 90');
      return;
    }

    if (lon < -180 || lon > 180) {
      Alert.alert('Erro', 'Longitude deve estar entre -180 e 180');
      return;
    }

    const novoPonto = {
      id: Date.now(),
      nome: novoPontoNome.trim(),
      latitude: lat,
      longitude: lon,
      x: 50 + Math.random() * 200, // Posição simulada no mapa
      y: 50 + Math.random() * 200,
      editavel: true,
    };

    setPontosRota([...pontosRota, novoPonto]);
    setNovoPontoNome('');
    setNovoPontoLat('');
    setNovoPontoLon('');
    setMostrarFormNovoPonto(false);
  };

  const handleRemoverPonto = (pontoId) => {
    Alert.alert(
      'Remover Ponto',
      'Tem certeza que deseja remover este ponto?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            setPontosRota(pontosRota.filter((p) => p.id !== pontoId));
          },
        },
      ],
    );
  };

  const handleSalvarPontos = async () => {
    console.log('handleSalvarPontos chamado');
    console.log('route.params:', route?.params);
    console.log('rota:', rota);
    console.log('pontosRota:', pontosRota);
    
    // Determine which route ID to use
    let rotaId = rota?.id;
    if (!rotaId) {
      const params = route?.params || {};
      const rotaFromParams = params.rota || (params.viagem?.rota_id ? {id: params.viagem.rota_id} : null);
      rotaId = rotaFromParams?.id;
    }
    
    if (!rotaId) {
      Alert.alert(
        'Erro',
        'Rota não encontrada. Por favor, volte e tente novamente.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
      return;
    }

    if (pontosRota.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um ponto à rota');
      return;
    }

    try {
      setSalvando(true);
      
      // Backend requires two steps:
      // 1. Create each point (POST /pontos/)
      // 2. Add point to route (POST /rotas/{id}/pontos)
      
      let addedCount = 0;
      
      for (let i = 0; i < pontosRota.length; i++) {
        const ponto = pontosRota[i];
        
        try {
          // Step 1: Create the point if it doesn't have a backend ID
          let pontoId = ponto.backendId;
          
          if (!pontoId) {
            console.log(`Creating point ${i + 1}:`, ponto.nome);
            const createdPonto = await motoristaService.criarPonto({
              apelido: ponto.nome,
              latitude: ponto.latitude,
              longitude: ponto.longitude,
            });
            pontoId = createdPonto.id;
            console.log(`Point created with ID:`, pontoId);
          }
          
          // Step 2: Add point to route with order
          console.log(`Adding point ${pontoId} to route ${rotaId} at order ${i + 1}`);
          await motoristaService.adicionarPontoRota(rotaId, pontoId, i + 1);
          addedCount++;
          
        } catch (pointError) {
          console.error(`Error processing point ${i + 1}:`, pointError);
          // Continue with other points
        }
      }

      if (addedCount > 0) {
        Alert.alert(
          'Sucesso', 
          `${addedCount} ponto(s) adicionado(s) à rota!`, 
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível adicionar os pontos. Tente novamente.');
      }
      
    } catch (error) {
      console.error('Error saving points:', error);
      Alert.alert(
        'Erro',
        error?.message || 'Não foi possível salvar os pontos. Tente novamente.',
      );
    } finally {
      setSalvando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name={IconNames.back} size="md" color={colors.secondary.main} />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Definir Pontos da Rota</Text>
      </View>

      {loading && pontosRota.length === 0 && !isNovaRota ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary.main} />
          <Text style={styles.loadingText}>Carregando pontos da rota...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
          <View style={styles.infoBox}>
            <Icon name={IconNames.warning} size="md" color={colors.warning.main} />
            <Text style={styles.infoText}>
              Você pode editar os pontos da rota, mas eles devem estar
              dentro de um raio de 2km dos colégios.
            </Text>
          </View>

          {/* Mapa Simplificado */}
          <View style={styles.mapaContainer}>
            <Text style={styles.mapaTitle}>Mapa da Rota</Text>
            <View style={styles.mapaPlaceholder}>
              {/* Pontos pré-definidos dos colégios */}
              {pontosPreDefinidos.map((ponto) => (
                  <View
                  key={ponto.id}
                  style={[
                    styles.pontoMapa,
                    styles.pontoColegio,
                    {left: ponto.x, top: ponto.y},
                  ]}>
                  <Icon name={IconNames.badge} size="md" color={colors.primary.main} />
                  <Text style={styles.pontoMapaNome}>{ponto.nome}</Text>
                </View>
              ))}

              {/* Pontos editáveis da rota */}
              {pontosRota.map((ponto) => (
                <TouchableOpacity
                  key={ponto.id}
                  style={[
                    styles.pontoMapa,
                    styles.pontoEditavel,
                    editandoPonto === ponto.id && styles.pontoEditando,
                    {left: ponto.x, top: ponto.y},
                  ]}
                  onPress={() => handleEditarPonto(ponto)}>
                  <Icon name={IconNames.location} size="md" color={colors.secondary.main} />
                  <Text style={styles.pontoMapaNome}>{ponto.nome}</Text>
                  {editandoPonto === ponto.id && (
                    <View style={styles.editarIndicador}>
                      <Text style={styles.editarIndicadorText}>Editar</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}

              {/* Linhas da rota */}
              <View style={styles.linhaRota} />
            </View>
          </View>

          {/* Lista de Pontos */}
          <View style={styles.listaPontos}>
            <View style={styles.listaHeader}>
              <Text style={styles.listaTitle}>Pontos da Rota</Text>
              <TouchableOpacity
                style={styles.adicionarButton}
                onPress={() => setMostrarFormNovoPonto(!mostrarFormNovoPonto)}>
                <Text style={styles.adicionarButtonText}>
                  {mostrarFormNovoPonto ? '−' : '+'} Adicionar Ponto
                </Text>
              </TouchableOpacity>
            </View>

            {mostrarFormNovoPonto && (
              <View style={styles.formNovoPonto}>
                <TextInput
                  style={styles.input}
                  placeholder="Nome do ponto"
                  placeholderTextColor="#999"
                  value={novoPontoNome}
                  onChangeText={setNovoPontoNome}
                />
                <View style={styles.coordenadasRow}>
                  <TextInput
                    style={[styles.input, styles.inputCoordenada, styles.inputCoordenadaLeft]}
                    placeholder="Latitude"
                    placeholderTextColor="#999"
                    value={novoPontoLat}
                    onChangeText={setNovoPontoLat}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.inputCoordenada, styles.inputCoordenadaRight]}
                    placeholder="Longitude"
                    placeholderTextColor="#999"
                    value={novoPontoLon}
                    onChangeText={setNovoPontoLon}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={styles.cancelarButton}
                    onPress={() => {
                      setMostrarFormNovoPonto(false);
                      setNovoPontoNome('');
                      setNovoPontoLat('');
                      setNovoPontoLon('');
                    }}>
                    <Text style={styles.cancelarButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmarButton}
                    onPress={handleAdicionarPonto}>
                    <Text style={styles.confirmarButtonText}>Adicionar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {pontosRota.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  Nenhum ponto adicionado ainda
                </Text>
                <Text style={styles.emptySubtext}>
                  Clique em "Adicionar Ponto" para começar
                </Text>
              </View>
            ) : (
              pontosRota.map((ponto) => (
                <View key={ponto.id} style={styles.pontoItem}>
                  <View style={styles.pontoItemLeft}>
                    <Icon name={IconNames.location} size="md" color={colors.secondary.main} />
                    <View style={styles.pontoItemInfo}>
                      <Text style={styles.pontoItemNome}>{ponto.nome}</Text>
                      <Text style={styles.pontoItemCoords}>
                        {ponto.latitude.toFixed(6)}, {ponto.longitude.toFixed(6)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.removerButton}
                    onPress={() => handleRemoverPonto(ponto.id)}>
                    <Text style={styles.removerButtonText}>Remover</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          {limiteExcedido && (
            <View style={styles.avisoBox}>
              <Icon name={IconNames.warning} size="sm" color={colors.error.main} />
              <Text style={styles.avisoText}>
                Alguns pontos estão fora do limite de 2km
              </Text>
            </View>
          )}

          {(limiteExcedido || pontosRota.length === 0) && (
            <View style={styles.infoBox}>
              <Icon name={IconNames.warning} size="sm" color={colors.warning.main} />
              <Text style={styles.infoText}>
                {pontosRota.length === 0
                  ? 'Adicione pelo menos um ponto antes de salvar'
                  : 'Verifique os pontos antes de salvar'}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.salvarButton,
              (limiteExcedido || salvando || pontosRota.length === 0) &&
                styles.salvarButtonDisabled,
            ]}
            onPress={() => {
              console.log('Botão clicado!');
              console.log('limiteExcedido:', limiteExcedido);
              console.log('salvando:', salvando);
              console.log('pontosRota.length:', pontosRota.length);
              console.log('rota:', rota);
              console.log('user:', user);
              handleSalvarPontos();
            }}
            disabled={limiteExcedido || salvando || pontosRota.length === 0}>
            {salvando ? (
              <ActivityIndicator color={colors.text.inverse} />
            ) : (
              <Text style={styles.salvarButtonText}>
                Salvar Pontos da Rota ({pontosRota.length})
              </Text>
            )}
          </TouchableOpacity>
        </View>
        </ScrollView>
      )}
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
  title: {
    ...textStyles.h2,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.base,
  },
  infoBox: {
    backgroundColor: colors.warning.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.base,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  infoText: {
    ...textStyles.bodySmall,
    color: colors.warning.dark,
    flex: 1,
  },
  mapaContainer: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  mapaTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  mapaPlaceholder: {
    height: 300,
    backgroundColor: colors.success.light,
    borderRadius: borderRadius.md,
    position: 'relative',
    borderWidth: 2,
    borderColor: colors.success.main,
    borderStyle: 'dashed',
  },
  pontoMapa: {
    position: 'absolute',
    alignItems: 'center',
  },
  pontoColegio: {
    zIndex: 3,
  },
  pontoEditavel: {
    zIndex: 2,
  },
  pontoEditando: {
    zIndex: 10,
    borderWidth: 2,
    borderColor: colors.secondary.main,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  pontoMapaNome: {
    ...textStyles.caption,
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
    backgroundColor: colors.background.paper,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.xs,
    textAlign: 'center',
  },
  editarIndicador: {
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.xs,
    marginTop: spacing.xs,
  },
  editarIndicadorText: {
    ...textStyles.caption,
    color: colors.text.inverse,
    fontWeight: fontWeight.bold,
  },
  linhaRota: {
    position: 'absolute',
    width: '80%',
    height: 2,
    backgroundColor: colors.secondary.main,
    opacity: 0.5,
    left: '10%',
    top: '50%',
    zIndex: 1,
  },
  listaPontos: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  listaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  listaTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    flex: 1,
  },
  adicionarButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.success.main,
    ...shadows.xs,
  },
  adicionarButtonText: {
    ...textStyles.buttonSmall,
    color: colors.text.inverse,
  },
  formNovoPonto: {
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.sm,
    padding: spacing.base,
    ...textStyles.inputText,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  coordenadasRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  inputCoordenada: {
    flex: 1,
    minWidth: 0,
    marginBottom: 0,
  },
  inputCoordenadaLeft: {
    marginRight: spacing.sm,
  },
  inputCoordenadaRight: {
    marginLeft: spacing.sm,
  },
  formButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  cancelarButton: {
    flex: 1,
    padding: spacing.base,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.border.light,
    alignItems: 'center',
  },
  cancelarButtonText: {
    ...textStyles.buttonSmall,
    color: colors.text.secondary,
  },
  confirmarButton: {
    flex: 1,
    padding: spacing.base,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.secondary.main,
    alignItems: 'center',
    ...shadows.xs,
  },
  confirmarButtonText: {
    ...textStyles.buttonSmall,
    color: colors.text.inverse,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...textStyles.caption,
    color: colors.text.hint,
  },
  pontoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  pontoItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  pontoItemInfo: {
    flex: 1,
  },
  pontoItemNome: {
    ...textStyles.body,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  pontoItemCoords: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  removerButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.error.main,
    ...shadows.xs,
  },
  removerButtonText: {
    ...textStyles.buttonSmall,
    color: colors.text.inverse,
    fontWeight: fontWeight.medium,
  },
  avisoBox: {
    backgroundColor: colors.error.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avisoText: {
    ...textStyles.bodySmall,
    color: colors.error.dark,
    flex: 1,
  },
  salvarButton: {
    backgroundColor: colors.secondary.main,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    alignItems: 'center',
    ...shadows.sm,
  },
  salvarButtonDisabled: {
    backgroundColor: colors.border.light,
  },
  salvarButtonText: {
    ...textStyles.button,
    color: colors.text.inverse,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  loadingText: {
    marginTop: spacing.base,
    ...textStyles.body,
    color: colors.text.secondary,
  },
});

export default DefinirPontosRota;


