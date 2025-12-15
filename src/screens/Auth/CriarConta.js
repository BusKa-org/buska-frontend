import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const CriarConta = ({navigation}) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('aluno'); // aluno, motorista, gestor
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleCriarConta = async () => {
    // Clear previous errors
    setError('');

    // Validation
    if (!nome.trim() || !email.trim() || !senha.trim() || !municipio.trim()) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        nome,
        email,
        password: senha,
        role: tipoUsuario,
        municipio,
      });

      if (result.success) {
        // Navigate immediately to login screen
        navigation.navigate('Login');
        // Show success message after navigation
        setTimeout(() => {
          Alert.alert('Sucesso', 'Conta criada com sucesso! Faça login para continuar.');
        }, 300);
      } else {
        // Display error message from backend
        const errorMessage = result.error || 'Não foi possível criar a conta';
        setError(errorMessage);
      }
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error?.message || 'Ocorreu um erro ao criar a conta. Verifique sua conexão e tente novamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Criar Conta</Text>
              <Text style={styles.subtitle}>Preencha os dados abaixo</Text>
            </View>

            {/* Formulário */}
            <View style={styles.form}>
              <Text style={styles.label}>Nome Completo</Text>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder="Seu nome completo"
                placeholderTextColor="#999"
                value={nome}
                onChangeText={(text) => {
                  setNome(text);
                  if (error) setError('');
                }}
                autoCapitalize="words"
              />

              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder="seu@email.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.label}>Tipo de Usuário</Text>
              <View style={styles.tipoUsuarioContainer}>
                <TouchableOpacity
                  style={[
                    styles.tipoUsuarioButton,
                    tipoUsuario === 'aluno' && styles.tipoUsuarioButtonActive,
                  ]}
                  onPress={() => setTipoUsuario('aluno')}>
                  <Text
                    style={[
                      styles.tipoUsuarioText,
                      tipoUsuario === 'aluno' &&
                        styles.tipoUsuarioTextActive,
                    ]}>
                    Aluno
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tipoUsuarioButton,
                    tipoUsuario === 'motorista' &&
                      styles.tipoUsuarioButtonActive,
                  ]}
                  onPress={() => setTipoUsuario('motorista')}>
                  <Text
                    style={[
                      styles.tipoUsuarioText,
                      tipoUsuario === 'motorista' &&
                        styles.tipoUsuarioTextActive,
                    ]}>
                    Motorista
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tipoUsuarioButton,
                    tipoUsuario === 'gestor' &&
                      styles.tipoUsuarioButtonActive,
                  ]}
                  onPress={() => setTipoUsuario('gestor')}>
                  <Text
                    style={[
                      styles.tipoUsuarioText,
                      tipoUsuario === 'gestor' && styles.tipoUsuarioTextActive,
                    ]}>
                    Gestor
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#999"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                autoCapitalize="none"
              />

              <Text style={styles.label}>Confirmar Senha</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite a senha novamente"
                placeholderTextColor="#999"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry
                autoCapitalize="none"
              />

              <Text style={styles.label}>Município</Text>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder="Ex: CAMPINA GRANDE"
                placeholderTextColor="#999"
                value={municipio}
                onChangeText={(text) => {
                  setMunicipio(text);
                  if (error) setError('');
                }}
                autoCapitalize="characters"
              />

              {/* Error message display */}
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.criarContaButton, loading && styles.criarContaButtonDisabled]}
                onPress={handleCriarConta}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.criarContaButtonText}>Criar Conta</Text>
                )}
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Já tem uma conta? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Entrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a73e8',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  tipoUsuarioContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tipoUsuarioButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tipoUsuarioButtonActive: {
    backgroundColor: '#1a73e8',
    borderColor: '#1a73e8',
  },
  tipoUsuarioText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tipoUsuarioTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  criarContaButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  criarContaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  criarContaButtonDisabled: {
    opacity: 0.6,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#1a73e8',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: '500',
  },
  inputError: {
    borderColor: '#d32f2f',
    borderWidth: 1,
  },
});

export default CriarConta;


