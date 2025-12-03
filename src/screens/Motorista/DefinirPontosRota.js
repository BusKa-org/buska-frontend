import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';

const DefinirPontosRota = ({navigation}) => {
  // Pontos pré-definidos dos colégios
  const [pontosPreDefinidos] = useState([
    {id: 1, nome: 'Escola Municipal Centro', tipo: 'colegio', x: 100, y: 200},
    {
      id: 2,
      nome: 'Escola Estadual Zona Norte',
      tipo: 'colegio',
      x: 300,
      y: 400,
    },
  ]);

  // Pontos editáveis da rota
  const [pontosRota, setPontosRota] = useState([
    {
      id: 1,
      nome: 'Centro - Rua Principal',
      tipo: 'parada',
      x: 50,
      y: 100,
      editavel: true,
    },
    {
      id: 2,
      nome: 'Praça da República',
      tipo: 'parada',
      x: 150,
      y: 200,
      editavel: true,
    },
    {
      id: 3,
      nome: 'Avenida Principal',
      tipo: 'parada',
      x: 250,
      y: 300,
      editavel: true,
    },
  ]);

  const [editandoPonto, setEditandoPonto] = useState(null);
  const [limiteExcedido, setLimiteExcedido] = useState(false);

  const handleEditarPonto = (ponto) => {
    setEditandoPonto(ponto.id);
    // Simulação: verificar se está dentro do limite de 2km
    const distancia = Math.sqrt(
      Math.pow(ponto.x - pontosPreDefinidos[0].x, 2) +
        Math.pow(ponto.y - pontosPreDefinidos[0].y, 2),
    );
    if (distancia > 200) {
      // Simulação de 2km (200 unidades)
      setLimiteExcedido(true);
      Alert.alert(
        'Limite Excedido',
        'O ponto está a mais de 2km dos colégios. Por favor, ajuste a posição.',
      );
    } else {
      setLimiteExcedido(false);
    }
  };

  const handleSalvarPontos = () => {
    Alert.alert('Sucesso', 'Pontos da rota salvos com sucesso!');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Definir Pontos da Rota</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ⚠️ Você pode editar os pontos da rota, mas eles devem estar
              dentro de um raio de 2km dos colégios.
            </Text>
          </View>

          {/* Mapa Simplificado */}
          <View style={styles.mapaContainer}>
            <Text style={styles.mapaTitle}>Mapa da Rota</Text>
            <View style={styles.mapaPlaceholder}>
              {/* Pontos pré-definidos dos colégios */}
              {pontosPreDefinidos.map((ponto) => (
                <View
                  key={ponto.id}
                  style={[
                    styles.pontoMapa,
                    styles.pontoColegio,
                    {left: ponto.x, top: ponto.y},
                  ]}>
                  <Text style={styles.pontoMapaIcon}>🏫</Text>
                  <Text style={styles.pontoMapaNome}>{ponto.nome}</Text>
                </View>
              ))}

              {/* Pontos editáveis da rota */}
              {pontosRota.map((ponto) => (
                <TouchableOpacity
                  key={ponto.id}
                  style={[
                    styles.pontoMapa,
                    styles.pontoEditavel,
                    editandoPonto === ponto.id && styles.pontoEditando,
                    {left: ponto.x, top: ponto.y},
                  ]}
                  onPress={() => handleEditarPonto(ponto)}>
                  <Text style={styles.pontoMapaIcon}>📍</Text>
                  <Text style={styles.pontoMapaNome}>{ponto.nome}</Text>
                  {editandoPonto === ponto.id && (
                    <View style={styles.editarIndicador}>
                      <Text style={styles.editarIndicadorText}>Editar</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}

              {/* Linhas da rota */}
              <View style={styles.linhaRota} />
            </View>
          </View>

          {/* Lista de Pontos */}
          <View style={styles.listaPontos}>
            <Text style={styles.listaTitle}>Pontos da Rota</Text>
            {pontosRota.map((ponto) => (
              <View key={ponto.id} style={styles.pontoItem}>
                <View style={styles.pontoItemLeft}>
                  <Text style={styles.pontoItemIcon}>📍</Text>
                  <View>
                    <Text style={styles.pontoItemNome}>{ponto.nome}</Text>
                    <Text style={styles.pontoItemTipo}>Parada</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.editarButton}
                  onPress={() => handleEditarPonto(ponto)}>
                  <Text style={styles.editarButtonText}>Editar</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {limiteExcedido && (
            <View style={styles.avisoBox}>
              <Text style={styles.avisoText}>
                ⚠️ Alguns pontos estão fora do limite de 2km
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.salvarButton,
              limiteExcedido && styles.salvarButtonDisabled,
            ]}
            onPress={handleSalvarPontos}
            disabled={limiteExcedido}>
            <Text style={styles.salvarButtonText}>Salvar Pontos da Rota</Text>
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
  infoBox: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  mapaContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mapaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  mapaPlaceholder: {
    height: 300,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#c8e6c9',
    borderStyle: 'dashed',
  },
  pontoMapa: {
    position: 'absolute',
    alignItems: 'center',
  },
  pontoColegio: {
    zIndex: 3,
  },
  pontoEditavel: {
    zIndex: 2,
  },
  pontoEditando: {
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#1a73e8',
    borderRadius: 8,
    padding: 4,
  },
  pontoMapaIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  pontoMapaNome: {
    fontSize: 10,
    color: '#333',
    fontWeight: '500',
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textAlign: 'center',
  },
  editarIndicador: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  editarIndicadorText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  linhaRota: {
    position: 'absolute',
    width: '80%',
    height: 2,
    backgroundColor: '#1a73e8',
    opacity: 0.5,
    left: '10%',
    top: '50%',
    zIndex: 1,
  },
  listaPontos: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  listaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  pontoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pontoItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pontoItemIcon: {
    fontSize: 20,
    marginRight: 12,
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
  editarButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#1a73e8',
  },
  editarButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  avisoBox: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  avisoText: {
    fontSize: 14,
    color: '#c62828',
  },
  salvarButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  salvarButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  salvarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DefinirPontosRota;


