import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {motoristaService} from '../../services/motoristaService';
import {useAuth} from '../../contexts/AuthContext';
import {useToast} from '../../components/Toast';
import { colors, spacing, borderRadius, shadows, textStyles, fontSize, fontWeight } from '../../theme';
import Icon, { IconNames } from '../../components/Icon';

const isWeb = Platform.OS === 'web';

const CriarViagem = ({navigation, route}) => {
  const {user} = useAuth();
  const toast = useToast();
  const rotaParam = route?.params?.rota;
  
  const [rotas, setRotas] = useState([]);
  const [rotaSelecionada, setRotaSelecionada] = useState(rotaParam?.id || null);
  const [horarios, setHorarios] = useState([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingRotas, setLoadingRotas] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(false);

  // Helper to get date string in YYYY-MM-DD format
  const formatDateToString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDateOffset = (daysOffset) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return formatDateToString(date);
  };

  useEffect(() => {
    const loadRotas = async () => {
      try {
        const rotasData = await motoristaService.listarRotas();
        setRotas(rotasData || []);
        
        // Se veio com rota pré-selecionada, garantir que está na lista
        if (rotaParam && rotasData) {
          const rotaExiste = rotasData.find((r) => r.id === rotaParam.id);
          if (rotaExiste) {
            setRotaSelecionada(rotaParam.id);
          }
        }
      } catch (error) {
        console.error('Error loading routes:', error);
        toast.error('Não foi possível carregar as rotas.');
      } finally {
        setLoadingRotas(false);
      }
    };

    loadRotas();
  }, []);

  // Load schedules when route is selected
  useEffect(() => {
    const loadHorarios = async () => {
      if (!rotaSelecionada) {
        setHorarios([]);
        return;
      }
      
      try {
        setLoadingHorarios(true);
        const horariosData = await motoristaService.listarHorariosRota(rotaSelecionada);
        setHorarios(horariosData || []);
        setHorarioSelecionado(null);
      } catch (error) {
        console.error('Error loading schedules:', error);
        setHorarios([]);
      } finally {
        setLoadingHorarios(false);
      }
    };

    loadHorarios();
  }, [rotaSelecionada]);

  const handleCriarViagem = async () => {
    if (!rotaSelecionada) {
      toast.error('Selecione uma rota');
      return;
    }

    if (!data.trim()) {
      toast.error('Informe a data da viagem');
      return;
    }

    // Validar formato da data (YYYY-MM-DD)
    const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dataRegex.test(data)) {
      toast.error('Formato de data inválido. Use YYYY-MM-DD (ex: 2024-12-25)');
      return;
    }

    if (!horarioSelecionado && horarios.length > 0) {
      toast.error('Selecione um horário');
      return;
    }

    try {
      setLoading(true);

      const viagemData = {
        rota_id: rotaSelecionada,
        data: data.trim(),
        horario_id: horarioSelecionado || undefined,
      };
      
      await motoristaService.criarViagem(viagemData);

      toast.success('Viagem criada com sucesso!');
      navigation.navigate('ListaViagens');
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error(error?.message || 'Não foi possível criar a viagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Obter data de hoje no formato YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatHorario = (horario) => {
    const sentidoLabel = {
      'IDA': 'Ida',
      'VOLTA': 'Volta',
      'CIRCULAR': 'Circular'
    };
    const diasLabel = (horario.dias || []).join(', ');
    return `${horario.horario_saida} - ${sentidoLabel[horario.sentido] || horario.sentido}${diasLabel ? ` (${diasLabel})` : ''}`;
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
        <Text style={styles.title}>Criar Nova Viagem</Text>
      </View>

      {loadingRotas ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary.main} />
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            {/* Seleção de Rota */}
            <View style={styles.section}>
              <Text style={styles.label}>Rota *</Text>
              {rotas.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    Você não possui rotas cadastradas
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => navigation.navigate('CriarRota')}>
                    <Text style={styles.emptyButtonText}>Criar Rota</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.rotasScroll}>
                  {rotas.map((rota) => (
                    <TouchableOpacity
                      key={rota.id}
                      style={[
                        styles.rotaOption,
                        rotaSelecionada === rota.id && styles.rotaOptionSelected,
                      ]}
                      onPress={() => setRotaSelecionada(rota.id)}>
                      <Text
                        style={[
                          styles.rotaOptionText,
                          rotaSelecionada === rota.id &&
                            styles.rotaOptionTextSelected,
                        ]}>
                        {rota.nome}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Seleção de Horário */}
            {rotaSelecionada && (
              <View style={styles.section}>
                <Text style={styles.label}>Horário</Text>
                {loadingHorarios ? (
                  <ActivityIndicator size="small" color={colors.secondary.main} />
                ) : horarios.length === 0 ? (
                  <View style={styles.infoBox}>
                    <Icon name={IconNames.info} size="md" color={colors.info.main} />
                    <Text style={styles.infoText}>
                      Esta rota não possui horários cadastrados. A viagem será criada sem horário definido.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.horariosContainer}>
                    {horarios.map((horario) => (
                      <TouchableOpacity
                        key={horario.id}
                        style={[
                          styles.horarioOption,
                          horarioSelecionado === horario.id && styles.horarioOptionSelected,
                        ]}
                        onPress={() => setHorarioSelecionado(horario.id)}>
                        <View style={styles.horarioContent}>
                          <Icon 
                            name={IconNames.schedule} 
                            size="md" 
                            color={horarioSelecionado === horario.id ? colors.secondary.main : colors.text.secondary} 
                          />
                          <Text
                            style={[
                              styles.horarioText,
                              horarioSelecionado === horario.id && styles.horarioTextSelected,
                            ]}>
                            {formatHorario(horario)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Data */}
            <View style={styles.section}>
              <Text style={styles.label}>Data da Viagem *</Text>
              
              {/* Quick date selection buttons */}
              <View style={styles.quickDatesContainer}>
                <TouchableOpacity
                  style={[styles.quickDateButton, data === getDateOffset(0) && styles.quickDateButtonSelected]}
                  onPress={() => setData(getDateOffset(0))}
                >
                  <Text style={[styles.quickDateText, data === getDateOffset(0) && styles.quickDateTextSelected]}>Hoje</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickDateButton, data === getDateOffset(1) && styles.quickDateButtonSelected]}
                  onPress={() => setData(getDateOffset(1))}
                >
                  <Text style={[styles.quickDateText, data === getDateOffset(1) && styles.quickDateTextSelected]}>Amanhã</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickDateButton, data === getDateOffset(2) && styles.quickDateButtonSelected]}
                  onPress={() => setData(getDateOffset(2))}
                >
                  <Text style={[styles.quickDateText, data === getDateOffset(2) && styles.quickDateTextSelected]}>+2 dias</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickDateButton, data === getDateOffset(7) && styles.quickDateButtonSelected]}
                  onPress={() => setData(getDateOffset(7))}
                >
                  <Text style={[styles.quickDateText, data === getDateOffset(7) && styles.quickDateTextSelected]}>+1 semana</Text>
                </TouchableOpacity>
              </View>

              {/* Date input - native for web, text for mobile */}
              {isWeb ? (
                <input
                  type="date"
                  value={data}
                  min={getTodayDate()}
                  onChange={(e) => setData(e.target.value)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: 16,
                    fontSize: 16,
                    borderRadius: 8,
                    border: `1px solid ${colors.border.light}`,
                    backgroundColor: colors.background.default,
                    color: colors.text.primary,
                    fontFamily: 'inherit',
                  }}
                />
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.text.hint}
                  value={data}
                  onChangeText={setData}
                  editable={!loading}
                  keyboardType="numbers-and-punctuation"
                />
              )}
              
              {data && (
                <Text style={styles.selectedDateText}>
                  Selecionado: {new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
              )}
            </View>

            {/* Botão Criar */}
            <TouchableOpacity
              style={[styles.button, (loading || !rotaSelecionada || rotas.length === 0) && styles.buttonDisabled]}
              onPress={handleCriarViagem}
              disabled={loading || !rotaSelecionada || rotas.length === 0}>
              {loading ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <Text style={styles.buttonText}>Criar Viagem</Text>
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
  section: {
    marginBottom: spacing.xl,
  },
  label: {
    ...textStyles.inputLabel,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...textStyles.inputText,
    borderWidth: 1,
    borderColor: colors.border.light,
    color: colors.text.primary,
  },
  hint: {
    ...textStyles.inputHelper,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  quickDatesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickDateButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.border.light,
    backgroundColor: colors.background.paper,
  },
  quickDateButtonSelected: {
    borderColor: colors.secondary.main,
    backgroundColor: colors.secondary.main,
  },
  quickDateText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontWeight: fontWeight.medium,
  },
  quickDateTextSelected: {
    color: colors.text.inverse,
  },
  selectedDateText: {
    ...textStyles.bodySmall,
    color: colors.success.main,
    marginTop: spacing.sm,
    fontWeight: fontWeight.medium,
  },
  rotasScroll: {
    marginTop: spacing.sm,
  },
  rotaOption: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: colors.border.light,
    ...shadows.xs,
  },
  rotaOptionSelected: {
    borderColor: colors.secondary.main,
    backgroundColor: colors.info.light,
  },
  rotaOptionText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontWeight: fontWeight.medium,
  },
  rotaOptionTextSelected: {
    color: colors.secondary.main,
    fontWeight: fontWeight.semiBold,
  },
  horariosContainer: {
    gap: spacing.sm,
  },
  horarioOption: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border.light,
    ...shadows.xs,
  },
  horarioOptionSelected: {
    borderColor: colors.secondary.main,
    backgroundColor: colors.info.light,
  },
  horarioContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  horarioText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  horarioTextSelected: {
    color: colors.secondary.main,
    fontWeight: fontWeight.semiBold,
  },
  infoBox: {
    backgroundColor: colors.info.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.info.main,
  },
  infoText: {
    ...textStyles.bodySmall,
    color: colors.info.dark,
    flex: 1,
  },
  button: {
    backgroundColor: colors.success.main,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    alignItems: 'center',
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  buttonDisabled: {
    backgroundColor: colors.success.light,
  },
  buttonText: {
    ...textStyles.button,
    color: colors.text.inverse,
    fontSize: fontSize.h4,
    fontWeight: fontWeight.bold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.xs,
  },
  emptyText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.base,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: colors.secondary.main,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    ...shadows.xs,
  },
  emptyButtonText: {
    ...textStyles.button,
    color: colors.text.inverse,
  },
});

export default CriarViagem;
