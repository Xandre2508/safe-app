import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { addDoc, collection, doc, getDoc, onSnapshot, query, serverTimestamp, updateDoc, where, orderBy, limit } from 'firebase/firestore'; 
import { useEffect, useState, useRef } from 'react'; 
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MapView from 'react-native-maps';
import * as Notifications from 'expo-notifications'; 

// Importação das configurações e constantes
import { auth, db } from '../../src/firebaseConfig';
import { Strings } from '../constants/Strings';
import { styles } from '../styles/VictimDashboardStyles';

// Importação dos Componentes Visuais
import ActiveEmergencyView from '../components/Vitima/ActiveEmergencyView';
import EmergencyHistoryView from '../components/Vitima/EmergencyHistoryView';
import InitialActionButtons from '../components/Vitima/InitialActionButtons';
import NewsSection from '../components/Vitima/NewsSection';
import SOSDetailsForm from '../components/Vitima/SOSDetailsForm';
import MantimentosDetailsForm from '../components/Mantimentos/MantimentosDetailsForm';
import ActiveMantimentosView from '../components/Mantimentos/ActiveMantimentosView';

// Importação dos Custom Hooks
import { useLocation } from '../hooks/useLocation';
import { useNews } from '../hooks/useNews';

// --- CONFIGURAÇÃO GLOBAL DE NOTIFICAÇÕES ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function VictimDashboard({ navigation }) {
  const { location } = useLocation(); 
  const { news, loadingNews } = useNews(); 

  const [isSending, setIsSending] = useState(false); 
  const [showDetailsForm, setShowDetailsForm] = useState(false); 
  const [showHistory, setShowHistory] = useState(false); 
  const [showMantimentosForm, setShowMantimentosForm] = useState(false); 
  
  const [isEmergencyMinimized, setIsEmergencyMinimized] = useState(false);
  const isMinimizedRef = useRef(isEmergencyMinimized); 

  // NOVO: Estados e Refs para o Chat de Mantimentos
  const [activeMantimentosId, setActiveMantimentosId] = useState(null);
  const [isMantimentosMinimized, setIsMantimentosMinimized] = useState(false);
  const isMantMinimizedRef = useRef(isMantimentosMinimized);

  const [userName, setUserName] = useState(''); 
  const [activeSosId, setActiveSosId] = useState(null); 
  const [userName, setUserName] = useState(''); 

  // Refs para ler estado dentro dos listeners
  const isMinimizedRef = useRef(isEmergencyMinimized); 
  const activeSosIdRef = useRef(activeSosId);

  // Estados do SOS
  const [idade, setIdade] = useState('');
  const [estaGravida, setEstaGravida] = useState(false);
  const [temCriancas, setTemCriancas] = useState(false);

  // Estados dos Mantimentos
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [urgente, setUrgente] = useState(false);

  useEffect(() => {
    isMinimizedRef.current = isEmergencyMinimized;
  }, [isEmergencyMinimized]);

  // NOVO: Sincronizar o Ref dos Mantimentos
  useEffect(() => {
    isMantMinimizedRef.current = isMantimentosMinimized;
  }, [isMantimentosMinimized]);

  useEffect(() => {
    const requestNotificationPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log("Permissão para notificações não concedida.");
      }
    };
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    const fetchUserName = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) setUserName(userDoc.data().nome);
        } catch (error) {
          console.log("Erro ao buscar nome:", error);
        }
      }
    };
    fetchUserName();
  }, []);

  // --- MOTOR: SOS ---
  useEffect(() => {
    if (!auth.currentUser) return; 
    
    const q = query(collection(db, 'sos_requests'), where('userId', '==', auth.currentUser.uid));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const pendingRequest = snapshot.docs.find(doc => doc.data().status === 'pendente');
        
        if (pendingRequest) {
          if (pendingRequest.id !== activeSosIdRef.current) {
              setActiveSosId(pendingRequest.id);
              setIsEmergencyMinimized(false);
          }
        } else {
          if (activeSosIdRef.current) {
            const completedDoc = snapshot.docs.find(doc => doc.id === activeSosIdRef.current && doc.data().status === 'concluido');
            if (completedDoc) {
              Alert.alert("Resgate Concluído ✅", "O operador encerrou a ocorrência. Mantém-te em segurança.");
            }
            setActiveSosId(null); 
          }
        }
      },
      // Tratamento de erro silencioso para evitar "Permission Denied" no logout
      (error) => {
        console.log("Listener de SOS interrompido (esperado durante o logout):", error.code);
      }
    );

    return () => unsubscribe();
  }, []); 

  // NOVO: MOTOR: MANTIMENTOS ---
  useEffect(() => {
    if (!auth.currentUser) return; 
    
    const q = query(collection(db, 'pedidos_mantimentos'), where('userId', '==', auth.currentUser.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pendingRequest = snapshot.docs.find(doc => doc.data().status === 'pendente');
      
      if (pendingRequest) {
        if (pendingRequest.id !== activeMantimentosId) {
            setActiveMantimentosId(pendingRequest.id);
            setIsMantimentosMinimized(false);
        }
      } else {
        setActiveMantimentosId((prevId) => {
          if (prevId) {
            const completedDoc = snapshot.docs.find(doc => doc.id === prevId && doc.data().status === 'concluido');
            if (completedDoc) Alert.alert("Pedido Concluído ✅", "O teu pedido de mantimentos foi encerrado.");
          }
          return null; 
        });
      }
    });

    return () => unsubscribe();
  }, [activeMantimentosId]);

  // --- NOTIFICAÇÕES: SOS ---
  useEffect(() => {
    if (!activeSosId) return;

    const msgQuery = query(
      collection(db, 'sos_requests', activeSosId, 'messages'), 
      orderBy('timestamp', 'desc'), 
      limit(1)
    );

    const unsubscribeMessages = onSnapshot(msgQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const msgData = change.doc.data();
          
          if (msgData.senderRole === 'operador' && isMinimizedRef.current) {
            Notifications.scheduleNotificationAsync({
              content: {
                title: 'Central de Operações',
                body: msgData.text,
                sound: true,
              },
              trigger: null,
            });
          }
        });
      },
      // Tratamento de erro silencioso para evitar "Permission Denied" no logout
      (error) => {
        console.log("Listener de Mensagens interrompido (esperado durante o logout):", error.code);
      }
    );

    return () => unsubscribeMessages();
  }, [activeSosId]);

  // NOVO: NOTIFICAÇÕES: MANTIMENTOS ---
  useEffect(() => {
    if (!activeMantimentosId) return;

    const msgQuery = query(
      collection(db, 'pedidos_mantimentos', activeMantimentosId, 'messages'), 
      orderBy('timestamp', 'desc'), 
      limit(1)
    );

    const unsubscribeMessages = onSnapshot(msgQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const msgData = change.doc.data();
          
          if (msgData.senderRole === 'operador' && isMantMinimizedRef.current) {
            Notifications.scheduleNotificationAsync({
              content: {
                title: 'Apoio Logístico',
                body: msgData.text,
                sound: true,
              },
              trigger: null,
            });
          }
        }
      });
    });

    return () => unsubscribeMessages();
  }, [activeMantimentosId]);

  const handleConfirmSOS = async () => {
    if (!location) return Alert.alert(Strings.wait, Strings.victim.locationWait); 
    setIsSending(true); 

    try {
      const docRef = await addDoc(collection(db, 'sos_requests'), {
        userId: auth.currentUser ? auth.currentUser.uid : 'anonimo',
        userEmail: auth.currentUser ? auth.currentUser.email : 'N/A',
        userName: userName || 'Utilizador Desconhecido', 
        latitude: location.latitude,
        longitude: location.longitude,
        status: 'pendente', 
        cancelRequested: false, 
        detalhes: { idade: idade || 'Não informada', gravida: estaGravida, criancas: temCriancas }, 
        timestamp: serverTimestamp() 
      });

      await addDoc(collection(db, 'sos_requests', docRef.id, 'messages'), {
        senderId: 'system', 
        senderRole: 'sistema',
        text: 'O teu pedido de SOS foi recebido. Um operador irá responder em breve.',
        timestamp: serverTimestamp()
      });

      setShowDetailsForm(false);
      setIdade(''); setEstaGravida(false); setTemCriancas(false);
      Alert.alert(Strings.victim.sosSentTitle, Strings.victim.sosSentMessage);

    } catch (error) {
      Alert.alert(Strings.error, Strings.victim.sosError);
    } finally {
      setIsSending(false); 
    }
  };

  const handleConfirmMantimentos = async () => {
    if (!location) return Alert.alert(Strings.wait, Strings.victim.locationWait); 
    setIsSending(true); 

    try {
      const docRef = await addDoc(collection(db, 'pedidos_mantimentos'), {
        userId: auth.currentUser ? auth.currentUser.uid : 'anonimo',
        userName: userName || 'Utilizador Desconhecido', 
        latitude: location.latitude,
        longitude: location.longitude,
        status: 'pendente', 
        detalhes: { descricao: descricao || 'Não informada', quantidade: quantidade || 'Não informada', urgente: urgente }, 
        timestamp: serverTimestamp() 
      });

      // NOVO: Cria a mensagem inicial no chat de mantimentos
      await addDoc(collection(db, 'pedidos_mantimentos', docRef.id, 'messages'), {
        senderId: 'system', 
        senderRole: 'sistema',
        text: 'O teu pedido de mantimentos foi registado. Um operador irá analisar o pedido em breve.',
        timestamp: serverTimestamp()
      });

      setShowMantimentosForm(false);
      setDescricao(''); setQuantidade(''); setUrgente(false);
      Alert.alert("Pedido Enviado", "O teu pedido de mantimentos foi registado com sucesso.");

    } catch (error) {
      Alert.alert("Erro", "Erro ao enviar o pedido de mantimentos.");
    } finally {
      setIsSending(false); 
    }
  };

  const handleCancelSOS = () => {
    Alert.alert(
      "Solicitar Cancelamento", 
      "Desejas enviar um pedido ao operador para cancelar este SOS? O operador irá confirmar antes de encerrar.", 
      [
        { text: "Voltar", style: "cancel" },
        { text: "Sim, Solicitar", onPress: async () => {
            if (activeSosId) {
              try {
                await updateDoc(doc(db, 'sos_requests', activeSosId), { cancelRequested: true });
                await addDoc(collection(db, 'sos_requests', activeSosId, 'messages'), {
                    senderId: 'system', 
                    senderRole: 'sistema',
                    text: '⚠️ O utilizador solicitou o cancelamento desta emergência. A aguardar revisão do operador.',
                    timestamp: serverTimestamp()
                });
                Alert.alert("Pedido Enviado", "O operador foi notificado do teu pedido.");
              } catch (error) {
                Alert.alert("Erro", "Não foi possível enviar o pedido.");
              }
            }
          }
        }
      ]
    );
  };

  // NOVO: Constante para saber se ALGUM chat está aberto
  const isAnyChatOpen = (activeSosId && !isEmergencyMinimized) || (activeMantimentosId && !isMantimentosMinimized);

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={{ position: 'absolute', top: 50, left: 20, zIndex: 10 }}>
        <TouchableOpacity 
          style={{
            backgroundColor: '#FFFFFF', width: 50, height: 50, borderRadius: 25,
            justifyContent: 'center', alignItems: 'center', shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 5, elevation: 4
          }} 
          onPress={() => navigation.navigate('ProfileScreen')}
        >
          <Ionicons name="person" size={24} color="#4B5563" />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        {location && <MapView style={styles.map} showsUserLocation={true} showsMyLocationButton={true} region={location} />}
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        >
          
          {!showDetailsForm && !showMantimentosForm && !isAnyChatOpen && !showHistory && (
            <View>
              <InitialActionButtons setShowDetailsForm={setShowDetailsForm} setShowMantimentosForm={setShowMantimentosForm} />
              
              {/* BANNER SOS */}
              {activeSosId && isEmergencyMinimized && (
                <TouchableOpacity 
                  style={{
                    backgroundColor: '#EF4444', padding: 15, borderRadius: 12, width: '90%',          
                    alignSelf: 'center', marginTop: 10, marginBottom: 10, flexDirection: 'row', 
                    alignItems: 'center', justifyContent: 'center', shadowColor: '#000', 
                    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, elevation: 4
                  }}
                  onPress={() => setIsEmergencyMinimized(false)} 
                >
                  <Ionicons name="warning" size={24} color="#FFF" style={{ marginRight: 10 }} />
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>🚨 SOS ATIVO - ABRIR CHAT</Text>
                </TouchableOpacity>
              )}

              {/* NOVO: BANNER MANTIMENTOS */}
              {activeMantimentosId && isMantimentosMinimized && (
                <TouchableOpacity 
                  style={{
                    backgroundColor: '#3B82F6', padding: 15, borderRadius: 12, width: '90%',          
                    alignSelf: 'center', marginTop: 10, marginBottom: 10, flexDirection: 'row', 
                    alignItems: 'center', justifyContent: 'center', shadowColor: '#000', 
                    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, elevation: 4
                  }}
                  onPress={() => setIsMantimentosMinimized(false)} 
                >
                  <Ionicons name="cube" size={24} color="#FFF" style={{ marginRight: 10 }} />
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>📦 MANTIMENTOS - ABRIR CHAT</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={{ 
                  backgroundColor: '#FFFFFF', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 14, 
                  alignSelf: 'center', marginTop: activeSosId && isEmergencyMinimized ? 0 : 10, 
                  marginBottom: 20, flexDirection: 'row', alignItems: 'center',
                  width: '90%', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, borderWidth: 1, borderColor: '#F3F4F6'
                }}
                onPress={() => setShowHistory(true)}
              >
                <MaterialCommunityIcons name="clipboard-text-clock-outline" size={26} color="#3B82F6" style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937' }}>Histórico de Alertas</Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" style={{ position: 'absolute', right: 15 }} />
              </TouchableOpacity>

              <NewsSection news={news} loadingNews={loadingNews} />
            </View>
          )}

          {showDetailsForm && !isAnyChatOpen && !showHistory && (
            <SOSDetailsForm 
              idade={idade} setIdade={setIdade}
              estaGravida={estaGravida} setEstaGravida={setEstaGravida}
              temCriancas={temCriancas} setTemCriancas={setTemCriancas}
              handleConfirmSOS={handleConfirmSOS} isSending={isSending} setShowDetailsForm={setShowDetailsForm}
            />
          )}

          {showMantimentosForm && !isAnyChatOpen && !showHistory && (
            <MantimentosDetailsForm 
              descricao={descricao} setDescricao={setDescricao}
              quantidade={quantidade} setQuantidade={setQuantidade}
              urgente={urgente} setUrgente={setUrgente}
              handleConfirmMantimentos={handleConfirmMantimentos} 
              isSending={isSending} setShowMantimentosForm={setShowMantimentosForm}
            />
          )}

          {/* VISTA DO CHAT SOS */}
          {activeSosId && !isEmergencyMinimized && (
            <ActiveEmergencyView 
              activeSosId={activeSosId}
              currentUserId={auth.currentUser?.uid} 
              handleCancelSOS={handleCancelSOS}
              onMinimize={() => setIsEmergencyMinimized(true)} 
            />
          )}

          {/* NOVO: VISTA DO CHAT MANTIMENTOS */}
          {activeMantimentosId && !isMantimentosMinimized && (
            <View style={{ flex: 1, paddingHorizontal: 15, paddingTop: 10 }}>
              <ActiveMantimentosView 
                activeMantimentosId={activeMantimentosId}
                currentUserId={auth.currentUser?.uid} 
                onMinimize={() => setIsMantimentosMinimized(true)} 
              />
            </View>
          )}

          {showHistory && !isAnyChatOpen && (
            <View>
               <EmergencyHistoryView />
               <TouchableOpacity 
                 style={{ 
                   padding: 16, alignItems: 'center', backgroundColor: '#4B5563', borderRadius: 12, 
                   marginHorizontal: 15, marginTop: 10, marginBottom: 25, flexDirection: 'row',
                   justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                   shadowOpacity: 0.2, shadowRadius: 4, elevation: 3
                 }}
                 onPress={() => setShowHistory(false)}
               >
                 <Ionicons name="arrow-back" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                 <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' }}>Voltar ao Mapa</Text>
               </TouchableOpacity>
            </View>
          )}

          {!showHistory && !isAnyChatOpen && (
            <TouchableOpacity
              style={[styles.logoutButton, { marginVertical: 20 }]}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.logoutButtonText}>Sair da Conta</Text>
            </TouchableOpacity>
          )}

    </SafeAreaView>
  );
}