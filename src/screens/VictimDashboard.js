import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { addDoc, collection, doc, getDoc, onSnapshot, query, serverTimestamp, updateDoc, where, orderBy, limit } from 'firebase/firestore'; // NOVO: orderBy e limit
import { useEffect, useState, useRef } from 'react'; // NOVO: useRef
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MapView from 'react-native-maps';
import * as Notifications from 'expo-notifications'; // NOVO: Notificações Push

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
  // NOVO: Ref para as notificações saberem o estado do chat em tempo real sem causar re-renders
  const isMinimizedRef = useRef(isEmergencyMinimized); 

  const [userName, setUserName] = useState(''); 
  const [activeSosId, setActiveSosId] = useState(null); 

  // Estados do SOS
  const [idade, setIdade] = useState('');
  const [estaGravida, setEstaGravida] = useState(false);
  const [temCriancas, setTemCriancas] = useState(false);

  // Estados dos Mantimentos
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [urgente, setUrgente] = useState(false);

  // NOVO 1: Sincroniza o estado Minimizado com a Ref
  useEffect(() => {
    isMinimizedRef.current = isEmergencyMinimized;
  }, [isEmergencyMinimized]);

  // NOVO 2: Pede permissão para Notificações ao abrir a app
  useEffect(() => {
    const requestNotificationPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log("Permissão para notificações não concedida.");
      }
    };
    requestNotificationPermissions();
  }, []);

  // --- BUSCA NOME DO UTILIZADOR ---
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

  // --- MOTOR DE ESTADO DE EMERGÊNCIA (Verifica se há um SOS PENDENTE) ---
  useEffect(() => {
    if (!auth.currentUser) return; 
    
    const q = query(collection(db, 'sos_requests'), where('userId', '==', auth.currentUser.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pendingRequest = snapshot.docs.find(doc => doc.data().status === 'pendente');
      
      if (pendingRequest) {
        if (pendingRequest.id !== activeSosId) {
            setActiveSosId(pendingRequest.id);
            setIsEmergencyMinimized(false);
        }
      } else {
        setActiveSosId((prevId) => {
          if (prevId) {
            const completedDoc = snapshot.docs.find(doc => doc.id === prevId && doc.data().status === 'concluido');
            if (completedDoc) Alert.alert("Resgate Concluído ✅", "O operador encerrou a ocorrência. Mantém-te em segurança.");
          }
          return null; 
        });
      }
    });

    return () => unsubscribe();
  }, [activeSosId]);

  // NOVO 3: MOTOR DE NOTIFICAÇÕES (Escuta mensagens da Central)
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
          
          // Se a mensagem foi enviada pelo Operador E a vítima tem o chat minimizado -> Notifica!
          if (msgData.senderRole === 'operador' && isMinimizedRef.current) {
            Notifications.scheduleNotificationAsync({
              content: {
                title: 'Central de Operações',
                body: msgData.text,
                sound: true,
              },
              trigger: null, // trigger null significa notificar instantaneamente
            });
          }
        }
      });
    });

    return () => unsubscribeMessages();
  }, [activeSosId]);

  // --- AÇÕES ---
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
      await addDoc(collection(db, 'pedidos_mantimentos'), {
        userId: auth.currentUser ? auth.currentUser.uid : 'anonimo',
        userName: userName || 'Utilizador Desconhecido', 
        latitude: location.latitude,
        longitude: location.longitude,
        status: 'pendente', 
        detalhes: { descricao: descricao || 'Não informada', quantidade: quantidade || 'Não informada', urgente: urgente }, 
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
      {/* TRUQUE 1: Usar undefined no Android e adicionar keyboardVerticalOffset para o iOS */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          /* TRUQUE 2: O paddingBottom no contentContainerStyle cria o espaço extra no fundo */
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 300 }}
        >

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.bottomSection} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          {!showDetailsForm && !showMantimentosForm && (!activeSosId || isEmergencyMinimized) && !showHistory && (
            <View>
              <InitialActionButtons setShowDetailsForm={setShowDetailsForm} setShowMantimentosForm={setShowMantimentosForm} />
              
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

          {showDetailsForm && (!activeSosId || isEmergencyMinimized) && !showHistory && (
            <SOSDetailsForm 
              idade={idade} setIdade={setIdade}
              estaGravida={estaGravida} setEstaGravida={setEstaGravida}
              temCriancas={temCriancas} setTemCriancas={setTemCriancas}
              handleConfirmSOS={handleConfirmSOS} isSending={isSending} setShowDetailsForm={setShowDetailsForm}
            />
          )}

          {showMantimentosForm && (!activeSosId || isEmergencyMinimized) && !showHistory && (
            <MantimentosDetailsForm 
              descricao={descricao} setDescricao={setDescricao}
              quantidade={quantidade} setQuantidade={setQuantidade}
              urgente={urgente} setUrgente={setUrgente}
              handleConfirmMantimentos={handleConfirmMantimentos} 
              isSending={isSending} setShowMantimentosForm={setShowMantimentosForm}
            />
          )}

          {activeSosId && !isEmergencyMinimized && (
            <ActiveEmergencyView 
              activeSosId={activeSosId}
              currentUserId={auth.currentUser?.uid} 
              handleCancelSOS={handleCancelSOS}
              onMinimize={() => setIsEmergencyMinimized(true)} 
            />
          )}

          {showHistory && (!activeSosId || isEmergencyMinimized) && (
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

                 {/* BOTÃO DE VOLTAR AO MAPA */}
                 <TouchableOpacity style={styles.btnBackHistory} onPress={() => setShowHistory(false)}>
                   <Ionicons name="arrow-back" size={20} color="#FFFFFF" style={styles.btnBackHistoryIcon} />
                   <Text style={styles.btnBackHistoryText}>Voltar ao Mapa</Text>
                 </TouchableOpacity>

              </View>
            )}

            {/* BOTÃO DE SAIR DA CONTA */}
            {!showHistory && (
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.logoutButtonText}>Sair da Conta</Text>
              </TouchableOpacity>
            )}

          </View>
          {/* FIM DA BOTTOM SECTION */}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}