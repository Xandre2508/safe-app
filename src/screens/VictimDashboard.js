import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
// ActivityIndicator: Componente visual que mostra um "spinner" de carregamento
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MapView from 'react-native-maps';

// Importações do Firebase para interagir com a base de dados (Firestore)
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig'; // Ligações configuradas no teu ficheiro Firebase

import { styles } from './styles/VictimDashboardStyles';

export default function VictimDashboard({ navigation }) {
  // Estados para gerir a localização do utilizador
  const [location, setLocation] = useState(null);
  
  // Estado para controlar se o botão SOS está num processo de envio (para evitar múltiplos cliques)
  const [isSending, setIsSending] = useState(false);

  // Pedir permissões e capturar a localização assim que o ecrã abre
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

  // --- FUNÇÃO PARA ENVIAR PEDIDO DE SOCORRO (FIREBASE) ---
  const handleSOS = async () => {
    // Se ainda não temos localização, não podemos enviar o pedido corretamente
    if (!location) {
      Alert.alert("Aguarde", "A obter a sua localização exata para o resgate...");
      return;
    }

    // Bloqueia o botão e mostra o ícone de carregamento
    setIsSending(true);

    try {
      // Tenta adicionar um novo documento à coleção "sos_requests" no Firestore
      await addDoc(collection(db, 'sos_requests'), {
        userId: auth.currentUser ? auth.currentUser.uid : 'anonimo', // Guarda o ID se logado
        userEmail: auth.currentUser ? auth.currentUser.email : 'N/A',
        latitude: location.latitude,     // Coordenadas atuais
        longitude: location.longitude,
        type: 'SOS_URGENTE', 
        status: 'pendente',              // Para os socorristas saberem que ninguém atendeu ainda
        timestamp: serverTimestamp()     // Carimbo de tempo do servidor do Firebase (muito seguro)
      });

      // Sucesso! Mostra um alerta à vítima
      Alert.alert(
        "🚨 Alerta Enviado!", 
        "O seu pedido foi enviado com sucesso. Socorristas num raio de 50km estão a ser notificados."
      );
    } catch (error) {
      // Se a internet falhar ou houver erro no Firebase
      Alert.alert("Erro", "Não foi possível enviar o alerta. Verifique a sua ligação.");
      console.error("Erro ao enviar SOS:", error);
    } finally {
      // Independentemente de dar erro ou sucesso, desbloqueia o botão
      setIsSending(false);
    }
  };

  // Função pendente para um futuro botão de apoio de mantimentos
  const handleApoio = () => {
    Alert.alert("Apoio Humanitário", "Funcionalidade de pedido de mantimentos em breve.");
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* MAPA: Envolvemos o mapa numa View para controlar melhor a altura */}
      <View style={styles.mapContainer}>
        <MapView 
          style={styles.map} 
          showsUserLocation={true} 
          showsMyLocationButton={true} 
          // Se "location" ainda for null, o mapa foca temporariamente no Porto por defeito
          region={location || {
            latitude: 41.1579, 
            longitude: -8.6291,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      </View>

      <ScrollView style={styles.bottomSection} showsVerticalScrollIndicator={false}>
        
        {/* Fila com os botões de ação principal */}
        <View style={styles.buttonRow}>
          {/* Botão de SOS (Desativado se `isSending` for true) */}
          <TouchableOpacity 
            style={[styles.actionButton, styles.btnSOS]} 
            onPress={handleSOS}
            disabled={isSending}
          >
            {/* Se estiver a enviar mostra a rodinha (ActivityIndicator), senão mostra o texto */}
            {isSending ? (
              <ActivityIndicator color="#FFF" size="large" />
            ) : (
              <>
                <Text style={styles.btnText}>SOS</Text>
                <Text style={styles.btnSubText}>Pedido Urgente</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Botão de Pedido de Apoio */}
          <TouchableOpacity 
            style={[styles.actionButton, styles.btnApoio]}
            onPress={handleApoio}
          >
            <Text style={styles.btnText}>APOIO</Text>
            <Text style={styles.btnSubText}>Mantimentos</Text>
          </TouchableOpacity>
        </View>

        {/* Cartão de informações sobre o estado de emergência global da zona */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Estado de Emergência: PORTO</Text>
          <Text style={styles.alertText}>🔥 ALERTA CRÍTICO 🔥</Text>
          <Text style={styles.infoText}>Incêndio ativo a 12km de distância.</Text>
          <Text style={styles.infoText}>Siga as instruções das autoridades.</Text>
        </View>

        {/* Cartão com atualizações e dicas */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Últimas Atualizações:</Text>
          <Text style={styles.infoText}>• Meios de socorro a caminho do setor Norte.</Text>
          <Text style={styles.infoText}>• Condições meteorológicas adversas previstas.</Text>
        </View>

        {/* Botão de Logout */}
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