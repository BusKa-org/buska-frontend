import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
// Importação seguindo o Usage Guide
import { 
  colors, 
  spacing, 
  borderRadius, 
  shadows, 
  textStyles,
  getCardStyle // Helper para o container da logo
} from '../theme';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      {/* Usando a cor de fundo padrão do sistema */}
      <StatusBar backgroundColor={colors.background.default} barStyle="dark-content" />
      
      <View style={styles.content}>
        {/* Logo Container usando o helper de Card Elevado */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>BusKá</Text>
        </View>
        
        {/* Texto usando a tipografia H4 do sistema */}
        <Text style={styles.tagline}>Gestão Municipal de Transporte Escolar</Text>
      </View>
      
      <View style={styles.loaderContainer}>
        {/* Usando a cor secundária (Electric Teal) para o feedback de tech */}
        <ActivityIndicator size="large" color={colors.secondary.main} />
        <Text style={styles.loadingText}>Sincronizando dados...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default, // Neutro 50
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.huge, // 48px
  },
  content: {
    alignItems: 'center',
    marginTop: spacing.massive, // 64px
  },
  logoContainer: {
    // Aplicando estilo de card elevado conforme o helper do index.js
    ...getCardStyle('elevated'),
    backgroundColor: colors.primary.main, // Deep Navy
    width: 140,
    height: 140,
    borderRadius: borderRadius.xl, // 16px
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    // Estilo Display 2 para impacto visual
    ...textStyles.display2,
    color: colors.primary.contrast, // Branco
  },
  tagline: {
    ...textStyles.h4,
    color: colors.text.secondary, // Gray 500
    marginTop: spacing.xl, // 24px
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  loaderContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl, // 32px
  },
  loadingText: {
    ...textStyles.caption,
    color: colors.text.hint, // Placeholder Gray
    marginTop: spacing.sm, // 8px
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default SplashScreen;