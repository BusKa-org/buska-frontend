import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';

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
  <style>
    html, body, #map {
      height: 100%;
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
    body { overflow: visible; }
    .leaflet-container { width: 100%; height: 100%; background: #f5f5f5; }
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

    // Timeout: se Leaflet não carregar em 8s, mostra erro
    var loadTimeout = setTimeout(function() {
      if (typeof L === 'undefined') showError();
    }, 8000);
  </script>

  <script
    src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    onerror="clearTimeout(loadTimeout); showError();"
  ></script>

  <script>
    (function () {
      if (typeof L === 'undefined') return;
      clearTimeout(loadTimeout);

      const BuskaMap = {
        mapInstance: null,
        destMarker: null,

        postMessage(payload) {
          try {
            window.ReactNativeWebView &&
              window.ReactNativeWebView.postMessage(JSON.stringify(payload));
          } catch (e) {}
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

        setPoint(lat, lng) {
          if (!this.mapInstance) return;
          const latLng = L.latLng(lat, lng);
          if (this.destMarker) {
            this.destMarker.setLatLng(latLng);
          } else {
            this.destMarker = L.marker(latLng).addTo(this.mapInstance);
          }
          this.mapInstance.setView(latLng, 15);
        },

        clearPoint() {
          if (this.mapInstance && this.destMarker) {
            this.mapInstance.removeLayer(this.destMarker);
            this.destMarker = null;
          }
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

export default function MapaLocalizacaoMotorista({ pontosRota }) {
  const webViewRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [loadingMap, setLoadingMap] = useState(true);
  const [mapError, setMapError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const destinoAtual = pontosRota && pontosRota.length > 0 ? pontosRota[0] : null;
  const initialHtml = useMemo(() => buildHtml(), [reloadKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const inject = useCallback(
    (script) => {
      if (!webViewRef.current || !mapReady) return;
      webViewRef.current.injectJavaScript(`try { ${script} } catch (e) {} true;`);
    },
    [mapReady]
  );

  useEffect(() => {
    if (!mapReady) return;
    if (!destinoAtual) { inject('window.BuskaMap.clearPoint();'); return; }
    const latDest = parseFloat(destinoAtual.latitude);
    const lonDest = parseFloat(destinoAtual.longitude);
    if (Number.isNaN(latDest) || Number.isNaN(lonDest)) return;
    inject(`window.BuskaMap.setPoint(${latDest}, ${lonDest});`);
  }, [mapReady, destinoAtual, inject]);

  const handleWebViewMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapReady') { setMapReady(true); setLoadingMap(false); }
      if (data.type === 'mapError') { setLoadingMap(false); setMapError(true); }
    } catch (e) {}
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
  errorIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  errorSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  reloadButton: {
    backgroundColor: '#00B4D8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  reloadText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});