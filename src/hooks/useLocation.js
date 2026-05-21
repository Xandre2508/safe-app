// src/hooks/useLocation.js
// Hook para obter a localização atual do usuário usando o Expo Location


import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Strings } from '../constants/Strings';

export function useLocation() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(Strings.permissionDeniedTitle, Strings.victim.locationError);
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.05, 
        longitudeDelta: 0.05,
      });
    })();
  }, []);

  return { location };
}