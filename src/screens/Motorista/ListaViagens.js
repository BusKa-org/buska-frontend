import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import {motoristaService} from '../../services/motoristaService';
import { colors, spacing, borderRadius, shadows, textStyles, fontSize, fontWeight } from '../../theme';
import Icon, { IconNames } from '../../components/Icon';

const ListaViagens = ({navigation}) => {
  const [viagens, setViagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadViagens = async () => {
    try {
      setLoading(true);
      const viagensData = await motoristaService.listarViagens();
      console.log('Viagens recebidas:', viagensData);
      
      // Ordenar por data (mais recentes primeiro)
      const viagensOrdenadas = (viagensData || []).sort((a, b) => {
        const dataA = new Date(a.data);
        const dataB = new Date(b.data);
        return dataB - dataA;
      });
      
      console.log('Viagens ordenadas:', viagensOrdenadas);
      setViagens(viagensOrdenadas);
    } catch (error) {
      console.error('Error loading trips:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      Alert.alert(
        'Erro',
        error?.message || 'Não foi possível carregar as viagens. Tente novamente.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadViagens();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadViagens();
  };

  const getStatusViagem = (viagem) => {
    // horario_fim existe quando a viagem foi finalizada
    if (viagem.horario_fim) {
      return 'Finalizada';
    }
    // Por enquanto, todas as viagens sem horario_fim são "A iniciar"
    // O status "Em andamento" seria determinado quando a viagem é iniciada
    // mas isso requer verificar se horario_inicio foi atualizado pela API de iniciar
    return 'A iniciar';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'A iniciar':
        return colors.warning.main;
      case 'Em andamento':
        return colors.secondary.main;
      case 'Finalizada':
        return colors.success.main;
      default:
        return colors.text.hint;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return timeString.substring(0, 5);
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
        <View style={styles.headerContent}>
          <Text style={styles.title}>Minhas Viagens</Text>
          <TouchableOpacity
            style={styles.criarViagemButton}
            onPress={() => navigation.navigate('CriarViagem')}>
            <Text style={styles.criarViagemButtonText}>+ Nova Viagem</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary.main} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <View style={styles.content}>
            {viagens.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  Nenhuma viagem cadastrada ainda
                </Text>
                <Text style={styles.emptySubtext}>
                  Crie sua primeira viagem para começar
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => navigation.navigate('CriarViagem')}>
                  <Text style={styles.emptyButtonText}>Criar Primeira Viagem</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {viagens.map((viagem) => {
                  console.log('Renderizando viagem:', viagem);
                  const status = getStatusViagem(viagem);
                  return (
                    <TouchableOpacity
                      key={viagem.id}
                      style={styles.viagemCard}
                      onPress={() =>
                        navigation.navigate('DetalheViagemMotorista', {
                          viagem,
                        })
                      }>
                      <View style={styles.viagemHeader}>
                        <View style={styles.viagemInfo}>
                          <Text style={styles.viagemTipo}>{viagem.tipo || 'N/A'}</Text>
                          <Text style={styles.viagemData}>
                            {viagem.data ? formatDate(viagem.data) : 'Data não disponível'}
                          </Text>
                          <Text style={styles.viagemHorario}>
                            {viagem.horario_inicio ? formatTime(viagem.horario_inicio) : '--:--'}
                            {viagem.horario_fim
                              ? ` - ${formatTime(viagem.horario_fim)}`
                              : ''}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            {backgroundColor: getStatusColor(status) + '20'},
                          ]}>
                          <Text
                            style={[
                              styles.statusText,
                              {color: getStatusColor(status)},
                            ]}>
                            {status}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.rotaId}>Rota ID: {viagem.rota_id || 'N/A'}</Text>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...textStyles.h2,
    color: colors.text.primary,
    flex: 1,
  },
  criarViagemButton: {
    backgroundColor: colors.success.main,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    ...shadows.xs,
  },
  criarViagemButtonText: {
    ...textStyles.buttonSmall,
    color: colors.text.inverse,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.base,
  },
  viagemCard: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  viagemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  viagemInfo: {
    flex: 1,
  },
  viagemTipo: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  viagemData: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  viagemHorario: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...textStyles.caption,
    fontWeight: fontWeight.semiBold,
  },
  rotaId: {
    ...textStyles.caption,
    color: colors.text.hint,
    marginTop: spacing.sm,
  },
  emptyState: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    ...textStyles.h4,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...textStyles.bodySmall,
    color: colors.text.hint,
    marginBottom: spacing.xl,
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

export default ListaViagens;

