// src/components/mapa/hooks/useArrivalDetection.ts
import { useEffect, useRef } from 'react';
import type { LatLng, RoutePoint } from '../types';
import { buildArrivalKey, distanceInMeters, isValidLatLng } from '../utils/geo';

type Params = {
  userLocation: LatLng | null;
  destination: RoutePoint | null;
  thresholdMeters?: number;
  onArrive?: (point: RoutePoint) => void;
};

export function useArrivalDetection({
  userLocation,
  destination,
  thresholdMeters = 50,
  onArrive,
}: Params) {
  const lastArrivalKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userLocation || !destination || !onArrive) return;
    if (!isValidLatLng(destination)) return;

    const distance = distanceInMeters(userLocation, {
      latitude: destination.latitude,
      longitude: destination.longitude,
    });

    if (distance <= thresholdMeters) {
      const arrivalKey = buildArrivalKey(destination);

      if (lastArrivalKeyRef.current !== arrivalKey) {
        lastArrivalKeyRef.current = arrivalKey;
        onArrive(destination);
      }
    }
  }, [userLocation, destination, thresholdMeters, onArrive]);
}