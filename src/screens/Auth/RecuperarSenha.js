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
import { colors, spacing, borderRadius, shadows, textStyles } from '../../theme';
import Icon, { IconNames } from '../../components/Icon';

const RecuperarSenha = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleRecuperarSenha = () => {
    console.log('Recuperar senha:', {email});
    setEnviado(true);
  };

  if (enviado) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <Icon name={IconNames.checkCircle} size="huge" color={colors.success.main} />
            </View>
            <Text style={styles.successTitle}>E-mail Enviado!</Text>
            <Text style={styles.successText}>
              Enviamos um link de recuperação para
            </Text>
            <Text style={styles.emailText}>{email}</Text>
            <Text style={styles.successSubtext}>
              Verifique sua caixa de entrada e siga as instruções para
              redefinir sua senha.
            </Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Login')}>
              <Icon name={IconNames.back} size="md" color={colors.primary.contrast} />
              <Text style={styles.backButtonText}>Voltar ao Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
              style={styles.navBackButton}
              onPress={() => navigation.goBack()}>
              <Icon name={IconNames.back} size="base" color={colors.text.secondary} />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIconContainer}>
                <Icon name="lock-reset" size="xxl" color={colors.secondary.main} />
              </View>
              <Text style={styles.title}>Recuperar Senha</Text>
              <Text style={styles.subtitle}>
                Digite seu e-mail para receber{'\n'}um link de recuperação
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Text style={styles.label}>E-mail</Text>
              <View style={styles.inputContainer}>
                <Icon name="email" size="md" color={colors.text.hint} />
                <TextInput
                  style={styles.input}
                  placeholder="seu@email.com"
                  placeholderTextColor={colors.text.hint}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={styles.recuperarButton}
                onPress={handleRecuperarSenha}>
                <Icon name="send" size="md" color={colors.primary.contrast} />
                <Text style={styles.recuperarButtonText}>
                  Enviar Link de Recuperação
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backLink}
                onPress={() => navigation.navigate('Login')}>
                <Icon name={IconNames.back} size="sm" color={colors.secondary.main} />
                <Text style={styles.backLinkText}>Voltar ao Login</Text>
              </TouchableOpacity>
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
  navBackButton: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.xl,
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.paper,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.xs,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary.lighter,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...textStyles.h1,
    color: colors.primary.main,
    marginBottom: spacing.base,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  label: {
    ...textStyles.inputLabel,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.base,
    fontSize: textStyles.inputText.fontSize,
    color: colors.text.primary,
  },
  recuperarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    ...shadows.sm,
  },
  recuperarButtonText: {
    ...textStyles.button,
    color: colors.primary.contrast,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
  },
  backLinkText: {
    ...textStyles.bodySmall,
    color: colors.secondary.main,
  },
  successContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successTitle: {
    ...textStyles.h2,
    color: colors.text.primary,
    marginBottom: spacing.base,
  },
  successText: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  emailText: {
    ...textStyles.h5,
    color: colors.secondary.main,
    marginVertical: spacing.sm,
  },
  successSubtext: {
    ...textStyles.bodySmall,
    color: colors.text.hint,
    textAlign: 'center',
    marginTop: spacing.base,
    marginBottom: spacing.xxl,
    lineHeight: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    width: '100%',
    ...shadows.sm,
  },
  backButtonText: {
    ...textStyles.button,
    color: colors.primary.contrast,
  },
});

export default RecuperarSenha;
