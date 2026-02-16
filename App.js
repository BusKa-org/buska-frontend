import React from 'react';
import {Platform} from 'react-native';
import MainNavigator from './src/navigation/MainNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { ToastProvider } from './src/components';

// Detecta se está na web
const isWeb = Platform.OS === 'web' || typeof window !== 'undefined';

// Para mobile, usa NavigationContainer do React Navigation
let NavigationContainer = null;

if (!isWeb) {
  try {
    const ReactNavigation = require('@react-navigation/native');
    NavigationContainer = ReactNavigation.NavigationContainer;
  } catch (e) {
    // React Navigation not available
  }
}

function App() {
  // Se estiver na web ou NavigationContainer não estiver disponível, renderiza diretamente
  if (isWeb || !NavigationContainer) {
    return (
      <AuthProvider>
        <ToastProvider>
          <MainNavigator />
        </ToastProvider>
      </AuthProvider>
    );
  }

  // Para mobile, usa NavigationContainer
  return (
    <AuthProvider>
      <ToastProvider>
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;


