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
import { colors, spacing, borderRadius, shadows, textStyles, fontSize, fontWeight } from '../../theme';
import Icon, { IconNames } from '../../components/Icon';

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
  const [loadingAlunos, setLoadingAlunos] = useState(false);

  useEffect(() => {
    const loadProximaViagem = async () => {
      try {
        const viagens = await motoristaService.listarViagens();
        
        if (viagens && viagens.length > 0) {
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          
          const viagensFuturas = viagens
            .filter((v) => {
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
            
            let origem = 'N/A';
            let destino = 'N/A';
            
            try {
              const pontos = await motoristaService.listarPontosRota(proxima.rota_id);
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
            
            setProximaViagem({
              id: proxima.id,
              tipo: proxima.tipo,
              data: proxima.data,
              horario: horarioFormatado,
              rota_id: proxima.rota_id,
              status: proxima.horario_fim ? 'Finalizada' : 'A iniciar',
              origem: origem,
              destino: destino,
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

  // Buscar informações de alunos quando a próxima viagem for definida
  useEffect(() => {
    const loadAlunosInfo = async () => {
      if (!proximaViagem?.id) {
        setAlunosInfo({
          totalAlunos: 0,
          alunosConfirmados: 0,
        });
        return;
      }
      
      try {
        setLoadingAlunos(true);
        const alunosData = await motoristaService.listarAlunosViagem(proximaViagem.id);
        
        if (alunosData && typeof alunosData === 'object') {
          const totalAlunos = alunosData.total_alunos !== undefined ? alunosData.total_alunos : 0;
          const alunosConfirmados = alunosData.alunos_confirmados !== undefined ? alunosData.alunos_confirmados : 0;
          
          setAlunosInfo({
            totalAlunos: totalAlunos,
            alunosConfirmados: alunosConfirmados,
          });
        } else {
          setAlunosInfo({
            totalAlunos: 0,
            alunosConfirmados: 0,
          });
        }
      } catch (error) {
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
        // Em caso de erro, manter valores anteriores ou definir como 0
        setAlunosInfo({
          totalAlunos: 0,
          alunosConfirmados: 0,
        });
      } finally {
        setLoadingAlunos(false);
      }
    };

    loadAlunosInfo();
  }, [proximaViagem?.id]);

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
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>
              Olá, {user?.nome || 'Motorista'}!
            </Text>
            <Icon name={IconNames.person} size="md" color={colors.primary.main} />
          </View>
          <Text style={styles.subtitle}>
            {getUserInfo()}
          </Text>
        </View>

        {/* Próxima Viagem */}
        <View style={styles.proximaViagemCard}>
          <Text style={styles.cardTitle}>Próxima Viagem</Text>
          {loadingViagem ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.secondary.main} />
            </View>
          ) : proximaViagem ? (
            <>
              {proximaViagem.data && (
                <Text style={styles.viagemData}>
                  {formatDate(proximaViagem.data)}
                </Text>
              )}
              <View style={styles.viagemInfo}>
                <View style={styles.viagemHeader}>
                  <View>
                    <Text style={styles.viagemTipo}>{proximaViagem.tipo}</Text>
                    <Text style={styles.viagemHorario}>{proximaViagem.horario}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{proximaViagem.status}</Text>
                  </View>
                </View>

                <View style={styles.rotaInfo}>
                  <View style={styles.pontoRota}>
                    <Icon name={IconNames.location} size="md" color={colors.secondary.main} />
                    <Text style={styles.pontoNome}>{proximaViagem.origem || 'N/A'}</Text>
                  </View>
                  <View style={styles.linhaRota} />
                  <View style={styles.pontoRota}>
                    <Icon name={IconNames.location} size="md" color={colors.accent.main} />
                    <Text style={styles.pontoNome}>{proximaViagem.destino || 'N/A'}</Text>
                  </View>
                </View>
              </View>

              {/* Informações de Alunos */}
              <View style={styles.alunosInfo}>
                {loadingAlunos ? (
                  <View style={styles.loadingAlunosContainer}>
                    <ActivityIndicator size="small" color={colors.secondary.main} />
                  </View>
                ) : (
                  <>
                    <Text style={styles.alunosText}>
                      {alunosInfo.alunosConfirmados} de {alunosInfo.totalAlunos} alunos confirmados
                    </Text>
                    {alunosInfo.totalAlunos > 0 ? (
                      <View style={styles.alunosBar}>
                        <View
                          style={[
                            styles.alunosBarFill,
                            {
                              width: `${
                                alunosInfo.totalAlunos > 0
                                  ? (alunosInfo.alunosConfirmados / alunosInfo.totalAlunos) * 100
                                  : 0
                              }%`,
                            },
                          ]}
                        />
                      </View>
                    ) : alunosInfo.totalAlunos === 0 && alunosInfo.alunosConfirmados === 0 ? (
                      <Text style={styles.emptyAlunosText}>
                        Nenhum aluno inscrito nesta rota
                      </Text>
                    ) : null}
                  </>
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
                  <Text style={styles.iniciarButtonText}>Iniciar Viagem</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhuma viagem agendada</Text>
            </View>
          )}
        </View>

        {/* Botões Rápidos */}
        <View style={styles.botoesRapidos}>
          <View style={styles.botoesRow}>
            <TouchableOpacity
              style={styles.botaoRapido}
              onPress={() => navigation.navigate('RotaMotorista')}>
              <Icon name={IconNames.bus} size="xl" color={colors.secondary.main} />
              <Text style={styles.botaoRapidoText}>Minhas Rotas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoRapido}
              onPress={() => navigation.navigate('CriarRota')}>
              <Icon name={IconNames.add} size="xl" color={colors.secondary.main} />
              <Text style={styles.botaoRapidoText}>Criar Rota</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.botoesRow}>
            <TouchableOpacity
              style={styles.botaoRapido}
              onPress={() => navigation.navigate('CriarViagem')}>
              <Icon name={IconNames.route} size="xl" color={colors.secondary.main} />
              <Text style={styles.botaoRapidoText}>Criar Viagem</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoRapido}
              onPress={() => navigation.navigate('ChatGestor')}>
              <Icon name={IconNames.chat} size="xl" color={colors.secondary.main} />
              <Text style={styles.botaoRapidoText}>Chat Gestor</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.botoesRow}>
            <TouchableOpacity
              style={styles.botaoRapido}
              onPress={() => navigation.navigate('ConfigNotificacoesMotorista')}>
              <Icon name={IconNames.settings} size="xl" color={colors.secondary.main} />
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
  header: {
    padding: spacing.xl,
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    ...shadows.sm,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  greeting: {
    ...textStyles.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  proximaViagemCard: {
    margin: spacing.base,
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  cardTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  viagemData: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    fontWeight: fontWeight.medium,
    textTransform: 'capitalize',
  },
  loadingContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  viagemInfo: {
    marginBottom: spacing.lg,
  },
  viagemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.base,
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
    backgroundColor: colors.warning.light,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statusText: {
    color: colors.warning.main,
    ...textStyles.caption,
    fontWeight: fontWeight.semiBold,
  },
  rotaInfo: {
    marginBottom: spacing.base,
  },
  rotaIdText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  pontoRota: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  pontoNome: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
  },
  linhaRota: {
    width: 2,
    height: spacing.lg,
    backgroundColor: colors.border.light,
    marginLeft: spacing.md,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  alunosInfo: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
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
    marginBottom: spacing.sm,
  },
  alunosBarFill: {
    height: '100%',
    backgroundColor: colors.success.main,
    borderRadius: borderRadius.xs,
  },
  loadingAlunosContainer: {
    padding: spacing.md,
    alignItems: 'center',
  },
  emptyAlunosText: {
    ...textStyles.bodySmall,
    color: colors.text.hint,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  acoesContainer: {
    gap: spacing.md,
  },
  verDetalhesButton: {
    backgroundColor: colors.secondary.main,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.xs,
  },
  verDetalhesButtonText: {
    ...textStyles.button,
    color: colors.text.inverse,
  },
  iniciarButton: {
    backgroundColor: colors.success.main,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    alignItems: 'center',
    marginTop: spacing.xs,
    ...shadows.sm,
  },
  iniciarButtonText: {
    ...textStyles.button,
    color: colors.text.inverse,
    fontSize: fontSize.h4,
    fontWeight: fontWeight.bold,
  },
  botoesRapidos: {
    paddingHorizontal: spacing.base,
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
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    minHeight: 100,
    justifyContent: 'center',
    ...shadows.xs,
  },
  botaoRapidoText: {
    ...textStyles.caption,
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
    marginTop: spacing.sm,
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

