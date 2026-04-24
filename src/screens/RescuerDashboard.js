import * as Location from 'expo-location'; // Biblioteca nativa de GPS
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView from 'react-native-maps';

export default function RescuerDashboard({ navigation }) {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      // 1. Pede permissão ao utilizador para usar o GPS nativo do telemóvel
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão Negada', 'Precisamos da sua localização para o mapa.');
        return;
      }

      // 2. Obtém as coordenadas atuais
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
        showsUserLocation={true} // Mostra o ponto azul (localização do utilizador)
        showsMyLocationButton={true} // Mostra o botão para centrar no utilizador
        region={location} // Define a região do mapa para a localização atual
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

          {/* Botão para Voltar ao Login */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E5E5E5' },
  map: { width: '100%', height: '35%' },
  contentSection: { padding: 15, flex: 1 },
  headerButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  greenButton: { backgroundColor: '#1E8449', padding: 15, borderRadius: 15, width: '48%', alignItems: 'center' },
  grayButton: { backgroundColor: '#5D6D7E', padding: 15, borderRadius: 15, width: '48%', alignItems: 'center' },
  whiteIconText: { fontSize: 24, marginBottom: 5 },
  whiteText: { color: '#FFF', fontSize: 12, textAlign: 'center' },
  countText: { color: '#FFF', fontWeight: 'bold', fontSize: 14, textAlign: 'center', marginTop: 5 },
  listContainer: { flex: 1 },
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 15 },
  sectionTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 5 },
  listItem: { fontSize: 14, color: '#333', marginBottom: 5 },
  priorityText: { fontSize: 14, color: '#E32636', fontWeight: 'bold', marginTop: 5 },
  
  /* Estilos do novo botão de Logout */
  logoutButton: { backgroundColor: '#333', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  logoutButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});