import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {motoristaService} from '../../services/motoristaService';
import {useAuth} from '../../contexts/AuthContext';
import {useToast} from '../../components/Toast';
import { colors, spacing, borderRadius, shadows, textStyles, fontSize, fontWeight, lineHeight } from '../../theme';
import Icon, { IconNames } from '../../components/Icon';

const CriarRota = ({navigation}) => {
  const {user} = useAuth();
  const toast = useToast();
  const [nomeRota, setNomeRota] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCriarRota = async () => {
    if (!nomeRota.trim()) {
      toast.error('Por favor, informe o nome da rota');
      return;
    }

    if (!user?.prefeitura_id) {
      toast.error('Você não possui um município cadastrado. Entre em contato com o gestor.');
      return;
    }

    try {
      setLoading(true);
      const response = await motoristaService.criarRota({ nome: nomeRota.trim() });
      const rotaId = response?.id;
      
      if (!rotaId) {
        toast.error('Rota criada mas ID não disponível. Tente novamente.');
        return;
      }
      
      // Create rota object with the info we have
      const rotaData = {
        id: rotaId,
        nome: nomeRota.trim(),
      };
      
      toast.success('Rota criada com sucesso!');
      
      // Navigate directly after success
      navigation.navigate('DefinirPontosRota', {
        rota: rotaData,
        isNovaRota: true,
      });
    } catch (error) {
      console.error('Error creating route:', error);
      toast.error(error?.message || 'Não foi possível criar a rota. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name={IconNames.back} size="md" color={colors.secondary.main} />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Criar Nova Rota</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.infoBox}>
            <Icon name={IconNames.location} size="md" color={colors.info.main} />
            <Text style={styles.infoText}>
              Crie uma nova rota para seu município. Após criar, você poderá
              adicionar os pontos de parada.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome da Rota *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Rota Centro - Zona Norte"
                placeholderTextColor={colors.text.hint}
                value={nomeRota}
                onChangeText={setNomeRota}
                editable={!loading}
              />
              <Text style={styles.helperText}>
                Escolha um nome descritivo para a rota
              </Text>
            </View>

            {user?.prefeitura_id && (
              <View style={styles.municipioInfo}>
                <Text style={styles.municipioLabel}>Município:</Text>
                <Text style={styles.municipioNome}>
                  {user.municipio_nome || user.prefeitura_nome || 'Configurado'}
                  {user.municipio_uf ? ` - ${user.municipio_uf}` : ''}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.criarButton, loading && styles.criarButtonDisabled]}
              onPress={handleCriarRota}
              disabled={loading || !nomeRota.trim()}>
              {loading ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <Text style={styles.criarButtonText}>Criar Rota</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    backgroundColor: colors.background.paper,
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    ...shadows.sm,
  },
  backButton: {
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backButtonText: {
    ...textStyles.body,
    color: colors.secondary.main,
  },
  title: {
    ...textStyles.h2,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.base,
  },
  infoBox: {
    backgroundColor: colors.info.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.info.main,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  infoText: {
    ...textStyles.bodySmall,
    color: colors.info.dark,
    lineHeight: fontSize.bodySmall * lineHeight.relaxed,
    flex: 1,
  },
  form: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...textStyles.inputLabel,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...textStyles.inputText,
    borderWidth: 1,
    borderColor: colors.border.light,
    color: colors.text.primary,
  },
  helperText: {
    ...textStyles.inputHelper,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  municipioInfo: {
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  municipioLabel: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  municipioNome: {
    ...textStyles.body,
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
  },
  criarButton: {
    backgroundColor: colors.secondary.main,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    alignItems: 'center',
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  criarButtonDisabled: {
    backgroundColor: colors.border.light,
  },
  criarButtonText: {
    ...textStyles.button,
    color: colors.text.inverse,
  },
});

export default CriarRota;

