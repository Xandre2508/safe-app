import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { collection, doc, limit, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

import { auth, db } from '../../src/firebaseConfig';
import { styles } from '../styles/RescuerDashboardStyles';

// O teu componente de chat Rádio
import RescuerChatView from '../components/Socorrista/RescuerChatView';

const GOOGLE_MAPS_APIKEY = 'COLA_AQUI_A_TUA_CHAVE_DE_API'; 

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
};

const getPriorityWeight = (detalhes) => {
  if (!detalhes) return 4;
  if (detalhes.criancas) return 1;
  if (detalhes.gravida) return 2;
  return parseInt(detalhes.idade) > 65 ? 3 : 4;
};

export default function RescuerDashboard({ navigation }) {
  const [location, setLocation] = useState(null);
  const [activeRequests, setActiveRequests] = useState([]);
  const [currentMission, setCurrentMission] = useState(null);
  const [showChat, setShowChat] = useState(false);
  
  const chatIsOpenRef = useRef(false);
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['15%', '45%', '85%'], []);

  useEffect(() => {
    const requestNotificationPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Aviso', 'Ativa as notificações para receberes alertas da Central.');
      }
    };
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;
    const chatRef = collection(db, 'operator_rescuer_chats', auth.currentUser.uid, 'messages');
    const qChat = query(chatRef, orderBy('timestamp', 'desc'), limit(1));

    const unsubscribeChat = onSnapshot(qChat, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const messageData = change.doc.data();
          if (messageData.senderRole === 'operador' && !chatIsOpenRef.current) {
            Notifications.scheduleNotificationAsync({
              content: { title: 'Central de Operações', body: messageData.text, sound: true },
              trigger: null,
            });
          }
        }
      });
    });
    return () => unsubscribeChat();
  }, []);

  useEffect(() => {
    let locationSubscription;
    const startLocationTracking = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        locationSubscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 15 },
          (loc) => setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude, latitudeDelta: 0.04, longitudeDelta: 0.04 })
        );
      }
    };
    startLocationTracking();
    return () => { if (locationSubscription) locationSubscription.remove(); };
  }, []);

  useEffect(() => {
    if (!location) return;
    const q = query(collection(db, 'sos_requests'), where('status', '==', 'pendente'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let requests = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const distance = getDistanceKm(location.latitude, location.longitude, data.latitude, data.longitude);
        if (distance <= 50) requests.push({ id: doc.id, distance, ...data });
      });
      requests.sort((a, b) => {
        const weightA = getPriorityWeight(a.detalhes);
        const weightB = getPriorityWeight(b.detalhes);
        return weightA !== weightB ? weightA - weightB : a.distance - b.distance; 
      });
      setActiveRequests(requests);
      setCurrentMission(requests.length > 0 ? requests[0] : null);
    });
    return () => unsubscribe();
  }, [location]); 

  const toggleChat = () => {
    const nextState = !showChat;
    setShowChat(nextState);
    chatIsOpenRef.current = nextState; 
    
    if (nextState) bottomSheetRef.current?.snapToIndex(2);
    else bottomSheetRef.current?.snapToIndex(1);
  };

  const handleCompleteMission = async () => {
    if (!currentMission) return;
    Alert.alert("Concluir Resgate", "Confirmar que a missão está terminada?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sim, Concluído", onPress: async () => {
          await updateDoc(doc(db, 'sos_requests', currentMission.id), { status: 'concluido' });
        }
      }
    ]);
  };

  const handleLogout = () => {
    Alert.alert("Terminar Sessão", "Tens a certeza que queres sair do sistema?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => navigation.navigate('Login') }
    ]);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.navBarContainer}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('ProfileScreen')}>
            <Ionicons name="person-circle-outline" size={28} color="#4B5563" />
            <Text style={styles.navButtonText}>Perfil</Text>
          </TouchableOpacity>

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

      {location ? (
        <MapView style={StyleSheet.absoluteFillObject} showsUserLocation={true} showsMyLocationButton={false} region={location}>
          {currentMission && (
            <>
              <Marker coordinate={{ latitude: currentMission.latitude, longitude: currentMission.longitude }} pinColor="red" />
              <MapViewDirections origin={location} destination={{ latitude: currentMission.latitude, longitude: currentMission.longitude }} apikey={GOOGLE_MAPS_APIKEY} strokeWidth={5} strokeColor="#3B82F6" />
            </>
          )}
        </MapView>
      ) : (
        <View style={styles.loadingMap}><Text>A calibrar GPS...</Text></View>
      )}

      <BottomSheet ref={bottomSheetRef} index={1} snapPoints={snapPoints} style={styles.bottomSheetShadow}>
        <BottomSheetView style={{ flex: 1 }}>
          
          {!showChat ? (
            <BottomSheetScrollView contentContainerStyle={styles.contentSection} keyboardShouldPersistTaps="handled">
              <View style={styles.headerButtons}>
                <View style={[styles.statusBadge, { backgroundColor: activeRequests.length > 0 ? '#EF4444' : '#10B981' }]}>
                  <Text style={styles.whiteIconText}>⚠️ Alerta de Ativos</Text>
                  <Text style={styles.countText}>{activeRequests.length} Ocorrências</Text>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Resgate Prioritário:</Text>
                {currentMission ? (
                  <>
                    <Text style={styles.highlightDistance}>📍 {currentMission.distance.toFixed(1)} km</Text>
                    <Text style={styles.listItem}>👤 Nome: {currentMission.userName || "N/A"}</Text>
                    
                    {currentMission.detalhes && (
                      <View style={styles.priorityBox}>
                        <Text style={styles.priorityText}>
                          🚨 PRIORIDADE: 
                          {currentMission.detalhes.criancas ? " CRIANÇAS PRESENTES" : 
                           currentMission.detalhes.gravida ? " GRÁVIDA" : 
                           parseInt(currentMission.detalhes.idade) > 65 ? " IDOSO" : " NORMAL"}
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity style={styles.completeButton} onPress={handleCompleteMission}>
                      <Ionicons name="checkmark-circle" size={20} color="#FFF" style={{ marginRight: 6 }} />
                      <Text style={styles.completeButtonText}>Marcar Concluído</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text style={styles.listItem}>Nenhuma ocorrência.</Text>
                )}
              </View>
            </BottomSheetScrollView>
          ) : (
            <View style={[styles.contentSection, { flex: 1, paddingBottom: 0 }]}>
              <View style={styles.chatHeader}>
                <TouchableOpacity onPress={toggleChat} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={22} color="#1F2937" />
                  <Text style={styles.backButtonText}>Recolher Rádio</Text>
                </TouchableOpacity>
              </View>
              
              <RescuerChatView currentUserId={auth.currentUser?.uid} />
            </View>
          )}

        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}