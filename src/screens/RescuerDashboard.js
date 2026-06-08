import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView, TouchableOpacity as GorhomTouchableOpacity } from '@gorhom/bottom-sheet';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { collection, doc, limit, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

import { auth, db } from '../../src/firebaseConfig';
import { styles } from '../styles/RescuerDashboardStyles';

// Componente de chat Rádio
import RescuerChatView from '../components/Socorrista/RescuerChatView';

// Constante para a API Key do Google Maps (Necessária para desenhar as rotas no mapa)
const GOOGLE_MAPS_APIKEY = 'COLA_AQUI_A_TUA_CHAVE_DE_API'; 

// Configuração do comportamento global das notificações push recebidas em primeiro plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Função para calcular a distância em Quilómetros entre duas coordenadas GPS.
 * Utiliza a Fórmula de Haversine para ter em conta a curvatura da terra.
 */
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Raio médio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
};

/**
 * Define o peso da prioridade da ocorrência baseado nos detalhes fornecidos.
 * Quanto menor o número, maior a prioridade (1 = Prioridade Máxima).
 */
const getPriorityWeight = (detalhes) => {
  if (!detalhes) return 4; // Prioridade normal
  if (detalhes.criancas) return 1; // Máxima prioridade: crianças envolvidas
  if (detalhes.gravida) return 2; // Alta prioridade: grávidas
  return parseInt(detalhes.idade) > 65 ? 3 : 4; // Prioridade média para idosos, normal para os restantes
};

