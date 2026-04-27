import * as Location from 'expo-location';
// Funções do Firebase Firestore para enviar dados para a base de dados
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
// ActivityIndicator usado para mostrar a "rodinha" de loading
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MapView from 'react-native-maps';

// Importa as configurações de autenticação e base de dados do Firebase
import { auth, db } from '../firebaseConfig';

// Importação dos Textos (Strings) e Estilos
import { Strings } from '../constants/Strings';
import { styles } from '../styles/VictimDashboardStyles';

export default function VictimDashboard({ navigation }) {
  // Estado para armazenar as coordenadas exatas da vítima
  const [location, setLocation] = useState(null);
  
  // Estado de controlo: Evita que o utilizador carregue 50 vezes no botão de SOS sem querer
  const [isSending, setIsSending] = useState(false);

  // Assim que o ecrã carrega, pede permissão e apanha as coordenadas
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      // Sem localização, os socorristas não conseguem ajudar
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

  // --- FUNÇÃO DE ENVIO DE SOS (FIREBASE) ---
  const handleSOS = async () => {
    // Validação de segurança: Não enviar se o GPS ainda não tiver respondido
    if (!location) {
      Alert.alert(Strings.wait, Strings.victim.locationWait);
      return;
    }
    
    // Ativa o estado de carregamento para atualizar o botão visualmente
    setIsSending(true);

    try {
      // addDoc: Cria um novo documento na coleção 'sos_requests' na base de dados
      await addDoc(collection(db, 'sos_requests'), {
        userId: auth.currentUser ? auth.currentUser.uid : 'anonimo', // Regista quem pediu
        userEmail: auth.currentUser ? auth.currentUser.email : 'N/A',
        latitude: location.latitude, // Envia as coordenadas para o mapa dos socorristas
        longitude: location.longitude,
        type: 'SOS_URGENTE', 
        status: 'pendente', // Mantém pendente até um socorrista aceitar o pedido
        timestamp: serverTimestamp() // Hora oficial do servidor Firebase
      });

      // Feedback de sucesso
      Alert.alert(Strings.victim.sosSentTitle, Strings.victim.sosSentMessage);
    } catch (error) {
      // Feedback de erro (ex: falha de internet)
      Alert.alert(Strings.error, Strings.victim.sosError);
      console.error("Erro ao enviar SOS:", error);
    } finally {
      // Independentemente de dar erro ou sucesso, desliga o estado de carregamento
      setIsSending(false);
    }
  };

  // Função provisória para o botão de Apoio
  const handleApoio = () => {
    Alert.alert(Strings.victim.supportAlertTitle, Strings.victim.supportAlertMessage);
  };

  return (
    <SafeAreaView style={styles.container}>
       
      {/* ÁREA DO MAPA */}
      <View style={styles.mapContainer}>
        <MapView 
          style={styles.map} 
          showsUserLocation={true} 
          showsMyLocationButton={true} 
          // Se a localização ainda não estiver pronta, foca temporariamente numa zona padrão
          region={location || { latitude: 41.1579, longitude: -8.6291, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }} 
        />
      </View>

      {/* ÁREA DE AÇÕES E INFORMAÇÕES */}
      <ScrollView style={styles.bottomSection} showsVerticalScrollIndicator={false}>
        
        {/* Fila com os botões principais de emergência */}
        <View style={styles.buttonRow}>
          
          {/* Botão de SOS (Desativa-se durante o envio de dados) */}
          <TouchableOpacity 
            style={[styles.actionButton, styles.btnSOS]} 
            onPress={handleSOS} 
            disabled={isSending}
          >
            {/* Se estiver a enviar, mostra o ActivityIndicator, senão mostra o texto normal */}
            {isSending ? (
              <ActivityIndicator color="#FFF" size="large" />
            ) : (
              <>
                <Text style={styles.btnText}>{Strings.victim.btnSOS}</Text>
                <Text style={styles.btnSubText}>{Strings.victim.btnSOSSub}</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Botão de Apoio Logístico */}
          <TouchableOpacity style={[styles.actionButton, styles.btnApoio]} onPress={handleApoio}>
            <Text style={styles.btnText}>{Strings.victim.btnSupport}</Text>
            <Text style={styles.btnSubText}>{Strings.victim.btnSupportSub}</Text>
          </TouchableOpacity>
        </View>

        {/* Cartão de Estado Geral (Notificações da proteção civil) */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>{Strings.victim.emergencyStateTitle}</Text>
          <Text style={styles.alertText}>{Strings.victim.criticalAlert}</Text>
          <Text style={styles.infoText}>{Strings.victim.fireInfo}</Text>
          <Text style={styles.infoText}>{Strings.victim.followInstructions}</Text>
        </View>

        {/* Cartão de Atualizações em Tempo Real */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>{Strings.victim.updatesTitle}</Text>
          <Text style={styles.infoText}>{Strings.victim.update1}</Text>
          <Text style={styles.infoText}>{Strings.victim.update2}</Text>
        </View>

        {/* Botão de Logout / Voltar Atrás */}
        <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.logoutButtonText}>{Strings.logout}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}