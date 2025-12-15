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

const Login = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    // Clear previous errors
    setError('');

    if (!email.trim() || !senha.trim()) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, senha);
      
      if (result.success) {
        // Navigation will be handled automatically by MainNavigator
        // based on authentication state and user role
        // The AuthContext update will trigger a re-render
      } else {
        // Display error message from API
        const errorMessage = result.error || 'Credenciais inválidas. Verifique seu e-mail e senha.';
        setError(errorMessage);
      }
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error.message || 'Ocorreu um erro ao fazer login. Verifique sua conexão e tente novamente.';
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
            {/* Logo/Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Transporte Escolar</Text>
              <Text style={styles.subtitle}>Gestão Municipal</Text>
            </View>

            {/* Formulário */}
            <View style={styles.form}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder="seu@email.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  // Clear error when user starts typing
                  if (error) setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder="Digite sua senha"
                placeholderTextColor="#999"
                value={senha}
                onChangeText={(text) => {
                  setSenha(text);
                  // Clear error when user starts typing
                  if (error) setError('');
                }}
                secureTextEntry
                autoCapitalize="none"
              />

              {/* Error message display */}
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate('RecuperarSenha')}>
                <Text style={styles.forgotPasswordText}>
                  Esqueceu sua senha?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
                onPress={handleLogin}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Entrar</Text>
                )}
              </TouchableOpacity>

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Não tem uma conta? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('CriarConta')}>
                  <Text style={styles.signupLink}>Cadastre-se</Text>
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
    marginBottom: 48,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#1a73e8',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
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

export default Login;


