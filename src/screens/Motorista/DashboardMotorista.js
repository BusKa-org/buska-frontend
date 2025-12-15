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
        console.log('Loading proxima viagem...');
        const viagens = await motoristaService.listarViagens();
        console.log('Viagens recebidas:', viagens);
        
        if (viagens && viagens.length > 0) {
          // Ordenar por data e horário, encontrar a próxima viagem
          const now = new Date();
          const todayStr = now.toISOString().split('T')[0]; // "2025-12-10"
          now.setHours(0, 0, 0, 0); // Resetar para início do dia para comparação
          
          console.log('Now date:', now);
          console.log('Today string:', todayStr);
          
          const viagensFuturas = viagens
            .filter((v) => {
              // Extrair apenas a parte da data (YYYY-MM-DD)
              const viagemDateStr = v.data.split('T')[0];
              
              // Criar data da viagem às 00:00:00 no timezone local
              const [year, month, day] = viagemDateStr.split('-').map(Number);
              const viagemDate = new Date(year, month - 1, day);
              
              console.log(`Viagem ${v.id}: data=${v.data}, viagemDateStr=${viagemDateStr}, viagemDate=${viagemDate}`);
              
              // Se a viagem tem horario_fim, considerar apenas se ainda não passou
              if (v.horario_fim) {
                const horarioFimStr = v.horario_fim.includes('T') 
                  ? v.horario_fim.substring(11, 16) 
                  : v.horario_fim.substring(0, 5);
                const [horasFim, minutosFim] = horarioFimStr.split(':').map(Number);
                const fimViagem = new Date(year, month - 1, day, horasFim, minutosFim);
                
                if (fimViagem < new Date()) {
                  console.log('Viagem já finalizada:', v.id, fimViagem);
                  return false; // Viagem já finalizada
                }
              }
              
              // Comparar datas: viagemDate >= now (inclui hoje e futuras)
              const isTodayOrFuture = viagemDate >= now;
              
              console.log(`Viagem ${v.id}: viagemDate=${viagemDate}, now=${now}, isTodayOrFuture=${isTodayOrFuture}`);
              
              return isTodayOrFuture;
            })
            .sort((a, b) => {
              // Parse completo com data e horário
              const horarioA = a.horario_inicio || '00:00';
              const horarioB = b.horario_inicio || '00:00';
              
              const dateA = new Date(`${a.data}T${horarioA}`);
              const dateB = new Date(`${b.data}T${horarioB}`);
              
              return dateA - dateB;
            });

          console.log('Viagens futuras encontradas:', viagensFuturas.length);
          console.log('Viagens futuras:', viagensFuturas);

          if (viagensFuturas.length > 0) {
            const proxima = viagensFuturas[0];
            
            // Buscar pontos da rota para obter origem e destino
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
            } catch (error) {
              console.error('Error loading route points:', error);
            }
            
            console.log('Proxima viagem selecionada:', proxima);
            
            // Normalizar formato do horário
            let horarioFormatado = '--:--';
            if (proxima.horario_inicio) {
              if (proxima.horario_inicio.includes('T')) {
                // Formato ISO: "2024-12-10T08:37:00" -> "08:37"
                horarioFormatado = proxima.horario_inicio.substring(11, 16);
              } else if (proxima.horario_inicio.includes(':')) {
                // Formato HH:MM ou HH:MM:SS -> pegar apenas HH:MM
                horarioFormatado = proxima.horario_inicio.substring(0, 5);
              }
            }
            
            console.log('Horario formatado:', horarioFormatado);
            
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
            console.log('Nenhuma viagem futura encontrada');
            setProximaViagem(null);
          }
        } else {
          console.log('Nenhuma viagem retornada da API');
          setProximaViagem(null);
        }
      } catch (error) {
        console.error('Error loading next trip:', error);
        console.error('Error details:', error.message, error.response?.data);
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
        console.log('Loading alunos info for viagem:', proximaViagem.id);
        const alunosData = await motoristaService.listarAlunosViagem(proximaViagem.id);
        console.log('Alunos data received:', alunosData);
        
        // Verificar se a resposta tem a estrutura esperada
        if (alunosData && typeof alunosData === 'object') {
          const totalAlunos = alunosData.total_alunos !== undefined ? alunosData.total_alunos : 0;
          const alunosConfirmados = alunosData.alunos_confirmados !== undefined ? alunosData.alunos_confirmados : 0;
          
          console.log(`Setting alunos info: ${alunosConfirmados} de ${totalAlunos}`);
          
          setAlunosInfo({
            totalAlunos: totalAlunos,
            alunosConfirmados: alunosConfirmados,
          });
        } else {
          console.warn('Unexpected alunos data format:', alunosData);
          setAlunosInfo({
            totalAlunos: 0,
            alunosConfirmados: 0,
          });
        }
      } catch (error) {
        console.error('Error loading alunos info:', error);
        console.error('Error details:', error.message);
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
          <Text style={styles.greeting}>
            Olá, {user?.nome || 'Motorista'}! 👋
          </Text>
          <Text style={styles.subtitle}>
            {getUserInfo()}
          </Text>
        </View>

        {/* Próxima Viagem */}
        <View style={styles.proximaViagemCard}>
          <Text style={styles.cardTitle}>Próxima Viagem</Text>
          {loadingViagem ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#1a73e8" />
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
                    <Text style={styles.pontoIcon}>📍</Text>
                    <Text style={styles.pontoNome}>{proximaViagem.origem || 'N/A'}</Text>
                  </View>
                  <View style={styles.linhaRota} />
                  <View style={styles.pontoRota}>
                    <Text style={styles.pontoIcon}>🎯</Text>
                    <Text style={styles.pontoNome}>{proximaViagem.destino || 'N/A'}</Text>
                  </View>
                </View>
              </View>

              {/* Informações de Alunos */}
              <View style={styles.alunosInfo}>
                {loadingAlunos ? (
                  <View style={styles.loadingAlunosContainer}>
                    <ActivityIndicator size="small" color="#1a73e8" />
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
              <Text style={styles.botaoRapidoIcon}>🚌</Text>
              <Text style={styles.botaoRapidoText}>Minhas Rotas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoRapido}
              onPress={() => navigation.navigate('CriarRota')}>
              <Text style={styles.botaoRapidoIcon}>➕</Text>
              <Text style={styles.botaoRapidoText}>Criar Rota</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.botoesRow}>
            <TouchableOpacity
              style={styles.botaoRapido}
              onPress={() => navigation.navigate('CriarViagem')}>
              <Text style={styles.botaoRapidoIcon}>🚗</Text>
              <Text style={styles.botaoRapidoText}>Criar Viagem</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoRapido}
              onPress={() => navigation.navigate('ChatGestor')}>
              <Text style={styles.botaoRapidoIcon}>💬</Text>
              <Text style={styles.botaoRapidoText}>Chat Gestor</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.botoesRow}>
            <TouchableOpacity
              style={styles.botaoRapido}
              onPress={() => navigation.navigate('ConfigNotificacoesMotorista')}>
              <Text style={styles.botaoRapidoIcon}>⚙️</Text>
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
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  proximaViagemCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  viagemData: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  viagemInfo: {
    marginBottom: 20,
  },
  viagemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  viagemTipo: {
    fontSize: 16,
    color: '#1a73e8',
    fontWeight: '600',
    marginBottom: 4,
  },
  viagemHorario: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fbbc04',
    fontSize: 12,
    fontWeight: '600',
  },
  rotaInfo: {
    marginBottom: 16,
  },
  rotaIdText: {
    fontSize: 14,
    color: '#666',
  },
  pontoRota: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pontoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  pontoNome: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  linhaRota: {
    width: 2,
    height: 20,
    backgroundColor: '#e0e0e0',
    marginLeft: 14,
    marginBottom: 8,
    marginTop: 4,
  },
  alunosInfo: {
    marginTop: 12,
    marginBottom: 20,
  },
  alunosText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  alunosBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  alunosBarFill: {
    height: '100%',
    backgroundColor: '#34a853',
    borderRadius: 4,
  },
  loadingAlunosContainer: {
    padding: 12,
    alignItems: 'center',
  },
  emptyAlunosText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  acoesContainer: {
    gap: 12,
  },
  verDetalhesButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  verDetalhesButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  iniciarButton: {
    backgroundColor: '#34a853',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  iniciarButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  botoesRapidos: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  botoesRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  botaoRapido: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 100,
    justifyContent: 'center',
  },
  botaoRapidoIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  botaoRapidoText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  acessoRapido: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  rapidoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  rapidoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  rapidoText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default DashboardMotorista;

