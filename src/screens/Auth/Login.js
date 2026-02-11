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
import { colors, spacing, borderRadius, shadows, textStyles } from '../../theme';

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
              <Text style={styles.brandName}>BusKá</Text>
              <Text style={styles.title}>Transporte Escolar</Text>
              <Text style={styles.subtitle}>Gestão Municipal</Text>
            </View>

            {/* Formulário */}
            <View style={styles.form} accessible={false}>
              <Text 
                style={styles.label}
                nativeID="email-label"
              >
                E-mail
              </Text>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder="seu@email.com"
                placeholderTextColor={colors.text.hint}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                accessible={true}
                accessibilityLabel="E-mail"
                accessibilityHint="Digite seu endereço de e-mail"
                accessibilityLabelledBy="email-label"
                testID="email-input"
              />

              <Text 
                style={styles.label}
                nativeID="password-label"
              >
                Senha
              </Text>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder="Digite sua senha"
                placeholderTextColor={colors.text.hint}
                value={senha}
                onChangeText={(text) => {
                  setSenha(text);
                  if (error) setError('');
                }}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                accessible={true}
                accessibilityLabel="Senha"
                accessibilityHint="Digite sua senha"
                accessibilityLabelledBy="password-label"
                testID="password-input"
              />

              {/* Error message display */}
              {error ? (
                <View 
                  style={styles.errorContainer}
                  accessible={true}
                  accessibilityRole="alert"
                  accessibilityLiveRegion="assertive"
                >
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate('RecuperarSenha')}
                accessible={true}
                accessibilityRole="link"
                accessibilityLabel="Esqueceu sua senha?"
                accessibilityHint="Toque para recuperar sua senha"
              >
                <Text style={styles.forgotPasswordText}>
                  Esqueceu sua senha?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
                onPress={handleLogin}
                disabled={loading}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={loading ? "Entrando" : "Entrar"}
                accessibilityState={{ disabled: loading, busy: loading }}
                testID="login-button"
              >
                {loading ? (
                  <ActivityIndicator color={colors.primary.contrast} />
                ) : (
                  <Text style={styles.loginButtonText}>Entrar</Text>
                )}
              </TouchableOpacity>

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Não tem uma conta? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('CriarConta')}
                  accessible={true}
                  accessibilityRole="link"
                  accessibilityLabel="Cadastre-se"
                  accessibilityHint="Toque para criar uma nova conta"
                >
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
    backgroundColor: colors.background.default,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.huge,
  },
  brandName: {
    ...textStyles.display2,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  title: {
    ...textStyles.h2,
    color: colors.secondary.main,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  form: {
    width: '100%',
  },
  label: {
    ...textStyles.inputLabel,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.base,
  },
  input: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    fontSize: textStyles.inputText.fontSize,
    borderWidth: 1,
    borderColor: colors.border.light,
    color: colors.text.primary,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  forgotPasswordText: {
    ...textStyles.bodySmall,
    color: colors.secondary.main,
  },
  loginButton: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    alignItems: 'center',
    marginTop: spacing.sm,
    minHeight: 48, // Minimum touch target for accessibility
    justifyContent: 'center',
    ...shadows.sm,
  },
  loginButtonText: {
    ...textStyles.button,
    color: colors.primary.contrast,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  signupText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  signupLink: {
    ...textStyles.bodySmall,
    color: colors.secondary.main,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: colors.error.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.error.main,
  },
  errorText: {
    ...textStyles.bodySmall,
    color: colors.error.dark,
    fontWeight: '500',
  },
  inputError: {
    borderColor: colors.error.main,
    borderWidth: 1,
  },
});

export default Login;


