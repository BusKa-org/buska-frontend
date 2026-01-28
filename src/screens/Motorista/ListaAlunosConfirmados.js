import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { colors, spacing, borderRadius, shadows, textStyles, fontSize, fontWeight } from '../../theme';
import Icon, { IconNames } from '../../components/Icon';

const ListaAlunosConfirmados = ({navigation, route}) => {
  const viagem = route?.params?.viagem || {};
  const [alunos, setAlunos] = useState([]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name={IconNames.back} size="md" color={colors.secondary.main} />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Alunos Confirmados</Text>
        <Text style={styles.subtitle}>
          {viagem.tipo} - {viagem.horario}
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.resumo}>
            <Text style={styles.resumoText}>
              {alunos.length} alunos confirmados
            </Text>
            <Text style={styles.resumoSubtext}>
              {alunos.filter((a) => !a.confirmadoAntes).length} confirmações
              após início
            </Text>
          </View>

          {alunos.map((aluno) => (
            <View
              key={aluno.id}
              style={[
                styles.alunoCard,
                !aluno.confirmadoAntes && styles.alunoCardNovo,
              ]}>
              <View style={styles.alunoHeader}>
                <View style={styles.alunoAvatar}>
                  {aluno.foto ? (
                    <Text style={styles.alunoFoto}>📷</Text>
                  ) : (
                    <Text style={styles.alunoInicial}>
                      {aluno.nome.charAt(0)}
                    </Text>
                  )}
                </View>
                <View style={styles.alunoInfo}>
                  <View style={styles.alunoNomeContainer}>
                    <Text style={styles.alunoNome}>{aluno.nome}</Text>
                    {!aluno.confirmadoAntes && (
                      <View style={styles.novoBadge}>
                        <Text style={styles.novoBadgeText}>NOVO</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.pontoContainer}>
                    <Icon name={IconNames.location} size="sm" color={colors.text.secondary} />
                    <Text style={styles.pontoEmbarque}>
                      {aluno.pontoEmbarque}
                    </Text>
                  </View>
                </View>
                <View style={styles.confirmadoIcon}>
                  <Icon name={IconNames.checkCircle} size="md" color={colors.text.inverse} />
                </View>
              </View>
            </View>
          ))}

          {alunos.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Nenhum aluno confirmado ainda
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.base,
  },
  resumo: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  resumoText: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  resumoSubtext: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  alunoCard: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  alunoCardNovo: {
    borderColor: colors.secondary.main,
    borderWidth: 2,
    backgroundColor: colors.info.light,
  },
  alunoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alunoAvatar: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  alunoFoto: {
    fontSize: fontSize.h3,
  },
  alunoInicial: {
    ...textStyles.h3,
    fontWeight: fontWeight.bold,
    color: colors.text.inverse,
  },
  alunoInfo: {
    flex: 1,
  },
  alunoNomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  alunoNome: {
    ...textStyles.body,
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
  },
  novoBadge: {
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
  },
  novoBadgeText: {
    ...textStyles.caption,
    color: colors.text.inverse,
    fontWeight: fontWeight.bold,
  },
  pontoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pontoEmbarque: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  confirmadoIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  emptyStateText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
});

export default ListaAlunosConfirmados;


