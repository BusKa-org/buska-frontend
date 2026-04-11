// src/components/mapa/hooks/useLocationPermissionWrapper.ts
import { useCallback, useState } from 'react';
import { requestLocationPermission } from './useLocationPermission';

type Result = {
  granted: boolean;
  loading: boolean;
  error: string | null;
  requestPermission: () => Promise<void>;
};

export function useLocationPermission(): Result {
  const [granted, setGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await requestLocationPermission();
      setGranted(result);

      if (!result) {
        setError('Permissão de localização não concedida.');
      }
    } catch (err) {
      console.warn('Erro ao solicitar permissão:', err);
      setGranted(false);
      setError('Não foi possível solicitar a permissão de localização.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { granted, loading, error, requestPermission };
}