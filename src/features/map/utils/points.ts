import type { LatLng, NormalizedRoutePoint, RoutePoint } from '../types';

export function normalizeRoutePoints(points: RoutePoint[] = []): NormalizedRoutePoint[] {
  return [...points]
    .filter(
      (point): point is NormalizedRoutePoint =>
        typeof point?.latitude === 'number' &&
        Number.isFinite(point.latitude) &&
        typeof point?.longitude === 'number' &&
        Number.isFinite(point.longitude)
    )
    .sort((a, b) => {
      const orderA = a.ordem ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.ordem ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
}

export function pointToLatLng(point: NormalizedRoutePoint): LatLng {
  return {
    latitude: point.latitude,
    longitude: point.longitude,
  };
}

export function buildFitCoordinates(params: {
  userLocation?: LatLng | null;
  destination?: NormalizedRoutePoint | null;
  polyline?: LatLng[];
}): LatLng[] {
  const coordinates: LatLng[] = [];

  if (params.userLocation) {
    coordinates.push(params.userLocation);
  }

  if (params.destination) {
    coordinates.push(pointToLatLng(params.destination));
  }

  if (params.polyline?.length) {
    coordinates.push(...params.polyline);
  }

  return coordinates;
}

export function getPointKey(point: RoutePoint | null | undefined): string | null {
  if (!point) return null;

  return (
    point.id ??
    `${point.latitude ?? 'no-lat'}:${point.longitude ?? 'no-lng'}:${point.ordem ?? 'no-order'}`
  );
}