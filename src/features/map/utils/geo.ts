// src/components/map/utils/geo.ts
import type { LatLng, NormalizedRoutePoint, RoutePoint } from '../types';

const EARTH_RADIUS_METERS = 6371000;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export function distanceInMeters(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);

  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_METERS * c;
}

export function isValidLatLng(value: unknown): value is LatLng {
  if (!value || typeof value !== 'object') return false;

  const coord = value as Partial<LatLng>;
  return (
    typeof coord.latitude === 'number' &&
    Number.isFinite(coord.latitude) &&
    typeof coord.longitude === 'number' &&
    Number.isFinite(coord.longitude)
  );
}

export function buildArrivalKey(point: RoutePoint): string {
  return point.id ?? `${point.latitude}:${point.longitude}:${point.ordem ?? ''}`;
}