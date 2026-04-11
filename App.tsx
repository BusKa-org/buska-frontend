import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import MainNavigator from './src/navigation/MainNavigator';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ToastProvider } from './src/components';
import SplashScreen from './src/screens/SplashScreen';
import { Platform } from 'react-native';

const Root: React.FC = () => {
  const { loading } = useAuth();

  const DEBUG_HOLD_SPLASH = __DEV__ && Platform.OS !== 'web';
  const [released, setReleased] = React.useState(!DEBUG_HOLD_SPLASH);

  if (loading || !released) {
    return <SplashScreen onContinue={() => setReleased(true)} />;
  }

  return <MainNavigator />;
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <NavigationContainer
          documentTitle={{
            formatter: (options, route) =>
              `BusKá - ${options?.title ?? route?.name ?? 'Transporte Escolar'}`,
          }}
        >
          <Root />
        </NavigationContainer>
      </AuthProvider>
    </ToastProvider>
  );
};