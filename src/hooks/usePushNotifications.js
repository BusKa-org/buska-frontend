import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { userService } from '../services/userService';
import { errorLogger } from '../utils/errors';

let messagingModule = null;

if (Platform.OS !== 'web') {
  try {
    messagingModule = require('@react-native-firebase/messaging').default;
  } catch {
    // Firebase not installed
  }
}

// Cache the singleton instance to avoid concurrent initialisation (IOConcurrency)
let messagingInstance = null;
const getMessaging = () => {
  if (!messagingModule) return null;
  if (!messagingInstance) messagingInstance = messagingModule();
  return messagingInstance;
};

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
    const m = getMessaging();
    if (!isAuthenticated || !m) return;

    // ── Token registration ──────────────────────────────────────────────────
    const registerToken = async () => {
      try {
        const authStatus = await m.requestPermission();
        const granted =
          authStatus === messagingModule.AuthorizationStatus.AUTHORIZED ||
          authStatus === messagingModule.AuthorizationStatus.PROVISIONAL;

        if (!granted) {
          errorLogger.debug('Push notification permission denied');
          return;
        }

        const token = await m.getToken();
        if (token) {
          await userService.updateFcmToken(token);
          errorLogger.info('FCM token registered');
        }
      } catch (error) {
        errorLogger.error(error, { context: 'usePushNotifications:registerToken' });
      }
    };

    registerToken();

    // ── Token refresh ───────────────────────────────────────────────────────
    const unsubscribeTokenRefresh = m.onTokenRefresh(async (newToken) => {
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
    const unsubscribeForeground = m.onMessage(async (remoteMessage) => {
      const title = remoteMessage.notification?.title ?? '';
      const body  = remoteMessage.notification?.body  ?? '';
      errorLogger.debug('FCM foreground', { title });
      if (onForegroundMessage) {
        onForegroundMessage({ title, body, remoteMessage });
      }
    });

    // ── Background notification tap ─────────────────────────────────────────
    // Fires when the user taps a system notification while the app is in background.
    const unsubscribeBackgroundTap = m.onNotificationOpenedApp((remoteMessage) => {
      errorLogger.debug('FCM background tap', { messageId: remoteMessage.messageId });
      if (onNotificationTap) {
        onNotificationTap(remoteMessage);
      }
    });

    // ── Quit-state notification tap ─────────────────────────────────────────
    // getInitialNotification resolves once; if null the app was opened normally.
    m.getInitialNotification()
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
