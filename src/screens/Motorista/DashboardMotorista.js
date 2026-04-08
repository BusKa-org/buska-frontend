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
import { useAuth } from '../../contexts/AuthContext';
import {motoristaService} from '../../services/motoristaService';
import pontoService from '../../services/pontoService';
import { colors, spacing, borderRadius, shadows, textStyles, fontSize, fontWeight } from '../../theme';
import { Icon, IconNames, LoadingSpinner } from '../../components';
import { unwrapItems } from '../../types';

const DashboardMotorista = ({navigation}) => {
  const { user } = useAuth();

  const getRoleLabel = (role) => {
    const roleMap = {
      'aluno': 'Aluno',
      'motorista': 'Motorista',
      'gestor': 'Gestor'
    };
    return roleMap[role] || role;
  };

  const getUserInfo = () => {
    const roleLabel = getRoleLabel(user?.role);
    const municipioInfo = user?.municipio 
      ? `${user.municipio.nome}${user.municipio.uf ? ` - ${user.municipio.uf}` : ''}`
      : '';
    return municipioInfo ? `${roleLabel} • ${municipioInfo}` : roleLabel;
  };

  const [proximaViagem, setProximaViagem] = useState(null);
  const [loadingViagem, setLoadingViagem] = useState(true);
  const [alunosInfo, setAlunosInfo] = useState({
    totalAlunos: 0,
    alunosConfirmados: 0,
  });
  // loadingAlunos removed - data comes from viagem object directly

  useEffect(() => {
    const loadProximaViagem = async () => {
      try {
        const viagens = await motoristaService.listarViagens().then(unwrapItems);
        
        if (viagens && viagens.length > 0) {
          const now = new Date();
          now.setHours(0, 0, 0, 0);

          const viagensFuturas = viagens
            .filter((v) => {
              // Exclude finished and cancelled trips
              if (v.status === 'FINALIZADA' || v.status === 'CANCELADA') {
                return false;
              }
              
              const viagemDateStr = v.data.split('T')[0];
              const [year, month, day] = viagemDateStr.split('-').map(Number);
              const viagemDate = new Date(year, month - 1, day);
              
              if (v.horario_fim) {
                const horarioFimStr = v.horario_fim.includes('T') 
                  ? v.horario_fim.substring(11, 16) 
                  : v.horario_fim.substring(0, 5);
                const [horasFim, minutosFim] = horarioFimStr.split(':').map(Number);
                const fimViagem = new Date(year, month - 1, day, horasFim, minutosFim);
                
                if (fimViagem < new Date()) {
                  return false;
                }
              }
              
              return viagemDate >= now;
            })
            .sort((a, b) => {
              const horarioA = a.horario_inicio || '00:00';
              const horarioB = b.horario_inicio || '00:00';
              const dateA = new Date(`${a.data}T${horarioA}`);
              const dateB = new Date(`${b.data}T${horarioB}`);
              return dateA - dateB;
            });

          if (viagensFuturas.length > 0) {
            const proxima = viagensFuturas[0];
            const pontos = await pontoService.getPontosByRota(proxima.rota_id).then(unwrapItems);
            proxima.pontos = pontos;
            
            let origem = 'N/A';
            let destino = 'N/A';
            
            try {
              const pontos = await motoristaService.listarPontosRota(proxima.rota_id).then(unwrapItems);
              if (pontos && pontos.length > 0) {
                origem = pontos[0].nome || 'N/A';
                if (pontos.length > 1) {
                  destino = pontos[pontos.length - 1].nome || 'N/A';
                } else {
                  destino = origem;
                }
              }
            } catch (e) {
              // Silent fail - use default values
            }
            
            let horarioFormatado = '--:--';
            if (proxima.horario_inicio) {
              if (proxima.horario_inicio.includes('T')) {
                horarioFormatado = proxima.horario_inicio.substring(11, 16);
              } else if (proxima.horario_inicio.includes(':')) {
                horarioFormatado = proxima.horario_inicio.substring(0, 5);
              }
            }
            
            // Map backend status to display status
            const statusMap = {
              'AGENDADA': 'A iniciar',
              'EM_ANDAMENTO': 'Em andamento',
              'FINALIZADA': 'Finalizada',
              'CANCELADA': 'Cancelada',
            };
            
            setProximaViagem({
              ...proxima, // Keep all original data including 'alunos' array
              horario: horarioFormatado,
              status: statusMap[proxima.status] || 'A iniciar',
              origem: proxima.origem || origem,
              destino: proxima.destino || destino,
            });
          } else {
            setProximaViagem(null);
          }
        } else {
          setProximaViagem(null);
        }
      } catch (error) {
        setProximaViagem(null);
      } finally {
        setLoadingViagem(false);
      }
    };

    loadProximaViagem();
  }, []);

  // Atualizar informações de alunos a partir da próxima viagem
  useEffect(() => {
    if (!proximaViagem) {
      setAlunosInfo({
        totalAlunos: 0,
        alunosConfirmados: 0,
      });
      return;
    }
    
    // Use data directly from the viagem object (from /viagens/minhas endpoint)
    setAlunosInfo({
      totalAlunos: proximaViagem.total_alunos || 0,
      alunosConfirmados: proximaViagem.alunos_confirmados_count || 0,
    });
  }, [proximaViagem]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00'); // Adiciona hora para evitar problemas de timezone
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    date.setHours(0, 0, 0, 0);
    
    if (date.getTime() === today.getTime()) {
      return 'Hoje';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Amanhã';
    } else {
      const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      const weekday = weekdays[date.getDay()];
      const day = date.getDate();
      const month = months[date.getMonth()];
      return `${weekday}, ${day} de ${month}`;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>
                Olá, {user?.nome || 'Motorista'}!
              </Text>
              <Text style={styles.subtitle}>
                {getUserInfo()}
              </Text>
            </View>
            <View style={styles.avatarContainer}>
              <Icon name={IconNames.person} size="xl" color={colors.primary.contrast} />
            </View>
          </View>
        </View>

        {/* Próxima Viagem */}
        <View style={styles.proximaViagemCard}>
          <View style={styles.cardHeader}>
            <Icon name={IconNames.schedule} size="md" color={colors.primary.dark} />
            <Text style={styles.cardTitle}>Próxima Viagem</Text>
          </View>
          {loadingViagem ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary.dark} />
            </View>
          ) : proximaViagem ? (
            <>
              <View style={styles.viagemInfo}>
                <View style={styles.viagemHeader}>
                  <Text style={styles.viagemHorario}>{proximaViagem.horario}</Text>
                  <View style={[
                    styles.statusBadge,
                    proximaViagem.status === 'Em andamento' 
                      ? styles.statusEmAndamento 
                      : styles.statusAIniciar
                  ]}>
                    <Icon 
                      name={proximaViagem.status === 'Em andamento' ? IconNames.route : IconNames.schedule} 
                      size="xs" 
                      color={colors.text.inverse} 
                    />
                    <Text style={styles.statusText}>{proximaViagem.status}</Text>
                  </View>
                </View>
                
                {proximaViagem.data && (
                  <Text style={styles.viagemData}>
                    {formatDate(proximaViagem.data)} • {proximaViagem.tipo}
                  </Text>
                )}

                <View style={styles.rotaInfo}>
                  <View style={styles.pontoRota}>
                    <Icon name={IconNames.location} size="sm" color={colors.success.main} />
                    <Text style={styles.pontoNome}>{proximaViagem.origem || 'Origem'}</Text>
                  </View>
                  <View style={styles.linhaRota} />
                  <View style={styles.pontoRota}>
                    <Icon name={IconNames.location} size="sm" color={colors.error.main} />
                    <Text style={styles.pontoNome}>{proximaViagem.destino || 'Destino'}</Text>
                  </View>
                </View>
              </View>

              {/* Informações de Alunos */}
              <View style={styles.alunosInfo}>
                <View style={styles.alunosHeader}>
                  <Icon name={IconNames.group} size="sm" color={colors.primary.dark} />
                  <Text style={styles.alunosText}>
                    {alunosInfo.alunosConfirmados} de {alunosInfo.totalAlunos} alunos confirmados
                  </Text>
                </View>
                {alunosInfo.totalAlunos > 0 ? (
                  <View style={styles.alunosBar}>
                    <View
                      style={[
                        styles.alunosBarFill,
                        {
                          width: `${(alunosInfo.alunosConfirmados / alunosInfo.totalAlunos) * 100}%`,
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

              {/* Botões de Ação */}
              <View style={styles.acoesContainer}>
                <TouchableOpacity
                  style={styles.verDetalhesButton}
                  onPress={() =>
                    navigation.navigate('DetalheViagemMotorista', {
                      viagem: proximaViagem,
                    })
                  }>
                  <Text style={styles.verDetalhesButtonText}>Ver Detalhes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iniciarButton}
                  onPress={() =>
                    navigation.navigate('InicioFimViagem', {viagem: proximaViagem})
                  }>
                  <Icon name={IconNames.route} size="md" color={colors.text.inverse} />
                  <Text style={styles.iniciarButtonText}>Iniciar Viagem</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Icon name={IconNames.route} size="xxl" color={colors.neutral[300]} />
              <Text style={styles.emptyText}>Nenhuma viagem agendada</Text>
              <Text style={styles.emptySubtext}>Aguarde o gestor atribuir viagens para você</Text>
            </View>
          )}
        </View>

        {/* Botões Rápidos */}
        <View style={styles.botoesRapidos}>
          <View style={styles.botoesRow}>
            <TouchableOpacity
              style={styles.botaoRapido}
              onPress={() => navigation.navigate('RotaMotorista')}>
              <View style={styles.botaoIconContainer}>
                <Icon name={IconNames.bus} size="lg" color={colors.primary.dark} />
              </View>
              <Text style={styles.botaoRapidoText}>Minhas Rotas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoRapido}
              onPress={() => navigation.navigate('ListaViagens')}>
              <View style={styles.botaoIconContainer}>
                <Icon name={IconNames.route} size="lg" color={colors.primary.dark} />
              </View>
              <Text style={styles.botaoRapidoText}>Minhas Viagens</Text>
            </TouchableOpacity>
          </View>

          {/* Gestor-only buttons */}
          {user?.role?.toLowerCase() === 'gestor' && (
            <View style={styles.botoesRow}>
              <TouchableOpacity
                style={styles.botaoRapido}
                onPress={() => navigation.navigate('CriarRota')}>
                <View style={[styles.botaoIconContainer, { backgroundColor: colors.success.lighter }]}>
                  <Icon name={IconNames.add} size="lg" color={colors.success.main} />
                </View>
                <Text style={styles.botaoRapidoText}>Criar Rota</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoRapido}
                onPress={() => navigation.navigate('CriarViagem')}>
                <View style={[styles.botaoIconContainer, { backgroundColor: colors.success.lighter }]}>
                  <Icon name={IconNames.route} size="lg" color={colors.success.main} />
                </View>
                <Text style={styles.botaoRapidoText}>Criar Viagem</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.botoesRow}>
            

            <TouchableOpacity
              style={styles.botaoRapido}
              onPress={() => navigation.navigate('ConfigNotificacoesMotorista')}>
              <View style={styles.botaoIconContainer}>
                <Icon name={IconNames.settings} size="lg" color={colors.primary.dark} />
              </View>
              <Text style={styles.botaoRapidoText}>Configurações</Text>
            </TouchableOpacity>
          </View>
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
  scrollView: {
    flex: 1,
  },
  
  // Header - Styled like DashboardAluno
  header: {
    backgroundColor: colors.primary.dark,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    ...textStyles.h2,
    color: colors.primary.contrast,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...textStyles.bodySmall,
    color: 'rgba(255,255,255,0.75)',
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Próxima Viagem Card - Overlaps header
  proximaViagemCard: {
    margin: spacing.base,
    marginTop: -spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.primary.lighter,
    borderRadius: borderRadius.xl,
    ...shadows.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...textStyles.caption,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loadingContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  viagemInfo: {
    marginBottom: spacing.base,
  },
  viagemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  viagemHorario: {
    ...textStyles.display2,
    color: colors.text.primary,
  },
  viagemData: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statusAIniciar: {
    backgroundColor: colors.warning.main,
  },
  statusEmAndamento: {
    backgroundColor: colors.success.main,
  },
  statusText: {
    ...textStyles.caption,
    color: colors.text.inverse,
    fontWeight: fontWeight.semiBold,
  },
  rotaInfo: {
    marginTop: spacing.md,
  },
  pontoRota: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pontoNome: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
  },
  linhaRota: {
    width: 2,
    height: spacing.base,
    backgroundColor: colors.neutral[300],
    marginLeft: spacing.sm,
    opacity: 0.5,
  },
  
  // Alunos Info
  alunosInfo: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
  },
  alunosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  alunosText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
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
  emptyAlunosText: {
    ...textStyles.caption,
    color: colors.text.hint,
    fontStyle: 'italic',
  },
  
  // Action Buttons
  acoesContainer: {
    gap: spacing.sm,
  },
  verDetalhesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  verDetalhesButtonText: {
    ...textStyles.button,
    color: colors.primary.dark,
  },
  iniciarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.success.main,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    ...shadows.sm,
  },
  iniciarButtonText: {
    ...textStyles.button,
    color: colors.text.inverse,
    fontSize: fontSize.h4,
    fontWeight: fontWeight.bold,
  },
  
  // Empty State
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...textStyles.h4,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...textStyles.bodySmall,
    color: colors.text.hint,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  // Botões Rápidos
  botoesRapidos: {
    paddingHorizontal: spacing.base,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  botoesRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  botaoRapido: {
    flex: 1,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    alignItems: 'center',
    ...shadows.sm,
  },
  botaoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.lighter,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  botaoRapidoText: {
    ...textStyles.caption,
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
  acessoRapido: {
    padding: spacing.base,
  },
  sectionTitle: {
    ...textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  rapidoCard: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.xs,
  },
  rapidoIcon: {
    fontSize: fontSize.h3,
    marginRight: spacing.md,
  },
  rapidoText: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
});

export default DashboardMotorista;

