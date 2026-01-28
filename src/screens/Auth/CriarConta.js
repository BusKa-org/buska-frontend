import React, {useState, useEffect} from 'react';
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
import api from '../../services/api';

const CriarConta = ({navigation}) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [matricula, setMatricula] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [instituicaoId, setInstituicaoId] = useState('');
  const [instituicoes, setInstituicoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingInstituicoes, setLoadingInstituicoes] = useState(true);
  const [error, setError] = useState('');
  const { register } = useAuth();

  // Load institutions on mount
  useEffect(() => {
    loadInstituicoes();
  }, []);

  const loadInstituicoes = async () => {
    try {
      setLoadingInstituicoes(true);
      // This endpoint may require auth - for MVP we'll handle the error gracefully
      const response = await api.get('/instituicoes/');
      setInstituicoes(response.data || []);
    } catch (error) {
      console.log('Could not load institutions:', error);
      // If we can't load institutions, we'll allow manual entry or skip
      setInstituicoes([]);
    } finally {
      setLoadingInstituicoes(false);
    }
  };

  const formatCPF = (text) => {
    // Remove non-digits
    const digits = text.replace(/\D/g, '');
    // Format as XXX.XXX.XXX-XX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  const handleCriarConta = async () => {
    setError('');

    // Validation
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      setError('Por favor, preencha nome, e-mail e senha');
      return;
    }

    if (!cpf.trim() || cpf.replace(/\D/g, '').length !== 11) {
      setError('CPF inválido. Digite os 11 dígitos');
      return;
    }

    if (!matricula.trim()) {
      setError('Por favor, informe sua matrícula');
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
        cpf: cpf.replace(/\D/g, ''), // Send only digits
        matricula,
        telefone: telefone || undefined,
        instituicao_id: instituicaoId || undefined,
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
              <Text style={styles.title}>Cadastro de Aluno</Text>
              <Text style={styles.subtitle}>Preencha seus dados para se cadastrar</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Text style={styles.label}>Nome Completo *</Text>
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

              <Text style={styles.label}>E-mail *</Text>
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

              <Text style={styles.label}>CPF *</Text>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder="000.000.000-00"
                placeholderTextColor={colors.text.hint}
                value={cpf}
                onChangeText={(text) => {
                  setCpf(formatCPF(text));
                  if (error) setError('');
                }}
                keyboardType="numeric"
                maxLength={14}
              />

              <Text style={styles.label}>Matrícula *</Text>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder="Número da matrícula escolar"
                placeholderTextColor={colors.text.hint}
                value={matricula}
                onChangeText={(text) => {
                  setMatricula(text);
                  if (error) setError('');
                }}
              />

              <Text style={styles.label}>Telefone</Text>
              <TextInput
                style={styles.input}
                placeholder="(00) 00000-0000"
                placeholderTextColor={colors.text.hint}
                value={telefone}
                onChangeText={setTelefone}
                keyboardType="phone-pad"
              />

              {/* Institution selection */}
              {instituicoes.length > 0 && (
                <>
                  <Text style={styles.label}>Instituição de Ensino</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.instituicoesScroll}>
                    <View style={styles.instituicoesContainer}>
                      {instituicoes.map((inst) => (
                        <TouchableOpacity
                          key={inst.id}
                          style={[
                            styles.instituicaoButton,
                            instituicaoId === inst.id && styles.instituicaoButtonActive,
                          ]}
                          onPress={() => setInstituicaoId(inst.id)}>
                          <Text style={[
                            styles.instituicaoText,
                            instituicaoId === inst.id && styles.instituicaoTextActive,
                          ]}>
                            {inst.nome}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </>
              )}

              <Text style={styles.label}>Senha *</Text>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={colors.text.hint}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                autoCapitalize="none"
              />

              <Text style={styles.label}>Confirmar Senha *</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite a senha novamente"
                placeholderTextColor={colors.text.hint}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry
                autoCapitalize="none"
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

              <Text style={styles.noteText}>
                * Campos obrigatórios
              </Text>
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
    marginBottom: spacing.xl,
  },
  brandName: {
    ...textStyles.h3,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  title: {
    ...textStyles.h2,
    color: colors.secondary.main,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  label: {
    ...textStyles.inputLabel,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
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
  instituicoesScroll: {
    marginBottom: spacing.sm,
  },
  instituicoesContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  instituicaoButton: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  instituicaoButtonActive: {
    backgroundColor: colors.secondary.lighter,
    borderColor: colors.secondary.main,
  },
  instituicaoText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  instituicaoTextActive: {
    color: colors.secondary.dark,
    fontWeight: '600',
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
    marginTop: spacing.md,
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
  noteText: {
    ...textStyles.caption,
    color: colors.text.hint,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});

export default CriarConta;
