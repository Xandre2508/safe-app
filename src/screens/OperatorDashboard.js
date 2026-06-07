import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { useCallback, useEffect, useState, useRef } from 'react';
import { Alert, FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import * as Notifications from 'expo-notifications'; 

import { auth, db } from '../../src/firebaseConfig';
import { styles } from '../styles/OperatorDashboardStyles';

// Componentes
import IncidentDetails from '../components/Operador/OperadorIncidentDetails';
import IncidentList from '../components/Operador/OperadorIncidentList';
import OperatorRescuerChatView from '../components/Operador/OperatorRescuerChatView';

// --- CONFIGURAÇÃO GLOBAL DE NOTIFICAÇÕES ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function OperatorDashboard({ navigation }) {
  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState('sos'); // 'sos' | 'radio'
  const [todasOcorrencias, setTodasOcorrencias] = useState([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [socorristas, setSocorristas] = useState([]);
  const [selectedRescuer, setSelectedRescuer] = useState(null);

  // --- REFS (Para controlo de Notificações sem causar re-renders) ---
  const isFirstLoadSOS = useRef(true);
  const isFirstLoadRadio = useRef(true);
  const currentTabRef = useRef(activeTab);
  const currentRescuerRef = useRef(selectedRescuer);

  // Mantém as Refs atualizadas com o estado atual
  useEffect(() => { currentTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => { currentRescuerRef.current = selectedRescuer; }, [selectedRescuer]);

  // --- MÉTRICAS ---
  const selectedIncident = todasOcorrencias.find(r => r.id === selectedIncidentId);
  const pendingCount = todasOcorrencias.filter(r => r.status === 'pendente').length;

  // --- EFEITO 1: Pedir Permissões de Notificação ---
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') Alert.alert('Aviso', 'Ativa as notificações para não perderes alertas críticos.');
    };
    requestPermissions();
  }, []);

  // --- EFEITO 2: Ocorrências SOS e Mantimentos ---
  useFocusEffect(
    useCallback(() => {
      let sosData = [];
      let mantimentosData = [];

      // Função que junta as duas listas e ordena
      const updateCombinedList = () => {
        let combined = [...sosData, ...mantimentosData];
        combined.sort((a, b) => {
          if (a.status === 'pendente' && b.status !== 'pendente') return -1;
          if (a.status !== 'pendente' && b.status === 'pendente') return 1;
          return 0; 
        });
        setTodasOcorrencias(combined);
      };

      // Escutar SOS
      const qSos = query(collection(db, 'sos_requests'));
      const unsubSos = onSnapshot(qSos, (snapshot) => {
        sosData = snapshot.docs.map(doc => ({ id: doc.id, tipoAlerta: 'SOS', ...doc.data() }));
        updateCombinedList();
      });

      // Escutar Mantimentos
      const qMant = query(collection(db, 'pedidos_mantimentos'));
      const unsubMant = onSnapshot(qMant, (snapshot) => {
        mantimentosData = snapshot.docs.map(doc => ({ id: doc.id, tipoAlerta: 'MANTIMENTO', ...doc.data() }));
        updateCombinedList();
      });

      return () => {
        unsubSos();
        unsubMant();
      };
    }, [])
  );

  // --- EFEITO 3: Buscar Socorristas ---
  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'socorrista'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let equipa = [];
      snapshot.forEach(doc => equipa.push({ id: doc.id, ...doc.data() }));
      setSocorristas(equipa);
    });
    return () => unsubscribe();
  }, []);

  // --- EFEITO 4: Notificações de Rádio (Ouve todos os socorristas ativos) ---
  useEffect(() => {
    if (socorristas.length === 0) return;

    // Cria um listener para o chat de cada socorrista
    const unsubscribes = socorristas.map((socorrista) => {
      const qMsg = query(collection(db, 'operator_rescuer_chats', socorrista.id, 'messages'), orderBy('timestamp', 'desc'), limit(1));
      
      return onSnapshot(qMsg, (snapshot) => {
        if (!isFirstLoadRadio.current) {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const msgData = change.doc.data();
              
              // Só notifica se a mensagem for do socorrista E o operador não estiver a olhar para o chat dele
              const isLookingAtThisRescuer = currentTabRef.current === 'radio' && currentRescuerRef.current?.id === socorrista.id;
              
              if (msgData.senderRole === 'socorrista' && !isLookingAtThisRescuer) {
                Notifications.scheduleNotificationAsync({
                  content: {
                    title: `📻 Rádio: ${socorrista.nome}`,
                    body: msgData.text,
                    sound: true,
                  },
                  trigger: null,
                });
              }
            }
          });
        }
      });
    });

    // Timeout ligeiro para garantir que os dados antigos carregaram antes de ativar o gatilho de notificações
    setTimeout(() => { isFirstLoadRadio.current = false; }, 1000);

    // Limpeza de todos os listeners quando o ecrã for desmontado
    return () => unsubscribes.forEach(unsub => unsub());
  }, [socorristas]);

  // --- ACÕES ---
  const handleLogout = () => {
    Alert.alert("Terminar Sessão", "Tens a certeza que queres sair da central?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => navigation.navigate('Login') }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* NAVBAR SUPERIOR FIXA */}
      {!selectedIncidentId && !selectedRescuer && (
        <SafeAreaView style={styles.navBarContainer}>
          <View style={styles.navBar}>
            
            <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('ProfileScreen')}>
              <Ionicons name="person-circle-outline" size={28} color="#4B5563" />
              <Text style={styles.navButtonText}>Perfil</Text>
            </TouchableOpacity>

            <View style={styles.navTabContainer}>
              <TouchableOpacity 
                style={[styles.navTabButton, activeTab === 'sos' && styles.navTabButtonActive]} 
                onPress={() => setActiveTab('sos')}
              >
                <Text style={[styles.navTabText, activeTab === 'sos' && styles.navTabTextActive]}>
                  🚨 Alertas ({pendingCount})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.navTabButton, activeTab === 'radio' && styles.navTabButtonActive]} 
                onPress={() => setActiveTab('radio')}
              >
                <Text style={[styles.navTabText, activeTab === 'radio' && styles.navTabTextActive]}>
                  📻 Rádio
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.navButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={28} color="#EF4444" />
              <Text style={[styles.navButtonText, { color: '#EF4444' }]}>Sair</Text>
            </TouchableOpacity>

          </View>
        </SafeAreaView>
      )}

      {/* ÁREA DE CONTEÚDO */}
      <View style={(!selectedIncidentId && !selectedRescuer) ? styles.contentPadding : { flex: 1 }}>
        
        {/* ABA: SOS / MANTIMENTOS */}
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

        {/* ABA: RÁDIO */}
        {activeTab === 'radio' && (
          <>
            {!selectedRescuer ? (
              <FlatList
                data={socorristas}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                  <View style={styles.rescuerCard}>
                    <Ionicons name="person-circle" size={40} color="#9CA3AF" />
                    <View style={styles.rescuerInfo}>
                      <Text style={styles.rescuerName}>{item.nome}</Text>
                      <Text style={styles.rescuerStatus}>🟢 Online na Rede</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.chatIconButton} 
                      onPress={() => setSelectedRescuer(item)}
                    >
                      <Ionicons name="chatbubbles" size={24} color="#3B82F6" />
                    </TouchableOpacity>
                  </View>
                )}
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