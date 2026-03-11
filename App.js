import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigator from './src/navigation/MainNavigator';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ToastProvider } from './src/components';
import SplashScreen from './src/screens/SplashScreen';

const Root = () => {
  const { loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return <MainNavigator />;
};

function App() {
  const isWeb = Platform.OS === 'web';

  return (
    <ToastProvider>
      <AuthProvider>
        {isWeb ? (
          <Root />
        ) : (
          <NavigationContainer>
            <Root />
          </NavigationContainer>
        )}
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;