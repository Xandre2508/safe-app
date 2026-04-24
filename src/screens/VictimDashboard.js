import * as Location from 'expo-location'; // Funcionalidade Nativa: GPS 
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import MapView from 'react-native-maps'; // Componente de Mapa Nativo

// Importação da configuração do Firebase que criámos anteriormente
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

// Importação dos estilos separados para manter o código limpo e organizado
import { styles } from './styles/VictimDashboardStyles';

export default function VictimDashboard({ navigation }) {
  // Estados para gerir a localização do utilizador e o estado de envio do SOS
  const [location, setLocation] = useState(null);
  const [isSending, setIsSending] = useState(false);

  /**
   * Hook useEffect que corre ao iniciar o ecrã.
   * Serve para pedir permissão ao sistema operativo e obter as coordenadas atuais.
   */
  useEffect(() => {
    (async () => {
      // Pedir permissão para aceder à localização em primeiro plano [cite: 9]
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Negada', 
          'Precisamos da sua localização para que os socorristas o encontrem.'
        );
        return;
      }

      // Obter a posição atual com precisão equilibrada
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.05, // Zoom inicial do mapa
        longitudeDelta: 0.05,
      });
    })();
  }, []);

  /**
   * Função handleSOS: Envia o pedido de socorro para o Firebase.
   * Este pedido será lido pelos socorristas que estejam num raio de 50km.
   */
  const handleSOS = async () => {
    // Verificar se o GPS já conseguiu obter a localização
    if (!location) {
      Alert.alert("Aguarde", "A obter a sua localização exata para o resgate...");
      return;
    }

    setIsSending(true);

    try {
      // 1. Gravar o pedido na coleção 'sos_requests' do Firestore 
      await addDoc(collection(db, 'sos_requests'), {
        userId: auth.currentUser ? auth.currentUser.uid : 'anonimo',
        userEmail: auth.currentUser ? auth.currentUser.email : 'N/A',
        latitude: location.latitude,
        longitude: location.longitude,
        type: 'SOS_URGENTE', // Identifica o tipo de alerta
        status: 'pendente',  // Estado inicial que os socorristas verão
        timestamp: serverTimestamp() // Hora exata guardada pelo servidor
      });

      // 2. Feedback visual ao utilizador [cite: 11]
      Alert.alert(
        "🚨 Alerta Enviado!", 
        "O seu pedido foi enviado com sucesso. Socorristas num raio de 50km estão a ser notificados."
      );
    } catch (error) {
      // Tratamento de erros (ex: falta de internet)
      Alert.alert("Erro", "Não foi possível enviar o alerta. Verifique a sua ligação.");
      console.error("Erro ao enviar SOS:", error);
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Função handleApoio: Para pedidos de mantimentos (Água, Comida, Abrigo).
   */
  const handleApoio = () => {
    // Pode implementar lógica semelhante ao SOS mas com o tipo 'APOIO_HUMANITARIO'
    Alert.alert("Apoio Humanitário", "Funcionalidade de pedido de mantimentos em breve.");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Secção do Mapa: Mostra onde o utilizador está em tempo real [cite: 35] */}
      <View style={styles.mapContainer}>
        <MapView 
          style={styles.map} 
          showsUserLocation={true} // Ponto azul nativo
          showsMyLocationButton={true} // Botão para centrar a câmara
          region={location || {
            latitude: 41.1579, // Coordenadas do Porto por defeito
            longitude: -8.6291,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      </View>

      {/* Secção de Interação: Botões e Alertas informativos [cite: 11] */}
      <ScrollView style={styles.bottomSection} showsVerticalScrollIndicator={false}>
        
        {/* Linha de botões principais baseada no layout */}
        <View style={styles.buttonRow}>
          {/* Botão de SOS Vermelho */}
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

          {/* Botão de APOIO Azul */}
          <TouchableOpacity 
            style={[styles.actionButton, styles.btnApoio]}
            onPress={handleApoio}
          >
            <Text style={styles.btnText}>APOIO</Text>
            <Text style={styles.btnSubText}>Mantimentos</Text>
          </TouchableOpacity>
        </View>

        {/* Cartão de Estado de Emergência */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Estado de Emergência: PORTO</Text>
          <Text style={styles.alertText}>🔥 ALERTA CRÍTICO 🔥</Text>
          <Text style={styles.infoText}>Incêndio ativo a 12km de distância.</Text>
          <Text style={styles.infoText}>Siga as instruções das autoridades.</Text>
        </View>

        {/* Histórico/Últimos Alertas */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Últimas Atualizações:</Text>
          <Text style={styles.infoText}>• Meios de socorro a caminho do setor Norte.</Text>
          <Text style={styles.infoText}>• Condições meteorológicas adversas previstas.</Text>
        </View>

        {/* Botão para voltar ao ecrã de Login */}
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