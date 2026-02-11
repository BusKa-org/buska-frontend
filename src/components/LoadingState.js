/**
 * LoadingState Component
 * Standardized component for showing loading, error, and empty states
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, borderRadius, textStyles } from '../theme';
import Icon, { IconNames } from './Icon';

/**
 * Loading indicator with optional message
 */
export const LoadingView = ({ 
  message = 'Carregando...', 
  size = 'large',
  color = colors.secondary.main,
  fullScreen = false,
}) => (
  <View style={[styles.container, fullScreen && styles.fullScreen]}>
    <ActivityIndicator size={size} color={color} />
    {message && <Text style={styles.message}>{message}</Text>}
  </View>
);

/**
 * Error state with retry option
 */
export const ErrorView = ({ 
  message = 'Ocorreu um erro', 
  onRetry,
  retryText = 'Tentar novamente',
  icon = IconNames.error,
}) => (
  <View style={styles.container}>
    <View style={styles.iconContainer}>
      <Icon name={icon} size="xxl" color={colors.error.main} />
    </View>
    <Text style={styles.errorTitle}>Ops!</Text>
    <Text style={styles.errorMessage}>{message}</Text>
    {onRetry && (
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Icon name={IconNames.refresh} size="sm" color={colors.text.inverse} />
        <Text style={styles.retryButtonText}>{retryText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

/**
 * Empty state with optional action
 */
export const EmptyView = ({ 
  title = 'Nenhum item encontrado',
  message,
  icon = IconNames.info,
  actionText,
  onAction,
}) => (
  <View style={styles.container}>
    <View style={[styles.iconContainer, styles.emptyIconContainer]}>
      <Icon name={icon} size="xxl" color={colors.neutral[400]} />
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    {message && <Text style={styles.emptyMessage}>{message}</Text>}
    {onAction && actionText && (
      <TouchableOpacity style={styles.actionButton} onPress={onAction}>
        <Text style={styles.actionButtonText}>{actionText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

/**
 * Combined state handler - shows loading, error, or empty based on props
 */
export const StateHandler = ({
  isLoading,
  isError,
  isEmpty,
  error,
  onRetry,
  loadingMessage,
  emptyTitle,
  emptyMessage,
  emptyIcon,
  emptyActionText,
  onEmptyAction,
  children,
}) => {
  if (isLoading) {
    return <LoadingView message={loadingMessage} fullScreen />;
  }

  if (isError) {
    return (
      <ErrorView 
        message={error?.message || 'Ocorreu um erro inesperado'} 
        onRetry={onRetry} 
      />
    );
  }

  if (isEmpty) {
    return (
      <EmptyView 
        title={emptyTitle}
        message={emptyMessage}
        icon={emptyIcon}
        actionText={emptyActionText}
        onAction={onEmptyAction}
      />
    );
  }

  return children;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background.default,
    zIndex: 100,
  },
  message: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.error.lighter,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyIconContainer: {
    backgroundColor: colors.neutral[100],
  },
  errorTitle: {
    ...textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    ...textStyles.button,
    color: colors.text.inverse,
  },
  emptyTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  actionButton: {
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  actionButtonText: {
    ...textStyles.button,
    color: colors.text.inverse,
  },
});

export default {
  LoadingView,
  ErrorView,
  EmptyView,
  StateHandler,
};
