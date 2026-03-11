import React, {useState, useEffect} from 'react';
import {
  Alert,
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
import {useAuth} from '../../contexts/AuthContext';
import {useToast} from '../../components/Toast';
import { colors, spacing, borderRadius, shadows, textStyles, fontSize, fontWeight } from '../../theme';
import Icon, { IconNames } from '../../components/Icon';

const RotaMotorista = ({navigation, route}) => {
  const { user } = useAuth();
  const toast = useToast();
  const isGestor = user?.role?.toLowerCase() === 'gestor';
  const [rotas, setRotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const loadRotas = async () => {
    try {
      const rotasData = await motoristaService.listarRotas();
      setRotas(rotasData || []);
    } catch (error) {
      console.error('Error loading routes:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar as rotas. Tente novamente.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRotas();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadRotas();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name={IconNames.back} size="md" color={colors.secondary.contrast} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Minhas Rotas</Text>
            <Text style={styles.subtitle}>{rotas.length} rota{rotas.length !== 1 ? 's' : ''} cadastrada{rotas.length !== 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.headerIcon}>
            <Icon name={IconNames.bus} size="lg" color={colors.secondary.contrast} />
          </View>
        </View>
        {isGestor && (
          <TouchableOpacity
            style={styles.criarRotaButton}
            onPress={() => navigation.navigate('CriarRota')}>
            <Icon name={IconNames.add} size="sm" color={colors.text.inverse} />
            <Text style={styles.criarRotaButtonText}>Nova Rota</Text>
          </TouchableOpacity>
        )}
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
            {rotas.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  Nenhuma rota cadastrada ainda
                </Text>
                <Text style={styles.emptySubtext}>
                  Crie sua primeira rota para começar
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => navigation.navigate('CriarRota')}>
                  <Text style={styles.emptyButtonText}>Criar Primeira Rota</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {rotas.map((rota) => (
                  <View key={rota.id} style={styles.rotaCard}>
                    <View style={styles.rotaHeader}>
                      <View style={styles.rotaInfo}>
                        <Text style={styles.rotaNome}>{rota.nome}</Text>
                        <Text style={styles.rotaId}>ID: {rota.id}</Text>
                      </View>
                    </View>

                    <View style={styles.rotaActions}>
                      <TouchableOpacity
                        style={styles.acaoButton}
                        onPress={() =>
                          navigation.navigate('ListaViagens', {
                            rota: rota,
                          })
                        }>
                        <Icon name={IconNames.route} size="sm" color={colors.text.inverse} />
                        <Text style={styles.acaoButtonText}>
                          Ver Viagens
                        </Text>
                      </TouchableOpacity>
                      
                      {isGestor && (
                        <>
                          <TouchableOpacity
                            style={[styles.acaoButton, styles.acaoButtonSecondary]}
                            onPress={() =>
                              navigation.navigate('DefinirPontosRota', {
                                rota: rota,
                                isNovaRota: false,
                              })
                            }>
                            <Icon name={IconNames.location} size="sm" color={colors.text.inverse} />
                            <Text style={styles.acaoButtonText}>
                              Pontos
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.acaoButton, { backgroundColor: colors.success.main }]}
                            onPress={() =>
                              navigation.navigate('CriarViagem', {
                                rota: rota,
                              })
                            }>
                            <Icon name={IconNames.add} size="sm" color={colors.text.inverse} />
                            <Text style={styles.acaoButtonText}>
                              Nova Viagem
                            </Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                ))}
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
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.lg,
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
  subtitle: {
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
  title: {
    ...textStyles.h3,
    color: colors.secondary.contrast,
  },
  criarRotaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.success.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    ...shadows.sm,
  },
  criarRotaButtonText: {
    ...textStyles.button,
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
  rotaCard: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  rotaHeader: {
    marginBottom: spacing.base,
  },
  rotaInfo: {
    marginBottom: spacing.sm,
  },
  rotaNome: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  rotaId: {
    ...textStyles.caption,
    color: colors.text.hint,
  },
  rotaActions: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.sm,
  },
  acaoButton: {
    backgroundColor: colors.secondary.main,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    ...shadows.xs,
  },
  acaoButtonSecondary: {
    backgroundColor: colors.success.main,
  },
  acaoButtonText: {
    ...textStyles.buttonSmall,
    color: colors.text.inverse,
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

export default RotaMotorista;

