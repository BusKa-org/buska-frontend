# BusKá Design System - Usage Guide

## Quick Start

```javascript
// Import what you need
import { 
  colors, 
  spacing, 
  borderRadius, 
  shadows, 
  textStyles 
} from '../theme';
```

## Color Palette

### Primary Colors (Deep Navy - Trust & Professionalism)
```javascript
colors.primary.main      // #0F2942 - Primary buttons, headers
colors.primary.light     // #1A3A5C - Hover states
colors.primary.dark      // #091B2D - Emphasis
```

### Secondary Colors (Electric Teal - Tech-Forward)
```javascript
colors.secondary.main    // #00B4D8 - Accent buttons, links
colors.secondary.light   // #48CAE4 - Hover states
```

### Accent Colors (Warm Gold - Highlights)
```javascript
colors.accent.main       // #F7B32B - CTAs, important highlights
```

## Example: Styled Button

```javascript
import { colors, spacing, borderRadius, shadows, textStyles } from '../theme';

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.base,      // 16px
    paddingHorizontal: spacing.xl,      // 24px
    borderRadius: borderRadius.md,      // 8px
    ...shadows.sm,
  },
  buttonText: {
    ...textStyles.button,
    color: colors.primary.contrast,
  },
});
```

## Example: Card Component

```javascript
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.paper,
    padding: spacing.base,
    borderRadius: borderRadius.lg,       // 12px
    marginBottom: spacing.md,            // 12px
    ...shadows.sm,
  },
  cardTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  cardSubtitle: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
});
```

## Example: Form Input

```javascript
const styles = StyleSheet.create({
  label: {
    ...textStyles.inputLabel,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background.paper,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    ...textStyles.inputText,
    color: colors.text.primary,
  },
  inputFocused: {
    borderColor: colors.secondary.main,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.error.main,
  },
});
```

## Role-Based Colors

```javascript
// For badges, indicators by user role
colors.roles.aluno       // #00B4D8 - Teal
colors.roles.motorista   // #0F2942 - Navy
colors.roles.gestor      // #F7B32B - Gold
```

## Status Colors

```javascript
colors.status.active     // #10B981 - Green
colors.status.pending    // #F59E0B - Amber
colors.status.completed  // #64748B - Gray
colors.status.cancelled  // #EF4444 - Red
```

## Semantic Colors

```javascript
colors.success.main      // Green for success messages
colors.warning.main      // Amber for warnings
colors.error.main        // Red for errors
colors.info.main         // Blue for information
```

## Using Helper Functions

```javascript
import { withOpacity, getButtonStyle, getCardStyle, getInputStyle } from '../theme';

// Add opacity to any color
const overlayColor = withOpacity(colors.primary.main, 0.5);

// Get pre-built component styles
const primaryBtn = getButtonStyle('primary');
const outlineBtn = getButtonStyle('outline');
const defaultCard = getCardStyle('default');
const focusedInput = getInputStyle('focused');
```

## Migration Checklist

When updating existing screens:

1. Replace hardcoded colors:
   - `#1a73e8` → `colors.primary.main` or `colors.secondary.main`
   - `#f5f5f5` → `colors.background.default`
   - `#333` → `colors.text.primary`
   - `#666` → `colors.text.secondary`
   - `#ddd` → `colors.border.light`

2. Replace hardcoded spacing:
   - `24` → `spacing.xl`
   - `16` → `spacing.base`
   - `12` → `spacing.md`
   - `8` → `spacing.sm`

3. Replace hardcoded border radius:
   - `8` → `borderRadius.md`
   - `12` → `borderRadius.lg`
   - `16` → `borderRadius.xl`

4. Add shadows from the system:
   - Cards: `...shadows.sm`
   - Modals: `...shadows.xl`
   - Buttons: `...shadows.xs`
