import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

const DetalheViagem = ({navigation, route}) => {
  const {rota, viagem} = route?.params || {
    rota: {
      id: 1,
      nome: 'Rota Centro - Zona Norte',
      bairro: 'Centro',
    },
    viagem: {
      id: 1,
      tipo: 'Manhã',
      horario: '07:30',
      status: 'Confirmado',
      origem: 'Centro',
      destino: 'Escola Municipal',
    },
  };

  const [situacaoViagem, setSituacaoViagem] = useState('não iniciada');
  const [presencaConfirmada, setPresencaConfirmada] = useState(
    viagem.status === 'Confirmado',
  );

  // Simula pontos da rota
  const pontosRota = [
    {id: 1, nome: 'Centro', tipo: 'origem'},
    {id: 2, nome: 'Praça da República', tipo: 'parada'},
    {id: 3, nome: 'Avenida Principal', tipo: 'parada'},
    {id: 4, nome: 'Escola Municipal', tipo: 'destino'},
  ];

  const podeConfirmarPresenca = () => {
    // Pode confirmar se estiver dentro da janela de 10 minutos após início
    return situacaoViagem === 'em andamento';
  };

  const handleConfirmarPresenca = () => {
    setPresencaConfirmada(true);
  };

  const getSituacaoColor = (situacao) => {
    switch (situacao) {
      case 'não iniciada':
        return '#999';
      case 'em andamento':
        return '#1a73e8';
      case 'finalizada':
        return '#34a853';
      default:
        return '#999';
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
                  styles.situacaoBadge,
                  {backgroundColor: getSituacaoColor(situacaoViagem) + '20'},
                ]}>
                <Text
                  style={[
                    styles.situacaoText,
                    {color: getSituacaoColor(situacaoViagem)},
                  ]}>
                  {situacaoViagem.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.rotaInfo}>
              <View style={styles.pontoRota}>
                <View style={styles.pontoIcon}>
                  <Text style={styles.pontoIconText}>📍</Text>
                </View>
                <View style={styles.pontoInfo}>
                  <Text style={styles.pontoLabel}>Origem</Text>
                  <Text style={styles.pontoNome}>{viagem.origem}</Text>
                </View>
              </View>

              <View style={styles.linhaRota} />

              <View style={styles.pontoRota}>
                <View style={styles.pontoIcon}>
                  <Text style={styles.pontoIconText}>🎯</Text>
                </View>
                <View style={styles.pontoInfo}>
                  <Text style={styles.pontoLabel}>Destino</Text>
                  <Text style={styles.pontoNome}>{viagem.destino}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Status de Presença */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Status de Presença</Text>
            <View
              style={[
                styles.presencaStatus,
                presencaConfirmada
                  ? styles.presencaConfirmada
                  : styles.presencaNaoConfirmada,
              ]}>
              <Text
                style={[
                  styles.presencaText,
                  presencaConfirmada && styles.presencaTextConfirmada,
                ]}>
                {presencaConfirmada
                  ? '✓ Presença Confirmada'
                  : '✗ Presença Não Confirmada'}
              </Text>
            </View>

            {podeConfirmarPresenca() && !presencaConfirmada && (
              <TouchableOpacity
                style={styles.confirmarButton}
                onPress={handleConfirmarPresenca}>
                <Text style={styles.confirmarButtonText}>
                  Confirmar Presença
                </Text>
                <Text style={styles.confirmarSubtext}>
                  (Janela de 10 minutos após início)
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Pontos da Rota */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pontos da Rota</Text>
            {pontosRota.map((ponto, index) => (
              <View key={ponto.id} style={styles.pontoItem}>
                <View style={styles.pontoItemLeft}>
                  <View
                    style={[
                      styles.pontoItemIcon,
                      ponto.tipo === 'origem' && styles.pontoItemIconOrigem,
                      ponto.tipo === 'destino' && styles.pontoItemIconDestino,
                    ]}>
                    <Text style={styles.pontoItemIconText}>
                      {ponto.tipo === 'origem'
                        ? '📍'
                        : ponto.tipo === 'destino'
                        ? '🎯'
                        : '•'}
                    </Text>
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
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Mapa Simplificado */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Mapa da Rota</Text>
            <View style={styles.mapaPlaceholder}>
              <Text style={styles.mapaPlaceholderText}>🗺️</Text>
              <Text style={styles.mapaPlaceholderLabel}>
                Mapa com pontos da rota
              </Text>
              <Text style={styles.mapaPlaceholderSubtext}>
                (Em implementação)
              </Text>
            </View>
          </View>

          {/* Ações */}
          <TouchableOpacity
            style={styles.localizacaoButton}
            onPress={() =>
              navigation.navigate('LocalizacaoOnibus', {rota, viagem})
            }>
            <Text style={styles.localizacaoButtonText}>
              📍 Ver Localização do Ônibus
            </Text>
          </TouchableOpacity>
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
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#1a73e8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  viagemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
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
  situacaoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  situacaoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rotaInfo: {
    marginTop: 8,
  },
  pontoRota: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pontoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pontoIconText: {
    fontSize: 20,
  },
  pontoInfo: {
    flex: 1,
  },
  pontoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  pontoNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  linhaRota: {
    width: 2,
    height: 20,
    backgroundColor: '#e0e0e0',
    marginLeft: 20,
    marginBottom: 12,
  },
  presencaStatus: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  presencaConfirmada: {
    backgroundColor: '#e8f5e9',
  },
  presencaNaoConfirmada: {
    backgroundColor: '#fff3cd',
  },
  presencaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fbbc04',
  },
  presencaTextConfirmada: {
    color: '#34a853',
  },
  confirmarButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  confirmarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmarSubtext: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  pontoItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  pontoItemLeft: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  pontoItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pontoItemIconOrigem: {
    backgroundColor: '#e3f2fd',
  },
  pontoItemIconDestino: {
    backgroundColor: '#e8f5e9',
  },
  pontoItemIconText: {
    fontSize: 16,
  },
  pontoItemLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 4,
  },
  pontoItemRight: {
    flex: 1,
  },
  pontoItemNome: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  pontoItemTipo: {
    fontSize: 12,
    color: '#666',
  },
  mapaPlaceholder: {
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  mapaPlaceholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  mapaPlaceholderLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  mapaPlaceholderSubtext: {
    fontSize: 12,
    color: '#999',
  },
  localizacaoButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  localizacaoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DetalheViagem;


