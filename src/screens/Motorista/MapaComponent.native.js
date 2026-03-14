import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from 'react-native-geolocation-service';

const DISTANCIA_CHEGADA_METROS = 50;

const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

async function requestLocationPermission() {
  if (Platform.OS !== 'android') return true;

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

function buildHtml() {
  return `
<!doctype html>
<html>
<head>
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
  />
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  />
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css"
  />
  <style>
    html, body, #map {
      height: 100%;
      margin: 0;
      padding: 0;
      background: #ffffff;
    }

    body { overflow: visible; }

    .leaflet-container { width: 100%; height: 100%; background: #f5f5f5; }

    .motorista-icon { background: transparent; border: none; }

    .leaflet-routing-container { display: none !important; }

    #error-msg {
      display: none;
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      background: #f5f5f5;
      font-family: sans-serif;
      color: #64748B;
      font-size: 14px;
      text-align: center;
      padding: 16px;
    }
    #error-msg.visible { display: flex; }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="error-msg">
    <span style="font-size:32px">🗺️</span>
    <p style="margin:8px 0 4px">Mapa indisponível</p>
    <small>Verifique sua conexão com a internet</small>
  </div>

  <script>
    function showError() {
      document.getElementById('map').style.display = 'none';
      document.getElementById('error-msg').classList.add('visible');
      window.ReactNativeWebView &&
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapError' }));
    }
    var loadTimeout = setTimeout(function() {
      if (typeof L === 'undefined') showError();
    }, 8000);
  </script>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" onerror="clearTimeout(loadTimeout); showError();"></script>
  <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>

  <script>
    (function () {
      if (typeof L === 'undefined') return;
      clearTimeout(loadTimeout);

      const BuskaMap = {
        mapInstance: null,
        routingControl: null,
        userMarker: null,
        destMarker: null,
        hasFitted: false,

        postMessage(payload) {
          try {
            window.ReactNativeWebView &&
              window.ReactNativeWebView.postMessage(JSON.stringify(payload));
          } catch (error) {}
        },

        init() {
          if (this.mapInstance) return;

          this.mapInstance = L.map('map', {
            zoomControl: true,
            preferCanvas: false,
          }).setView([-23.55, -46.63], 13);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(this.mapInstance);

          this.postMessage({ type: 'mapReady' });
        },

        setUserMarker(lat, lng) {
          if (!this.mapInstance) return;

          const userLatLng = L.latLng(lat, lng);

          if (this.userMarker) {
            this.userMarker.setLatLng(userLatLng);
            return;
          }

          const icon = L.divIcon({
            className: 'motorista-icon',
            html: '<div style="width:16px;height:16px;background:#2196F3;border:3px solid white;border-radius:50%;box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>',
          });

          this.userMarker = L.marker(userLatLng, {
            icon,
            zIndexOffset: 1000,
          }).addTo(this.mapInstance);
        },

        setDestination(lat, lng) {
          if (!this.mapInstance) return;

          const destLatLng = L.latLng(lat, lng);

          if (this.destMarker) {
            this.destMarker.setLatLng(destLatLng);
            return;
          }

          this.destMarker = L.marker(destLatLng).addTo(this.mapInstance);
        },

        ensureRoutingControl() {
          if (!this.mapInstance) return null;
          if (this.routingControl) return this.routingControl;
          if (!L.Routing) return null;

          this.routingControl = L.Routing.control({
            waypoints: [],
            router: L.Routing.osrmv1({
              serviceUrl: 'https://router.project-osrm.org/route/v1',
              profile: 'driving',
            }),
            lineOptions: {
              styles: [{ color: '#007bff', weight: 6, opacity: 0.8 }],
            },
            createMarker: function () {
              return null;
            },
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: false,
            show: false,
            routeWhileDragging: false,
          }).addTo(this.mapInstance);

          return this.routingControl;
        },

        setRoute(userLat, userLng, destLat, destLng) {
          const control = this.ensureRoutingControl();
          if (!control) return;

          const userLatLng = L.latLng(userLat, userLng);
          const destLatLng = L.latLng(destLat, destLng);

          control.setWaypoints([userLatLng, destLatLng]);
        },

        fitBoundsToRoute(userLat, userLng, destLat, destLng) {
          if (!this.mapInstance) return;
          if (this.hasFitted) return;

          const bounds = L.latLngBounds([
            [userLat, userLng],
            [destLat, destLng],
          ]);

          this.mapInstance.fitBounds(bounds, { padding: [30, 30] });
          this.hasFitted = true;
        },

        resetFit() {
          this.hasFitted = false;
        },

        clearRoute() {
          if (!this.mapInstance || !this.routingControl) return;

          try {
            this.mapInstance.removeControl(this.routingControl);
            
            if (this.routingControl._map) {
              this.routingControl._map = null;
            }
          } catch (error) {}

          this.routingControl = null;
        },

        clearDestination() {
          if (!this.mapInstance || !this.destMarker) return;

          try {
            this.mapInstance.removeLayer(this.destMarker);
          } catch (error) {}

          this.destMarker = null;
        },

        destroy() {
          try {
            this.clearRoute();
            this.clearDestination();

            if (this.userMarker && this.mapInstance) {
              this.mapInstance.removeLayer(this.userMarker);
              this.userMarker = null;
            }

            if (this.mapInstance) {
              this.mapInstance.remove();
              this.mapInstance = null;
            }
          } catch (error) {}
        },
      };

      window.BuskaMap = BuskaMap;

      document.addEventListener('DOMContentLoaded', function () {
        BuskaMap.init();
      });
    })();
  </script>
</body>
</html>
  `;
}

export default function MapaComponent({ pontosRota, onPontoChegado }) {
  const webViewRef = useRef(null);

  const mapInstance = useRef(null);
  const routingControl = useRef(null);
  const userMarker = useRef(null);
  const watchId = useRef(null);

  const [mapReady, setMapReady] = useState(false);
  const [loadingMap, setLoadingMap] = useState(true);
  const [mapError, setMapError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const destinoAtual = pontosRota && pontosRota.length > 0 ? pontosRota[0] : null;

  const initialHtml = useMemo(() => buildHtml(), []);

  const inject = useCallback(
    (script) => {
      if (!webViewRef.current || !mapReady) return;
      webViewRef.current.injectJavaScript(`
        try {
          ${script}
        } catch (e) {
          true;
        }
        true;
      `);
    },
    [mapReady]
  );

  const clearLocationWatch = useCallback(() => {
    if (watchId.current != null) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearLocationWatch();
    };
  }, [clearLocationWatch]);

  useEffect(() => {
    if (!mapReady) return;

    // Espelha a ideia da web: refs existem e representam o estado do mapa/rota/marcador
    mapInstance.current = true;
  }, [mapReady]);

  useEffect(() => {
    if (!mapReady || !destinoAtual) return;

    const latDest = parseFloat(destinoAtual.latitude);
    const lonDest = parseFloat(destinoAtual.longitude);

    if (Number.isNaN(latDest) || Number.isNaN(lonDest)) return;

    inject(`
      window.BuskaMap.resetFit();
      window.BuskaMap.setDestination(${latDest}, ${lonDest});
    `);

    routingControl.current = true;
  }, [mapReady, destinoAtual, inject]);

  useEffect(() => {
    if (!mapReady || !destinoAtual) return;

    const latDest = parseFloat(destinoAtual.latitude);
    const lonDest = parseFloat(destinoAtual.longitude);

    if (Number.isNaN(latDest) || Number.isNaN(lonDest)) return;

    let isMounted = true;

    const startTracking = async () => {
      const hasPermission = await requestLocationPermission();

      if (!hasPermission) {
        Alert.alert(
          'Permissão negada',
          'Sem acesso à localização, não é possível mostrar a rota.'
        );
        return;
      }

      clearLocationWatch();

      Geolocation.getCurrentPosition(
        (pos) => {
          if (!isMounted) return;

          const latUser = pos.coords.latitude;
          const lonUser = pos.coords.longitude;

          inject(`
            window.BuskaMap.setUserMarker(${latUser}, ${lonUser});
            window.BuskaMap.setRoute(${latUser}, ${lonUser}, ${latDest}, ${lonDest});
            window.BuskaMap.fitBoundsToRoute(${latUser}, ${lonUser}, ${latDest}, ${lonDest});
          `);

          userMarker.current = true;
          routingControl.current = true;
        },
        (error) => {
          console.log('Erro ao obter posição inicial:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          forceRequestLocation: true,
          showLocationDialog: true,
        }
      );

      watchId.current = Geolocation.watchPosition(
        (pos) => {
          if (!isMounted) return;

          const latUser = pos.coords.latitude;
          const lonUser = pos.coords.longitude;

          inject(`
            window.BuskaMap.setUserMarker(${latUser}, ${lonUser});
            window.BuskaMap.setRoute(${latUser}, ${lonUser}, ${latDest}, ${lonDest});
          `);

          userMarker.current = true;
          routingControl.current = true;

          const distReal = calcularDistancia(latUser, lonUser, latDest, lonDest);
          console.log(`Distância: ${(distReal / 1000).toFixed(1)} km`);

          if (distReal < DISTANCIA_CHEGADA_METROS) {
            console.log('✅ Chegou! Encerrando rota...');

            clearLocationWatch();

            inject(`
              window.BuskaMap.clearRoute();
            `);

            routingControl.current = null;

            if (typeof onPontoChegado === 'function') {
              onPontoChegado();
            }
          }
        },
        (error) => {
          console.log('Erro ao observar posição:', error);
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
    };

    startTracking();

    return () => {
      isMounted = false;
      clearLocationWatch();
    };
  }, [mapReady, destinoAtual, inject, clearLocationWatch, onPontoChegado]);

  useEffect(() => {
    if (!mapReady || destinoAtual) return;

    clearLocationWatch();

    inject(`
      window.BuskaMap.clearRoute();
      window.BuskaMap.clearDestination();
      window.BuskaMap.resetFit();
    `);

    routingControl.current = null;
  }, [mapReady, destinoAtual, inject, clearLocationWatch]);

  const handleWebViewMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapReady') { setMapReady(true); setLoadingMap(false); }
      if (data.type === 'mapError') { setLoadingMap(false); setMapError(true); }
    } catch (error) {
      console.log('Mensagem inválida do WebView:', error);
    }
  }, []);

  const handleReload = () => {
    setMapError(false);
    setMapReady(false);
    setLoadingMap(true);
    setReloadKey(k => k + 1);
  };

  return (
    <View style={styles.container}>
      <WebView
        key={reloadKey}
        ref={webViewRef}
        style={[styles.webview, mapError && styles.hidden]}
        originWhitelist={['*']}
        source={{ html: initialHtml }}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        nestedScrollEnabled={false}
        setSupportMultipleWindows={false}
        onMessage={handleWebViewMessage}
        androidLayerType="software"
      />

      {loadingMap && !mapError && (
        <View pointerEvents="none" style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#00B4D8" />
        </View>
      )}

      {mapError && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorIcon}>🗺️</Text>
          <Text style={styles.errorTitle}>Mapa indisponível</Text>
          <Text style={styles.errorSubtitle}>Verifique sua conexão com a internet</Text>
          <TouchableOpacity style={styles.reloadButton} onPress={handleReload}>
            <Text style={styles.reloadText}>Tentar novamente</Text>
          </TouchableOpacity>
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
  webview: {
    flex: 1,
    opacity: 0.99,
    backgroundColor: 'transparent',
  },
  hidden: {
    opacity: 0,
    height: 0,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  errorIcon: { fontSize: 40, marginBottom: 8 },
  errorTitle: { fontSize: 15, fontWeight: '600', color: '#334155', marginBottom: 4 },
  errorSubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 16 },
  reloadButton: { backgroundColor: '#00B4D8', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  reloadText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
