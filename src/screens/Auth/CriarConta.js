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
import Icon, { IconNames } from '../../components/Icon';

const CriarConta = ({navigation}) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('aluno');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleCriarConta = async () => {
    setError('');

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
        navigation.navigate('Login');
        setTimeout(() => {
          Alert.alert('Sucesso', 'Conta criada com sucesso! Faça login para continuar.');
        }, 300);
      } else {
        const errorMessage = result.error || 'Não foi possível criar a conta';
        setError(errorMessage);
      }
    } catch (error) {
      const errorMessage = error?.message || 'Ocorreu um erro ao criar a conta. Verifique sua conexão e tente novamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const userTypes = [
    { id: 'aluno', label: 'Aluno', icon: IconNames.person, color: colors.roles.aluno },
    { id: 'motorista', label: 'Motorista', icon: IconNames.bus, color: colors.roles.motorista },
    { id: 'gestor', label: 'Gestor', icon: IconNames.badge, color: colors.roles.gestor },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Icon name={IconNames.back} size="base" color={colors.text.secondary} />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.brandName}>BusKá</Text>
              <Text style={styles.title}>Criar Conta</Text>
              <Text style={styles.subtitle}>Preencha os dados abaixo</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Text style={styles.label}>Nome Completo</Text>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder="Seu nome completo"
                placeholderTextColor={colors.text.hint}
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
                placeholderTextColor={colors.text.hint}
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
                {userTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.tipoUsuarioButton,
                      tipoUsuario === type.id && [styles.tipoUsuarioButtonActive, { borderColor: type.color }],
                    ]}
                    onPress={() => setTipoUsuario(type.id)}>
                    <Icon 
                      name={type.icon} 
                      size="md" 
                      color={tipoUsuario === type.id ? type.color : colors.text.secondary} 
                    />
                    <Text
                      style={[
                        styles.tipoUsuarioText,
                        tipoUsuario === type.id && { color: type.color, fontWeight: '600' },
                      ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={colors.text.hint}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                autoCapitalize="none"
              />

              <Text style={styles.label}>Confirmar Senha</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite a senha novamente"
                placeholderTextColor={colors.text.hint}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry
                autoCapitalize="none"
              />

              <Text style={styles.label}>Município</Text>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder="Ex: CAMPINA GRANDE"
                placeholderTextColor={colors.text.hint}
                value={municipio}
                onChangeText={(text) => {
                  setMunicipio(text);
                  if (error) setError('');
                }}
                autoCapitalize="characters"
              />

              {error ? (
                <View style={styles.errorContainer}>
                  <Icon name={IconNames.error} size="sm" color={colors.error.main} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.criarContaButton, loading && styles.criarContaButtonDisabled]}
                onPress={handleCriarConta}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color={colors.primary.contrast} />
                ) : (
                  <>
                    <Icon name={IconNames.add} size="md" color={colors.primary.contrast} />
                    <Text style={styles.criarContaButtonText}>Criar Conta</Text>
                  </>
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.paper,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.xs,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  brandName: {
    ...textStyles.h3,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  title: {
    ...textStyles.h1,
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
  tipoUsuarioContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tipoUsuarioButton: {
    flex: 1,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border.light,
    gap: spacing.xs,
  },
  tipoUsuarioButtonActive: {
    backgroundColor: colors.neutral[50],
  },
  tipoUsuarioText: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  criarContaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    marginTop: spacing.xl,
    ...shadows.sm,
  },
  criarContaButtonText: {
    ...textStyles.button,
    color: colors.primary.contrast,
  },
  criarContaButtonDisabled: {
    opacity: 0.6,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  loginText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  loginLink: {
    ...textStyles.bodySmall,
    color: colors.secondary.main,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.error.main,
  },
  errorText: {
    ...textStyles.bodySmall,
    color: colors.error.dark,
    flex: 1,
  },
  inputError: {
    borderColor: colors.error.main,
  },
});

export default CriarConta;
