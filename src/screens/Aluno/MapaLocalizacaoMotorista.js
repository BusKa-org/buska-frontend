import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
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
    body {
      overflow: visible;
    }
    .leaflet-container {
      width: 100%;
      height: 100%;
      background: #f5f5f5;
    }
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
          }).setView([-23.55, -46.63], 13); // Posição inicial padrão

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(this.mapInstance);

          this.postMessage({ type: 'mapReady' });
        },

        setPoint(lat, lng) {
          if (!this.mapInstance) return;

          const latLng = L.latLng(lat, lng);

          // Atualiza o marcador ou cria um novo se não existir
          if (this.destMarker) {
            this.destMarker.setLatLng(latLng);
          } else {
            this.destMarker = L.marker(latLng).addTo(this.mapInstance);
          }

          // Centraliza o mapa no ponto com um zoom adequado (ex: 15)
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

      document.addEventListener('DOMContentLoaded', function () {
        BuskaMap.init();
      });
    })();
  </script>
</body>
</html>
  `;
}

// Mantive o nome e a prop 'pontosRota' para não quebrar a importação no seu componente pai
export default function MapaLocalizacaoMotorista({ pontosRota }) {
  const webViewRef = useRef(null);

  const [mapReady, setMapReady] = useState(false);
  const [loadingMap, setLoadingMap] = useState(true);

  // Pega o primeiro ponto, já que agora queremos mostrar apenas um
  const destinoAtual = pontosRota && pontosRota.length > 0 ? pontosRota[0] : null;

  const initialHtml = useMemo(() => buildHtml(), []);

  const inject = useCallback(
    (script) => {
      if (!webViewRef.current || !mapReady) return;
      webViewRef.current.injectJavaScript(`
        try {
          ${script}
        } catch (e) {}
        true;
      `);
    },
    [mapReady]
  );

  // Efeito único para lidar com a atualização do ponto no mapa
  useEffect(() => {
    if (!mapReady) return;

    if (!destinoAtual) {
      inject(`window.BuskaMap.clearPoint();`);
      return;
    }

    const latDest = parseFloat(destinoAtual.latitude);
    const lonDest = parseFloat(destinoAtual.longitude);

    if (Number.isNaN(latDest) || Number.isNaN(lonDest)) return;

    // Injeta o comando para setar o ponto e centralizar o mapa
    inject(`
      window.BuskaMap.setPoint(${latDest}, ${lonDest});
    `);
  }, [mapReady, destinoAtual, inject]);

  const handleWebViewMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'mapReady') {
        setMapReady(true);
        setLoadingMap(false);
      }
    } catch (error) {
      console.log('Mensagem inválida do WebView:', error);
    }
  }, []);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        style={styles.webview}
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
    overflow: 'visible',
  },
  webview: {
    flex: 1,
    opacity: 0.99,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});