import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import maplibregl, { LngLatBoundsLike, Map as MapLibreMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { MAP_STYLE_URL } from '../utils/mapStyle';
import { useMultiSegmentRoute } from '../hooks/useMultiSegmentRoute';

interface RoutePoint {
  id?: string | number;
  latitude: number | string;
  longitude: number | string;
  nome?: string;
  apelido?: string;
  ordem?: number;
}

interface StaticRouteMapProps {
  pontosRota: RoutePoint[];
}

interface NormalizedPoint {
  latitude: number;
  longitude: number;
  label: string;
  color: string;
  name: string;
}

const ROUTE_SOURCE_ID = 'static-route-source';
const ROUTE_LAYER_ID = 'static-route-layer';

function normalizePoints(points: RoutePoint[]): NormalizedPoint[] {
  const valid = [...points]
    .filter((p) => {
      const lat = Number(p.latitude);
      const lng = Number(p.longitude);
      return Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0;
    })
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));

  return valid.map((p, i) => ({
    latitude: Number(p.latitude),
    longitude: Number(p.longitude),
    label: i === 0 ? 'A' : i === valid.length - 1 ? 'B' : String(i + 1),
    color: i === 0 ? '#34A853' : i === valid.length - 1 ? '#EA4335' : '#4285F4',
    name: p.nome || p.apelido || `Ponto ${i + 1}`,
  }));
}

function buildPinElement(label: string, color: string, title: string): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.title = title;
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'center';
  wrapper.style.filter = 'drop-shadow(0 2px 6px rgba(0,0,0,0.35))';

  const head = document.createElement('div');
  head.style.width = '28px';
  head.style.height = '28px';
  head.style.borderRadius = '50%';
  head.style.background = color;
  head.style.color = '#fff';
  head.style.fontSize = '12px';
  head.style.fontWeight = 'bold';
  head.style.display = 'flex';
  head.style.alignItems = 'center';
  head.style.justifyContent = 'center';
  head.style.border = '3px solid #fff';
  head.textContent = label;

  const tail = document.createElement('div');
  tail.style.width = '0';
  tail.style.height = '0';
  tail.style.borderLeft = '5px solid transparent';
  tail.style.borderRight = '5px solid transparent';
  tail.style.borderTop = `7px solid ${color}`;
  tail.style.marginTop = '-1px';

  wrapper.appendChild(head);
  wrapper.appendChild(tail);
  return wrapper;
}

export default function StaticRouteMap({ pontosRota }: StaticRouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  const [mapReady, setMapReady] = useState(false);

  const points = useMemo(() => normalizePoints(pontosRota || []), [pontosRota]);

  const pointsForRouting = useMemo(
    () => points.map((p) => ({ latitude: p.latitude, longitude: p.longitude })),
    [points],
  );

  const { coordinates: routedCoords } = useMultiSegmentRoute(pointsForRouting);

  const isUsingFallback = routedCoords.length < 2 && points.length >= 2;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: [-47.93, -15.78],
      zoom: 4,
      attributionControl: { compact: true },
    });

    map.on('load', () => {
      map.addSource(ROUTE_SOURCE_ID, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: [] },
          properties: {},
        },
      });
      map.addLayer({
        id: ROUTE_LAYER_ID,
        type: 'line',
        source: ROUTE_SOURCE_ID,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#4285F4',
          'line-width': 4,
          'line-opacity': 0.85,
        },
      });
      setMapReady(true);
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Atualiza markers + linha + viewport quando os pontos mudam
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    // Limpa markers antigos
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Cria novos markers
    points.forEach((point) => {
      const el = buildPinElement(point.label, point.color, point.name);
      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([point.longitude, point.latitude])
        .addTo(map);
      markersRef.current.push(marker);
    });

    const source = map.getSource(ROUTE_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    if (source) {
      let coords: number[][] = [];
      if (routedCoords.length >= 2) {
        coords = routedCoords.map((c) => [c.longitude, c.latitude]);
      } else if (points.length >= 2) {
        coords = points.map((p) => [p.longitude, p.latitude]);
      }
      source.setData({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: coords },
        properties: {},
      });
    }

    if (map.getLayer(ROUTE_LAYER_ID)) {
      map.setPaintProperty(
        ROUTE_LAYER_ID,
        'line-dasharray',
        isUsingFallback ? [2, 1] : [1, 0],
      );
      map.setPaintProperty(
        ROUTE_LAYER_ID,
        'line-opacity',
        isUsingFallback ? 0.5 : 0.85,
      );
    }

    // Ajusta viewport
    if (points.length === 1) {
      map.flyTo({ center: [points[0].longitude, points[0].latitude], zoom: 15 });
    } else if (points.length >= 2) {
      const lngs = points.map((p) => p.longitude);
      const lats = points.map((p) => p.latitude);
      const bounds: LngLatBoundsLike = [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ];
      map.fitBounds(bounds, { padding: 50, duration: 500 });
    }
  }, [mapReady, points, routedCoords, isUsingFallback]);

  return (
    <View style={styles.container}>
      <div ref={containerRef} style={styles.map as React.CSSProperties} />
      {!mapReady && (
        <View pointerEvents="none" style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#00B4D8" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 280,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  map: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
