/**
 * Button Component
 * 
 * Accessible, reusable button with multiple variants
 */
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors, spacing, textStyles, borderRadius, shadows } from '../theme';
import Icon from './Icon';

const VARIANTS = {
  primary: {
    backgroundColor: colors.primary.main,
    textColor: colors.text.inverse,
    borderColor: 'transparent',
  },
  secondary: {
    backgroundColor: colors.secondary.main,
    textColor: colors.text.inverse,
    borderColor: 'transparent',
  },
  outline: {
    backgroundColor: 'transparent',
    textColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  ghost: {
    backgroundColor: 'transparent',
    textColor: colors.primary.main,
    borderColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.error.main,
    textColor: colors.text.inverse,
    borderColor: 'transparent',
  },
  success: {
    backgroundColor: colors.success.main,
    textColor: colors.text.inverse,
    borderColor: 'transparent',
  },
};

const SIZES = {
  sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    fontSize: textStyles.bodySmall.fontSize,
    iconSize: 'xs',
  },
  md: {
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.lg,
    fontSize: textStyles.button.fontSize,
    iconSize: 'sm',
  },
  lg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    fontSize: textStyles.button.fontSize,
    iconSize: 'md',
  },
};

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
}) => {
  const variantStyle = VARIANTS[variant] || VARIANTS.primary;
  const sizeStyle = SIZES[size] || SIZES.md;

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
        },
        variant === 'outline' && styles.outlineButton,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      testID={testID}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyle.textColor} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Icon 
              name={icon} 
              size={sizeStyle.iconSize} 
              color={isDisabled ? colors.text.disabled : variantStyle.textColor} 
            />
          )}
          <Text
            style={[
              styles.text,
              { 
                color: isDisabled ? colors.text.disabled : variantStyle.textColor,
                fontSize: sizeStyle.fontSize,
              },
              icon && iconPosition === 'left' && styles.textWithIconLeft,
              icon && iconPosition === 'right' && styles.textWithIconRight,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Icon 
              name={icon} 
              size={sizeStyle.iconSize} 
              color={isDisabled ? colors.text.disabled : variantStyle.textColor} 
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 44, // Minimum touch target for accessibility
  },
  outlineButton: {
    borderWidth: 2,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...textStyles.button,
    textAlign: 'center',
  },
  textWithIconLeft: {
    marginLeft: spacing.sm,
  },
  textWithIconRight: {
    marginRight: spacing.sm,
  },
});

export default Button;
