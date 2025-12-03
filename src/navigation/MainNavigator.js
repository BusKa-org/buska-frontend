import React from 'react';
import {Platform} from 'react-native';
import SelecaoFluxo from '../screens/SelecaoFluxo';
import AlunoNavigator from './AlunoNavigator';
import MotoristaNavigator from './MotoristaNavigator';
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
  // Se estiver na web ou React Navigation não estiver disponível, usa navegação simples
  if (isWeb || !createNativeStackNavigator) {
    return (
      <NavigationProvider initialRoute="SelecaoFluxo">
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
      initialRouteName="SelecaoFluxo"
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

export default MainNavigator;


