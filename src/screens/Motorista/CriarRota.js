import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {motoristaService} from '../../services/motoristaService';
import {useAuth} from '../../contexts/AuthContext';

const CriarRota = ({navigation}) => {
  const {user} = useAuth();
  const [nomeRota, setNomeRota] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCriarRota = async () => {
    if (!nomeRota.trim()) {
      Alert.alert('Erro', 'Por favor, informe o nome da rota');
      return;
    }

    if (!user?.municipio_id) {
      Alert.alert(
        'Erro',
        'Você não possui um município cadastrado. Entre em contato com o gestor.',
      );
      return;
    }

    try {
      setLoading(true);
      const response = await motoristaService.criarRota(nomeRota.trim());
      
      console.log('Response completo da criação de rota:', JSON.stringify(response, null, 2));
      
      // Garantir que temos a rota no formato correto
      const rotaData = response?.rota || response;
      
      console.log('Rota data a ser passada:', rotaData);
      console.log('Rota ID:', rotaData?.id);
      
      if (!rotaData || !rotaData.id) {
        Alert.alert('Erro', 'Rota criada mas dados não disponíveis. Tente novamente.');
        return;
      }
      
      Alert.alert('Sucesso', 'Rota criada com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            console.log('Navegando para DefinirPontosRota com rota:', rotaData);
            navigation.navigate('DefinirPontosRota', {
              rota: rotaData,
              isNovaRota: true,
            });
          },
        },
      ]);
    } catch (error) {
      console.error('Error creating route:', error);
      Alert.alert(
        'Erro',
        error?.message || 'Não foi possível criar a rota. Tente novamente.',
      );
    } finally {
      setLoading(false);
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
        <Text style={styles.title}>Criar Nova Rota</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              📍 Crie uma nova rota para seu município. Após criar, você poderá
              adicionar os pontos de parada.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome da Rota *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Rota Centro - Zona Norte"
                placeholderTextColor="#999"
                value={nomeRota}
                onChangeText={setNomeRota}
                editable={!loading}
              />
              <Text style={styles.helperText}>
                Escolha um nome descritivo para a rota
              </Text>
            </View>

            {user?.municipio && (
              <View style={styles.municipioInfo}>
                <Text style={styles.municipioLabel}>Município:</Text>
                <Text style={styles.municipioNome}>
                  {user.municipio.nome}
                  {user.municipio.uf ? ` - ${user.municipio.uf}` : ''}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.criarButton, loading && styles.criarButtonDisabled]}
              onPress={handleCriarRota}
              disabled={loading || !nomeRota.trim()}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.criarButtonText}>Criar Rota</Text>
              )}
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
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#1a73e8',
  },
  infoText: {
    fontSize: 14,
    color: '#1565c0',
    lineHeight: 20,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
  municipioInfo: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  municipioLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  municipioNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  criarButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  criarButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  criarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CriarRota;

