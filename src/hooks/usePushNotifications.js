import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { userService } from '../services/userService';
import { errorLogger } from '../utils/errors';

let messaging = null;

// Only import Firebase on native platforms - it's not available on web
if (Platform.OS !== 'web') {
  try {
    messaging = require('@react-native-firebase/messaging').default;
  } catch {
    // Firebase not installed yet
  }
}

/**
 * Registers this device for FCM push notifications and syncs the token
 * with the backend. Also sets up a foreground message listener.
 *
 * Must be called after the user is authenticated.
 *
 * @param {boolean} isAuthenticated - Whether a user session is active
 * @param {function} [onForegroundMessage] - Optional callback for foreground notifications
 */
export const usePushNotifications = (isAuthenticated, onForegroundMessage) => {
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !messaging) return;

    const registerToken = async () => {
      try {
        const authStatus = await messaging().requestPermission();
        const granted =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!granted) {
          errorLogger.debug('Push notification permission denied');
          return;
        }

        const token = await messaging().getToken();
        if (token) {
          await userService.updateFcmToken(token);
          errorLogger.info('FCM token registered');
        }
      } catch (error) {
        // Non-fatal: push notifications are a best-effort feature
        errorLogger.error(error, { context: 'usePushNotifications:registerToken' });
      }
    };

    registerToken();

    // Listen for token refreshes so the backend always has a valid token
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
      try {
        await userService.updateFcmToken(newToken);
        errorLogger.info('FCM token refreshed');
      } catch (error) {
        errorLogger.error(error, { context: 'usePushNotifications:onTokenRefresh' });
      }
    });

    // Handle notifications received while the app is in the foreground
    const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
      errorLogger.debug('Foreground push received', { title: remoteMessage.notification?.title });
      if (onForegroundMessage) {
        onForegroundMessage(remoteMessage);
      }
    });

    unsubscribeRef.current = () => {
      unsubscribeTokenRefresh();
      unsubscribeForeground();
    };

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [isAuthenticated, onForegroundMessage]);
};
