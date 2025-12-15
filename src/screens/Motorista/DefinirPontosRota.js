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
    console.log('user:', user);
    
    if (!rota || !rota.id) {
      console.log('Erro: Rota não encontrada');
      console.log('Tentando recuperar rota dos params...');
      
      // Tentar recuperar a rota dos params novamente
      const params = route?.params || {};
      const rotaFromParams = params.rota || (params.viagem?.rota_id ? {id: params.viagem.rota_id} : null);
      
      if (!rotaFromParams || !rotaFromParams.id) {
        Alert.alert(
          'Erro',
          'Rota não encontrada. Por favor, volte e tente novamente.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
        );
        return;
      }
      
      // Usar a rota recuperada
      const rotaToUse = rotaFromParams;
      console.log('Usando rota recuperada:', rotaToUse);
      
      // Continuar com a rota recuperada
      if (pontosRota.length === 0) {
        Alert.alert('Erro', 'Adicione pelo menos um ponto à rota');
        return;
      }

      if (!user?.municipio_id) {
        Alert.alert(
          'Erro',
          'Você não possui um município cadastrado. Entre em contato com o gestor.',
        );
        return;
      }

      try {
        setSalvando(true);
        const pontosFormatados = pontosRota.map((p) => ({
          nome: p.nome,
          latitude: p.latitude,
          longitude: p.longitude,
        }));

        console.log('Enviando pontos:', pontosFormatados);
        console.log('rota.id:', rotaToUse.id);
        console.log('user.municipio_id:', user.municipio_id);

        const response = await motoristaService.adicionarPontos(
          rotaToUse.id,
          user.municipio_id,
          pontosFormatados,
        );

        console.log('Resposta do servidor:', response);

        Alert.alert('Sucesso', 'Pontos da rota salvos com sucesso!', [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      } catch (error) {
        console.error('Error saving points:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        Alert.alert(
          'Erro',
          error?.message || 'Não foi possível salvar os pontos. Tente novamente.',
        );
      } finally {
        setSalvando(false);
      }
      return;
    }

    if (pontosRota.length === 0) {
      console.log('Erro: Nenhum ponto adicionado');
      Alert.alert('Erro', 'Adicione pelo menos um ponto à rota');
      return;
    }

    if (!user?.municipio_id) {
      console.log('Erro: Município não encontrado');
      Alert.alert(
        'Erro',
        'Você não possui um município cadastrado. Entre em contato com o gestor.',
      );
      return;
    }

    try {
      setSalvando(true);
      const pontosFormatados = pontosRota.map((p) => ({
        nome: p.nome,
        latitude: p.latitude,
        longitude: p.longitude,
      }));

      console.log('Enviando pontos:', pontosFormatados);
      console.log('rota.id:', rota.id);
      console.log('user.municipio_id:', user.municipio_id);

      const response = await motoristaService.adicionarPontos(
        rota.id,
        user.municipio_id,
        pontosFormatados,
      );

      console.log('Resposta do servidor:', response);

      Alert.alert('Sucesso', 'Pontos da rota salvos com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error('Error saving points:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
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
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Definir Pontos da Rota</Text>
      </View>

      {loading && pontosRota.length === 0 && !isNovaRota ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text style={styles.loadingText}>Carregando pontos da rota...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ⚠️ Você pode editar os pontos da rota, mas eles devem estar
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
                  <Text style={styles.pontoMapaIcon}>🏫</Text>
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
                  <Text style={styles.pontoMapaIcon}>📍</Text>
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
                    <Text style={styles.pontoItemIcon}>📍</Text>
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
              <Text style={styles.avisoText}>
                ⚠️ Alguns pontos estão fora do limite de 2km
              </Text>
            </View>
          )}

          {(limiteExcedido || pontosRota.length === 0) && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                {pontosRota.length === 0
                  ? '⚠️ Adicione pelo menos um ponto antes de salvar'
                  : '⚠️ Verifique os pontos antes de salvar'}
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
              <ActivityIndicator color="#fff" />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  infoBox: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  mapaContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mapaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  mapaPlaceholder: {
    height: 300,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#c8e6c9',
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
    borderColor: '#1a73e8',
    borderRadius: 8,
    padding: 4,
  },
  pontoMapaIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  pontoMapaNome: {
    fontSize: 10,
    color: '#333',
    fontWeight: '500',
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textAlign: 'center',
  },
  editarIndicador: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  editarIndicadorText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  linhaRota: {
    position: 'absolute',
    width: '80%',
    height: 2,
    backgroundColor: '#1a73e8',
    opacity: 0.5,
    left: '10%',
    top: '50%',
    zIndex: 1,
  },
  listaPontos: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  listaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  adicionarButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#34a853',
  },
  adicionarButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  formNovoPonto: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
    color: '#333',
  },
  coordenadasRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 8,
  },
  inputCoordenada: {
    flex: 1,
    minWidth: 0,
    marginBottom: 0,
  },
  inputCoordenadaLeft: {
    marginRight: 6,
  },
  inputCoordenadaRight: {
    marginLeft: 6,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  cancelarButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelarButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmarButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#1a73e8',
    alignItems: 'center',
  },
  confirmarButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#999',
  },
  pontoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pontoItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pontoItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  pontoItemInfo: {
    flex: 1,
  },
  pontoItemNome: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  pontoItemCoords: {
    fontSize: 12,
    color: '#666',
  },
  removerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#ea4335',
  },
  removerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  avisoBox: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  avisoText: {
    fontSize: 14,
    color: '#c62828',
  },
  salvarButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  salvarButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  salvarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default DefinirPontosRota;


