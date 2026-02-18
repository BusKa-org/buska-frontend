import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const MapaComponent = ({ pontosRota, onPontoChegado }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const routingControl = useRef(null);
  const watchId = useRef(null);
  const userMarker = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  // Ajuste de coordenadas (movido para dentro do useEffect para evitar side-effects no render)
  const destinoAtual = pontosRota && pontosRota.length > 0 ? pontosRota[0] : null;

  // --- 1. INICIALIZAÇÃO DO MAPA ---
  useEffect(() => {
    let isMounted = true;
    const initMap = async () => {
      if (mapInstance.current) return;

      try {
        const L = await import('leaflet');
        window.L = L;
        await import('leaflet-routing-machine');

        if (!isMounted) return;

        const map = L.map(mapRef.current).setView([-23.55, -46.63], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        mapInstance.current = map;
        setMapReady(true);
      } catch (error) {
        console.error("Erro Leaflet:", error);
      }
    };
    initMap();

    return () => {
      isMounted = false;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // --- 2. ROTA E GPS ---
  useEffect(() => {
    if (!mapReady || !mapInstance.current || !window.L || !destinoAtual) return;

    const map = mapInstance.current;
    const L = window.L;

    // Hardcode temporário solicitado (idealmente remover depois)
    // Usamos variáveis locais em vez de modificar o objeto original 'pontosRota'
    let latDest = parseFloat(destinoAtual.latitude);
    let lonDest = parseFloat(destinoAtual.longitude);

    if (pontosRota.length >= 3) {
       latDest = -7.107608;
       lonDest = -34.841817;
    }

    const destLatLng = L.latLng(latDest, lonDest);
    console.log("📍 Destino:", latDest, lonDest);

    // --- LIMPEZA SEGURA ---
    // Remove controle anterior se existir
    if (routingControl.current) {
      try {
        map.removeControl(routingControl.current);
      } catch (e) { console.warn("Erro limpeza rota", e); }
      routingControl.current = null;
    }

    // Limpa layers antigos
    map.eachLayer(layer => {
      if (layer instanceof L.Marker && layer !== userMarker.current) map.removeLayer(layer);
      if (layer instanceof L.Polyline && !layer._url && layer !== userMarker.current) map.removeLayer(layer);
    });

    // Marcador Destino
    L.marker(destLatLng).addTo(map);

    // Cria nova rota
    routingControl.current = L.Routing.control({
      waypoints: [null, destLatLng],
      router: L.Routing.osrmv1({
        serviceUrl: `https://router.project-osrm.org/route/v1`,
        profile: 'driving'
      }),
      lineOptions: { styles: [{ color: '#007bff', weight: 6, opacity: 0.8 }] },
      createMarker: () => null,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false
    }).addTo(map);

    // --- GPS ---
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);

    watchId.current = navigator.geolocation.watchPosition((pos) => {
      const latUser = pos.coords.latitude;
      const lonUser = pos.coords.longitude;
      const userLatLng = L.latLng(latUser, lonUser);

      // Atualiza Motorista
      if (userMarker.current) {
        userMarker.current.setLatLng(userLatLng);
      } else {
        const icon = L.divIcon({
          className: 'motorista-icon',
          html: `<div style="width:16px;height:16px;background:#2196F3;border:3px solid white;border-radius:50%;box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>`
        });
        userMarker.current = L.marker(userLatLng, { icon, zIndexOffset: 1000 }).addTo(map);
      }

      // Calcula Distância
      const distReal = calcularDistancia(latUser, lonUser, destLatLng.lat, destLatLng.lng);
      console.log(`Distância: ${(distReal / 1000).toFixed(1)} km`);

      // LÓGICA DE CHEGADA (CORRIGIDA)
      if (distReal < 50) {
        console.log("✅ Chegou! Encerrando rota...");
        
        // 1. Para o GPS imediatamente para não rodar esse bloco de novo
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;

        // 2. Remove a rota AGORA para evitar o erro 'removeLayer of null'
        // quando o React tentar atualizar o componente pai.
        if (routingControl.current) {
            try {
                routingControl.current.setWaypoints([]); // Esvazia pontos
                map.removeControl(routingControl.current); // Remove do mapa
            } catch (e) {
                console.log("Erro suprimido na limpeza final:", e);
            }
            routingControl.current = null;
        }

        // 3. Só agora chama a função que muda o estado
        onPontoChegado();
        return; 
      }

      // Se não chegou, atualiza a rota normalmente
      if (routingControl.current) {
        routingControl.current.setWaypoints([userLatLng, destLatLng]);
      }

    }, (err) => console.error(err), { enableHighAccuracy: true });

    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    };

  }, [pontosRota, mapReady]); // Atualiza ao mudar rota

  return <View ref={mapRef} style={{ height: 400, width: '100%', borderRadius: 10, overflow: 'hidden' }} />;
};

export default MapaComponent;