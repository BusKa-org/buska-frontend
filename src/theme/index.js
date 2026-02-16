/**
 * BusKá Design System
 * 
 * Centralized theme configuration for the entire app
 * Import from here: import { colors, spacing, ... } from '../theme';
 */

// Core tokens
export { default as colors, colors as Colors } from './colors';
export { 
  default as typography,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textStyles,
} from './typography';
export { 
  default as spacingSystem,
  spacing,
  screenPadding,
  cardSpacing,
  formSpacing,
  buttonSpacing,
  listSpacing,
  modalSpacing,
  layout,
  borderRadius,
  iconSize,
  avatarSize,
  hitSlop,
} from './spacing';
export { 
  default as shadowSystem,
  shadows,
  componentShadows,
  coloredShadows,
} from './shadows';

// ===========================================
// COMBINED THEME OBJECT
// ===========================================
import colors from './colors';
import typography from './typography';
import spacingModule from './spacing';
import shadowModule from './shadows';

const theme = {
  colors,
  typography,
  ...spacingModule,
  ...shadowModule,
  
  // App-specific constants
  app: {
    name: 'BusKá',
    tagline: 'Gestão Municipal de Transporte Escolar',
    version: '1.0.0',
  },
};

export default theme;

// ===========================================
// QUICK ACCESS HELPERS
// ===========================================

/**
 * Get color with opacity
 * @param {string} hex - Hex color
 * @param {number} opacity - Opacity 0-1
 */
export const withOpacity = (hex, opacity) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Create consistent button styles
 * @param {'primary' | 'secondary' | 'accent' | 'outline' | 'ghost'} variant
 */
export const getButtonStyle = (variant = 'primary') => {
  const { borderRadius: br } = spacingModule;
  const { buttonSpacing: bs } = spacingModule;
  
  const base = {
    paddingVertical: bs.paddingVertical,
    paddingHorizontal: bs.paddingHorizontal,
    borderRadius: br.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  };

  const variants = {
    primary: {
      ...base,
      backgroundColor: colors.primary.main,
    },
    secondary: {
      ...base,
      backgroundColor: colors.secondary.main,
    },
    accent: {
      ...base,
      backgroundColor: colors.accent.main,
    },
    outline: {
      ...base,
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.primary.main,
    },
    ghost: {
      ...base,
      backgroundColor: 'transparent',
    },
  };

  return variants[variant] || variants.primary;
};

/**
 * Create consistent card styles
 * @param {'default' | 'elevated' | 'outlined'} variant
 */
export const getCardStyle = (variant = 'default') => {
  const { borderRadius: br, cardSpacing: cs } = spacingModule;
  const { shadows: sh } = shadowModule;
  
  const base = {
    padding: cs.padding,
    borderRadius: br.lg,
    backgroundColor: colors.background.paper,
  };

  const variants = {
    default: {
      ...base,
      ...sh.sm,
    },
    elevated: {
      ...base,
      ...sh.lg,
    },
    outlined: {
      ...base,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
  };

  return variants[variant] || variants.default;
};

/**
 * Create consistent input styles
 * @param {'default' | 'focused' | 'error'} state
 */
export const getInputStyle = (state = 'default') => {
  const { borderRadius: br, formSpacing: fs, spacing: sp } = spacingModule;
  
  const base = {
    backgroundColor: colors.background.paper,
    borderWidth: 1,
    borderRadius: br.md,
    paddingVertical: sp.base,
    paddingHorizontal: sp.base,
    fontSize: typography.fontSize.input,
    color: colors.text.primary,
  };

  const states = {
    default: {
      ...base,
      borderColor: colors.border.light,
    },
    focused: {
      ...base,
      borderColor: colors.secondary.main,
      borderWidth: 2,
    },
    error: {
      ...base,
      borderColor: colors.error.main,
      borderWidth: 1,
    },
  };

  return states[state] || states.default;
};
