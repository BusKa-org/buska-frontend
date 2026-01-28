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
} from 'react-native';
import {motoristaService} from '../../services/motoristaService';
import {useToast} from '../../components/Toast';
import { colors, spacing, borderRadius, shadows, textStyles, fontSize, fontWeight } from '../../theme';
import Icon, { IconNames } from '../../components/Icon';

const ListaViagens = ({navigation}) => {
  const toast = useToast();
  const [viagens, setViagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadViagens = async () => {
    try {
      setLoading(true);
      const viagensData = await motoristaService.listarViagens();
      
      // Ordenar por data (mais recentes primeiro)
      const viagensOrdenadas = (viagensData || []).sort((a, b) => {
        const dataA = new Date(a.data);
        const dataB = new Date(b.data);
        return dataB - dataA;
      });
      
      setViagens(viagensOrdenadas);
    } catch (error) {
      console.error('Error loading trips:', error);
      toast.error(error?.message || 'Não foi possível carregar as viagens.');
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

  const getStatusLabel = (status) => {
    const statusMap = {
      'AGENDADA': 'A iniciar',
      'EM_ANDAMENTO': 'Em andamento',
      'FINALIZADA': 'Finalizada',
      'CANCELADA': 'Cancelada',
    };
    return statusMap[status] || status || 'Desconhecido';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'AGENDADA':
        return colors.warning.main;
      case 'EM_ANDAMENTO':
        return colors.secondary.main;
      case 'FINALIZADA':
        return colors.success.main;
      case 'CANCELADA':
        return colors.error.main;
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
                <Icon name={IconNames.route} size="xxl" color={colors.neutral[300]} />
                <Text style={styles.emptyText}>
                  Nenhuma viagem atribuída
                </Text>
                <Text style={styles.emptySubtext}>
                  O gestor precisa atribuir viagens para você
                </Text>
              </View>
            ) : (
              <>
                {viagens.map((viagem) => {
                  const statusLabel = getStatusLabel(viagem.status);
                  const statusColor = getStatusColor(viagem.status);
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
                          <Text style={styles.viagemTipo}>
                            {viagem.tipo || 'IDA'} - {viagem.rota_nome || 'Rota'}
                          </Text>
                          <Text style={styles.viagemData}>
                            {viagem.data ? formatDate(viagem.data) : 'Data não disponível'}
                          </Text>
                          <Text style={styles.viagemHorario}>
                            {viagem.horario_inicio ? formatTime(viagem.horario_inicio) : '--:--'}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            {backgroundColor: statusColor + '20'},
                          ]}>
                          <Text
                            style={[
                              styles.statusText,
                              {color: statusColor},
                            ]}>
                            {statusLabel}
                          </Text>
                        </View>
                      </View>
                      {viagem.origem && viagem.destino && (
                        <Text style={styles.rotaInfo}>
                          {viagem.origem} → {viagem.destino}
                        </Text>
                      )}
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
  rotaInfo: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  emptyState: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    ...textStyles.h4,
    color: colors.text.secondary,
    marginTop: spacing.base,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    ...textStyles.bodySmall,
    color: colors.text.hint,
    textAlign: 'center',
  },
});

export default ListaViagens;

