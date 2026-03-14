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

const STEPS = { BASIC: 1, PERSONAL: 2, ADDRESS: 3 };
const TOTAL_STEPS = 3;

const CriarConta = ({navigation}) => {
  const [step, setStep] = useState(STEPS.BASIC);
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
      // Use public endpoint (no auth required)
      const response = await api.get('/instituicoes/public');
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

  const validateStep1 = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = getFieldValidationMessage('email', 'required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = getFieldValidationMessage('email', 'invalid');
    }
    if (!senha) {
      newErrors.senha = getFieldValidationMessage('password', 'required');
    } else if (senha.length < 8) {
      newErrors.senha = getFieldValidationMessage('password', 'minLength');
    }
    if (senha !== confirmarSenha) {
      newErrors.confirmarSenha = getFieldValidationMessage('password', 'mismatch');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const [loadingCep, setLoadingCep] = useState(false);
  const buscarCep = async (valorCep) => {
  const cepSomenteNumeros = valorCep.replace(/\D/g, '');

  if (cepSomenteNumeros.length === 8) {
    try {
      setLoadingCep(true);

      const response = await fetch(`https://viacep.com.br/ws/${cepSomenteNumeros}/json/`);
      const data = await response.json();
      
      console.log("Resposta do ViaCEP:", data); 
      if (!data.erro) {
        setLogradouro(data.logradouro || '');
        setBairro(data.bairro || '');
        setCidade(data.localidade || '');
        
        clearFieldError('logradouro');
        clearFieldError('bairro');
        clearFieldError('cidade');
        
        if (!data.logradouro) {
           Alert.alert("Aviso", "Este CEP é geral. Por favor, preencha o logradouro e o bairro manualmente.");
        }
      } else {
        Alert.alert("Erro", "CEP não encontrado na base de dados.");
        setErrors(prev => ({ ...prev, cep: 'CEP não encontrado' }));
      }
    } catch (error) {
      console.error("Erro na requisição do CEP:", error);
      Alert.alert("Erro", "Não foi possível buscar o CEP. Verifique sua conexão.");
    } finally {
      setLoadingCep(false);
    }
  }
};

  const handleCepChange = (texto) => {
    let cepFormatado = texto.replace(/\D/g, '');
    if (cepFormatado.length > 5) {
      cepFormatado = cepFormatado.replace(/^(\d{5})(\d)/, '$1-$2');
    }
    
    setCep(cepFormatado);
    clearFieldError('cep');

    buscarCep(cepFormatado);
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!nome.trim()) {
      newErrors.nome = getFieldValidationMessage('nome', 'required');
    } else if (nome.trim().length < 3) {
      newErrors.nome = getFieldValidationMessage('nome', 'minLength');
    }
    const cpfDigits = cpf.replace(/\D/g, '');
    if (!cpfDigits) {
      newErrors.cpf = getFieldValidationMessage('cpf', 'required');
    } else if (cpfDigits.length !== 11) {
      newErrors.cpf = getFieldValidationMessage('cpf', 'invalid');
    }
    if (!matricula.trim()) {
      newErrors.matricula = getFieldValidationMessage('matricula', 'required');
    }
    if (!instituicaoId) {
      newErrors.instituicaoId = 'Selecione uma instituição de ensino.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!cep.trim()) newErrors.cep = 'CEP é obrigatório.';
    if (!logradouro.trim()) newErrors.logradouro = 'Logradouro é obrigatório.';
    if (!numero.trim()) newErrors.numero = 'Número é obrigatório.';
    if (!bairro.trim()) newErrors.bairro = 'Bairro é obrigatório.';
    if (!cidade.trim()) newErrors.cidade = 'Cidade é obrigatória.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNextStep = () => {
    setGeneralError('');
    if (step === STEPS.BASIC && validateStep1()) {
      setStep(STEPS.PERSONAL);
    } else if (step === STEPS.PERSONAL && validateStep2()) {
      setStep(STEPS.ADDRESS);
    }
  };

  const goPrevStep = () => {
    setGeneralError('');
    setErrors({});
    if (step === STEPS.PERSONAL) setStep(STEPS.BASIC);
    else if (step === STEPS.ADDRESS) setStep(STEPS.PERSONAL);
  };

  const handleCriarConta = async () => {
    setGeneralError('');
    if (!validateStep3()) return;

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

  // Which step each form field belongs to — used to navigate back when
  // the backend returns errors for fields on a previous step.
  const fieldStepMap = {
    email: STEPS.BASIC, senha: STEPS.BASIC, confirmarSenha: STEPS.BASIC,
    nome: STEPS.PERSONAL, cpf: STEPS.PERSONAL, matricula: STEPS.PERSONAL,
    instituicaoId: STEPS.PERSONAL, telefone: STEPS.PERSONAL,
    cep: STEPS.ADDRESS, logradouro: STEPS.ADDRESS, numero: STEPS.ADDRESS,
    bairro: STEPS.ADDRESS, cidade: STEPS.ADDRESS,
  };

  // Navigate to the earliest step that has at least one error.
  const navigateToEarliestErrorStep = (errorFields) => {
    const steps = errorFields.map(f => fieldStepMap[f]).filter(Boolean);
    if (steps.length > 0) {
      setStep(Math.min(...steps));
    }
  };

  const handleRegistrationError = (result) => {
    const { error, errorCode, field, fieldErrors } = result;

    const backendFieldMapping = {
      'password': 'senha',
      'instituicao_id': 'instituicaoId',
    };
    const validFormFields = ['nome', 'email', 'cpf', 'matricula', 'telefone', 'senha', 'confirmarSenha', 'instituicaoId', 'cep', 'logradouro', 'numero', 'bairro', 'cidade'];

    const extractMessage = (errorMsg) => {
      if (typeof errorMsg === 'string') return errorMsg;
      if (Array.isArray(errorMsg) && errorMsg.length > 0) {
        return typeof errorMsg[0] === 'string' ? errorMsg[0] : 'Campo inválido';
      }
      return 'Campo inválido';
    };

    // Multiple field errors from backend (400 validation)
    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
      const mappedErrors = {};
      const unmappedFields = [];

      for (const [fieldName, errorMsg] of Object.entries(fieldErrors)) {
        if (fieldName === 'endereco_casa' && typeof errorMsg === 'object' && !Array.isArray(errorMsg)) {
          for (const [nestedField, nestedError] of Object.entries(errorMsg)) {
            if (validFormFields.includes(nestedField)) {
              mappedErrors[nestedField] = extractMessage(nestedError);
            }
          }
          continue;
        }
        const mappedField = backendFieldMapping[fieldName] || fieldName;
        if (validFormFields.includes(mappedField)) {
          mappedErrors[mappedField] = extractMessage(errorMsg);
        } else {
          unmappedFields.push(fieldName);
        }
      }

      if (Object.keys(mappedErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...mappedErrors }));
        navigateToEarliestErrorStep(Object.keys(mappedErrors));
      }

      if (unmappedFields.length > 0) {
        const fieldLabels = { 'endereco_casa': 'Endereço' };
        const unmappedLabels = unmappedFields.map(f => fieldLabels[f] || f).join(', ');
        setGeneralError(`Erro em: ${unmappedLabels}. Verifique os dados e tente novamente.`);
      } else if (Object.keys(mappedErrors).length > 1) {
        setGeneralError('Verifique os campos destacados em vermelho.');
      }
      return;
    }

    // Single field error
    if (field) {
      const mappedField = backendFieldMapping[field] || field;
      setErrors(prev => ({ ...prev, [mappedField]: error }));
      navigateToEarliestErrorStep([mappedField]);
      return;
    }

    // Known error codes that map to a specific field
    const fieldErrorMap = {
      [ErrorCode.EMAIL_ALREADY_EXISTS]: { field: 'email', message: 'Este e-mail já está cadastrado.' },
      [ErrorCode.CPF_ALREADY_EXISTS]:   { field: 'cpf',   message: 'Este CPF já está cadastrado.' },
      [ErrorCode.INVALID_EMAIL]:        { field: 'email', message: 'E-mail inválido.' },
      [ErrorCode.INVALID_CPF]:          { field: 'cpf',   message: 'CPF inválido.' },
      [ErrorCode.INVALID_PASSWORD]:     { field: 'senha', message: error || 'Senha inválida.' },
      [ErrorCode.PASSWORD_TOO_WEAK]:    { field: 'senha', message: error || 'Senha muito fraca.' },
    };

    if (fieldErrorMap[errorCode]) {
      const { field: errField, message: errMsg } = fieldErrorMap[errorCode];
      setErrors(prev => ({ ...prev, [errField]: errMsg }));
      navigateToEarliestErrorStep([errField]);
      return;
    }

    switch (errorCode) {
      case ErrorCode.REQUIRED_FIELD:
        if (field) {
          const mappedField = backendFieldMapping[field] || field;
          setErrors(prev => ({ ...prev, [mappedField]: error }));
          navigateToEarliestErrorStep([mappedField]);
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
              onPress={step > STEPS.BASIC ? goPrevStep : () => navigation.goBack()}>
              <Icon name={IconNames.back} size="base" color={colors.text.secondary} />
            </TouchableOpacity>

            {/* Header + Progress */}
            <View style={styles.header}>
              <Text style={styles.brandName}>BusKá</Text>
              <Text style={styles.title}>Cadastro de Aluno</Text>
              <Text style={styles.subtitle}>
                {step === STEPS.BASIC && 'Informações básicas'}
                {step === STEPS.PERSONAL && 'Informações pessoais'}
                {step === STEPS.ADDRESS && 'Endereço'}
              </Text>
              <View style={styles.progressContainer}>
                {[1, 2, 3].map((s) => (
                  <View
                    key={s}
                    style={[
                      styles.progressDot,
                      s === step && styles.progressDotActive,
                      s < step && styles.progressDotDone,
                    ]}
                  />
                ))}
                <Text style={styles.progressText}>{step} de {TOTAL_STEPS}</Text>
              </View>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Step 1: Básico (email, senha, confirmar senha) */}
              {step === STEPS.BASIC && (
                <>
                  <Text style={styles.label}>E-mail *</Text>
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="seu@email.com"
                    placeholderTextColor={colors.text.hint}
                    value={email}
                    onChangeText={(text) => { setEmail(text); clearFieldError('email'); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {renderFieldError('email')}

                  <Text style={styles.label}>Senha *</Text>
                  <TextInput
                    style={[styles.input, errors.senha && styles.inputError]}
                    placeholder="Mínimo 8 caracteres"
                    placeholderTextColor={colors.text.hint}
                    value={senha}
                    onChangeText={(text) => { setSenha(text); clearFieldError('senha'); }}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                  {renderFieldError('senha')}

                  <Text style={styles.label}>Confirmar Senha *</Text>
                  <TextInput
                    style={[styles.input, errors.confirmarSenha && styles.inputError]}
                    placeholder="Digite a senha novamente"
                    placeholderTextColor={colors.text.hint}
                    value={confirmarSenha}
                    onChangeText={(text) => { setConfirmarSenha(text); clearFieldError('confirmarSenha'); }}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                  {renderFieldError('confirmarSenha')}
                </>
              )}

              {/* Step 2: Informações pessoais */}
              {step === STEPS.PERSONAL && (
                <>
                  <Text style={styles.label}>Nome Completo *</Text>
                  <TextInput
                    style={[styles.input, errors.nome && styles.inputError]}
                    placeholder="Seu nome completo"
                    placeholderTextColor={colors.text.hint}
                    value={nome}
                    onChangeText={(text) => { setNome(text); clearFieldError('nome'); }}
                    autoCapitalize="words"
                  />
                  {renderFieldError('nome')}

                  <Text style={styles.label}>CPF *</Text>
                  <TextInput
                    style={[styles.input, errors.cpf && styles.inputError]}
                    placeholder="000.000.000-00"
                    placeholderTextColor={colors.text.hint}
                    value={cpf}
                    onChangeText={(text) => { setCpf(formatCPF(text)); clearFieldError('cpf'); }}
                    keyboardType="numeric"
                    maxLength={14}
                  />
                  {renderFieldError('cpf')}

                  <Text style={styles.label}>Matrícula *</Text>
                  <TextInput
                    style={[styles.input, errors.matricula && styles.inputError]}
                    placeholder="Número da matrícula escolar"
                    placeholderTextColor={colors.text.hint}
                    value={matricula}
                    onChangeText={(text) => { setMatricula(text); clearFieldError('matricula'); }}
                  />
                  {renderFieldError('matricula')}

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
                              onPress={() => { setInstituicaoId(inst.id); clearFieldError('instituicaoId'); }}>
                              <Text style={[styles.instituicaoText, instituicaoId === inst.id && styles.instituicaoTextActive]}>
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

                  <Text style={styles.label}>Telefone</Text>
                  <TextInput
                    style={[styles.input, errors.telefone && styles.inputError]}
                    placeholder="(00) 00000-0000"
                    placeholderTextColor={colors.text.hint}
                    value={telefone}
                    onChangeText={(text) => { setTelefone(text); clearFieldError('telefone'); }}
                    keyboardType="phone-pad"
                  />
                  {renderFieldError('telefone')}
                </>
              )}

              {/* Step 3: Endereço */}
              {step === STEPS.ADDRESS && (
                <>
                  {/* CEP */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.label}>CEP *</Text>
                    {loadingCep && <ActivityIndicator size="small" color={colors.primary.main} />}
                  </View>
                  <TextInput
                    style={[styles.input, errors.cep && styles.inputError]}
                    placeholder="00000-000"
                    placeholderTextColor={colors.text.hint}
                    value={cep}
                    onChangeText={handleCepChange}
                    keyboardType="numeric"
                    maxLength={9}
                    editable={!loadingCep}
                  />
                  {renderFieldError('cep')}

                  <Text style={styles.label}>Logradouro *</Text>
                  <TextInput
                    style={[styles.input, errors.logradouro && styles.inputError]}
                    placeholder="Rua, Avenida, etc."
                    placeholderTextColor={colors.text.hint}
                    value={logradouro}
                    onChangeText={(text) => { setLogradouro(text); clearFieldError('logradouro'); }}
                  />
                  {renderFieldError('logradouro')}

                  <View style={styles.row}>
                    <View style={styles.halfField}>
                      <Text style={styles.label}>Número *</Text>
                      <TextInput
                        style={[styles.input, errors.numero && styles.inputError]}
                        placeholder="123"
                        placeholderTextColor={colors.text.hint}
                        value={numero}
                        onChangeText={(text) => { setNumero(text); clearFieldError('numero'); }}
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
                        onChangeText={(text) => { setBairro(text); clearFieldError('bairro'); }}
                      />
                      {renderFieldError('bairro')}
                    </View>
                  </View>

                  <Text style={styles.label}>Cidade *</Text>
                  <TextInput
                    style={[styles.input, errors.cidade && styles.inputError]}
                    placeholder="São Paulo"
                    placeholderTextColor={colors.text.hint}
                    value={cidade}
                    onChangeText={(text) => { setCidade(text); clearFieldError('cidade'); }}
                  />
                  {renderFieldError('cidade')}
                </>
              )}

              {/* General Error */}
              {generalError ? (
                <View style={styles.errorContainer}>
                  <Icon name={IconNames.error} size="sm" color={colors.error.main} />
                  <Text style={styles.errorText}>{generalError}</Text>
                </View>
              ) : null}

              {/* Primary action: Continuar or Criar Conta */}
              {step < STEPS.ADDRESS ? (
                <TouchableOpacity style={styles.criarContaButton} onPress={goNextStep}>
                  <Text style={styles.criarContaButtonText}>Continuar</Text>
                  <Icon name={IconNames.forward} size="md" color={colors.primary.contrast} />
                </TouchableOpacity>
              ) : (
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
              )}

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Já tem uma conta? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Entrar</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.noteText}>* Campos obrigatórios</Text>
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border.light,
  },
  progressDotActive: {
    backgroundColor: colors.primary.main,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  progressDotDone: {
    backgroundColor: colors.primary.main,
  },
  progressText: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
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
