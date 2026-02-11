/**
 * BusKá Spacing System
 * 
 * Based on 4px grid system for consistent spacing
 * All values are multiples of 4 for visual harmony
 */

// ===========================================
// BASE SPACING SCALE (4px grid)
// ===========================================
export const spacing = {
  none: 0,
  xxs: 2,         // 2px - Micro spacing
  xs: 4,          // 4px - Tight spacing
  sm: 8,          // 8px - Small spacing
  md: 12,         // 12px - Medium spacing
  base: 16,       // 16px - Base spacing (default)
  lg: 20,         // 20px - Large spacing
  xl: 24,         // 24px - Extra large
  xxl: 32,        // 32px - 2x large
  xxxl: 40,       // 40px - 3x large
  huge: 48,       // 48px - Huge spacing
  massive: 64,    // 64px - Massive spacing
};

// ===========================================
// COMPONENT-SPECIFIC SPACING
// ===========================================

// Screen/Container padding
export const screenPadding = {
  horizontal: spacing.base,     // 16px
  vertical: spacing.xl,         // 24px
  top: spacing.xl,              // 24px
  bottom: spacing.xxl,          // 32px
};

// Card spacing
export const cardSpacing = {
  padding: spacing.base,        // 16px
  paddingLarge: spacing.lg,     // 20px
  margin: spacing.md,           // 12px
  marginBottom: spacing.base,   // 16px
  gap: spacing.md,              // 12px between elements
};

// Form spacing
export const formSpacing = {
  labelMarginBottom: spacing.sm,    // 8px
  inputMarginBottom: spacing.base,  // 16px
  fieldGap: spacing.lg,             // 20px between fields
  sectionGap: spacing.xl,           // 24px between sections
  helperMarginTop: spacing.xs,      // 4px
};

// Button spacing
export const buttonSpacing = {
  paddingVertical: spacing.base,    // 16px
  paddingHorizontal: spacing.xl,    // 24px
  paddingSmall: spacing.md,         // 12px
  gap: spacing.md,                  // 12px between buttons
};

// List spacing
export const listSpacing = {
  itemPadding: spacing.base,        // 16px
  itemGap: spacing.md,              // 12px
  sectionGap: spacing.xl,           // 24px
  headerMarginBottom: spacing.base, // 16px
};

// Modal spacing
export const modalSpacing = {
  padding: spacing.xl,              // 24px
  headerMarginBottom: spacing.base, // 16px
  footerMarginTop: spacing.xl,      // 24px
  buttonGap: spacing.md,            // 12px
};

// ===========================================
// LAYOUT HELPERS
// ===========================================
export const layout = {
  // Common gap values
  gap: {
    xs: spacing.xs,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
    xl: spacing.xl,
  },
  
  // Section margins
  sectionMargin: {
    small: spacing.base,
    medium: spacing.xl,
    large: spacing.xxl,
  },
};

// ===========================================
// BORDER RADIUS
// ===========================================
export const borderRadius = {
  none: 0,
  xs: 4,          // Subtle rounding
  sm: 6,          // Small elements
  md: 8,          // Default (inputs, buttons)
  lg: 12,         // Cards
  xl: 16,         // Large cards
  xxl: 20,        // Prominent cards
  full: 9999,     // Pills, avatars
};

// ===========================================
// ICON SIZES
// ===========================================
export const iconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  base: 24,       // Default icon size
  lg: 28,
  xl: 32,
  xxl: 40,
  huge: 48,
};

// ===========================================
// AVATAR SIZES
// ===========================================
export const avatarSize = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  xxl: 80,
  huge: 120,
};

// ===========================================
// HIT SLOP (for touch targets)
// ===========================================
export const hitSlop = {
  small: { top: 8, right: 8, bottom: 8, left: 8 },
  medium: { top: 12, right: 12, bottom: 12, left: 12 },
  large: { top: 16, right: 16, bottom: 16, left: 16 },
};

export default {
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
};
