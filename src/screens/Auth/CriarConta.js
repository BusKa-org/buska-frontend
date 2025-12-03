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
} from 'react-native';

const CriarConta = ({navigation}) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('aluno'); // aluno, motorista, gestor

  const handleCriarConta = () => {
    // Simulação de criação de conta
    console.log('Criar conta:', {
      nome,
      email,
      senha,
      confirmarSenha,
      tipoUsuario,
    });
    // Aqui você navegaria para a tela principal após criação
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
                style={styles.input}
                placeholder="Seu nome completo"
                placeholderTextColor="#999"
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
              />

              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
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

              <TouchableOpacity
                style={styles.criarContaButton}
                onPress={handleCriarConta}>
                <Text style={styles.criarContaButtonText}>Criar Conta</Text>
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
});

export default CriarConta;


