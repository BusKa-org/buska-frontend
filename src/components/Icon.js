/**
 * BusKá Icon Component
 * 
 * Wrapper around Material Icons (from react-native-vector-icons)
 * Provides consistent icon usage with theme integration
 * 
 * Usage:
 *   import Icon from '../components/Icon';
 *   <Icon name="directions-bus" size="md" color={colors.primary.main} />
 * 
 * Common icons for BusKá:
 *   - directions-bus: Bus/vehicle
 *   - route: Routes/paths
 *   - location-on: Location/points
 *   - person: User/student
 *   - notifications: Notifications
 *   - settings: Settings
 *   - home: Dashboard
 *   - schedule: Time/schedule
 *   - check-circle: Success/confirmed
 *   - warning: Warning
 *   - error: Error
 *   - add: Add new
 *   - edit: Edit
 *   - delete: Delete
 *   - arrow-back: Back navigation
 *   - arrow-forward: Forward/next
 *   - menu: Menu
 *   - close: Close/dismiss
 *   - search: Search
 *   - refresh: Refresh
 *   - play-arrow: Start
 *   - stop: Stop/end
 *   - my-location: Current location
 *   - group: Students/group
 *   - badge: ID/badge
 *   - chat: Chat/messages
 */

import React from 'react';
import { Platform, Text, StyleSheet } from 'react-native';
import { colors, iconSize as themeSizes } from '../theme';

// Conditionally import the icon library
let MaterialIcons;
try {
  MaterialIcons = require('react-native-vector-icons/MaterialIcons').default;
} catch (e) {
  // Fallback for web or if icons aren't linked
  MaterialIcons = null;
}

// Size presets mapping to theme
const sizeMap = {
  xs: themeSizes.xs,    // 12
  sm: themeSizes.sm,    // 16
  md: themeSizes.md,    // 20
  base: themeSizes.base, // 24 (default)
  lg: themeSizes.lg,    // 28
  xl: themeSizes.xl,    // 32
  xxl: themeSizes.xxl,  // 40
  huge: themeSizes.huge, // 48
};

/**
 * Icon component with Material Symbols Rounded styling
 * 
 * @param {string} name - Icon name (Material Icons naming)
 * @param {string|number} size - Size preset ('sm', 'md', 'lg', etc.) or number
 * @param {string} color - Color (defaults to primary text color)
 * @param {object} style - Additional styles
 */
const Icon = ({ 
  name, 
  size = 'base', 
  color = colors.text.primary, 
  style,
  ...props 
}) => {
  // Resolve size
  const resolvedSize = typeof size === 'string' 
    ? (sizeMap[size] || themeSizes.base) 
    : size;

  // If MaterialIcons is available, use it
  if (MaterialIcons) {
    return (
      <MaterialIcons
        name={name}
        size={resolvedSize}
        color={color}
        style={style}
        {...props}
      />
    );
  }

  // Fallback for web or when icons aren't linked
  // Uses a simple text placeholder
  return (
    <Text 
      style={[
        styles.fallback, 
        { fontSize: resolvedSize, color },
        style,
      ]}
      {...props}
    >
      ●
    </Text>
  );
};

// Named exports for common icon sets
export const IconNames = {
  // Navigation
  home: 'home',
  back: 'arrow-back',
  forward: 'arrow-forward',
  menu: 'menu',
  close: 'close',
  
  // Transport
  bus: 'directions-bus',
  route: 'route',
  location: 'location-on',
  myLocation: 'my-location',
  map: 'map',
  
  // Users
  person: 'person',
  group: 'group',
  badge: 'badge',
  
  // Actions
  add: 'add',
  edit: 'edit',
  delete: 'delete',
  search: 'search',
  refresh: 'refresh',
  settings: 'settings',
  
  // Status
  checkCircle: 'check-circle',
  warning: 'warning',
  error: 'error',
  info: 'info',
  
  // Communication
  notifications: 'notifications',
  notificationsOff: 'notifications-off',
  chat: 'chat',
  
  // Time/Schedule
  schedule: 'schedule',
  calendarToday: 'calendar-today',
  
  // Trip controls
  play: 'play-arrow',
  stop: 'stop',
  pause: 'pause',
  
  // Misc
  visibility: 'visibility',
  visibilityOff: 'visibility-off',
  chevronRight: 'chevron-right',
  chevronLeft: 'chevron-left',
  expandMore: 'expand-more',
  expandLess: 'expand-less',
  moreVert: 'more-vert',
  moreHoriz: 'more-horiz',
  logout: 'logout',
  login: 'login',
};

const styles = StyleSheet.create({
  fallback: {
    textAlign: 'center',
  },
});

export default Icon;
