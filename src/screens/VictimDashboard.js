import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { addDoc, collection, doc, getDoc, onSnapshot, query, serverTimestamp, updateDoc, where, orderBy, limit } from 'firebase/firestore'; 
import { signOut } from 'firebase/auth'; 
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
  const [activeSosId, setActiveSosId] = useState(null); 
  
  // Estado para controlar o chat de mantimentos
  const [activeMantimentoId, setActiveMantimentoId] = useState(null);

  const [userName, setUserName] = useState(''); 

  // Refs para ler estado dentro dos listeners sem causar loops
  const isMinimizedRef = useRef(isEmergencyMinimized); 
  const activeSosIdRef = useRef(activeSosId);
  const activeMantimentoIdRef = useRef(activeMantimentoId); 

  // Estados do SOS
  const [idade, setIdade] = useState('');
  const [estaGravida, setEstaGravida] = useState(false);
  const [temCriancas, setTemCriancas] = useState(false);

  // Estados dos Mantimentos
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState('');

  // Sincronização das refs com os estados
  useEffect(() => {
    isMinimizedRef.current = isEmergencyMinimized;
  }, [isEmergencyMinimized]);

  useEffect(() => {
    activeSosIdRef.current = activeSosId;
  }, [activeSosId]);

  useEffect(() => {
    activeMantimentoIdRef.current = activeMantimentoId;
  }, [activeMantimentoId]);

  // Permissões de Notificação
  useEffect(() => {
    const requestNotificationPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') console.log("Permissão para notificações não concedida.");
    };
    requestNotificationPermissions();
  }, []);

  // Buscar Nome do Utilizador
  useEffect(() => {
    const fetchUserName = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) setUserName(userDoc.data().nome);
        } catch (error) { console.log("Erro ao buscar nome:", error); }
      }
    };
    fetchUserName();
  }, []);

  // --- MOTOR DE ESTADO DE EMERGÊNCIA (SOS) ---
  useEffect(() => {
    if (!auth.currentUser) return; 
    const q = query(collection(db, 'sos_requests'), where('userId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pendingRequest = snapshot.docs.find(doc => doc.data().status === 'pendente');
      if (pendingRequest) {
        if (pendingRequest.id !== activeSosIdRef.current) {
            setActiveSosId(pendingRequest.id);
            setIsEmergencyMinimized(false);
        }
      } else {
        if (activeSosIdRef.current) {
          const completedDoc = snapshot.docs.find(doc => doc.id === activeSosIdRef.current && doc.data().status === 'concluido');
          if (completedDoc) Alert.alert("Resgate Concluído ✅", "O operador encerrou a ocorrência. Mantém-te em segurança.");
          setActiveSosId(null); 
        }
      }
    }, (error) => console.log("Listener de SOS interrompido:", error.code));
    return () => unsubscribe();
  }, []); 

  // --- MOTOR DE ESTADO DE MANTIMENTOS ---
  useEffect(() => {
    if (!auth.currentUser) return; 
    const q = query(collection(db, 'pedidos_mantimentos'), where('userId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pendingRequest = snapshot.docs.find(doc => doc.data().status === 'pendente');
      if (pendingRequest) {
        if (pendingRequest.id !== activeMantimentoIdRef.current) {
            setActiveMantimentoId(pendingRequest.id);
            setIsEmergencyMinimized(false);
        }
      } else {
        if (activeMantimentoIdRef.current) {
          setActiveMantimentoId(null); 
        }
      }
    }, (error) => console.log("Listener de Mantimentos interrompido:", error.code));
    return () => unsubscribe();
  }, []);

  // --- MOTOR DE NOTIFICAÇÕES (Escuta mensagens do Operador no SOS) ---
  useEffect(() => {
    if (!activeSosId) return;
    const msgQuery = query(collection(db, 'sos_requests', activeSosId, 'messages'), orderBy('timestamp', 'desc'), limit(1));
    const unsubscribeMessages = onSnapshot(msgQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const msgData = change.doc.data();
          if (msgData.senderRole === 'operador' && isMinimizedRef.current) {
            Notifications.scheduleNotificationAsync({
              content: { title: 'Central de Operações', body: msgData.text, sound: true },
              trigger: null, 
            });
          }
        }
      });
    }, (error) => console.log("Listener de Mensagens interrompido:", error.code));
    return () => unsubscribeMessages();
  }, [activeSosId]);

  // --- AÇÕES ---
  const handleConfirmSOS = async () => {
    if (!location) return Alert.alert(Strings.wait, Strings.victim.locationWait); 
    setIsSending(true); 
    try {
      const docRef = await addDoc(collection(db, 'sos_requests'), {
        userId: auth.currentUser?.uid || 'anonimo',
        userName: userName || 'Utilizador Desconhecido', 
        latitude: location.latitude,
        longitude: location.longitude,
        status: 'pendente', 
        cancelRequested: false, 
        detalhes: { idade: idade || 'Não informada', gravida: estaGravida, criancas: temCriancas }, 
        timestamp: serverTimestamp() 
      });
      await addDoc(collection(db, 'sos_requests', docRef.id, 'messages'), {
        senderId: 'system', senderRole: 'sistema',
        text: 'O teu pedido de SOS foi recebido. Um operador irá responder em breve.',
        timestamp: serverTimestamp()
      });
      setShowDetailsForm(false);
      Alert.alert(Strings.victim.sosSentTitle, Strings.victim.sosSentMessage);
    } catch (_error) { Alert.alert(Strings.error, Strings.victim.sosError); } finally { setIsSending(false); }
  };

  const handleConfirmMantimentos = async () => {
    if (!location) return Alert.alert(Strings.wait, Strings.victim.locationWait); 
    setIsSending(true); 

    try {
      const docRef = await addDoc(collection(db, 'pedidos_mantimentos'), {
        userId: auth.currentUser?.uid || 'anonimo',
        userName: userName || 'Utilizador Desconhecido', 
        latitude: location.latitude,
        longitude: location.longitude,
        status: 'pendente', 
        detalhes: { descricao, quantidade }, 
        timestamp: serverTimestamp() 
      });

      // Adicionar a primeira mensagem de sistema para criar a coleção de chat
      await addDoc(collection(db, 'pedidos_mantimentos', docRef.id, 'messages'), {
        senderId: 'system', senderRole: 'sistema',
        text: 'O teu pedido de mantimentos foi recebido pela central.',
        timestamp: serverTimestamp()
      });

      setShowMantimentosForm(false);
      setDescricao(''); setQuantidade('');
      Alert.alert("Pedido Enviado", "O teu pedido de mantimentos foi registado.");

    } catch (error) {
      console.error("ERRO FIREBASE:", error); 
      Alert.alert("Erro", "Detalhe: " + error.message); 
    } finally {
      setIsSending(false); 
    }
  };

  const handleCancelSOS = () => {
    Alert.alert("Solicitar Cancelamento", "Desejas enviar um pedido ao operador para cancelar este SOS?", [
      { text: "Voltar", style: "cancel" },
      { text: "Sim", onPress: async () => {
          if (activeSosId) {
            try {
              await updateDoc(doc(db, 'sos_requests', activeSosId), { cancelRequested: true });
              Alert.alert("Pedido Enviado", "O operador foi notificado.");
            } catch (_error) { Alert.alert("Erro", "Não foi possível enviar."); }
          }
      }}
    ]);
  };

  const handleCancelMantimento = () => {
    Alert.alert("Cancelar Pedido", "Tens a certeza que queres cancelar este pedido de mantimentos?", [
      { text: "Voltar", style: "cancel" },
      { text: "Sim", onPress: async () => {
          if (activeMantimentoId) {
            try {
              await updateDoc(doc(db, 'pedidos_mantimentos', activeMantimentoId), { status: 'cancelado' });
              Alert.alert("Sucesso", "O teu pedido foi cancelado.");
            } catch (_error) { Alert.alert("Erro", "Não foi possível cancelar."); }
          }
      }}
    ]);
  };

  const handleLogout = () => {
    Alert.alert("Terminar Sessão", "Tens a certeza?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", onPress: () => signOut(auth).then(() => navigation.replace('Login')), style: "destructive" }
    ]);
  };

  // Função essencial para a Navbar (S.A.F.E. tab)
  const handleGoHome = () => {
    setShowDetailsForm(false);
    setShowMantimentosForm(false);
    setShowHistory(false);
    if (activeSosId || activeMantimentoId) {
      setIsEmergencyMinimized(true);
    }
  };

  // Variável para determinar se o chat está ativo e visível no ecrã
  const isChatOpen = (activeSosId || activeMantimentoId) && !isEmergencyMinimized;

  return (
    <SafeAreaView style={styles.container}>

      {/* MAPA - Encolhe dinamicamente se o chat estiver aberto para dar espaço ao teclado */}
      <View style={[styles.mapContainer, isChatOpen && { flex: 0, height: 150 }]}>
        {location && <MapView style={styles.map} showsUserLocation={true} showsMyLocationButton={true} region={location} />}
      </View>

      {/* ÁREA DE RENDERIZAÇÃO PRINCIPAL (Menus, Chats e Formulários) */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView 
          style={styles.bottomSection} 
          showsVerticalScrollIndicator={false} 
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }} // O paddingBottom de 100 é o que impede a Navbar de tapar o conteúdo!
        >
          
          {/* VISTA INICIAL (Sem forms ou chats abertos) */}
          {!showDetailsForm && !showMantimentosForm && !isChatOpen && !showHistory && (
            <View>
              <InitialActionButtons setShowDetailsForm={setShowDetailsForm} setShowMantimentosForm={setShowMantimentosForm} />
              
              {/* Botão para maximizar o chat consoante o tipo ativo */}
              {(activeSosId || activeMantimentoId) && isEmergencyMinimized && (
                <TouchableOpacity 
                  style={{ backgroundColor: activeSosId ? '#EF4444' : '#3B82F6', padding: 15, borderRadius: 12, width: '90%', alignSelf: 'center', marginTop: 10 }} 
                  onPress={() => setIsEmergencyMinimized(false)}
                >
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>
                    {activeSosId ? '🚨 SOS ATIVO - ABRIR CHAT' : '📦 MANTIMENTOS - ABRIR CHAT'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Botão de Histórico */}
              <TouchableOpacity style={{ backgroundColor: '#FFFFFF', padding: 16, borderRadius: 14, alignSelf: 'center', marginTop: 10, marginBottom: 20, width: '90%', flexDirection: 'row', alignItems: 'center' }} onPress={() => setShowHistory(true)}>
                <MaterialCommunityIcons name="clipboard-text-clock-outline" size={26} color="#3B82F6" />
                <Text style={{ fontSize: 16, fontWeight: '700', marginLeft: 10 }}>Histórico de Alertas</Text>
              </TouchableOpacity>

              <NewsSection news={news} loadingNews={loadingNews} />
            </View>
          )}

          {/* FORMULÁRIO DE SOS */}
          {showDetailsForm && (
          <SOSDetailsForm 
            idade={idade}
            setIdade={setIdade} 
            estaGravida={estaGravida}
            setEstaGravida={setEstaGravida}
            temCriancas={temCriancas}
            setTemCriancas={setTemCriancas}
            handleConfirmSOS={handleConfirmSOS} 
            setShowDetailsForm={setShowDetailsForm}
            isSending={isSending}
          />
        )}
          
          {/* FORMULÁRIO DE MANTIMENTOS */}
          {showMantimentosForm && (
            <MantimentosDetailsForm 
              descricao={descricao} 
              setDescricao={setDescricao}
              quantidade={quantidade} 
              setQuantidade={setQuantidade}
              handleConfirmMantimentos={handleConfirmMantimentos} 
              setShowMantimentosForm={setShowMantimentosForm} 
            />
          )}

          {/* CHAT DE SOS (Prioridade sobre mantimentos se ambos existissem) */}
          {activeSosId && !isEmergencyMinimized && (
            <ActiveEmergencyView 
              activeSosId={activeSosId}
              currentUserId={auth.currentUser?.uid} 
              handleCancelSOS={handleCancelSOS}
              onMinimize={() => setIsEmergencyMinimized(true)} 
            />
          )}

          {/* CHAT DE MANTIMENTOS (Só abre se não houver SOS ativo) */}
          {activeMantimentoId && !activeSosId && !isEmergencyMinimized && (
            <ActiveMantimentosView 
              activePedidoId={activeMantimentoId}
              currentUserId={auth.currentUser?.uid} 
              handleCancelPedido={handleCancelMantimento}
              onMinimize={() => setIsEmergencyMinimized(true)} 
            />
          )}

          {/* HISTÓRICO DE ALERTAS */}
          {showHistory && (
            <View>
               <EmergencyHistoryView />
               <TouchableOpacity style={{ padding: 16, alignItems: 'center', backgroundColor: '#4B5563', borderRadius: 12, margin: 20 }} onPress={() => setShowHistory(false)}>
                 <Text style={{ color: '#FFF' }}>Voltar ao Mapa</Text>
               </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* NAVBAR INFERIOR FIXA */}
      <View style={{
        position: 'absolute', 
        bottom: 0,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 35 : 15, 
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        elevation: 15,
        zIndex: 999, 
      }}>
        <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')} style={{ alignItems: 'center' }}>
            <Ionicons name="person-outline" size={24} color="#6B7280" />
            <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4, fontWeight: '500' }}>Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleGoHome} style={{ alignItems: 'center' }}>
            <Ionicons name="shield-checkmark" size={26} color="#EF4444" />
            <Text style={{ fontSize: 12, color: '#EF4444', marginTop: 4, fontWeight: '700' }}>S.A.F.E.</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={{ alignItems: 'center' }}>
            <Ionicons name="log-out-outline" size={24} color="#6B7280" />
            <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4, fontWeight: '500' }}>Sair</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}