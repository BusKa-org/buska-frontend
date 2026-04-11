// src/components/mapa/hooks/useRoutePolyline.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import type { LatLng } from '../types';
import { distanceInMeters } from '../utils/geo';
import { fetchRoutePolyline } from '../utils/routeProvider';

type Params = {
  origin: LatLng | null;
  destination: LatLng | null;
  enabled: boolean;
  minRefetchDistanceMeters?: number;
};

type Result = {
  coordinates: LatLng[];
  loading: boolean;
  error: string | null;
  reset: () => void;
};

export function useRoutePolyline({
  origin,
  destination,
  enabled,
  minRefetchDistanceMeters = 20,
}: Params): Result {
  const [coordinates, setCoordinates] = useState<LatLng[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastOriginRef = useRef<LatLng | null>(null);
  const requestIdRef = useRef(0);

  const reset = useCallback(() => {
    setCoordinates((prev) => (prev.length > 0 ? [] : prev));
    setLoading(false);
    setError(null);
    lastOriginRef.current = null;
  }, []);

  const loadRoute = useCallback(async () => {
    if (!enabled || !origin || !destination) {
      setLoading(false);
      setError(null);
      setCoordinates((prev) => (prev.length > 0 ? [] : prev));
      lastOriginRef.current = null;
      return;
    }

    const lastOrigin = lastOriginRef.current;
    const shouldSkip =
      lastOrigin !== null &&
      distanceInMeters(lastOrigin, origin) < minRefetchDistanceMeters;

    if (shouldSkip) {
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    // Record the attempt position before the fetch so that GPS jitter
    // while the request is in-flight (or after a failure) does not
    // trigger immediate retries.
    lastOriginRef.current = origin;

    try {
      const result = await fetchRoutePolyline(origin, destination);

      if (requestId !== requestIdRef.current) return;

      setCoordinates(result.coordinates);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      console.warn('Erro ao buscar rota:', err);
      setError('Não foi possível calcular a rota.');
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [enabled, origin, destination, minRefetchDistanceMeters, reset]);

  useEffect(() => {
    loadRoute();
  }, [loadRoute]);

  return { coordinates, loading, error, reset };
}