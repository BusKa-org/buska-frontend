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
import { colors, spacing, borderRadius, shadows, textStyles, fontSize, fontWeight } from '../../theme';
import Icon, { IconNames } from '../../components/Icon';

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
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name={IconNames.back} size="md" color={colors.secondary.contrast} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Chat</Text>
            <Text style={styles.headerSubtitle}>Gestor Municipal</Text>
          </View>
          <View style={styles.headerIcon}>
            <Icon name={IconNames.chat} size="lg" color={colors.secondary.contrast} />
          </View>
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
                <Text style={[
                  styles.mensagemTexto,
                  mensagem.remetente === 'motorista' && { color: colors.text.inverse }
                ]}>{mensagem.texto}</Text>
                <Text style={[
                  styles.mensagemHorario,
                  mensagem.remetente === 'motorista' && { color: colors.text.inverse, opacity: 0.8 }
                ]}>{mensagem.horario}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            placeholderTextColor={colors.text.hint}
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
    backgroundColor: colors.background.default,
  },
  header: {
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    ...textStyles.h3,
    color: colors.secondary.contrast,
  },
  headerSubtitle: {
    ...textStyles.bodySmall,
    color: colors.secondary.light,
    marginTop: spacing.xs,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  mensagensContainer: {
    flex: 1,
  },
  mensagensContent: {
    padding: spacing.base,
  },
  mensagemContainer: {
    marginBottom: spacing.base,
    alignItems: 'flex-start',
  },
  mensagemContainerMotorista: {
    alignItems: 'flex-end',
  },
  mensagem: {
    maxWidth: '80%',
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.xs,
  },
  mensagemMotorista: {
    backgroundColor: colors.secondary.main,
    borderColor: colors.secondary.main,
  },
  mensagemTexto: {
    ...textStyles.body,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  mensagemHorario: {
    ...textStyles.caption,
    color: colors.text.hint,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.base,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    alignItems: 'flex-end',
    ...shadows.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
    ...textStyles.inputText,
    maxHeight: 100,
    marginRight: spacing.sm,
  },
  enviarButton: {
    backgroundColor: colors.secondary.main,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    ...shadows.xs,
  },
  enviarButtonDisabled: {
    backgroundColor: colors.border.light,
  },
  enviarButtonText: {
    ...textStyles.button,
    color: colors.text.inverse,
  },
});

export default ChatGestor;


