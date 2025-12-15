import React, { useEffect } from 'react';
import {Platform, View, ActivityIndicator, StyleSheet} from 'react-native';
import SelecaoFluxo from '../screens/SelecaoFluxo';
import AlunoNavigator from './AlunoNavigator';
import MotoristaNavigator from './MotoristaNavigator';
import AuthNavigator from './AuthNavigator';
import { useAuth } from '../contexts/AuthContext';
import {
  NavigationProvider,
  Navigator,
  Screen,
} from './SimpleNavigator';

// Detecta se está na web
const isWeb = Platform.OS === 'web' || typeof window !== 'undefined';

// Para mobile, tenta usar React Navigation
let NativeStackNavigator = null;
let createNativeStackNavigator = null;

if (!isWeb) {
  try {
    const ReactNavigation = require('@react-navigation/native-stack');
    createNativeStackNavigator = ReactNavigation.createNativeStackNavigator;
  } catch (e) {
    console.log('React Navigation não disponível, usando navegação simples');
  }
}

const MainNavigator = () => {
  const { isAuthenticated, user, loading } = useAuth();

  // Log para debug
  console.log('MainNavigator render:', { isAuthenticated, loading, userId: user?.id });

  // Show loading screen while checking auth status
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  // If not authenticated, show auth screens
  // AuthNavigator already has its own NavigationProvider, so return it directly
  if (!isAuthenticated) {
    console.log('MainNavigator: Redirecionando para AuthNavigator');
    return <AuthNavigator />;
  }

  // If authenticated, show role-based navigator
  // Se estiver na web ou React Navigation não estiver disponível, usa navegação simples
  if (isWeb || !createNativeStackNavigator) {
    return (
      <NavigationProvider initialRoute={user?.role === 'aluno' ? 'AlunoNavigator' : 'MotoristaNavigator'}>
        <Navigator>
          <Screen name="SelecaoFluxo" component={SelecaoFluxo} />
          <Screen name="AlunoNavigator" component={AlunoNavigator} />
          <Screen name="MotoristaNavigator" component={MotoristaNavigator} />
        </Navigator>
      </NavigationProvider>
    );
  }

  // Para mobile, usa React Navigation
  if (!NativeStackNavigator && createNativeStackNavigator) {
    NativeStackNavigator = createNativeStackNavigator();
  }

  const Stack = NativeStackNavigator;

  return (
    <Stack.Navigator
      initialRouteName={user?.role === 'aluno' ? 'AlunoNavigator' : 'MotoristaNavigator'}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="SelecaoFluxo" component={SelecaoFluxo} />
      <Stack.Screen name="AlunoNavigator" component={AlunoNavigator} />
      <Stack.Screen name="MotoristaNavigator" component={MotoristaNavigator} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default MainNavigator;


