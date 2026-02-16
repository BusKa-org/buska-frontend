/**
 * BusKá Shadow System
 * 
 * Shadows for elevation and depth
 * Platform-specific implementations for iOS and Android
 */

import { Platform } from 'react-native';

// ===========================================
// SHADOW DEFINITIONS
// ===========================================

/**
 * Creates platform-specific shadow styles
 * @param {number} elevation - Android elevation value
 * @param {object} iosShadow - iOS shadow properties
 */
const createShadow = (elevation, iosShadow) => {
  return Platform.select({
    ios: {
      shadowColor: iosShadow.color || '#000',
      shadowOffset: iosShadow.offset,
      shadowOpacity: iosShadow.opacity,
      shadowRadius: iosShadow.radius,
    },
    android: {
      elevation,
    },
    default: {
      boxShadow: `${iosShadow.offset.width}px ${iosShadow.offset.height}px ${iosShadow.radius}px ${iosShadow.color || 'rgba(0,0,0,0.1)'}`,
    },
  });
};

// ===========================================
// SHADOW SCALE
// ===========================================
export const shadows = {
  // No shadow
  none: createShadow(0, {
    offset: { width: 0, height: 0 },
    opacity: 0,
    radius: 0,
  }),

  // Extra small - Subtle depth (inputs, small cards)
  xs: createShadow(1, {
    offset: { width: 0, height: 1 },
    opacity: 0.05,
    radius: 2,
  }),

  // Small - Light shadow (cards at rest)
  sm: createShadow(2, {
    offset: { width: 0, height: 1 },
    opacity: 0.08,
    radius: 3,
  }),

  // Medium - Default shadow (cards, buttons)
  md: createShadow(4, {
    offset: { width: 0, height: 2 },
    opacity: 0.1,
    radius: 6,
  }),

  // Large - Elevated elements (dropdowns, tooltips)
  lg: createShadow(8, {
    offset: { width: 0, height: 4 },
    opacity: 0.12,
    radius: 10,
  }),

  // Extra large - Modals, dialogs
  xl: createShadow(12, {
    offset: { width: 0, height: 6 },
    opacity: 0.15,
    radius: 14,
  }),

  // 2x large - Floating elements
  xxl: createShadow(16, {
    offset: { width: 0, height: 8 },
    opacity: 0.18,
    radius: 20,
  }),
};

// ===========================================
// COMPONENT-SPECIFIC SHADOWS
// ===========================================
export const componentShadows = {
  // Cards
  card: shadows.sm,
  cardHover: shadows.md,
  cardElevated: shadows.lg,

  // Buttons
  button: shadows.xs,
  buttonPressed: shadows.none,
  buttonFloating: shadows.lg,

  // Inputs
  input: shadows.none,
  inputFocused: shadows.xs,

  // Navigation
  header: shadows.sm,
  bottomTab: shadows.lg,
  fab: shadows.xl,

  // Overlays
  dropdown: shadows.lg,
  modal: shadows.xxl,
  tooltip: shadows.md,

  // Lists
  listItem: shadows.none,
  listItemSelected: shadows.xs,
};

// ===========================================
// COLORED SHADOWS (for special effects)
// ===========================================
export const coloredShadows = {
  primary: createShadow(8, {
    color: '#0F2942',
    offset: { width: 0, height: 4 },
    opacity: 0.25,
    radius: 10,
  }),

  secondary: createShadow(8, {
    color: '#00B4D8',
    offset: { width: 0, height: 4 },
    opacity: 0.25,
    radius: 10,
  }),

  accent: createShadow(8, {
    color: '#F7B32B',
    offset: { width: 0, height: 4 },
    opacity: 0.25,
    radius: 10,
  }),

  success: createShadow(8, {
    color: '#10B981',
    offset: { width: 0, height: 4 },
    opacity: 0.25,
    radius: 10,
  }),

  error: createShadow(8, {
    color: '#EF4444',
    offset: { width: 0, height: 4 },
    opacity: 0.25,
    radius: 10,
  }),
};

// ===========================================
// INNER SHADOWS (for inset effects)
// Note: React Native doesn't natively support inner shadows
// This is for documentation/web fallback
// ===========================================
export const innerShadows = {
  // Use these with care - may need workarounds on mobile
  subtle: {
    // Simulate with border or overlay
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
};

export default {
  shadows,
  componentShadows,
  coloredShadows,
  innerShadows,
};