export default function RescuerDashboard({ navigation }) {
  // Variáveis de Estado (State)
  const [location, setLocation] = useState(null); // Localização atual do socorrista
  const [activeRequests, setActiveRequests] = useState([]); // Lista de todas as ocorrências ativas perto
  const [currentMission, setCurrentMission] = useState(null); // Missão atual (a mais prioritária/próxima)
  const [showChat, setShowChat] = useState(false); // Alterna entre a vista do mapa/missão e a vista do chat
  
  // Referências (Refs) para manter valores sem causar re-renderizações na interface
  const chatIsOpenRef = useRef(false); // Para saber se o chat está aberto (usado nas notificações)
  const bottomSheetRef = useRef(null); // Controlo da janela deslizante inferior (Bottom Sheet)
  
  // Pontos de paragem da altura do Bottom Sheet (15%, 45% e 85% do ecrã)
  const snapPoints = useMemo(() => ['15%', '45%', '85%'], []);

  // 1. Hook para pedir permissões de Notificação quando a app inicia
  useEffect(() => {
    const requestNotificationPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Aviso', 'Ativa as notificações para receberes alertas da Central.');
      }
    };
    requestNotificationPermissions();
  }, []);

  // 2. Hook para escutar novas mensagens de rádio no Firebase
  useEffect(() => {
    if (!auth.currentUser) return;
    
    // Referência à coleção de mensagens do socorrista autenticado
    const chatRef = collection(db, 'operator_rescuer_chats', auth.currentUser.uid, 'messages');
    const qChat = query(chatRef, orderBy('timestamp', 'desc'), limit(1)); // Pega apenas na última mensagem

    // Escuta alterações em tempo real
    const unsubscribeChat = onSnapshot(qChat, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        // Se a mensagem foi adicionada, foi enviada pelo operador, e o chat ESTÁ FECHADO, emite notificação local
        if (change.type === 'added') {
          const messageData = change.doc.data();
          if (messageData.senderRole === 'operador' && !chatIsOpenRef.current) {
            Notifications.scheduleNotificationAsync({
              content: { title: 'Central de Operações', body: messageData.text, sound: true },
              trigger: null, // trigger null faz a notificação disparar imediatamente
            });
          }
        }
      });
    });
    
    return () => unsubscribeChat(); // Limpa o listener quando o componente é desmontado
  }, []);

  // 3. Hook para rastrear a localização do Socorrista em tempo real
  useEffect(() => {
    let locationSubscription;
    const startLocationTracking = async () => {
      // Pede permissão para aceder ao GPS
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        // Inicia a monitorização constante da localização
        locationSubscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 15 }, // Atualiza a cada 5s ou 15 metros
          (loc) => setLocation({ 
            latitude: loc.coords.latitude, 
            longitude: loc.coords.longitude, 
            latitudeDelta: 0.04, 
            longitudeDelta: 0.04 
          })
        );
      }
    };
    startLocationTracking();
    
    return () => { if (locationSubscription) locationSubscription.remove(); };
  }, []);

  // 4. Hook para buscar pedidos de SOS e Mantimentos na base de dados
  // Só corre se a 'location' for conhecida, ou se a location for atualizada
  useEffect(() => {
    if (!location) return; // Aguarda a obtenção das coordenadas do socorrista
    
    // Queries para procurar apenas missões pendentes
    const qSOS = query(collection(db, 'sos_requests'), where('status', '==', 'pendente'));
    const qMantimentos = query(collection(db, 'pedidos_mantimentos'), where('status', '==', 'pendente'));

    let pendingSOS = [];
    let pendingMant = [];

    // Função interna que junta, filtra e ordena os pedidos
    const processRequests = () => {
      let combinedRequests = [];

      // Filtra pedidos de SOS a um raio de 50km
      pendingSOS.forEach((data) => {
        const distance = getDistanceKm(location.latitude, location.longitude, data.latitude, data.longitude);
        if (distance <= 50) combinedRequests.push({ ...data, distance, tipoAlerta: 'SOS' });
      });

      // Filtra pedidos de mantimentos a um raio de 50km
      pendingMant.forEach((data) => {
        const distance = getDistanceKm(location.latitude, location.longitude, data.latitude, data.longitude);
        if (distance <= 50) combinedRequests.push({ ...data, distance, tipoAlerta: 'MANTIMENTO' });
      });

      // Lógica de Ordenação das missões
      combinedRequests.sort((a, b) => {
        // Calcula o peso de prioridade de ambas
        let weightA = a.tipoAlerta === 'SOS' ? getPriorityWeight(a.detalhes) : (a.detalhes?.urgente ? 2 : 4);
        let weightB = b.tipoAlerta === 'SOS' ? getPriorityWeight(b.detalhes) : (b.detalhes?.urgente ? 2 : 4);
        
        // Se as prioridades forem diferentes, ordena pela prioridade. Se forem iguais, ordena pela distância (mais próximo primeiro)
        return weightA !== weightB ? weightA - weightB : a.distance - b.distance; 
      });

      // Atualiza os estados de interface
      setActiveRequests(combinedRequests);
      setCurrentMission(combinedRequests.length > 0 ? combinedRequests[0] : null); // Define o index 0 como missão atual
    };

    // Listeners do Firebase para as duas coleções
    const unsubSOS = onSnapshot(qSOS, (snapshot) => {
      pendingSOS = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      processRequests();
    });

    const unsubMant = onSnapshot(qMantimentos, (snapshot) => {
      pendingMant = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      processRequests();
    });

    // Limpa os listeners ao desmontar ou se as coordenadas resetarem
    return () => { unsubSOS(); unsubMant(); };
  }, [location]); 

  // Função para abrir e fechar a janela do Chat
  const toggleChat = () => {
    const nextState = !showChat;
    setShowChat(nextState);
    chatIsOpenRef.current = nextState; // Atualiza a Ref usada pelas notificações push
    
    // Anima o painel inferior dependendo se estamos a abrir o chat (85%) ou a ver o mapa (45%)
    if (nextState) bottomSheetRef.current?.snapToIndex(2);
    else bottomSheetRef.current?.snapToIndex(1);
  };

  // Função para dar a missão atual como concluída
  const handleCompleteMission = async () => {
    if (!currentMission) return;
    
    Alert.alert("Concluir Missão", "Confirmar que a missão está terminada?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sim, Concluído", onPress: async () => {
          try {
            // Verifica de qual coleção a missão veio e atualiza o campo "status"
            const colecao = currentMission.tipoAlerta === 'MANTIMENTO' ? 'pedidos_mantimentos' : 'sos_requests';
            await updateDoc(doc(db, colecao, currentMission.id), { status: 'concluido' });
          } catch (error) {
            Alert.alert("Erro", "Ocorreu um erro ao tentar concluir a missão.");
            console.log(error);
          }
        }
      }
    ]);
  };

  // Lógica de saída de conta
  const handleLogout = () => {
    Alert.alert("Terminar Sessão", "Tens a certeza que queres sair do sistema?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => navigation.navigate('Login') }
    ]);
  };

  // ================= RENDERIZAÇÃO DA INTERFACE =================
  return (
    <View style={styles.container}>
      
      {/* Barra de Navegação no topo */}
      <SafeAreaView style={styles.navBarContainer}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('ProfileScreen')}>
            <Ionicons name="person-circle-outline" size={28} color="#4B5563" />
            <Text style={styles.navButtonText}>Perfil</Text>
          </TouchableOpacity>

          {/* Botão central para alternar entre as visões Mapa / Rádio */}
          <TouchableOpacity style={[styles.navChatButton, showChat && styles.navChatButtonActive]} onPress={toggleChat}>
            <View style={styles.iconBadgeContainer}>
              <Ionicons name="headset" size={24} color={showChat ? "#FFF" : "#3B82F6"} />
            </View>
            <Text style={[styles.navChatButtonText, showChat && { color: '#FFF' }]}>
              {showChat ? "Ver Mapa" : "Central Rádio"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={28} color="#EF4444" />
            <Text style={[styles.navButtonText, { color: '#EF4444' }]}>Sair</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Renderização Condicional do Mapa (Mostra loading até obter GPS) */}
      {location ? (
        <MapView style={StyleSheet.absoluteFillObject} showsUserLocation={true} showsMyLocationButton={false} region={location}>
          {/* Se houver uma missão ativa, mostra o marcador e a rota calculada pelo Maps Directions */}
          {currentMission && (
            <>
              <Marker coordinate={{ latitude: currentMission.latitude, longitude: currentMission.longitude }} pinColor="red" />
              <MapViewDirections 
                origin={location} 
                destination={{ latitude: currentMission.latitude, longitude: currentMission.longitude }} 
                apikey={GOOGLE_MAPS_APIKEY} 
                strokeWidth={5} 
                strokeColor="#3B82F6" 
              />
            </>
          )}
        </MapView>
      ) : (
        <View style={styles.loadingMap}><Text>A calibrar GPS...</Text></View>
      )}

      {/* Janela Deslizante Inferior (Bottom Sheet) */}
      <BottomSheet 
        ref={bottomSheetRef} 
        index={1} // Inicia no tamanho intermédio (45%)
        snapPoints={snapPoints} 
        style={styles.bottomSheetShadow}
        keyboardBehavior="extend"
      >
        {/* Renderiza Missões OU Chat, consoante o estado 'showChat' */}
        {!showChat ? (
          <BottomSheetScrollView contentContainerStyle={styles.contentSection} keyboardShouldPersistTaps="handled">
            
            {/* Header de Ocorrências */}
            <View style={styles.headerButtons}>
              <View style={[styles.statusBadge, { backgroundColor: activeRequests.length > 0 ? '#EF4444' : '#10B981' }]}>
                <Text style={styles.whiteIconText}>⚠️ Alerta de Ativos</Text>
                <Text style={styles.countText}>{activeRequests.length} Ocorrências</Text>
              </View>
            </View>

            {/* Cartão de Detalhes da Missão Atual */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Missão Ativa {currentMission ? `(${currentMission.tipoAlerta})` : ''}:</Text>
              
              {currentMission ? (
                <>
                  {/* Distância */}
                  <Text style={styles.highlightDistance}>📍 {currentMission.distance.toFixed(1)} km</Text>
                  
                  {/* Informação do Utilizador em Perigo */}
                  <Text style={styles.listItem}>👤 Nome: {currentMission.userName || "N/A"}</Text>
                  
                  {/* Caixa de Prioridade formatada */}
                  {currentMission.detalhes && (
                    <View style={styles.priorityBox}>
                      <Text style={styles.priorityText}>
                        🚨 PRIORIDADE: 
                        {currentMission.tipoAlerta === 'SOS' 
                          ? (currentMission.detalhes.criancas ? " CRIANÇAS PRESENTES" : 
                             currentMission.detalhes.gravida ? " GRÁVIDA" : 
                             parseInt(currentMission.detalhes.idade) > 65 ? " IDOSO" : " NORMAL")
                          : (currentMission.detalhes.urgente ? " URGENTE" : " NORMAL")
                        }
                      </Text>
                    </View>
                  )}

                  {/* Botão de Conclusão da Missão (Notar o GorhomTouchableOpacity para evitar conflitos no BottomSheet) */}
                  <GorhomTouchableOpacity style={styles.completeButton} onPress={handleCompleteMission}>
                    <Ionicons name="checkmark-circle" size={20} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.completeButtonText}>Marcar Concluído</Text>
                  </GorhomTouchableOpacity>
                </>
              ) : (
                <Text style={styles.listItem}>Nenhuma ocorrência.</Text>
              )}
            </View>
          </BottomSheetScrollView>
        ) : (
          /* Visualização do Chat da Central */
          <View style={[styles.contentSection, { flex: 1, paddingBottom: 0 }]}>
            <View style={styles.chatHeader}>
              <GorhomTouchableOpacity onPress={toggleChat} style={styles.backButton}>
                <Ionicons name="arrow-back" size={22} color="#1F2937" />
                <Text style={styles.backButtonText}>Recolher Rádio</Text>
              </GorhomTouchableOpacity>
            </View>
            
            {/* Componente Modular do Chat */}
            <RescuerChatView currentUserId={auth.currentUser?.uid} />
          </View>
        )}
      </BottomSheet>
    </View>
  );
}