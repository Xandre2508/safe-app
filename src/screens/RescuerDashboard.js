import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView, TouchableOpacity as GorhomTouchableOpacity } from '@gorhom/bottom-sheet';
import * as Location from 'expo-location';
import { collection, doc, limit, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import MapView, { Marker, Polyline } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { signOut } from 'firebase/auth';

import { auth, db } from '../firebaseConfig';
import { sendLocalNotification } from '../services/notifications';
import { styles } from '../styles/RescuerDashboardStyles';
import RescuerChatView from '../components/Socorrista/RescuerChatView';

const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

/**
 * Fórmula de Haversine para cálculo da distância geodésica em quilómetros.
 */
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getPriorityWeight = (detalhes) => {
  if (!detalhes) return 4;
  if (detalhes.criancas) return 1; // Prioridade máxima
  if (detalhes.gravida) return 2;
  return parseInt(detalhes.idade, 10) > 65 ? 3 : 4;
};

export default function RescuerDashboard({ navigation }) {
  const [location, setLocation] = useState(null);
  const [activeRequests, setActiveRequests] = useState([]);
  const [currentMission, setCurrentMission] = useState(null);
  const [showChat, setShowChat] = useState(false);

  const chatIsOpenRef = useRef(false);
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['18%', '48%', '88%'], []);

  // Botão de voltar físico no Android
  useEffect(() => {
    const onBackPress = () => {
      if (showChat) {
        toggleChat();
        return true;
      }
      handleLogout();
      return true;
    };

    const backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandlerSubscription.remove();
  }, [showChat]);

  // Listener das transmissões rádio da Central
  useEffect(() => {
    if (!auth.currentUser) return;

    const chatRef = collection(db, 'operator_rescuer_chats', auth.currentUser.uid, 'messages');
    const qChat = query(chatRef, orderBy('timestamp', 'desc'), limit(1));

    const unsubscribeChat = onSnapshot(qChat, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const messageData = change.doc.data();
          if (messageData.senderRole === 'operador' && !chatIsOpenRef.current) {
            sendLocalNotification(
              'Central de Operações',
              messageData.text || 'Nova mensagem de rádio recebida.',
              'radio_messages'
            );
          }
        }
      });
    }, (err) => console.warn('[RescuerDashboard] Erro no rádio:', err));

    return () => unsubscribeChat();
  }, []);

  // Monitorização de GPS com fallback no Android
  useEffect(() => {
    let locationSubscription;

    const startLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'GPS Necessário',
            'O S.A.F.E. necessita da sua localização para mapear as rotas de socorro.'
          );
          // Coordenadas padrão seguras (Lisboa / Porto) caso sem GPS
          setLocation({
            latitude: 41.1579,
            longitude: -8.6291,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
          return;
        }

        // Tentar obter a última posição conhecida imediatamente para arrancar rápido
        const lastKnown = await Location.getLastKnownPositionAsync({});
        if (lastKnown) {
          setLocation({
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          });
        }

        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 4000,
            distanceInterval: 10,
          },
          (loc) => {
            setLocation({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              latitudeDelta: 0.04,
              longitudeDelta: 0.04,
            });
          }
        );
      } catch (error) {
        console.warn('[RescuerDashboard] Falha ao iniciar GPS:', error);
      }
    };

    startLocationTracking();

    return () => {
      if (locationSubscription) locationSubscription.remove();
    };
  }, []);

  // Monitorização em tempo real de missões de resgate pendentes
  useEffect(() => {
    if (!location) return;

    const qSOS = query(collection(db, 'sos_requests'), where('status', '==', 'pendente'));
    const qMantimentos = query(collection(db, 'pedidos_mantimentos'), where('status', '==', 'pendente'));

    let pendingSOS = [];
    let pendingMant = [];

    const processRequests = () => {
      let combined = [];

      pendingSOS.forEach((data) => {
        if (data.latitude && data.longitude) {
          const distance = getDistanceKm(location.latitude, location.longitude, data.latitude, data.longitude);
          if (distance <= 60) {
            combined.push({ ...data, distance, tipoAlerta: 'SOS' });
          }
        }
      });

      pendingMant.forEach((data) => {
        if (data.latitude && data.longitude) {
          const distance = getDistanceKm(location.latitude, location.longitude, data.latitude, data.longitude);
          if (distance <= 60) {
            combined.push({ ...data, distance, tipoAlerta: 'MANTIMENTO' });
          }
        }
      });

      combined.sort((a, b) => {
        const weightA = a.tipoAlerta === 'SOS' ? getPriorityWeight(a.detalhes) : a.detalhes?.urgente ? 2 : 4;
        const weightB = b.tipoAlerta === 'SOS' ? getPriorityWeight(b.detalhes) : b.detalhes?.urgente ? 2 : 4;
        return weightA !== weightB ? weightA - weightB : a.distance - b.distance;
      });

      setActiveRequests(combined);
      setCurrentMission(combined.length > 0 ? combined[0] : null);
    };

    const unsubSOS = onSnapshot(qSOS, (snapshot) => {
      pendingSOS = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      processRequests();
    });

    const unsubMant = onSnapshot(qMantimentos, (snapshot) => {
      pendingMant = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      processRequests();
    });

    return () => {
      unsubSOS();
      unsubMant();
    };
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

    Alert.alert('Concluir Ocorrência', 'Confirmar que a assistência foi prestada e a ocorrência está resolvida?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar Conclusão',
        onPress: async () => {
          try {
            const colecao = currentMission.tipoAlerta === 'MANTIMENTO' ? 'pedidos_mantimentos' : 'sos_requests';
            await updateDoc(doc(db, colecao, currentMission.id), {
              status: 'concluido',
              resolvedAt: new Date().toISOString(),
              resolvedBy: auth.currentUser?.uid || 'socorrista',
            });
            Alert.alert('Sucesso', 'Ocorrência assinalada como resolvida.');
          } catch (error) {
            console.warn('[RescuerDashboard] Erro ao concluir missão:', error);
            Alert.alert('Erro', 'Não foi possível concluir a missão na base de dados.');
          }
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Terminar Turno', 'Pretende encerrar a sua sessão operacional?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            navigation.replace('Login');
          } catch (err) {
            console.warn('[RescuerDashboard] Erro ao sair:', err);
            navigation.replace('Login');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Barra de Navegação Superior */}
      <SafeAreaView style={styles.navBarContainer} edges={['top', 'left', 'right']}>
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('ProfileScreen')}
            activeOpacity={0.7}
          >
            <Ionicons name="person-circle-outline" size={28} color="#4B5563" />
            <Text style={styles.navButtonText}>Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navChatButton, showChat && styles.navChatButtonActive]}
            onPress={toggleChat}
            activeOpacity={0.8}
          >
            <View style={styles.iconBadgeContainer}>
              <Ionicons name="headset" size={24} color={showChat ? '#FFF' : '#3B82F6'} />
            </View>
            <Text style={[styles.navChatButtonText, showChat && { color: '#FFF' }]}>
              {showChat ? 'Ver Mapa Tático' : 'Rádio Central'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={handleLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={28} color="#EF4444" />
            <Text style={[styles.navButtonText, { color: '#EF4444' }]}>Sair</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Mapa Interativo */}
      {location ? (
        <MapView
          style={StyleSheet.absoluteFillObject}
          showsUserLocation
          showsMyLocationButton={false}
          region={location}
        >
          {currentMission && (
            <>
              <Marker
                coordinate={{
                  latitude: currentMission.latitude,
                  longitude: currentMission.longitude,
                }}
                pinColor={currentMission.tipoAlerta === 'SOS' ? '#EF4444' : '#3B82F6'}
                title={currentMission.tipoAlerta === 'SOS' ? '🚨 Vítima' : '📦 Entrega de Mantimentos'}
                description={currentMission.userName || 'Pedido de Socorro'}
              />

              {GOOGLE_MAPS_APIKEY ? (
                <MapViewDirections
                  origin={location}
                  destination={{
                    latitude: currentMission.latitude,
                    longitude: currentMission.longitude,
                  }}
                  apikey={GOOGLE_MAPS_APIKEY}
                  strokeWidth={5}
                  strokeColor="#3B82F6"
                  onError={(err) => console.warn('[RescuerDashboard] MapViewDirections falhou:', err)}
                />
              ) : (
                /* Fallback sem necessidade de API Key: Traçado direto da rota */
                <Polyline
                  coordinates={[
                    { latitude: location.latitude, longitude: location.longitude },
                    { latitude: currentMission.latitude, longitude: currentMission.longitude },
                  ]}
                  strokeColor="#3B82F6"
                  strokeWidth={4}
                  lineDashPattern={[6, 4]}
                />
              )}
            </>
          )}
        </MapView>
      ) : (
        <View style={styles.loadingMap}>
          <Text style={{ color: '#6B7280', fontSize: 16 }}>A obter sinal de GPS...</Text>
        </View>
      )}

      {/* Painel Inferior Deslizante (Bottom Sheet) */}
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        style={styles.bottomSheetShadow}
        keyboardBehavior="extend"
      >
        {!showChat ? (
          <BottomSheetScrollView
            contentContainerStyle={styles.contentSection}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerButtons}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: activeRequests.length > 0 ? '#EF4444' : '#10B981' },
                ]}
              >
                <Text style={styles.whiteIconText}>🚨 Ocorrências no Raio de Ação</Text>
                <Text style={styles.countText}>{activeRequests.length} Ativas</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Missão Prioritária {currentMission ? `(${currentMission.tipoAlerta})` : ''}:
              </Text>

              {currentMission ? (
                <>
                  <Text style={styles.highlightDistance}>
                    📍 {currentMission.distance ? currentMission.distance.toFixed(1) : '0.0'} km de distância
                  </Text>
                  <Text style={styles.listItem}>👤 Cidadão: {currentMission.userName || 'Não identificado'}</Text>

                  {currentMission.detalhes && (
                    <View style={styles.priorityBox}>
                      <Text style={styles.priorityText}>
                        STATUS DE TRIAGEM:{' '}
                        {currentMission.tipoAlerta === 'SOS'
                          ? currentMission.detalhes.criancas
                            ? 'CRIANÇAS PRESENTES'
                            : currentMission.detalhes.gravida
                            ? 'GRÁVIDA'
                            : parseInt(currentMission.detalhes.idade, 10) > 65
                            ? 'IDOSO'
                            : 'NORMAL'
                          : currentMission.detalhes.urgente
                          ? 'URGENTE'
                          : 'NORMAL'}
                      </Text>
                    </View>
                  )}

                  <GorhomTouchableOpacity
                    style={styles.completeButton}
                    onPress={handleCompleteMission}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.completeButtonText}>Assinalar Como Concluído</Text>
                  </GorhomTouchableOpacity>
                </>
              ) : (
                <Text style={styles.listItem}>Não existem ocorrências pendentes de momento.</Text>
              )}
            </View>
          </BottomSheetScrollView>
        ) : (
          <View style={[styles.contentSection, { flex: 1, paddingBottom: 0 }]}>
            <View style={styles.chatHeader}>
              <GorhomTouchableOpacity onPress={toggleChat} style={styles.backButton}>
                <Ionicons name="arrow-back" size={22} color="#1F2937" />
                <Text style={styles.backButtonText}>Recolher Rádio</Text>
              </GorhomTouchableOpacity>
            </View>

            <RescuerChatView currentUserId={auth.currentUser?.uid} />
          </View>
        )}
      </BottomSheet>
    </View>
  );
}
