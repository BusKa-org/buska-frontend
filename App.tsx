import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import MainNavigator from './src/navigation/MainNavigator';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ToastProvider } from './src/components';
import SplashScreen from './src/screens/SplashScreen';

const Root: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
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

/**
 * import React from "react";
import { Text, View } from "react-native";

export const App: React.FC = () => (
  <View>
    <Text>BusKá Web Test</Text>
  </View>
);
 */