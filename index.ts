import { AppRegistry, Platform } from 'react-native';
import { App } from './App';
import { name as appName } from './app.json';

// Background/quit-state FCM handler — must be registered before the app renders
if (Platform.OS !== 'web') {
  try {
    const messaging = require('@react-native-firebase/messaging').default;

    messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
      // The OS already shows the system notification automatically.
      // Use this handler for silent data-only messages or any background logic.
      console.log('[FCM] Background message:', remoteMessage?.messageId);
    });
  } catch {
    // Firebase not installed
  }
}

AppRegistry.registerComponent(appName, () => App);
