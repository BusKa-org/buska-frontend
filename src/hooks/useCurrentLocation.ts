// src/components/mapa/hooks/useCurrentLocation.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import Geolocation from 'react-native-geolocation-service';
import type { LatLng } from '../components/map/types';

type Params = {
  enabled: boolean;
};

type Result = {
  location: LatLng | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
};

export function useCurrentLocation({ enabled }: Params): Result {
  const watchIdRef = useRef<number | null>(null);
  const [location, setLocation] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const clearWatch = useCallback(() => {
    if (watchIdRef.current != null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearWatch();
    setLocation(null);
    setLoading(false);
    setError(null);
  }, [clearWatch]);

  useEffect(() => {
    if (!enabled) {
      reset();
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    Geolocation.getCurrentPosition(
      (pos) => {
        if (!mounted) return;

        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        if (!mounted) return;

        console.warn('Erro ao obter posição inicial:', err);
        setError('Não foi possível obter sua localização.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        forceRequestLocation: true,
        showLocationDialog: true,
      }
    );

    watchIdRef.current = Geolocation.watchPosition(
      (pos) => {
        if (!mounted) return;

        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        if (!mounted) return;
        console.warn('Erro ao observar posição:', err);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 20,
        interval: 8000,
        fastestInterval: 5000,
        forceRequestLocation: true,
        showLocationDialog: true,
      }
    );

    return () => {
      mounted = false;
      clearWatch();
    };
  }, [enabled, clearWatch, reset]);

  return { location, loading, error, reset };
}