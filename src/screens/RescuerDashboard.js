import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MapView from 'react-native-maps';
import { styles } from './styles/RescuerDashboardStyles'; // Importação dos estilos

export default function RescuerDashboard({ navigation }) {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão Negada', 'Precisamos da sua localização para o mapa.');
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

  return (
    <SafeAreaView style={styles.container}>
      <MapView 
        style={styles.map} 
        showsUserLocation={true} 
        showsMyLocationButton={true} 
        region={location} 
      />

      <View style={styles.contentSection}>
        <View style={styles.headerButtons}>
          <View style={styles.greenButton}>
            <Text style={styles.whiteIconText}>⚠️</Text>
            <Text style={styles.whiteText}>Alerta de Ativos</Text>
            <Text style={styles.countText}>12 Pendentes</Text>
          </View>
          <View style={styles.grayButton}>
            <Text style={styles.whiteIconText}>📋</Text>
            <Text style={styles.whiteText}>Missão Atual:</Text>
            <Text style={styles.countText}>Setor Leste</Text>
          </View>
        </View>

        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Resgate Prioritário:</Text>
            <Text style={styles.listItem}>📍 Rua de Santa Catarina, Porto</Text>
            <Text style={styles.listItem}>👤 Maria Santos (82 anos)</Text>
            <Text style={styles.priorityText}>🔴 Prioridade Máxima - Idade e Fumo</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Atualização Tática:</Text>
            <Text style={styles.listItem}>Bombeiros a 5 minutos do local.</Text>
            <Text style={styles.listItem}>Vento forte de Noroeste.</Text>
          </View>

          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.logoutButtonText}>Sair / Voltar ao Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}