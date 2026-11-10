import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { Strings } from '../constants/Strings';

export function useLocation() {
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const obtainPosition = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(Strings.permissionDeniedTitle, Strings.victim.locationError);
          // Coordenadas padrão em caso de recusa de permissão
          if (isMounted) {
            setLocation({
              latitude: 41.1579,
              longitude: -8.6291,
              latitudeDelta: 0.04,
              longitudeDelta: 0.04,
            });
            setLoadingLocation(false);
          }
          return;
        }

        // Recuperação rápida da última localização conhecida para resposta imediata
        const lastKnown = await Location.getLastKnownPositionAsync({});
        if (lastKnown && isMounted) {
          setLocation({
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          });
        }

        // Obtenção da posição atual precisa
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (isMounted && current) {
          setLocation({
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          });
        }
      } catch (error) {
        console.warn('[useLocation] Falha ao obter GPS:', error);
        if (isMounted && !location) {
          setLocation({
            latitude: 41.1579,
            longitude: -8.6291,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          });
        }
      } finally {
        if (isMounted) setLoadingLocation(false);
      }
    };

    obtainPosition();

    return () => {
      isMounted = false;
    };
  }, []);

  return { location, loadingLocation };
}
