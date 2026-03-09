import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const MapaComponent = ({ pontosRota, onPontoChegado }) => {
  const [userLoc, setUserLoc] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [loadingMsg, setLoadingMsg] = useState('Buscando GPS...');
  const watchSubscription = useRef(null);
  const isFetchingRoute = useRef(false);

  let destinoAtual = pontosRota && pontosRota.length > 0 ? pontosRota[0] : null;


  const fetchRouteOSRM = async (start, end) => {
    if (isFetchingRoute.current) return;
    isFetchingRoute.current = true;

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const points = data.routes[0].geometry.coordinates.map(coord => ({
          latitude: coord[1],
          longitude: coord[0]
        }));
        setRouteCoords(points);
      }
    } catch (error) {
      console.error("Erro ao traçar rota OSRM no mobile:", error);
    } finally {
      isFetchingRoute.current = false;
    }
  };

  useEffect(() => {
    if (!destinoAtual) return;
    let isMounted = true;

    const iniciarRastreamento = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão Negada', 'O mapa precisa do GPS para traçar a rota até o destino.');
        setLoadingMsg('Permissão de GPS negada.');
        return;
      }

      const destCoord = {
        latitude: parseFloat(destinoAtual.latitude),
        longitude: parseFloat(destinoAtual.longitude)
      };

      const initialLoc = await Location.getCurrentPositionAsync({});
      if (!isMounted) return;
      
      const startCoord = {
        latitude: initialLoc.coords.latitude,
        longitude: initialLoc.coords.longitude
      };
      
      setUserLoc(startCoord);
      await fetchRouteOSRM(startCoord, destCoord);

      watchSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 10,
        },
        (pos) => {
          if (!isMounted) return;

          const currentUserLoc = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          };
          setUserLoc(currentUserLoc);

          const distReal = calcularDistancia(
            currentUserLoc.latitude, currentUserLoc.longitude,
            destCoord.latitude, destCoord.longitude
          );

          if (distReal < 50) {
            if (watchSubscription.current) {
              watchSubscription.current.remove();
            }
            onPontoChegado();
          }
        }
      );
    };

    iniciarRastreamento();

    return () => {
      isMounted = false;
      if (watchSubscription.current) {
        watchSubscription.current.remove();
      }
    };
  }, [destinoAtual]);

  if (!userLoc || !destinoAtual) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>{loadingMsg}</Text>
      </View>
    );
  }

  const destCoord = {
    latitude: parseFloat(destinoAtual.latitude),
    longitude: parseFloat(destinoAtual.longitude)
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation={true} 
        followsUserLocation={true}
        initialRegion={{
          latitude: userLoc.latitude,
          longitude: userLoc.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
      >
        <Marker coordinate={destCoord} pinColor="red" title="Destino" />

        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={5}
            strokeColor="#007bff"
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    height: 400, 
    width: '100%', 
    borderRadius: 10, 
    overflow: 'hidden',
    backgroundColor: '#f0f0f0' 
  },
  map: { 
    width: '100%', 
    height: '100%' 
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14
  }
});

export default MapaComponent;