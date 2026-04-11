// src/components/mapa/hooks/useLocationPermission.ts
import { PermissionsAndroid, Platform } from 'react-native';

export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Permissão de localização',
      message: 'O BusKá precisa da sua localização para mostrar a rota.',
      buttonPositive: 'Permitir',
      buttonNegative: 'Negar',
    }
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}