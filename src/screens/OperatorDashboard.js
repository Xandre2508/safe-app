import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';

import { auth, db } from '../firebaseConfig';
import { sendLocalNotification } from '../services/notifications';
import { styles } from '../styles/OperatorDashboardStyles';

// Componentes modulares
import IncidentDetails from '../components/Operador/OperadorIncidentDetails';
import IncidentList from '../components/Operador/OperadorIncidentList';
import OperatorRescuerChatView from '../components/Operador/OperatorRescuerChatView';

export default function OperatorDashboard({ navigation }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('sos'); // 'sos' | 'radio'
  const [todasOcorrencias, setTodasOcorrencias] = useState([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [socorristas, setSocorristas] = useState([]);
  const [selectedRescuer, setSelectedRescuer] = useState(null);

  const isFirstLoadRadio = useRef(true);
  const currentTabRef = useRef(activeTab);
  const currentRescuerRef = useRef(selectedRescuer);

  useEffect(() => {
    currentTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    currentRescuerRef.current = selectedRescuer;
  }, [selectedRescuer]);

  // Controlo do botão físico de voltar no Android
  useEffect(() => {
    const onBackPress = () => {
      if (selectedIncidentId) {
        setSelectedIncidentId(null);
        return true;
      }
      if (selectedRescuer) {
        setSelectedRescuer(null);
        return true;
      }
      handleLogout();
      return true;
    };

    const backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandlerSubscription.remove();
  }, [selectedIncidentId, selectedRescuer]);

  const selectedIncident = todasOcorrencias.find((r) => r.id === selectedIncidentId);
  const pendingCount = todasOcorrencias.filter((r) => r.status === 'pendente').length;

  // Escuta contínua das ocorrências de SOS e Mantimentos
  useFocusEffect(
    useCallback(() => {
      let sosData = [];
      let mantimentosData = [];

      const updateCombinedList = () => {
        const combined = [...sosData, ...mantimentosData];
        combined.sort((a, b) => {
          if (a.status === 'pendente' && b.status !== 'pendente') return -1;
          if (a.status !== 'pendente' && b.status === 'pendente') return 1;
          const timeA = a.timestamp?.seconds || 0;
          const timeB = b.timestamp?.seconds || 0;
          return timeB - timeA;
        });
        setTodasOcorrencias(combined);
      };

      const qSos = query(collection(db, 'sos_requests'));
      const unsubSos = onSnapshot(qSos, (snapshot) => {
        sosData = snapshot.docs.map((d) => ({ id: d.id, tipoAlerta: 'SOS', ...d.data() }));
        updateCombinedList();
      }, (error) => console.warn('[OperatorDashboard] Erro ao monitorizar SOS:', error));

      const qMant = query(collection(db, 'pedidos_mantimentos'));
      const unsubMant = onSnapshot(qMant, (snapshot) => {
        mantimentosData = snapshot.docs.map((d) => ({ id: d.id, tipoAlerta: 'MANTIMENTO', ...d.data() }));
        updateCombinedList();
      }, (error) => console.warn('[OperatorDashboard] Erro ao monitorizar mantimentos:', error));

      return () => {
        unsubSos();
        unsubMant();
      };
    }, [])
  );

  // Carregamento de Socorristas registados
  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'socorrista'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const equipa = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSocorristas(equipa);
    }, (error) => console.warn('[OperatorDashboard] Erro ao listar socorristas:', error));

    return () => unsubscribe();
  }, []);

  // Notificações locais de rádio em tempo real
  useEffect(() => {
    if (socorristas.length === 0) return;

    const unsubscribes = socorristas.map((socorrista) => {
      const qMsg = query(
        collection(db, 'operator_rescuer_chats', socorrista.id, 'messages'),
        orderBy('timestamp', 'desc'),
        limit(1)
      );

      return onSnapshot(qMsg, (snapshot) => {
        if (!isFirstLoadRadio.current) {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const msgData = change.doc.data();
              const isLookingAtThisRescuer =
                currentTabRef.current === 'radio' && currentRescuerRef.current?.id === socorrista.id;

              if (msgData.senderRole === 'socorrista' && !isLookingAtThisRescuer) {
                sendLocalNotification(
                  `📻 Rádio: ${socorrista.nome || 'Socorrista'}`,
                  msgData.text || 'Nova transmissão recebida.',
                  'radio_messages'
                );
              }
            }
          });
        }
      });
    });

    const timer = setTimeout(() => {
      isFirstLoadRadio.current = false;
    }, 1500);

    return () => {
      clearTimeout(timer);
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [socorristas]);

  const handleLogout = () => {
    Alert.alert('Terminar Turno', 'Tem a certeza de que deseja encerrar a sessão na Central?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            navigation.replace('Login');
          } catch (err) {
            console.warn('[OperatorDashboard] Erro ao terminar sessão:', err);
            navigation.replace('Login');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Barra de Navegação Superior */}
      {!selectedIncidentId && !selectedRescuer && (
        <View style={styles.navBarContainer}>
          <View style={styles.navBar}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigation.navigate('ProfileScreen')}
              activeOpacity={0.7}
            >
              <Ionicons name="person-circle-outline" size={28} color="#4B5563" />
              <Text style={styles.navButtonText}>Perfil</Text>
            </TouchableOpacity>

            <View style={styles.navTabContainer}>
              <TouchableOpacity
                style={[styles.navTabButton, activeTab === 'sos' && styles.navTabButtonActive]}
                onPress={() => setActiveTab('sos')}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.navTabText, activeTab === 'sos' && styles.navTabTextActive]}
                >
                  🚨 Ocorrências ({pendingCount})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navTabButton, activeTab === 'radio' && styles.navTabButtonActive]}
                onPress={() => setActiveTab('radio')}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.navTabText, activeTab === 'radio' && styles.navTabTextActive]}
                >
                  📻 Rádio Tático
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.navButton} onPress={handleLogout} activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={28} color="#EF4444" />
              <Text style={[styles.navButtonText, { color: '#EF4444' }]}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Conteúdo Principal */}
      <View style={!selectedIncidentId && !selectedRescuer ? styles.contentPadding : { flex: 1 }}>
        {activeTab === 'sos' && (
          <>
            {!selectedIncidentId ? (
              <IncidentList
                ocorrencias={todasOcorrencias}
                pendingCount={pendingCount}
                onSelectIncident={setSelectedIncidentId}
              />
            ) : (
              <IncidentDetails
                incident={selectedIncident}
                onBack={() => setSelectedIncidentId(null)}
                currentUserId={auth.currentUser ? auth.currentUser.uid : 'operador_anonimo'}
              />
            )}
          </>
        )}

        {activeTab === 'radio' && (
          <>
            {!selectedRescuer ? (
              <FlatList
                data={socorristas}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 24, paddingTop: 10 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.rescuerCard}>
                    <Ionicons name="person-circle" size={44} color="#9CA3AF" />
                    <View style={styles.rescuerInfo}>
                      <Text style={styles.rescuerName}>{item.nome || 'Socorrista Sem Nome'}</Text>
                      <Text style={styles.rescuerStatus}>🟢 Operacional Ativo</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.chatIconButton}
                      onPress={() => setSelectedRescuer(item)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="chatbubbles" size={24} color="#3B82F6" />
                    </TouchableOpacity>
                  </View>
                )}
                ListEmptyComponent={
                  <View style={{ padding: 30, alignItems: 'center' }}>
                    <Text style={{ color: '#9CA3AF', fontSize: 15 }}>Nenhum socorrista registado no sistema.</Text>
                  </View>
                }
              />
            ) : (
              <OperatorRescuerChatView
                rescuer={selectedRescuer}
                operatorId={auth.currentUser?.uid}
                onBack={() => setSelectedRescuer(null)}
              />
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
