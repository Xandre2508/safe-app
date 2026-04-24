import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MapView from 'react-native-maps';

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig'; // Certifica-te que este caminho está correto no teu projeto

import { styles } from './styles/VictimDashboardStyles'; // Importação dos estilos

export default function VictimDashboard({ navigation }) {
  const [location, setLocation] = useState(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Negada', 
          'Precisamos da sua localização para que os socorristas o encontrem.'
        );
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

  const handleSOS = async () => {
    if (!location) {
      Alert.alert("Aguarde", "A obter a sua localização exata para o resgate...");
      return;
    }

    setIsSending(true);

    try {
      await addDoc(collection(db, 'sos_requests'), {
        userId: auth.currentUser ? auth.currentUser.uid : 'anonimo',
        userEmail: auth.currentUser ? auth.currentUser.email : 'N/A',
        latitude: location.latitude,
        longitude: location.longitude,
        type: 'SOS_URGENTE', 
        status: 'pendente',  
        timestamp: serverTimestamp() 
      });

      Alert.alert(
        "🚨 Alerta Enviado!", 
        "O seu pedido foi enviado com sucesso. Socorristas num raio de 50km estão a ser notificados."
      );
    } catch (error) {
      Alert.alert("Erro", "Não foi possível enviar o alerta. Verifique a sua ligação.");
      console.error("Erro ao enviar SOS:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleApoio = () => {
    Alert.alert("Apoio Humanitário", "Funcionalidade de pedido de mantimentos em breve.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView 
          style={styles.map} 
          showsUserLocation={true} 
          showsMyLocationButton={true} 
          region={location || {
            latitude: 41.1579, 
            longitude: -8.6291,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      </View>

      <ScrollView style={styles.bottomSection} showsVerticalScrollIndicator={false}>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.btnSOS]} 
            onPress={handleSOS}
            disabled={isSending}
          >
            {isSending ? (
              <ActivityIndicator color="#FFF" size="large" />
            ) : (
              <>
                <Text style={styles.btnText}>SOS</Text>
                <Text style={styles.btnSubText}>Pedido Urgente</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.btnApoio]}
            onPress={handleApoio}
          >
            <Text style={styles.btnText}>APOIO</Text>
            <Text style={styles.btnSubText}>Mantimentos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Estado de Emergência: PORTO</Text>
          <Text style={styles.alertText}>🔥 ALERTA CRÍTICO 🔥</Text>
          <Text style={styles.infoText}>Incêndio ativo a 12km de distância.</Text>
          <Text style={styles.infoText}>Siga as instruções das autoridades.</Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Últimas Atualizações:</Text>
          <Text style={styles.infoText}>• Meios de socorro a caminho do setor Norte.</Text>
          <Text style={styles.infoText}>• Condições meteorológicas adversas previstas.</Text>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.logoutButtonText}>Sair / Voltar ao Login</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
}