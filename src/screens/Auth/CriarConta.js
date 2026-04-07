import React, {useState, useEffect, useRef} from 'react';
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
  Animated,
  StatusBar,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, borderRadius, shadows, textStyles } from '../../theme';
import Icon, { IconNames } from '../../components/Icon';
import { api } from '../../api/client';
import {
  ErrorCode,
  getFieldValidationMessage,
  errorLogger,
} from '../../utils/errors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('screen');
const CARD_TOP = Math.max(SCREEN_H * 0.40, 220);

const STEPS = { BASIC: 1, PERSONAL: 2, ADDRESS: 3 };
const TOTAL_STEPS = 3;

const STEP_META = {
  [STEPS.BASIC]:    { icon: 'email',        title: 'Acesso',     subtitle: 'Defina e-mail e senha' },
  [STEPS.PERSONAL]: { icon: 'person',       title: 'Dados',      subtitle: 'Informações pessoais' },
  [STEPS.ADDRESS]:  { icon: 'location-on',  title: 'Endereço',   subtitle: 'Onde você mora?' },
};

const CriarConta = ({navigation}) => {
  const [step, setStep] = useState(STEPS.BASIC);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [matricula, setMatricula] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
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
  const [loadingCep, setLoadingCep] = useState(false);

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const { register } = useAuth();

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 1, duration: 600, delay: 150, useNativeDriver: true }),
      Animated.timing(cardTranslateY, { toValue: 0, duration: 480, delay: 150, useNativeDriver: true }),
    ]).start();
    loadInstituicoes();
  }, []);

  const loadInstituicoes = async () => {
    try {
      setLoadingInstituicoes(true);
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
      setErrors(prev => { const n = {...prev}; delete n[field]; return n; });
    }
    if (generalError) setGeneralError('');
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

  const buscarCep = async (valorCep) => {
    const cepSomenteNumeros = valorCep.replace(/\D/g, '');
    if (cepSomenteNumeros.length === 8) {
      try {
        setLoadingCep(true);
        const response = await fetch(`https://viacep.com.br/ws/${cepSomenteNumeros}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setLogradouro(data.logradouro || '');
          setBairro(data.bairro || '');
          setCidade(data.localidade || '');
          clearFieldError('logradouro');
          clearFieldError('bairro');
          clearFieldError('cidade');
          if (!data.logradouro) {
            Alert.alert('Aviso', 'Este CEP é geral. Por favor, preencha o logradouro e o bairro manualmente.');
          }
        } else {
          Alert.alert('Erro', 'CEP não encontrado na base de dados.');
          setErrors(prev => ({...prev, cep: 'CEP não encontrado'}));
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível buscar o CEP. Verifique sua conexão.');
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
    if (step === STEPS.BASIC && validateStep1()) setStep(STEPS.PERSONAL);
    else if (step === STEPS.PERSONAL && validateStep2()) setStep(STEPS.ADDRESS);
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
          latitude: -23.5505,
          longitude: -46.6333,
        },
      });

      if (result.success) {
        navigation.navigate('Login');
        setTimeout(() => {
          Alert.alert('Conta criada!', 'Seu cadastro foi realizado com sucesso. Faça login para continuar.', [{text: 'OK'}]);
        }, 300);
      } else {
        handleRegistrationError(result);
      }
    } catch (error) {
      errorLogger.error(error, {context: 'CriarConta.handleCriarConta'});
      setGeneralError(error.message || 'Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const fieldStepMap = {
    email: STEPS.BASIC, senha: STEPS.BASIC, confirmarSenha: STEPS.BASIC,
    nome: STEPS.PERSONAL, cpf: STEPS.PERSONAL, matricula: STEPS.PERSONAL,
    instituicaoId: STEPS.PERSONAL, telefone: STEPS.PERSONAL,
    cep: STEPS.ADDRESS, logradouro: STEPS.ADDRESS, numero: STEPS.ADDRESS,
    bairro: STEPS.ADDRESS, cidade: STEPS.ADDRESS,
  };

  const navigateToEarliestErrorStep = (errorFields) => {
    const steps = errorFields.map(f => fieldStepMap[f]).filter(Boolean);
    if (steps.length > 0) setStep(Math.min(...steps));
  };

  const handleRegistrationError = (result) => {
    const {error, errorCode, field, fieldErrors} = result;
    const backendFieldMapping = {'password': 'senha', 'instituicao_id': 'instituicaoId'};
    const validFormFields = ['nome', 'email', 'cpf', 'matricula', 'telefone', 'senha', 'confirmarSenha', 'instituicaoId', 'cep', 'logradouro', 'numero', 'bairro', 'cidade'];
    const extractMessage = (msg) => {
      if (typeof msg === 'string') return msg;
      if (Array.isArray(msg) && msg.length > 0) return typeof msg[0] === 'string' ? msg[0] : 'Campo inválido';
      return 'Campo inválido';
    };

    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
      const mappedErrors = {};
      const unmappedFields = [];
      for (const [fieldName, errorMsg] of Object.entries(fieldErrors)) {
        if (fieldName === 'endereco_casa' && typeof errorMsg === 'object' && !Array.isArray(errorMsg)) {
          for (const [nestedField, nestedError] of Object.entries(errorMsg)) {
            if (validFormFields.includes(nestedField)) mappedErrors[nestedField] = extractMessage(nestedError);
          }
          continue;
        }
        const mappedField = backendFieldMapping[fieldName] || fieldName;
        if (validFormFields.includes(mappedField)) mappedErrors[mappedField] = extractMessage(errorMsg);
        else unmappedFields.push(fieldName);
      }
      if (Object.keys(mappedErrors).length > 0) {
        setErrors(prev => ({...prev, ...mappedErrors}));
        navigateToEarliestErrorStep(Object.keys(mappedErrors));
      }
      if (unmappedFields.length > 0) {
        const fieldLabels = {'endereco_casa': 'Endereço'};
        const unmappedLabels = unmappedFields.map(f => fieldLabels[f] || f).join(', ');
        setGeneralError(`Erro em: ${unmappedLabels}. Verifique os dados e tente novamente.`);
      } else if (Object.keys(mappedErrors).length > 1) {
        setGeneralError('Verifique os campos destacados em vermelho.');
      }
      return;
    }

    if (field) {
      const mappedField = backendFieldMapping[field] || field;
      setErrors(prev => ({...prev, [mappedField]: error}));
      navigateToEarliestErrorStep([mappedField]);
      return;
    }

    const fieldErrorMap = {
      [ErrorCode.EMAIL_ALREADY_EXISTS]: {field: 'email', message: 'Este e-mail já está cadastrado.'},
      [ErrorCode.CPF_ALREADY_EXISTS]:   {field: 'cpf',   message: 'Este CPF já está cadastrado.'},
      [ErrorCode.INVALID_EMAIL]:        {field: 'email', message: 'E-mail inválido.'},
      [ErrorCode.INVALID_CPF]:          {field: 'cpf',   message: 'CPF inválido.'},
      [ErrorCode.INVALID_PASSWORD]:     {field: 'senha', message: error || 'Senha inválida.'},
      [ErrorCode.PASSWORD_TOO_WEAK]:    {field: 'senha', message: error || 'Senha muito fraca.'},
    };

    if (fieldErrorMap[errorCode]) {
      const {field: errField, message: errMsg} = fieldErrorMap[errorCode];
      setErrors(prev => ({...prev, [errField]: errMsg}));
      navigateToEarliestErrorStep([errField]);
      return;
    }

    switch (errorCode) {
      case ErrorCode.REQUIRED_FIELD:
        if (field) {
          const mappedField = backendFieldMapping[field] || field;
          setErrors(prev => ({...prev, [mappedField]: error}));
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

  const meta = STEP_META[step];

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ImageBackground
        source={require('../../../assets/login-background.png')}
        style={styles.background}
        resizeMode="cover"
      />

      {/* Back button — floats above everything */}
      <TouchableOpacity
        style={styles.floatingBack}
        onPress={step > STEPS.BASIC ? goPrevStep : () => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Icon name={IconNames.back} size="md" color="rgba(255,255,255,0.9)" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[styles.card, {marginTop: CARD_TOP, opacity: cardOpacity, transform: [{translateY: cardTranslateY}]}]}
          >
            {/* Step progress bar */}
            <View style={styles.progressBar}>
              {[1, 2, 3].map((s) => (
                <View
                  key={s}
                  style={[styles.progressSegment, s <= step && styles.progressSegmentActive]}
                />
              ))}
            </View>

            {/* Step header */}
            <View style={styles.stepHeader}>
              <View style={styles.stepIconBadge}>
                <Icon name={meta.icon} size="md" color="#0347D0" />
              </View>
              <View>
                <Text style={styles.stepTitle}>{meta.title}</Text>
                <Text style={styles.stepSubtitle}>{meta.subtitle}</Text>
              </View>
              <Text style={styles.stepCounter}>{step}/{TOTAL_STEPS}</Text>
            </View>

            {/* ── Step 1: Acesso ── */}
            {step === STEPS.BASIC && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>E-mail *</Text>
                <View style={[styles.inputWrapper, errors.email ? styles.inputWrapperError : null]}>
                  <Icon name="email" size="md" color={colors.neutral[400]} />
                  <TextInput
                    style={styles.input}
                    placeholder="seu@email.com"
                    placeholderTextColor={colors.neutral[400]}
                    value={email}
                    onChangeText={(text) => { setEmail(text); clearFieldError('email'); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {renderFieldError('email')}

                <Text style={styles.label}>Senha *</Text>
                <View style={[styles.inputWrapper, errors.senha ? styles.inputWrapperError : null]}>
                  <Icon name="lock" size="md" color={colors.neutral[400]} />
                  <TextInput
                    style={[styles.input, styles.inputFlex]}
                    placeholder="Mínimo 8 caracteres"
                    placeholderTextColor={colors.neutral[400]}
                    value={senha}
                    onChangeText={(text) => { setSenha(text); clearFieldError('senha'); }}
                    secureTextEntry={!showSenha}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowSenha(v => !v)} hitSlop={{top:8,bottom:8,left:8,right:8}}>
                    <Icon name={showSenha ? IconNames.visibilityOff : IconNames.visibility} size="md" color={colors.neutral[400]} />
                  </TouchableOpacity>
                </View>
                {renderFieldError('senha')}

                <Text style={styles.label}>Confirmar Senha *</Text>
                <View style={[styles.inputWrapper, errors.confirmarSenha ? styles.inputWrapperError : null]}>
                  <Icon name="lock" size="md" color={colors.neutral[400]} />
                  <TextInput
                    style={[styles.input, styles.inputFlex]}
                    placeholder="Digite a senha novamente"
                    placeholderTextColor={colors.neutral[400]}
                    value={confirmarSenha}
                    onChangeText={(text) => { setConfirmarSenha(text); clearFieldError('confirmarSenha'); }}
                    secureTextEntry={!showConfirmarSenha}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowConfirmarSenha(v => !v)} hitSlop={{top:8,bottom:8,left:8,right:8}}>
                    <Icon name={showConfirmarSenha ? IconNames.visibilityOff : IconNames.visibility} size="md" color={colors.neutral[400]} />
                  </TouchableOpacity>
                </View>
                {renderFieldError('confirmarSenha')}
              </View>
            )}

            {/* ── Step 2: Dados pessoais ── */}
            {step === STEPS.PERSONAL && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nome Completo *</Text>
                <View style={[styles.inputWrapper, errors.nome ? styles.inputWrapperError : null]}>
                  <Icon name="person" size="md" color={colors.neutral[400]} />
                  <TextInput
                    style={styles.input}
                    placeholder="Seu nome completo"
                    placeholderTextColor={colors.neutral[400]}
                    value={nome}
                    onChangeText={(text) => { setNome(text); clearFieldError('nome'); }}
                    autoCapitalize="words"
                  />
                </View>
                {renderFieldError('nome')}

                <Text style={styles.label}>CPF *</Text>
                <View style={[styles.inputWrapper, errors.cpf ? styles.inputWrapperError : null]}>
                  <Icon name="badge" size="md" color={colors.neutral[400]} />
                  <TextInput
                    style={styles.input}
                    placeholder="000.000.000-00"
                    placeholderTextColor={colors.neutral[400]}
                    value={cpf}
                    onChangeText={(text) => { setCpf(formatCPF(text)); clearFieldError('cpf'); }}
                    keyboardType="numeric"
                    maxLength={14}
                  />
                </View>
                {renderFieldError('cpf')}

                <Text style={styles.label}>Matrícula *</Text>
                <View style={[styles.inputWrapper, errors.matricula ? styles.inputWrapperError : null]}>
                  <Icon name="school" size="md" color={colors.neutral[400]} />
                  <TextInput
                    style={styles.input}
                    placeholder="Número da matrícula escolar"
                    placeholderTextColor={colors.neutral[400]}
                    value={matricula}
                    onChangeText={(text) => { setMatricula(text); clearFieldError('matricula'); }}
                  />
                </View>
                {renderFieldError('matricula')}

                <Text style={styles.label}>Instituição de Ensino *</Text>
                {loadingInstituicoes ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color="#0347D0" />
                    <Text style={styles.loadingText}>Carregando instituições...</Text>
                  </View>
                ) : instituicoes.length > 0 ? (
                  <>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={[styles.chipsScroll, errors.instituicaoId ? styles.chipsScrollError : null]}
                    >
                      <View style={styles.chipsRow}>
                        {instituicoes.map((inst) => (
                          <TouchableOpacity
                            key={inst.id}
                            style={[
                              styles.chip,
                              instituicaoId === inst.id && styles.chipActive,
                              errors.instituicaoId && !instituicaoId && styles.chipError,
                            ]}
                            onPress={() => { setInstituicaoId(inst.id); clearFieldError('instituicaoId'); }}
                          >
                            <Text style={[styles.chipText, instituicaoId === inst.id && styles.chipTextActive]}>
                              {inst.nome}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                    {renderFieldError('instituicaoId')}
                  </>
                ) : (
                  <View style={styles.warningRow}>
                    <Icon name={IconNames.warning} size="sm" color={colors.warning.main} />
                    <Text style={styles.warningText}>Nenhuma instituição disponível. Contate o suporte.</Text>
                  </View>
                )}

                <Text style={styles.label}>Telefone</Text>
                <View style={[styles.inputWrapper, errors.telefone ? styles.inputWrapperError : null]}>
                  <Icon name="phone" size="md" color={colors.neutral[400]} />
                  <TextInput
                    style={styles.input}
                    placeholder="(00) 00000-0000"
                    placeholderTextColor={colors.neutral[400]}
                    value={telefone}
                    onChangeText={(text) => { setTelefone(text); clearFieldError('telefone'); }}
                    keyboardType="phone-pad"
                  />
                </View>
                {renderFieldError('telefone')}
              </View>
            )}

            {/* ── Step 3: Endereço ── */}
            {step === STEPS.ADDRESS && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>CEP *</Text>
                <View style={[styles.inputWrapper, errors.cep ? styles.inputWrapperError : null]}>
                  <Icon name="location-on" size="md" color={colors.neutral[400]} />
                  <TextInput
                    style={styles.input}
                    placeholder="00000-000"
                    placeholderTextColor={colors.neutral[400]}
                    value={cep}
                    onChangeText={handleCepChange}
                    keyboardType="numeric"
                    maxLength={9}
                    editable={!loadingCep}
                  />
                  {loadingCep && <ActivityIndicator size="small" color="#0347D0" />}
                </View>
                {renderFieldError('cep')}

                <Text style={styles.label}>Logradouro *</Text>
                <View style={[styles.inputWrapper, errors.logradouro ? styles.inputWrapperError : null]}>
                  <Icon name="home" size="md" color={colors.neutral[400]} />
                  <TextInput
                    style={styles.input}
                    placeholder="Rua, Avenida, etc."
                    placeholderTextColor={colors.neutral[400]}
                    value={logradouro}
                    onChangeText={(text) => { setLogradouro(text); clearFieldError('logradouro'); }}
                  />
                </View>
                {renderFieldError('logradouro')}

                <View style={styles.row}>
                  <View style={styles.halfField}>
                    <Text style={styles.label}>Número *</Text>
                    <View style={[styles.inputWrapper, errors.numero ? styles.inputWrapperError : null]}>
                      <TextInput
                        style={[styles.input, styles.inputNoPad]}
                        placeholder="123"
                        placeholderTextColor={colors.neutral[400]}
                        value={numero}
                        onChangeText={(text) => { setNumero(text); clearFieldError('numero'); }}
                      />
                    </View>
                    {renderFieldError('numero')}
                  </View>
                  <View style={styles.halfField}>
                    <Text style={styles.label}>Bairro *</Text>
                    <View style={[styles.inputWrapper, errors.bairro ? styles.inputWrapperError : null]}>
                      <TextInput
                        style={[styles.input, styles.inputNoPad]}
                        placeholder="Centro"
                        placeholderTextColor={colors.neutral[400]}
                        value={bairro}
                        onChangeText={(text) => { setBairro(text); clearFieldError('bairro'); }}
                      />
                    </View>
                    {renderFieldError('bairro')}
                  </View>
                </View>

                <Text style={styles.label}>Cidade *</Text>
                <View style={[styles.inputWrapper, errors.cidade ? styles.inputWrapperError : null]}>
                  <Icon name="location-city" size="md" color={colors.neutral[400]} />
                  <TextInput
                    style={styles.input}
                    placeholder="São Paulo"
                    placeholderTextColor={colors.neutral[400]}
                    value={cidade}
                    onChangeText={(text) => { setCidade(text); clearFieldError('cidade'); }}
                  />
                </View>
                {renderFieldError('cidade')}
              </View>
            )}

            {/* General error */}
            {generalError ? (
              <View style={styles.errorContainer}>
                <Icon name={IconNames.error} size="sm" color={colors.error.main} />
                <Text style={styles.errorText}>{generalError}</Text>
              </View>
            ) : null}

            {/* Primary action */}
            {step < STEPS.ADDRESS ? (
              <TouchableOpacity style={styles.primaryButton} onPress={goNextStep} activeOpacity={0.88}>
                <Text style={styles.primaryButtonText}>Continuar</Text>
                <Icon name={IconNames.forward} size="md" color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                onPress={handleCriarConta}
                disabled={loading}
                activeOpacity={0.88}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Criar Conta</Text>
                )}
              </TouchableOpacity>
            )}

            {/* Login link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Já tem uma conta?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.8}>
                <Text style={styles.loginLink}>Entrar</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.noteText}>* Campos obrigatórios</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#EEF3FB',
  },

  floatingBack: {
    position: 'absolute',
    top: 48,
    left: spacing.lg,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_W,
    height: SCREEN_H,
  },

  kav: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },

  // ── Card ──────────────────────────────────────────
  card: {
    backgroundColor: colors.background.paper,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    ...shadows.xl,
    minHeight: '100%',
  },

  // ── Progress bar ──────────────────────────────────
  progressBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border.light,
  },

  progressSegmentActive: {
    backgroundColor: '#0347D0',
  },

  // ── Step header ───────────────────────────────────
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },

  stepIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(3,71,208,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  stepTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 22,
  },

  stepSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },

  stepCounter: {
    marginLeft: 'auto',
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: colors.text.disabled,
  },

  // ── Fields ────────────────────────────────────────
  fieldGroup: {
    gap: spacing.xs,
  },

  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[50],
    borderWidth: 1.5,
    borderColor: colors.border.light,
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },

  inputWrapperError: {
    borderColor: colors.error.main,
  },

  input: {
    flex: 1,
    height: '100%',
    color: colors.text.primary,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    paddingVertical: 0,
  },

  inputFlex: {
    paddingRight: spacing.sm,
  },

  inputNoPad: {
    paddingHorizontal: 0,
  },

  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },

  halfField: {
    flex: 1,
  },

  // ── Field error ───────────────────────────────────
  fieldErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },

  fieldErrorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: colors.error.main,
  },

  // ── Institution chips ─────────────────────────────
  chipsScroll: {
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },

  chipsScrollError: {
    marginBottom: 0,
  },

  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  chip: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border.light,
  },

  chipActive: {
    backgroundColor: 'rgba(3,71,208,0.08)',
    borderColor: '#0347D0',
  },

  chipError: {
    borderColor: colors.error.main,
  },

  chipText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: colors.text.secondary,
  },

  chipTextActive: {
    fontFamily: 'Inter-SemiBold',
    color: '#0347D0',
    fontWeight: '600',
  },

  // ── Loading / warning ─────────────────────────────
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.base,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    marginTop: spacing.xs,
  },

  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: colors.text.secondary,
  },

  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.base,
    backgroundColor: colors.warning.lighter,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.warning.main,
    marginTop: spacing.xs,
  },

  warningText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: colors.warning.dark,
    flex: 1,
  },

  // ── General error ─────────────────────────────────
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.base,
    borderLeftWidth: 3,
    borderLeftColor: colors.error.main,
  },

  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: colors.error.dark,
    flex: 1,
  },

  // ── Primary button ────────────────────────────────
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: '#0347D0',
    marginTop: spacing.xl,
    ...shadows.sm,
  },

  primaryButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  primaryButtonDisabled: {
    opacity: 0.65,
  },

  // ── Login row ─────────────────────────────────────
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
  },

  loginText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.text.secondary,
  },

  loginLink: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    fontWeight: '700',
    color: '#0347D0',
  },

  noteText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: colors.text.disabled,
    textAlign: 'center',
    marginTop: spacing.base,
  },
});

export default CriarConta;
