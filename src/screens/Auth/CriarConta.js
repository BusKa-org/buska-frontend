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
import { 
  ErrorCode, 
  ErrorCategory,
  getFieldValidationMessage,
  errorLogger,
} from '../../utils/errors';

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
  
  // Field-specific errors
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  
  const { register } = useAuth();

  // Load institutions on mount
  useEffect(() => {
    loadInstituicoes();
  }, []);

  const loadInstituicoes = async () => {
    try {
      setLoadingInstituicoes(true);
      const response = await api.get('/instituicoes/');
      setInstituicoes(response.data || []);
    } catch (error) {
      errorLogger.debug('Could not load institutions', { error: error.message });
      setInstituicoes([]);
    } finally {
      setLoadingInstituicoes(false);
    }
  };

  const formatCPF = (text) => {
    const digits = text.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  const clearFieldError = (field) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Nome
    if (!nome.trim()) {
      newErrors.nome = getFieldValidationMessage('nome', 'required');
    } else if (nome.trim().length < 3) {
      newErrors.nome = getFieldValidationMessage('nome', 'minLength');
    }
    
    // Email
    if (!email.trim()) {
      newErrors.email = getFieldValidationMessage('email', 'required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = getFieldValidationMessage('email', 'invalid');
    }
    
    // CPF
    const cpfDigits = cpf.replace(/\D/g, '');
    if (!cpfDigits) {
      newErrors.cpf = getFieldValidationMessage('cpf', 'required');
    } else if (cpfDigits.length !== 11) {
      newErrors.cpf = getFieldValidationMessage('cpf', 'invalid');
    }
    
    // Matrícula
    if (!matricula.trim()) {
      newErrors.matricula = getFieldValidationMessage('matricula', 'required');
    }
    
    // Senha
    if (!senha) {
      newErrors.senha = getFieldValidationMessage('password', 'required');
    } else if (senha.length < 6) {
      newErrors.senha = getFieldValidationMessage('password', 'minLength');
    }
    
    // Confirmar senha
    if (senha !== confirmarSenha) {
      newErrors.confirmarSenha = getFieldValidationMessage('password', 'mismatch');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCriarConta = async () => {
    setGeneralError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        nome,
        email,
        password: senha,
        cpf: cpf.replace(/\D/g, ''),
        matricula,
        telefone: telefone || undefined,
        instituicao_id: instituicaoId || undefined,
      });

      if (result.success) {
        navigation.navigate('Login');
        setTimeout(() => {
          Alert.alert(
            'Conta criada!', 
            'Seu cadastro foi realizado com sucesso. Faça login para continuar.',
            [{ text: 'OK' }]
          );
        }, 300);
      } else {
        // Handle specific error codes
        handleRegistrationError(result);
      }
    } catch (error) {
      errorLogger.error(error, { context: 'CriarConta.handleCriarConta' });
      setGeneralError(error.message || 'Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationError = (result) => {
    const { error, errorCode, field } = result;
    
    // Handle field-specific errors
    if (field) {
      setErrors(prev => ({ ...prev, [field]: error }));
      return;
    }
    
    // Handle known error codes
    switch (errorCode) {
      case ErrorCode.EMAIL_ALREADY_EXISTS:
        setErrors(prev => ({ ...prev, email: 'Este e-mail já está cadastrado.' }));
        break;
      case ErrorCode.CPF_ALREADY_EXISTS:
        setErrors(prev => ({ ...prev, cpf: 'Este CPF já está cadastrado.' }));
        break;
      case ErrorCode.INVALID_EMAIL:
        setErrors(prev => ({ ...prev, email: 'E-mail inválido.' }));
        break;
      case ErrorCode.INVALID_CPF:
        setErrors(prev => ({ ...prev, cpf: 'CPF inválido.' }));
        break;
      case ErrorCode.NETWORK_ERROR:
        setGeneralError('Sem conexão. Verifique sua internet e tente novamente.');
        break;
      case ErrorCode.SERVICE_UNAVAILABLE:
        setGeneralError('Servidor indisponível. Tente novamente em alguns minutos.');
        break;
      default:
        setGeneralError(error || 'Não foi possível criar a conta. Tente novamente.');
    }
  };

  const renderFieldError = (field) => {
    if (!errors[field]) return null;
    return (
      <View style={styles.fieldErrorContainer}>
        <Icon name={IconNames.error} size="xs" color={colors.error.main} />
        <Text style={styles.fieldErrorText}>{errors[field]}</Text>
      </View>
    );
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
              {/* Nome */}
              <Text style={styles.label}>Nome Completo *</Text>
              <TextInput
                style={[styles.input, errors.nome && styles.inputError]}
                placeholder="Seu nome completo"
                placeholderTextColor={colors.text.hint}
                value={nome}
                onChangeText={(text) => {
                  setNome(text);
                  clearFieldError('nome');
                }}
                autoCapitalize="words"
              />
              {renderFieldError('nome')}

              {/* Email */}
              <Text style={styles.label}>E-mail *</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="seu@email.com"
                placeholderTextColor={colors.text.hint}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  clearFieldError('email');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {renderFieldError('email')}

              {/* CPF */}
              <Text style={styles.label}>CPF *</Text>
              <TextInput
                style={[styles.input, errors.cpf && styles.inputError]}
                placeholder="000.000.000-00"
                placeholderTextColor={colors.text.hint}
                value={cpf}
                onChangeText={(text) => {
                  setCpf(formatCPF(text));
                  clearFieldError('cpf');
                }}
                keyboardType="numeric"
                maxLength={14}
              />
              {renderFieldError('cpf')}

              {/* Matrícula */}
              <Text style={styles.label}>Matrícula *</Text>
              <TextInput
                style={[styles.input, errors.matricula && styles.inputError]}
                placeholder="Número da matrícula escolar"
                placeholderTextColor={colors.text.hint}
                value={matricula}
                onChangeText={(text) => {
                  setMatricula(text);
                  clearFieldError('matricula');
                }}
              />
              {renderFieldError('matricula')}

              {/* Telefone */}
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

              {/* Senha */}
              <Text style={styles.label}>Senha *</Text>
              <TextInput
                style={[styles.input, errors.senha && styles.inputError]}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={colors.text.hint}
                value={senha}
                onChangeText={(text) => {
                  setSenha(text);
                  clearFieldError('senha');
                }}
                secureTextEntry
                autoCapitalize="none"
              />
              {renderFieldError('senha')}

              {/* Confirmar Senha */}
              <Text style={styles.label}>Confirmar Senha *</Text>
              <TextInput
                style={[styles.input, errors.confirmarSenha && styles.inputError]}
                placeholder="Digite a senha novamente"
                placeholderTextColor={colors.text.hint}
                value={confirmarSenha}
                onChangeText={(text) => {
                  setConfirmarSenha(text);
                  clearFieldError('confirmarSenha');
                }}
                secureTextEntry
                autoCapitalize="none"
              />
              {renderFieldError('confirmarSenha')}

              {/* General Error */}
              {generalError ? (
                <View style={styles.errorContainer}>
                  <Icon name={IconNames.error} size="sm" color={colors.error.main} />
                  <Text style={styles.errorText}>{generalError}</Text>
                </View>
              ) : null}

              {/* Submit Button */}
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

              {/* Login Link */}
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
  inputError: {
    borderColor: colors.error.main,
    borderWidth: 1.5,
  },
  fieldErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  fieldErrorText: {
    ...textStyles.caption,
    color: colors.error.main,
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
  noteText: {
    ...textStyles.caption,
    color: colors.text.hint,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});

export default CriarConta;
