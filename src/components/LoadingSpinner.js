/**
 * LoadingSpinner Component
 * 
 * Accessible loading indicator with optional message
 */
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing, textStyles } from '../theme';

const LoadingSpinner = ({
  size = 'large',
  color = colors.primary.main,
  message,
  fullScreen = false,
  accessibilityLabel = 'Carregando',
}) => {
  const content = (
    <View 
      style={[styles.container, fullScreen && styles.fullScreen]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ busy: true }}
    >
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text style={styles.message} accessibilityLiveRegion="polite">
          {message}
        </Text>
      )}
    </View>
  );

  return content;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  message: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

export default LoadingSpinner;
