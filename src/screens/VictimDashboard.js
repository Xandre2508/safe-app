import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { addDoc, collection, doc, getDoc, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MapView from 'react-native-maps';

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

// Importação dos Custom Hooks
import { useLocation } from '../hooks/useLocation';
import { useNews } from '../hooks/useNews';

export default function VictimDashboard({ navigation }) {
  const { location } = useLocation(); 
  const { news, loadingNews } = useNews(); 

  const [isSending, setIsSending] = useState(false); 
  const [showDetailsForm, setShowDetailsForm] = useState(false); 
  const [showHistory, setShowHistory] = useState(false); 
  
  // Estado para minimizar o chat e voltar ao ecrã principal
  const [isEmergencyMinimized, setIsEmergencyMinimized] = useState(false);

  const [userName, setUserName] = useState(''); 
  const [activeSosId, setActiveSosId] = useState(null); 

  const [idade, setIdade] = useState('');
  const [estaGravida, setEstaGravida] = useState(false);
  const [temCriancas, setTemCriancas] = useState(false);

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

  useEffect(() => {
    if (!auth.currentUser) return; 
    
    const q = query(collection(db, 'sos_requests'), where('userId', '==', auth.currentUser.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pendingRequest = snapshot.docs.find(doc => doc.data().status === 'pendente');
      
      if (pendingRequest) {
        // Se detetar um SOS novo, abre o chat e tira do modo minimizado
        if (pendingRequest.id !== activeSosId) {
            setActiveSosId(pendingRequest.id);
            setIsEmergencyMinimized(false);
        }
      } else {
        setActiveSosId((prevId) => {
          if (prevId) {
            const completedDoc = snapshot.docs.find(doc => doc.id === prevId && doc.data().status === 'concluido');
            if (completedDoc) Alert.alert("Resgate Concluído ✅", "O operador encerrou a ocorrência. Mantenha-se em segurança.");
          }
          return null; 
        });
      }
    });

    return () => unsubscribe();
  }, [activeSosId]);

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
        cancelRequested: false, // Flag para o operador saber se a vítima pediu cancelamento
        detalhes: { idade: idade || 'Não informada', gravida: estaGravida, criancas: temCriancas }, 
        timestamp: serverTimestamp() 
      });

      await addDoc(collection(db, 'sos_requests', docRef.id, 'messages'), {
        senderId: 'system', 
        senderRole: 'sistema',
        text: 'O seu pedido de SOS foi recebido. Um operador irá responder em breve.',
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

  // Solicita o cancelamento em vez de cancelar diretamente
  const handleCancelSOS = () => {
    Alert.alert(
      "Solicitar Cancelamento", 
      "Deseja enviar um pedido ao operador para cancelar este SOS? O operador irá confirmar antes de encerrar.", 
      [
        { text: "Voltar", style: "cancel" },
        { text: "Sim, Solicitar", onPress: async () => {
            if (activeSosId) {
              try {
                // 1. Atualiza o documento principal indicando o pedido
                await updateDoc(doc(db, 'sos_requests', activeSosId), { cancelRequested: true });
                
                // 2. Envia uma mensagem visível no chat
                await addDoc(collection(db, 'sos_requests', activeSosId, 'messages'), {
                    senderId: 'system', 
                    senderRole: 'sistema',
                    text: '⚠️ O utilizador solicitou o cancelamento desta emergência. A aguardar revisão do operador.',
                    timestamp: serverTimestamp()
                });
                
                Alert.alert("Pedido Enviado", "O operador foi notificado do seu pedido.");
              } catch (error) {
                Alert.alert("Erro", "Não foi possível enviar o pedido.");
              }
            }
          }
        }
      ]
    );
  };

  const handleApoio = () => Alert.alert(Strings.victim.supportAlertTitle, Strings.victim.supportAlertMessage);

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

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.bottomSection} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          {/* VISTA 1: Ecrã Principal - Só aparece se NÃO houver SOS ou se estiver MINIMIZADO */}
          {!showDetailsForm && (!activeSosId || isEmergencyMinimized) && !showHistory && (
            <View>
              {/* Botoes SOS e Apoio */}
              <InitialActionButtons setShowDetailsForm={setShowDetailsForm} handleApoio={handleApoio} />
              
              {/* BANNER DE SOS ATIVO - Reposicionado para baixo dos botões e centrado */}
              {activeSosId && isEmergencyMinimized && (
                <TouchableOpacity 
                  style={{
                    backgroundColor: '#EF4444', 
                    padding: 15, 
                    borderRadius: 12, 
                    width: '90%',           // Mesma largura que o Histórico de Alertas
                    alignSelf: 'center',    // Alinhamento centralizado
                    marginTop: 10,          // Margem superior para afastar dos botões principais
                    marginBottom: 10,       // Margem inferior para colar ao Histórico de Alertas
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    shadowColor: '#000', 
                    shadowOffset: { width: 0, height: 2 }, 
                    shadowOpacity: 0.2, 
                    elevation: 4
                  }}
                  onPress={() => setIsEmergencyMinimized(false)} // Abre o chat novamente
                >
                  <Ionicons name="warning" size={24} color="#FFF" style={{ marginRight: 10 }} />
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>🚨 SOS ATIVO - ABRIR CHAT</Text>
                </TouchableOpacity>
              )}

              {/* Botão Histórico de Alertas */}
              <TouchableOpacity 
                style={{ 
                  backgroundColor: '#FFFFFF', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 14, 
                  alignSelf: 'center', 
                  marginTop: activeSosId && isEmergencyMinimized ? 0 : 10, // Diminui o espaço se o banner de SOS estiver ativo
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

          {/* VISTA 2: Formulário de Triagem SOS */}
          {showDetailsForm && (!activeSosId || isEmergencyMinimized) && !showHistory && (
            <SOSDetailsForm 
              idade={idade} setIdade={setIdade}
              estaGravida={estaGravida} setEstaGravida={setEstaGravida}
              temCriancas={temCriancas} setTemCriancas={setTemCriancas}
              handleConfirmSOS={handleConfirmSOS} isSending={isSending} setShowDetailsForm={setShowDetailsForm}
            />
          )}

          {/* VISTA 3: Emergência Ativa (O Chat) */}
          {activeSosId && !isEmergencyMinimized && (
            <ActiveEmergencyView 
              activeSosId={activeSosId}
              currentUserId={auth.currentUser?.uid} // Adiciona esta linha!
              handleCancelSOS={handleCancelSOS}
              onMinimize={() => setIsEmergencyMinimized(true)} 
            />
          )}

          {/* VISTA 4: Histórico de Alertas */}
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

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}