import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';

const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

const atualizarRotaNoMapa = (userCoords) => {
  if (!isMounted || !mapInstance.current || !window.L.Routing) return;

  // --- MODO DE TESTE ---
  // Se você estiver muito longe (ex: em SP), forçamos o início da rota 
  // para perto do destino apenas para ver a linha azul
  const destino = pontosRota[0];
  const destPos = window.L.latLng(parseFloat(destino.latitude), parseFloat(destino.longitude));
  
  let latInicio = userCoords.latitude;
  let lonInicio = userCoords.longitude;

  const distanciaKm = calcularDistancia(latInicio, lonInicio, destPos.lat, destPos.lng) / 1000;

  if (distanciaKm > 500) { 
    console.warn("Distância muito grande para rota. Simulando início próximo ao destino.");
    latInicio = destPos.lat + 0.005; // 500 metros de diferença
    lonInicio = destPos.lng + 0.005;
  }
  
  const startPos = window.L.latLng(latInicio, lonInicio);
  // ---------------------

  if (!routingControl.current) {
    routingControl.current = window.L.Routing.control({
      waypoints: [startPos, destPos],
      lineOptions: { styles: [{ color: '#007bff', weight: 6 }] },
      addWaypoints: false,
      show: false,
      createMarker: () => null
    }).addTo(mapInstance.current);
  } else {
    routingControl.current.setWaypoints([startPos, destPos]);
  }
  
  // Força o mapa a focar onde a rota realmente está
  mapInstance.current.fitBounds(window.L.latLngBounds([startPos, destPos]), { padding: [50, 50] });
};

const MapaComponent = ({ pontosRota, onPontoChegado }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const routingControl = useRef(null); // O ref está definido aqui
  const watchId = useRef(null);

  if (pontosRota && pontosRota.length >= 3) {
    pontosRota[0].latitude = -7.107608;
    pontosRota[0].longitude = -34.841817;
  }

  useEffect(() => {
    let isMounted = true;

    const carregarMapa = async () => {
      const L = await import('leaflet');
      if (!isMounted || !mapRef.current) return;
      window.L = L;
      await import('leaflet-routing-machine');

      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current).setView([-7.11, -34.86], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance.current);
      }
      
      const map = mapInstance.current;

      // --- 1. LIMPEZA BLINDADA DA ROTA ---
      if (routingControl.current) {
        try {
          const map = mapInstance.current;
          if (map) {
            // Primeiro limpamos os pontos para abortar cálculos pendentes
            routingControl.current.setWaypoints([]); 
            // Depois removemos o controle do mapa
            map.removeControl(routingControl.current);
          }
        } catch (e) {
          // Ignoramos erros de 'null' durante a remoção assíncrona
          console.log("Limpando resíduos de rotas...");
        } finally {
          routingControl.current = null;
        }
      }

      // --- 2. LIMPEZA SEGURA DE MARCADORES ---
      if (mapInstance.current) {
        try {
          mapInstance.current.eachLayer((layer) => {
            // Removemos apenas se for Marcador ou se for a linha da rota (Polyline)
            if (layer instanceof L.Marker || layer instanceof L.Polyline) {
              mapInstance.current.removeLayer(layer);
            }
          });
        } catch (e) {
          console.log("Mapa em transição, aguardando...");
        }
      }

      // --- DEFINA A FUNÇÃO AQUI DENTRO PARA ELA ENXERGAR O REF ---
      const atualizarRotaNoMapa = (userCoords) => {
        if (!isMounted || !map || !window.L.Routing) return;

        const userPos = window.L.latLng(userCoords.latitude, userCoords.longitude);
        const destino = pontosRota[0];
        const destPos = window.L.latLng(parseFloat(destino.latitude), parseFloat(destino.longitude));

        if (!routingControl.current) {
          // Criar a rota pela primeira vez
          routingControl.current = window.L.Routing.control({
            waypoints: [userPos, destPos],
            lineOptions: { styles: [{ color: '#007bff', weight: 6 }] },
            addWaypoints: false,
            show: false,
            createMarker: () => null
          }).addTo(map);
        } else {
          // Apenas atualizar os pontos da rota existente
          routingControl.current.setWaypoints([userPos, destPos]);
        }
      };

      // Limpeza de marcadores antigos
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) map.removeLayer(layer);
      });

      if (pontosRota && pontosRota.length > 0) {
        // Marcadores dos destinos
        pontosRota.forEach((p, idx) => {
          L.marker([parseFloat(p.latitude), parseFloat(p.longitude)], { opacity: idx === 0 ? 1 : 0.4 }).addTo(map);
        });

        // Localização Inicial e Rota
        const simularPosicaoPerto = (callback) => {
  const destino = pontosRota[0];
  // Criamos uma posição a 0.001 graus de distância do destino (aprox. 100 metros)
  const posFake = {
    coords: {
      latitude: parseFloat(destino.latitude) + 0.001,
      longitude: parseFloat(destino.longitude) + 0.001
    }
  };
  callback(posFake);
};

// Use a função fake em vez da real para testar a linha azul
simularPosicaoPerto((pos) => {
  atualizarRotaNoMapa(pos.coords);
});

        // Monitoramento contínuo
        watchId.current = navigator.geolocation.watchPosition((pos) => {
          if (!isMounted) return;
          
          atualizarRotaNoMapa(pos.coords);

          map.eachLayer((layer) => {
            // Se você der uma classe específica ou usar uma lógica para identificar a bolinha
            if (layer instanceof L.Marker && layer.options.icon?.options.className === 'motorista') {
              map.removeLayer(layer);
            }
          });

          // Bolinha do motorista
          const myIcon = L.divIcon({
            className: 'motorista',
            html: `<div style="width:14px; height:14px; background:#4285F4; border:3px solid white; border-radius:50%;"></div>`
          });
          L.marker([pos.coords.latitude, pos.coords.longitude], { icon: myIcon }).addTo(map);

          // Lógica de Chegada
          const dist = calcularDistancia(
            pos.coords.latitude, 
            pos.coords.longitude, 
            parseFloat(pontosRota[0].latitude), 
            parseFloat(pontosRota[0].longitude)
          );

          if (dist < 30) {
            navigator.geolocation.clearWatch(watchId.current);
            onPontoChegado();
          }
        }, null, { enableHighAccuracy: true });
      }
    };

    carregarMapa();

    return () => {
      isMounted = false;
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [pontosRota]);

  return <View ref={mapRef} style={{ height: 400, width: '100%', borderRadius: 10, overflow: 'hidden' }} />;
};

export default MapaComponent;