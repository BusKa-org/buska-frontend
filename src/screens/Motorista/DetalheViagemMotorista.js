import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {motoristaService} from '../../services/motoristaService';
import { colors, spacing, borderRadius, shadows, textStyles, fontSize, fontWeight } from '../../theme';
import Icon, { IconNames } from '../../components/Icon';

const DetalheViagemMotorista = ({navigation, route}) => {
  const {viagem} = route?.params || {};

  if (!viagem) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name={IconNames.back} size="md" color={colors.secondary.main} />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Detalhes da Viagem</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.emptyText}>Dados da viagem não disponíveis</Text>
        </View>
      </SafeAreaView>
    );
  }

  const [situacaoViagem, setSituacaoViagem] = useState(viagem.status);
  const [pontosRota, setPontosRota] = useState([]);
  // Use data directly from viagem object (from /viagens/minhas response)
  const alunosInfo = {
    totalAlunos: viagem.total_alunos || 0,
    alunosConfirmados: viagem.alunos_confirmados_count || 0,
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

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'A iniciar':
        return colors.warning.light;
      case 'Em andamento':
        return colors.info.light;
      case 'Finalizada':
        return colors.success.light;
      default:
        return colors.background.default;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Detalhes da Viagem</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Informações Principais */}
          <View style={styles.card}>
            <View style={styles.viagemHeader}>
              <View>
                <Text style={styles.viagemTipo}>{viagem.tipo}</Text>
                <Text style={styles.viagemHorario}>{viagem.horario}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {backgroundColor: getStatusBgColor(situacaoViagem)},
                ]}>
                <Text
                  style={[
                    styles.statusText,
                    {color: getStatusColor(situacaoViagem)},
                  ]}>
                  {situacaoViagem}
                </Text>
              </View>
            </View>

            <View style={styles.rotaInfo}>
              <View style={styles.pontoRota}>
                <View style={styles.pontoIcon}>
                  <Icon name={IconNames.location} size="md" color={colors.secondary.main} />
                </View>
                <View style={styles.pontoInfo}>
                  <Text style={styles.pontoLabel}>Origem</Text>
                  <Text style={styles.pontoNome}>{viagem.origem}</Text>
                </View>
              </View>

              <View style={styles.linhaRota} />

              <View style={styles.pontoRota}>
                <View style={styles.pontoIcon}>
                  <Icon name={IconNames.location} size="md" color={colors.accent.main} />
                </View>
                <View style={styles.pontoInfo}>
                  <Text style={styles.pontoLabel}>Destino</Text>
                  <Text style={styles.pontoNome}>{viagem.destino}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Informações de Alunos */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Alunos Confirmados</Text>
            <View style={styles.alunosInfo}>
              <Text style={styles.alunosText}>
                {alunosInfo.alunosConfirmados} de {alunosInfo.totalAlunos} alunos
                confirmados
              </Text>
              {alunosInfo.totalAlunos > 0 ? (
                <View style={styles.alunosBar}>
                  <View
                    style={[
                      styles.alunosBarFill,
                      {
                        width: `${
                          (alunosInfo.alunosConfirmados / alunosInfo.totalAlunos) * 100
                        }%`,
                      },
                    ]}
                  />
                </View>
              ) : (
                <Text style={styles.emptyAlunosText}>
                  Nenhum aluno inscrito nesta rota
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.verAlunosButton}
              onPress={() =>
                navigation.navigate('ListaAlunosConfirmados', {viagem})
              }>
              <Text style={styles.verAlunosButtonText}>
                Ver Lista Completa de Alunos
              </Text>
            </TouchableOpacity>
          </View>

          {/* Pontos da Rota */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pontos da Rota</Text>
            {pontosRota.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum ponto cadastrado</Text>
            ) : (
              pontosRota.map((ponto, index) => (
              <View key={ponto.id} style={styles.pontoItem}>
                <View style={styles.pontoItemLeft}>
                  <View
                    style={[
                      styles.pontoItemIcon,
                      ponto.tipo === 'origem' && styles.pontoItemIconOrigem,
                      ponto.tipo === 'destino' && styles.pontoItemIconDestino,
                    ]}>
                    <Icon 
                      name={ponto.tipo === 'origem' 
                        ? IconNames.location 
                        : ponto.tipo === 'destino'
                        ? IconNames.location
                        : IconNames.location} 
                      size="sm" 
                      color={ponto.tipo === 'origem' 
                        ? colors.secondary.main 
                        : ponto.tipo === 'destino'
                        ? colors.accent.main
                        : colors.text.secondary} 
                    />
                  </View>
                  {index < pontosRota.length - 1 && (
                    <View style={styles.pontoItemLine} />
                  )}
                </View>
                <View style={styles.pontoItemRight}>
                  <Text style={styles.pontoItemNome}>{ponto.nome}</Text>
                  <Text style={styles.pontoItemTipo}>
                    {ponto.tipo === 'origem'
                      ? 'Origem'
                      : ponto.tipo === 'destino'
                      ? 'Destino'
                      : 'Parada'}
                    {ponto.alunos > 0 && ` • ${ponto.alunos} aluno(s)`}
                  </Text>
                </View>
              </View>
              ))
            )}
          </View>

          {/* Mapa Simplificado */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Mapa da Rota</Text>
            <View style={styles.mapaPlaceholder}>
              <Icon name={IconNames.map} size="xl" color={colors.text.secondary} />
              <Text style={styles.mapaPlaceholderLabel}>
                Mapa com pontos da rota
              </Text>
              <Text style={styles.mapaPlaceholderSubtext}>
                (Em implementação)
              </Text>
            </View>
          </View>

          {/* Configurações da Rota */}
          {situacaoViagem === 'A iniciar' && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Configurações da Rota</Text>
              <TouchableOpacity
                style={styles.definirPontosButton}
                onPress={() =>
                  navigation.navigate('DefinirPontosRota', {
                    viagem,
                    rota: viagem?.rota_id ? {id: viagem.rota_id} : null,
                    isNovaRota: false,
                  })
                }>
                <Icon name={IconNames.location} size="sm" color={colors.text.inverse} />
                <Text style={styles.definirPontosButtonText}>
                  Definir Pontos da Rota
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Ações */}
          {situacaoViagem === 'A iniciar' && (
            <TouchableOpacity
              style={styles.iniciarButton}
              onPress={() =>
                navigation.navigate('InicioFimViagem', {viagem})
              }>
              <Text style={styles.iniciarButtonText}>Iniciar Viagem</Text>
            </TouchableOpacity>
          )}

          {situacaoViagem === 'Em andamento' && (
            <TouchableOpacity
              style={styles.verRotaOtimizadaButton}
              onPress={() =>
                navigation.navigate('RotaOtimizada', {viagem})
              }>
              <Text style={styles.verRotaOtimizadaButtonText}>
                Ver Rota Otimizada
              </Text>
            </TouchableOpacity>
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
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.base,
  },
  card: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  cardTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.base,
  },
  viagemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  viagemTipo: {
    ...textStyles.body,
    color: colors.secondary.main,
    fontWeight: fontWeight.semiBold,
    marginBottom: spacing.xs,
  },
  viagemHorario: {
    ...textStyles.h1,
    color: colors.text.primary,
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
    marginTop: spacing.sm,
  },
  pontoRota: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pontoIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.default,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  pontoInfo: {
    flex: 1,
  },
  pontoLabel: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xxs,
  },
  pontoNome: {
    ...textStyles.body,
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
  },
  linhaRota: {
    width: 2,
    height: spacing.lg,
    backgroundColor: colors.border.light,
    marginLeft: spacing.lg,
    marginBottom: spacing.md,
  },
  alunosInfo: {
    marginBottom: spacing.base,
  },
  alunosText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  alunosBar: {
    height: spacing.sm,
    backgroundColor: colors.border.light,
    borderRadius: borderRadius.xs,
    overflow: 'hidden',
  },
  alunosBarFill: {
    height: '100%',
    backgroundColor: colors.success.main,
    borderRadius: borderRadius.xs,
  },
  verAlunosButton: {
    backgroundColor: colors.secondary.main,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    ...shadows.xs,
  },
  verAlunosButtonText: {
    ...textStyles.buttonSmall,
    color: colors.text.inverse,
  },
  pontoItem: {
    flexDirection: 'row',
    marginBottom: spacing.base,
  },
  pontoItemLeft: {
    width: 40,
    alignItems: 'center',
    marginRight: spacing.md,
  },
  pontoItemIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pontoItemIconOrigem: {
    backgroundColor: colors.info.light,
  },
  pontoItemIconDestino: {
    backgroundColor: colors.success.light,
  },
  pontoItemLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border.light,
    marginTop: spacing.xs,
  },
  pontoItemRight: {
    flex: 1,
  },
  pontoItemNome: {
    ...textStyles.body,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  pontoItemTipo: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  mapaPlaceholder: {
    height: 200,
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
    gap: spacing.sm,
  },
  mapaPlaceholderLabel: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  mapaPlaceholderSubtext: {
    ...textStyles.caption,
    color: colors.text.hint,
  },
  iniciarButton: {
    backgroundColor: colors.success.main,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    alignItems: 'center',
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  iniciarButtonText: {
    ...textStyles.button,
    color: colors.text.inverse,
  },
  verRotaOtimizadaButton: {
    backgroundColor: colors.secondary.main,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    alignItems: 'center',
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  verRotaOtimizadaButtonText: {
    ...textStyles.button,
    color: colors.text.inverse,
  },
  definirPontosButton: {
    backgroundColor: colors.secondary.main,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    ...shadows.xs,
  },
  definirPontosButtonText: {
    ...textStyles.button,
    color: colors.text.inverse,
  },
  emptyText: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  loadingContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyAlunosText: {
    ...textStyles.bodySmall,
    color: colors.text.hint,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
});

export default DetalheViagemMotorista;

