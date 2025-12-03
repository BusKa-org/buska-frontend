import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const ChatGestor = ({navigation}) => {
  const [mensagens, setMensagens] = useState([
    {
      id: 1,
      texto: 'Olá! Tudo certo com a rota de hoje?',
      remetente: 'gestor',
      horario: '08:00',
    },
    {
      id: 2,
      texto: 'Tudo certo! Viagem iniciada normalmente.',
      remetente: 'motorista',
      horario: '08:05',
    },
    {
      id: 3,
      texto: 'Ótimo! Qualquer problema, me avise.',
      remetente: 'gestor',
      horario: '08:06',
    },
  ]);

  const [novaMensagem, setNovaMensagem] = useState('');

  const handleEnviarMensagem = () => {
    if (novaMensagem.trim()) {
      const mensagem = {
        id: mensagens.length + 1,
        texto: novaMensagem,
        remetente: 'motorista',
        horario: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMensagens([...mensagens, mensagem]);
      setNovaMensagem('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Chat com Gestor</Text>
          <Text style={styles.subtitle}>Gestor Municipal</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          style={styles.mensagensContainer}
          contentContainerStyle={styles.mensagensContent}>
          {mensagens.map((mensagem) => (
            <View
              key={mensagem.id}
              style={[
                styles.mensagemContainer,
                mensagem.remetente === 'motorista' &&
                  styles.mensagemContainerMotorista,
              ]}>
              <View
                style={[
                  styles.mensagem,
                  mensagem.remetente === 'motorista' &&
                    styles.mensagemMotorista,
                ]}>
                <Text style={styles.mensagemTexto}>{mensagem.texto}</Text>
                <Text style={styles.mensagemHorario}>{mensagem.horario}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#999"
            value={novaMensagem}
            onChangeText={setNovaMensagem}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.enviarButton,
              !novaMensagem.trim() && styles.enviarButtonDisabled,
            ]}
            onPress={handleEnviarMensagem}
            disabled={!novaMensagem.trim()}>
            <Text style={styles.enviarButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#1a73e8',
  },
  headerInfo: {
    marginTop: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  keyboardView: {
    flex: 1,
  },
  mensagensContainer: {
    flex: 1,
  },
  mensagensContent: {
    padding: 16,
  },
  mensagemContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  mensagemContainerMotorista: {
    alignItems: 'flex-end',
  },
  mensagem: {
    maxWidth: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mensagemMotorista: {
    backgroundColor: '#1a73e8',
    borderColor: '#1a73e8',
  },
  mensagemTexto: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  mensagemHorario: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  enviarButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  enviarButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  enviarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatGestor;


