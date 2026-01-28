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
  
  // Address fields
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  
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
    
    // Instituição
    if (!instituicaoId) {
      newErrors.instituicaoId = 'Selecione uma instituição de ensino.';
    }
    
    // Endereço
    if (!cep.trim()) {
      newErrors.cep = 'CEP é obrigatório.';
    }
    if (!logradouro.trim()) {
      newErrors.logradouro = 'Logradouro é obrigatório.';
    }
    if (!numero.trim()) {
      newErrors.numero = 'Número é obrigatório.';
    }
    if (!bairro.trim()) {
      newErrors.bairro = 'Bairro é obrigatório.';
    }
    if (!cidade.trim()) {
      newErrors.cidade = 'Cidade é obrigatória.';
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
        endereco_casa: {
          logradouro: logradouro.trim(),
          numero: numero.trim(),
          bairro: bairro.trim(),
          cidade: cidade.trim(),
          cep: cep.replace(/\D/g, ''),
          // Default coordinates (can be updated later via geocoding)
          latitude: -23.5505,
          longitude: -46.6333,
        },
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
    const { error, errorCode, field, fieldErrors } = result;
    
    // Debug: log the full error result
    console.log('Registration error result:', JSON.stringify(result, null, 2));
    
    // Handle multiple field errors from backend
    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
      console.log('fieldErrors received:', fieldErrors);
      
      // Map backend field names to form field names
      const fieldMapping = {
        'password': 'senha',
        'instituicao_id': 'instituicaoId',
      };
      
      // Valid form fields that exist in the UI (including address fields)
      const validFormFields = ['nome', 'email', 'cpf', 'matricula', 'telefone', 'senha', 'confirmarSenha', 'instituicaoId', 'cep', 'logradouro', 'numero', 'bairro', 'cidade'];
      
      const mappedErrors = {};
      const unmappedFields = [];
      
      // Helper to extract error message
      const extractMessage = (errorMsg) => {
        if (typeof errorMsg === 'string') return errorMsg;
        if (Array.isArray(errorMsg) && errorMsg.length > 0) {
          return typeof errorMsg[0] === 'string' ? errorMsg[0] : 'Campo inválido';
        }
        return 'Campo inválido';
      };
      
      for (const [fieldName, errorMsg] of Object.entries(fieldErrors)) {
        // Handle nested endereco_casa errors
        if (fieldName === 'endereco_casa' && typeof errorMsg === 'object' && !Array.isArray(errorMsg)) {
          // Flatten nested address errors
          for (const [nestedField, nestedError] of Object.entries(errorMsg)) {
            if (validFormFields.includes(nestedField)) {
              mappedErrors[nestedField] = extractMessage(nestedError);
            }
          }
          continue;
        }
        
        const mappedField = fieldMapping[fieldName] || fieldName;
        
        // Only set error if field exists in the form
        if (validFormFields.includes(mappedField)) {
          mappedErrors[mappedField] = extractMessage(errorMsg);
        } else {
          // Track unmapped fields for general error
          unmappedFields.push(fieldName);
        }
      }
      
      console.log('mappedErrors:', mappedErrors);
      console.log('unmappedFields:', unmappedFields);
      
      // Set field errors
      if (Object.keys(mappedErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...mappedErrors }));
      }
      
      // Show general error for unmapped fields or when multiple errors exist
      if (unmappedFields.length > 0) {
        // Build a user-friendly message for unmapped fields
        const fieldLabels = {
          'endereco_casa': 'Endereço',
        };
        const unmappedLabels = unmappedFields.map(f => fieldLabels[f] || f).join(', ');
        setGeneralError(`Erro em: ${unmappedLabels}. Verifique os dados e tente novamente.`);
      } else if (Object.keys(mappedErrors).length > 1) {
        setGeneralError('Verifique os campos destacados em vermelho.');
      }
      return;
    }
    
    // Handle single field-specific error
    if (field) {
      const fieldMapping = { 'password': 'senha', 'instituicao_id': 'instituicaoId' };
      const mappedField = fieldMapping[field] || field;
      setErrors(prev => ({ ...prev, [mappedField]: error }));
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
      case ErrorCode.INVALID_PASSWORD:
      case ErrorCode.PASSWORD_TOO_WEAK:
        setErrors(prev => ({ ...prev, senha: error || 'Senha inválida.' }));
        break;
      case ErrorCode.REQUIRED_FIELD:
        // Field should be set by the parser
        if (field) {
          const fieldMapping = { 'password': 'senha' };
          const mappedField = fieldMapping[field] || field;
          setErrors(prev => ({ ...prev, [mappedField]: error }));
        } else {
          setGeneralError(error || 'Preencha todos os campos obrigatórios.');
        }
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

              {/* Institution selection - moved before telefone for better UX */}
              <Text style={styles.label}>Instituição de Ensino *</Text>
              {loadingInstituicoes ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary.main} />
                  <Text style={styles.loadingText}>Carregando instituições...</Text>
                </View>
              ) : instituicoes.length > 0 ? (
                <>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.instituicoesScroll, errors.instituicaoId && styles.instituicoesScrollError]}>
                    <View style={styles.instituicoesContainer}>
                      {instituicoes.map((inst) => (
                        <TouchableOpacity
                          key={inst.id}
                          style={[
                            styles.instituicaoButton,
                            instituicaoId === inst.id && styles.instituicaoButtonActive,
                            errors.instituicaoId && !instituicaoId && styles.instituicaoButtonError,
                          ]}
                          onPress={() => {
                            setInstituicaoId(inst.id);
                            clearFieldError('instituicaoId');
                          }}>
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
                  {renderFieldError('instituicaoId')}
                </>
              ) : (
                <View style={styles.noInstituicoesContainer}>
                  <Icon name={IconNames.warning} size="sm" color={colors.warning.main} />
                  <Text style={styles.noInstituicoesText}>Nenhuma instituição disponível. Contate o suporte.</Text>
                </View>
              )}

              {/* Telefone */}
              <Text style={styles.label}>Telefone</Text>
              <TextInput
                style={[styles.input, errors.telefone && styles.inputError]}
                placeholder="(00) 00000-0000"
                placeholderTextColor={colors.text.hint}
                value={telefone}
                onChangeText={(text) => {
                  setTelefone(text);
                  clearFieldError('telefone');
                }}
                keyboardType="phone-pad"
              />
              {renderFieldError('telefone')}

              {/* Address Section */}
              <Text style={styles.sectionTitle}>Endereço Residencial</Text>
              
              {/* CEP */}
              <Text style={styles.label}>CEP *</Text>
              <TextInput
                style={[styles.input, errors.cep && styles.inputError]}
                placeholder="00000-000"
                placeholderTextColor={colors.text.hint}
                value={cep}
                onChangeText={(text) => {
                  setCep(text);
                  clearFieldError('cep');
                }}
                keyboardType="numeric"
                maxLength={9}
              />
              {renderFieldError('cep')}

              {/* Logradouro */}
              <Text style={styles.label}>Logradouro *</Text>
              <TextInput
                style={[styles.input, errors.logradouro && styles.inputError]}
                placeholder="Rua, Avenida, etc."
                placeholderTextColor={colors.text.hint}
                value={logradouro}
                onChangeText={(text) => {
                  setLogradouro(text);
                  clearFieldError('logradouro');
                }}
              />
              {renderFieldError('logradouro')}

              {/* Número e Bairro (row) */}
              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Número *</Text>
                  <TextInput
                    style={[styles.input, errors.numero && styles.inputError]}
                    placeholder="123"
                    placeholderTextColor={colors.text.hint}
                    value={numero}
                    onChangeText={(text) => {
                      setNumero(text);
                      clearFieldError('numero');
                    }}
                  />
                  {renderFieldError('numero')}
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Bairro *</Text>
                  <TextInput
                    style={[styles.input, errors.bairro && styles.inputError]}
                    placeholder="Centro"
                    placeholderTextColor={colors.text.hint}
                    value={bairro}
                    onChangeText={(text) => {
                      setBairro(text);
                      clearFieldError('bairro');
                    }}
                  />
                  {renderFieldError('bairro')}
                </View>
              </View>

              {/* Cidade */}
              <Text style={styles.label}>Cidade *</Text>
              <TextInput
                style={[styles.input, errors.cidade && styles.inputError]}
                placeholder="São Paulo"
                placeholderTextColor={colors.text.hint}
                value={cidade}
                onChangeText={(text) => {
                  setCidade(text);
                  clearFieldError('cidade');
                }}
              />
              {renderFieldError('cidade')}

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
  sectionTitle: {
    ...textStyles.h4,
    color: colors.secondary.main,
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfField: {
    flex: 1,
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
  instituicoesScrollError: {
    marginBottom: 0,
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
  instituicaoButtonError: {
    borderColor: colors.error.main,
  },
  instituicaoText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.base,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
  },
  loadingText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  noInstituicoesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.base,
    backgroundColor: colors.warning.lighter,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.warning.main,
  },
  noInstituicoesText: {
    ...textStyles.bodySmall,
    color: colors.warning.dark,
    flex: 1,
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
