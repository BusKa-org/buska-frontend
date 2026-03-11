import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

function buildHtml() {
  return `
<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #ffffff; }
    body { overflow: visible; }
    .leaflet-container { width: 100%; height: 100%; background: #f5f5f5; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    (function () {
      const BuskaMap = {
        mapInstance: null,
        destMarker: null,
        postMessage(payload) {
          try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(payload)); } catch (e) {}
          try { if (window.parent !== window) window.parent.postMessage(JSON.stringify(payload), '*'); } catch (e) {}
        },
        init() {
          if (this.mapInstance) return;
          this.mapInstance = L.map('map', { zoomControl: true, preferCanvas: false }).setView([-23.55, -46.63], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(this.mapInstance);
          this.postMessage({ type: 'mapReady' });
        },
        setPoint(lat, lng) {
          if (!this.mapInstance) return;
          const latLng = L.latLng(lat, lng);
          if (this.destMarker) this.destMarker.setLatLng(latLng);
          else this.destMarker = L.marker(latLng).addTo(this.mapInstance);
          this.mapInstance.setView(latLng, 15);
        },
        clearPoint() {
          if (this.mapInstance && this.destMarker) {
            this.mapInstance.removeLayer(this.destMarker);
            this.destMarker = null;
          }
        }
      };
      window.BuskaMap = BuskaMap;
      document.addEventListener('DOMContentLoaded', function () { BuskaMap.init(); });
    })();
  </script>
</body>
</html>
  `;
}

export default function MapaLocalizacaoMotorista({ pontosRota }) {
  const iframeRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [loadingMap, setLoadingMap] = useState(true);

  const destinoAtual = pontosRota && pontosRota.length > 0 ? pontosRota[0] : null;
  const initialHtml = useMemo(() => buildHtml(), []);

  useEffect(() => {
    const handler = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'mapReady' && e.source === iframeRef.current?.contentWindow) {
          setMapReady(true);
          setLoadingMap(false);
        }
      } catch (_) {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const onIframeLoad = useCallback(() => {
    // Fallback: iframe pode ter enviado mapReady antes do listener estar ativo
    setTimeout(() => {
      if (iframeRef.current?.contentWindow?.BuskaMap) {
        setMapReady(true);
        setLoadingMap(false);
      }
    }, 150);
  }, []);

  useEffect(() => {
    if (!mapReady || !iframeRef.current?.contentWindow?.BuskaMap) return;
    if (!destinoAtual) {
      iframeRef.current.contentWindow.BuskaMap.clearPoint();
      return;
    }
    const latDest = parseFloat(destinoAtual.latitude);
    const lonDest = parseFloat(destinoAtual.longitude);
    if (Number.isNaN(latDest) || Number.isNaN(lonDest)) return;
    iframeRef.current.contentWindow.BuskaMap.setPoint(latDest, lonDest);
  }, [mapReady, destinoAtual]);

  return (
    <View style={styles.container}>
      <iframe
        ref={iframeRef}
        srcDoc={initialHtml}
        title="Mapa localização motorista"
        style={styles.iframe}
        sandbox="allow-scripts allow-same-origin"
        onLoad={onIframeLoad}
      />
      {loadingMap && (
        <View pointerEvents="none" style={styles.loadingOverlay}>
          <ActivityIndicator size="small" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 400,
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  iframe: {
    flex: 1,
    width: '100%',
    height: '100%',
    border: 'none',
    borderRadius: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
