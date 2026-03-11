import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { userService } from '../services/userService';
import { errorLogger } from '../utils/errors';

let messaging = null;

if (Platform.OS !== 'web') {
  try {
    messaging = require('@react-native-firebase/messaging').default;
  } catch {
    // Firebase not installed
  }
}

/**
 * Full push notification lifecycle:
 *   - Registers the device FCM token with the backend
 *   - Foreground: calls onForegroundMessage so the UI can show a Toast
 *   - Background: system notification shown automatically by the OS;
 *     onNotificationTap is called when the user taps it
 *   - Quit state: system notification shown automatically;
 *     onNotificationTap is called on the first render after cold start
 *
 * @param {boolean} isAuthenticated
 * @param {function} [onForegroundMessage]  ({ title, body }) => void
 * @param {function} [onNotificationTap]    (remoteMessage) => void  — optional navigation
 */
export const usePushNotifications = (
  isAuthenticated,
  onForegroundMessage,
  onNotificationTap,
) => {
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !messaging) return;

    // ── Token registration ──────────────────────────────────────────────────
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
          console.log('[FCM TOKEN]', token); // remove after testing
        }
      } catch (error) {
        errorLogger.error(error, { context: 'usePushNotifications:registerToken' });
      }
    };

    registerToken();

    // ── Token refresh ───────────────────────────────────────────────────────
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
      try {
        await userService.updateFcmToken(newToken);
        errorLogger.info('FCM token refreshed');
      } catch (error) {
        errorLogger.error(error, { context: 'usePushNotifications:onTokenRefresh' });
      }
    });

    // ── Foreground messages ─────────────────────────────────────────────────
    // FCM does NOT show a system notification while the app is open.
    // We surface it via Toast so the user still sees it.
    const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
      const title = remoteMessage.notification?.title ?? '';
      const body  = remoteMessage.notification?.body  ?? '';
      errorLogger.debug('FCM foreground', { title });
      if (onForegroundMessage) {
        onForegroundMessage({ title, body, remoteMessage });
      }
    });

    // ── Background notification tap ─────────────────────────────────────────
    // Fires when the user taps a system notification while the app is in background.
    const unsubscribeBackgroundTap = messaging().onNotificationOpenedApp((remoteMessage) => {
      errorLogger.debug('FCM background tap', { messageId: remoteMessage.messageId });
      if (onNotificationTap) {
        onNotificationTap(remoteMessage);
      }
    });

    // ── Quit-state notification tap ─────────────────────────────────────────
    // getInitialNotification resolves once; if null the app was opened normally.
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          errorLogger.debug('FCM quit-state tap', { messageId: remoteMessage.messageId });
          if (onNotificationTap) {
            onNotificationTap(remoteMessage);
          }
        }
      })
      .catch((error) => {
        errorLogger.error(error, { context: 'usePushNotifications:getInitialNotification' });
      });

    unsubscribeRef.current = () => {
      unsubscribeTokenRefresh();
      unsubscribeForeground();
      unsubscribeBackgroundTap();
    };

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [isAuthenticated, onForegroundMessage, onNotificationTap]);
};
