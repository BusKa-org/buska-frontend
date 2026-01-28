import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { colors, spacing, borderRadius, shadows, textStyles } from '../theme';
import Icon, { IconNames } from '../components/Icon';

const SelecaoFluxo = ({navigation}) => {
  const userTypes = [
    {
      id: 'aluno',
      label: 'Aluno',
      description: 'Confirme sua presença e acompanhe sua rota',
      icon: IconNames.person,
      color: colors.roles.aluno,
      bgColor: colors.secondary.lighter,
      route: 'AlunoNavigator',
      disabled: false,
    },
    {
      id: 'motorista',
      label: 'Motorista',
      description: 'Gerencie suas rotas e viagens',
      icon: IconNames.bus,
      color: colors.roles.motorista,
      bgColor: colors.neutral[100],
      route: 'MotoristaNavigator',
      disabled: false,
    },
    {
      id: 'gestor',
      label: 'Gestor',
      description: 'Acompanhe relatórios e estatísticas',
      icon: IconNames.badge,
      color: colors.roles.gestor,
      bgColor: colors.accent.light,
      route: 'GestorNavigator',
      disabled: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.brandName}>BusKá</Text>
          <Text style={styles.title}>Transporte Escolar</Text>
          <Text style={styles.subtitle}>Gestão Municipal</Text>
          <Text style={styles.description}>
            Selecione o tipo de usuário para acessar o sistema
          </Text>
        </View>

        <View style={styles.fluxosContainer}>
          {userTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.fluxoCard,
                type.disabled && styles.fluxoCardDisabled,
              ]}
              onPress={() => !type.disabled && navigation.navigate(type.route)}
              disabled={type.disabled}>
              <View style={[styles.iconContainer, { backgroundColor: type.bgColor }]}>
                <Icon name={type.icon} size="xxl" color={type.color} />
              </View>
              <View style={styles.fluxoTextContainer}>
                <Text style={styles.fluxoTitle}>{type.label}</Text>
                <Text style={styles.fluxoDescription}>{type.description}</Text>
                {type.disabled && (
                  <View style={styles.comingSoonBadge}>
                    <Icon name={IconNames.schedule} size="xs" color={colors.text.hint} />
                    <Text style={styles.comingSoon}>Em breve</Text>
                  </View>
                )}
              </View>
              {!type.disabled && (
                <Icon name={IconNames.chevronRight} size="lg" color={colors.neutral[400]} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  brandName: {
    ...textStyles.display2,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  title: {
    ...textStyles.h2,
    color: colors.secondary.main,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  description: {
    ...textStyles.bodySmall,
    color: colors.text.hint,
    textAlign: 'center',
  },
  fluxosContainer: {
    gap: spacing.base,
  },
  fluxoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
  },
  fluxoCardDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.base,
  },
  fluxoTextContainer: {
    flex: 1,
  },
  fluxoTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  fluxoDescription: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginTop: spacing.sm,
  },
  comingSoon: {
    ...textStyles.caption,
    color: colors.text.hint,
    fontStyle: 'italic',
  },
});

export default SelecaoFluxo;
