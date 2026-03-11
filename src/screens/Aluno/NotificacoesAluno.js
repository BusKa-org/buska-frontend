import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
} from 'react-native';
import { getNotificacoes, markNotificacaoAsSent } from '../../services/notificacaoService';
import { colors, spacing, borderRadius, shadows, textStyles } from '../../theme';
import { Icon, IconNames, LoadingSpinner, EmptyState } from '../../components';

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === 'None') return '';
  try {
    // Python str(datetime) uses a space instead of T: "2026-03-11 06:51:52+00:00"
    const normalized = dateStr.replace(' ', 'T');
    const date = new Date(normalized);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

const NotificacoesAluno = ({ navigation }) => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const unreadCount = notificacoes.filter((n) => !n.enviada).length;

  const loadNotificacoes = useCallback(async () => {
    setError(false);
    try {
      const data = await getNotificacoes();
      setNotificacoes(Array.isArray(data) ? data : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotificacoes();
  }, [loadNotificacoes]);

  const handleMarkAsRead = async (notificacao) => {
    if (notificacao.enviada) return;
    try {
      await markNotificacaoAsSent(notificacao.id);
      setNotificacoes((prev) =>
        prev.map((n) => (n.id === notificacao.id ? { ...n, enviada: true } : n)),
      );
    } catch {
      // Non-fatal
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notificacoes.filter((n) => !n.enviada);
    await Promise.allSettled(unread.map((n) => markNotificacaoAsSent(n.id)));
    setNotificacoes((prev) => prev.map((n) => ({ ...n, enviada: true })));
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, !item.enviada && styles.cardUnread]}
      onPress={() => handleMarkAsRead(item)}
      activeOpacity={0.7}>
      <View style={[styles.cardDot, !item.enviada && styles.cardDotUnread]} />
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.titulo}
          </Text>
          <Text style={styles.cardDate}>{formatDate(item.data_envio)}</Text>
        </View>
        <Text style={styles.cardMessage}>{item.mensagem}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner
          fullScreen
          message="Carregando notificações..."
          color={colors.secondary.main}
        />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Icon name={IconNames.back} size="md" color={colors.secondary.contrast} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.title}>Notificações</Text>
            </View>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Icon name={IconNames.error} size="xl" color={colors.error.main} />
          <Text style={styles.errorTitle}>Não foi possível carregar</Text>
          <Text style={styles.errorMessage}>
            Verifique a sua ligação e tente novamente.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => { setLoading(true); loadNotificacoes(); }}>
            <Icon name={IconNames.refresh} size="md" color={colors.primary.contrast} />
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name={IconNames.back} size="md" color={colors.secondary.contrast} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Notificações</Text>
            {unreadCount > 0 && (
              <Text style={styles.headerSubtitle}>
                {unreadCount} não {unreadCount === 1 ? 'lida' : 'lidas'}
              </Text>
            )}
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllAsRead}>
              <Icon name={IconNames.checkCircle} size="md" color={colors.secondary.contrast} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={notificacoes}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          notificacoes.length === 0 && styles.emptyContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadNotificacoes();
            }}
            colors={[colors.secondary.main]}
            tintColor={colors.secondary.main}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={IconNames.notifications}
            title="Sem notificações"
            message="Quando houver avisos sobre as suas viagens eles aparecerão aqui."
          />
        }
      />
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
  markAllButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },

  listContent: {
    padding: spacing.base,
    gap: spacing.sm,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    ...shadows.sm,
  },
  cardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary.main,
  },
  cardDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: 'transparent',
    marginTop: 6,
    marginRight: spacing.sm,
  },
  cardDotUnread: {
    backgroundColor: colors.secondary.main,
  },
  cardBody: { flex: 1 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  cardTitle: {
    ...textStyles.h5,
    color: colors.text.primary,
    flex: 1,
  },
  cardDate: {
    ...textStyles.caption,
    color: colors.text.secondary,
    flexShrink: 0,
  },
  cardMessage: {
    ...textStyles.body,
    color: colors.text.secondary,
    lineHeight: 20,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorTitle: { ...textStyles.h4, color: colors.text.primary, textAlign: 'center' },
  errorMessage: { ...textStyles.body, color: colors.text.secondary, textAlign: 'center', lineHeight: 22 },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  retryButtonText: { ...textStyles.button, color: colors.primary.contrast },
});

export default NotificacoesAluno;
