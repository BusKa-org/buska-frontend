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
import { colors, spacing, borderRadius, shadows, textStyles, fontWeight } from '../../theme';
import Icon, { IconNames } from '../../components/Icon';
import { useToast } from '../../components/Toast';

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

  // Load existing points
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        
        // Load available points (municipality points)
        const todosOsPontos = await motoristaService.listarPontos();
        setPontosDisponiveis(todosOsPontos || []);
        
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

  const handleAdicionarPontoExistente = (ponto) => {
    // Check if already added
    if (pontosRota.some(p => p.id === ponto.id)) {
      toast.warning('Este ponto já está na rota.');
      return;
    }
    
    setPontosRota([...pontosRota, {
      ...ponto,
      ordem: pontosRota.length + 1,
    }]);
    toast.success(`${ponto.nome || ponto.apelido} adicionado!`);
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
    Alert.alert(
      'Remover Ponto',
      'Tem certeza que deseja remover este ponto da rota?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            setPontosRota(pontosRota.filter(p => p.id !== pontoId));
            toast.info('Ponto removido.');
          },
        },
      ],
    );
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
      
      let successCount = 0;
      
      for (let i = 0; i < pontosRota.length; i++) {
        const ponto = pontosRota[i];
        try {
          await motoristaService.adicionarPontoRota(rotaId, ponto.id, i + 1);
          successCount++;
        } catch (error) {
          console.error(`Error adding point ${ponto.nome}:`, error);
        }
      }

      if (successCount === pontosRota.length) {
        toast.success('Pontos salvos com sucesso!');
        navigation.goBack();
      } else if (successCount > 0) {
        toast.warning(`${successCount} de ${pontosRota.length} pontos salvos.`);
      } else {
        toast.error('Não foi possível salvar os pontos.');
      }
    } catch (error) {
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
                <View key={ponto.id} style={styles.pontoItem}>
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
                  
                  <View style={styles.pontoActions}>
                    <TouchableOpacity 
                      style={styles.moveButton}
                      onPress={() => handleMoverPonto(index, -1)}
                      disabled={index === 0}>
                      <Icon 
                        name={IconNames.expandLess} 
                        size="md" 
                        color={index === 0 ? colors.neutral[300] : colors.text.secondary} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.moveButton}
                      onPress={() => handleMoverPonto(index, 1)}
                      disabled={index === pontosRota.length - 1}>
                      <Icon 
                        name={IconNames.expandMore} 
                        size="md" 
                        color={index === pontosRota.length - 1 ? colors.neutral[300] : colors.text.secondary} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => handleRemoverPonto(ponto.id)}>
                      <Icon name={IconNames.close} size="sm" color={colors.error.main} />
                    </TouchableOpacity>
                  </View>
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
                {pontosDisponiveis
                  .filter(p => !pontosRota.some(pr => pr.id === p.id))
                  .slice(0, 10)
                  .map(ponto => (
                    <TouchableOpacity
                      key={ponto.id}
                      style={styles.pontoChip}
                      onPress={() => handleAdicionarPontoExistente(ponto)}>
                      <Icon name={IconNames.add} size="xs" color={colors.secondary.main} />
                      <Text style={styles.pontoChipText} numberOfLines={1}>
                        {ponto.apelido || ponto.nome}
                      </Text>
                    </TouchableOpacity>
                  ))}
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
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
  moveButton: {
    padding: spacing.sm,
  },
  removeButton: {
    padding: spacing.sm,
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
  pontoChipText: {
    ...textStyles.caption,
    color: colors.secondary.dark,
    fontWeight: fontWeight.medium,
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
