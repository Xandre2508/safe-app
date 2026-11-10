import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import MapView from 'react-native-maps';

import { auth, db } from '../firebaseConfig';
import { sendLocalNotification } from '../services/notifications';
import { Strings } from '../constants/Strings';
import { styles } from '../styles/VictimDashboardStyles';

// Componentes da Interface de Vítima
import ActiveEmergencyView from '../components/Vitima/ActiveEmergencyView';
import EmergencyHistoryView from '../components/Vitima/EmergencyHistoryView';
import InitialActionButtons from '../components/Vitima/InitialActionButtons';
import NewsSection from '../components/Vitima/NewsSection';
import SOSDetailsForm from '../components/Vitima/SOSDetailsForm';
import MantimentosDetailsForm from '../components/Mantimentos/MantimentosDetailsForm';
import ActiveMantimentosView from '../components/Mantimentos/ActiveMantimentosView';

// Hooks personalizados
import { useLocation } from '../hooks/useLocation';
import { useNews } from '../hooks/useNews';

export default function VictimDashboard({ navigation }) {
  const insets = useSafeAreaInsets();
  const { location } = useLocation();
  const { news, loadingNews } = useNews();

  const [isSending, setIsSending] = useState(false);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showMantimentosForm, setShowMantimentosForm] = useState(false);

  const [isEmergencyMinimized, setIsEmergencyMinimized] = useState(false);
  const [activeSosId, setActiveSosId] = useState(null);
  const [activeMantimentoId, setActiveMantimentoId] = useState(null);
  const [userName, setUserName] = useState('');

  const isMinimizedRef = useRef(isEmergencyMinimized);
  const activeSosIdRef = useRef(activeSosId);
  const activeMantimentoIdRef = useRef(activeMantimentoId);

  // Estados dos formulários
  const [idade, setIdade] = useState('');
  const [estaGravida, setEstaGravida] = useState(false);
  const [temCriancas, setTemCriancas] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState('');

  useEffect(() => {
    isMinimizedRef.current = isEmergencyMinimized;
  }, [isEmergencyMinimized]);

  useEffect(() => {
    activeSosIdRef.current = activeSosId;
  }, [activeSosId]);

  useEffect(() => {
    activeMantimentoIdRef.current = activeMantimentoId;
  }, [activeMantimentoId]);

  // Controlo do botão físico de voltar no Android
  useEffect(() => {
    const onBackPress = () => {
      if (showDetailsForm) {
        setShowDetailsForm(false);
        return true;
      }
      if (showMantimentosForm) {
        setShowMantimentosForm(false);
        return true;
      }
      if (showHistory) {
        setShowHistory(false);
        return true;
      }
      if ((activeSosId || activeMantimentoId) && !isEmergencyMinimized) {
        setIsEmergencyMinimized(true);
        return true;
      }
      handleLogout();
      return true;
    };

    const backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandlerSubscription.remove();
  }, [showDetailsForm, showMantimentosForm, showHistory, activeSosId, activeMantimentoId, isEmergencyMinimized]);

  // Carregar nome do utilizador
  useEffect(() => {
    let isMounted = true;
    const fetchUserName = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists() && isMounted) {
            setUserName(userDoc.data().nome || 'Cidadão');
          }
        } catch (error) {
          console.warn('[VictimDashboard] Erro ao carregar nome:', error);
        }
      }
    };
    fetchUserName();
    return () => {
      isMounted = false;
    };
  }, []);

  // Monitorização do pedido de SOS ativo
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'sos_requests'), where('userId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const pendingRequest = snapshot.docs.find((d) => d.data().status === 'pendente');
        if (pendingRequest) {
          if (pendingRequest.id !== activeSosIdRef.current) {
            setActiveSosId(pendingRequest.id);
            setIsEmergencyMinimized(false);
          }
        } else {
          if (activeSosIdRef.current) {
            const completedDoc = snapshot.docs.find(
              (d) => d.id === activeSosIdRef.current && d.data().status === 'concluido'
            );
            if (completedDoc) {
              Alert.alert('Socorro Concluído ✅', 'A ocorrência foi encerrada com sucesso pelas equipas de socorro.');
            }
            setActiveSosId(null);
          }
        }
      },
      (error) => console.warn('[VictimDashboard] Erro no listener SOS:', error)
    );
    return () => unsubscribe();
  }, []);

  // Monitorização de pedidos de mantimentos ativos
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'pedidos_mantimentos'), where('userId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const pendingRequest = snapshot.docs.find((d) => d.data().status === 'pendente');
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
      },
      (error) => console.warn('[VictimDashboard] Erro no listener Mantimentos:', error)
    );
    return () => unsubscribe();
  }, []);

  // Notificações de mensagens da Central quando o chat está minimizado
  useEffect(() => {
    if (!activeSosId) return;
    const msgQuery = query(
      collection(db, 'sos_requests', activeSosId, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const unsubscribeMessages = onSnapshot(
      msgQuery,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const msgData = change.doc.data();
            if (msgData.senderRole === 'operador' && isMinimizedRef.current) {
              sendLocalNotification(
                'Central de Operações S.A.F.E.',
                msgData.text || 'Nova instrução do operador.',
                'emergency_alerts'
              );
            }
          }
        });
      },
      (err) => console.warn('[VictimDashboard] Erro nas mensagens SOS:', err)
    );
    return () => unsubscribeMessages();
  }, [activeSosId]);

  // Ações de emergência
  const handleConfirmSOS = async () => {
    if (!location) {
      Alert.alert(Strings.wait, Strings.victim.locationWait);
      return;
    }
    setIsSending(true);
    try {
      const docRef = await addDoc(collection(db, 'sos_requests'), {
        userId: auth.currentUser?.uid || 'anonimo',
        userName: userName || 'Cidadão Não Identificado',
        latitude: location.latitude,
        longitude: location.longitude,
        status: 'pendente',
        cancelRequested: false,
        detalhes: {
          idade: idade.trim() || 'Não informada',
          gravida: estaGravida,
          criancas: temCriancas,
        },
        timestamp: serverTimestamp(),
      });

      await addDoc(collection(db, 'sos_requests', docRef.id, 'messages'), {
        senderId: 'system',
        senderRole: 'sistema',
        text: 'O seu alerta de SOS foi emitido. As equipas de socorro e operadores foram notificados.',
        timestamp: serverTimestamp(),
      });

      setShowDetailsForm(false);
      Alert.alert(Strings.victim.sosSentTitle, Strings.victim.sosSentMessage);
    } catch (error) {
      console.warn('[VictimDashboard] Erro ao enviar SOS:', error);
      Alert.alert(Strings.error, Strings.victim.sosError);
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmMantimentos = async () => {
    if (!location) {
      Alert.alert(Strings.wait, Strings.victim.locationWait);
      return;
    }
    if (!descricao.trim() || !quantidade.trim()) {
      Alert.alert('Dados Incompletos', 'Indique a descrição e quantidade dos mantimentos necessários.');
      return;
    }

    setIsSending(true);
    try {
      const docRef = await addDoc(collection(db, 'pedidos_mantimentos'), {
        userId: auth.currentUser?.uid || 'anonimo',
        userName: userName || 'Cidadão Não Identificado',
        latitude: location.latitude,
        longitude: location.longitude,
        status: 'pendente',
        detalhes: {
          descricao: descricao.trim(),
          quantidade: quantidade.trim(),
        },
        timestamp: serverTimestamp(),
      });

      await addDoc(collection(db, 'pedidos_mantimentos', docRef.id, 'messages'), {
        senderId: 'system',
        senderRole: 'sistema',
        text: 'O seu pedido de mantimentos foi registado pela Central de Operações.',
        timestamp: serverTimestamp(),
      });

      setShowMantimentosForm(false);
      setDescricao('');
      setQuantidade('');
      Alert.alert('Pedido Submetido', 'O seu pedido de mantimentos foi encaminhado para a equipa logística.');
    } catch (error) {
      console.warn('[VictimDashboard] Erro ao pedir mantimentos:', error);
      Alert.alert('Erro', 'Não foi possível enviar o pedido de mantimentos.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCancelSOS = () => {
    Alert.alert('Solicitar Cancelamento', 'Pretende solicitar o cancelamento deste alerta ao operador?', [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Confirmar Pedido',
        onPress: async () => {
          if (activeSosId) {
            try {
              await updateDoc(doc(db, 'sos_requests', activeSosId), { cancelRequested: true });
              Alert.alert('Pedido Enviado', 'O operador foi notificado para validar o encerramento.');
            } catch (err) {
              console.warn('[VictimDashboard] Falha ao cancelar SOS:', err);
              Alert.alert('Erro', 'Não foi possível solicitar o cancelamento.');
            }
          }
        },
      },
    ]);
  };

  const handleCancelMantimento = () => {
    Alert.alert('Cancelar Mantimentos', 'Tem a certeza de que deseja anular este pedido de mantimentos?', [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Sim, Cancelar',
        style: 'destructive',
        onPress: async () => {
          if (activeMantimentoId) {
            try {
              await updateDoc(doc(db, 'pedidos_mantimentos', activeMantimentoId), { status: 'cancelado' });
              Alert.alert('Sucesso', 'O pedido de mantimentos foi cancelado.');
            } catch (err) {
              console.warn('[VictimDashboard] Erro ao cancelar mantimentos:', err);
              Alert.alert('Erro', 'Não foi possível cancelar o pedido.');
            }
          }
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Terminar Sessão', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            navigation.replace('Login');
          } catch (err) {
            console.warn('[VictimDashboard] Erro ao sair:', err);
            navigation.replace('Login');
          }
        },
      },
    ]);
  };

  const handleGoHome = () => {
    setShowDetailsForm(false);
    setShowMantimentosForm(false);
    setShowHistory(false);
    if (activeSosId || activeMantimentoId) {
      setIsEmergencyMinimized(true);
    }
  };

  const isChatOpen = (activeSosId || activeMantimentoId) && !isEmergencyMinimized;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.bottomSection}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 110 }}
        >
          {/* Mapa Interativo com Redimensionamento Suave */}
          <View style={[styles.mapContainer, isChatOpen && { flex: 0, height: 160 }]}>
            {location && (
              <MapView
                style={styles.map}
                showsUserLocation
                showsMyLocationButton
                region={location}
              />
            )}
          </View>

          {/* Vista Principal */}
          {!showDetailsForm && !showMantimentosForm && !isChatOpen && !showHistory && (
            <View>
              <InitialActionButtons
                setShowDetailsForm={setShowDetailsForm}
                setShowMantimentosForm={setShowMantimentosForm}
              />

              {/* Botão de Maximizar Ocorrência Ativa */}
              {(activeSosId || activeMantimentoId) && isEmergencyMinimized && (
                <TouchableOpacity
                  style={{
                    backgroundColor: activeSosId ? '#EF4444' : '#3B82F6',
                    padding: 16,
                    borderRadius: 14,
                    width: '92%',
                    alignSelf: 'center',
                    marginTop: 10,
                    elevation: 3,
                  }}
                  onPress={() => setIsEmergencyMinimized(false)}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>
                    {activeSosId ? '🚨 OCORRÊNCIA SOS ATIVA - ABRIR CHAT' : '📦 PEDIDO DE MANTIMENTOS - ABRIR CHAT'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Botão de Histórico */}
              <TouchableOpacity
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: 16,
                  borderRadius: 14,
                  alignSelf: 'center',
                  marginTop: 12,
                  marginBottom: 16,
                  width: '92%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  elevation: 2,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                }}
                onPress={() => setShowHistory(true)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="clipboard-text-clock-outline" size={26} color="#3B82F6" />
                <Text style={{ fontSize: 16, fontWeight: '700', marginLeft: 10, color: '#1F2937' }}>
                  Histórico de Pedidos e Alertas
                </Text>
              </TouchableOpacity>

              <NewsSection news={news} loadingNews={loadingNews} />
            </View>
          )}

          {/* Formulário de SOS */}
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

          {/* Formulário de Mantimentos */}
          {showMantimentosForm && (
            <MantimentosDetailsForm
              descricao={descricao}
              setDescricao={setDescricao}
              quantidade={quantidade}
              setQuantidade={setQuantidade}
              handleConfirmMantimentos={handleConfirmMantimentos}
              setShowMantimentosForm={setShowMantimentosForm}
              isSending={isSending}
            />
          )}

          {/* Chat de SOS Ativo */}
          {activeSosId && !isEmergencyMinimized && (
            <ActiveEmergencyView
              activeSosId={activeSosId}
              currentUserId={auth.currentUser?.uid}
              handleCancelSOS={handleCancelSOS}
              onMinimize={() => setIsEmergencyMinimized(true)}
            />
          )}

          {/* Chat de Mantimentos Ativo */}
          {activeMantimentoId && !activeSosId && !isEmergencyMinimized && (
            <ActiveMantimentosView
              activePedidoId={activeMantimentoId}
              currentUserId={auth.currentUser?.uid}
              handleCancelPedido={handleCancelMantimento}
              onMinimize={() => setIsEmergencyMinimized(true)}
            />
          )}

          {/* Histórico Completo */}
          {showHistory && (
            <View>
              <EmergencyHistoryView />
              <TouchableOpacity
                style={{
                  padding: 16,
                  alignItems: 'center',
                  backgroundColor: '#4B5563',
                  borderRadius: 12,
                  margin: 20,
                }}
                onPress={() => setShowHistory(false)}
                activeOpacity={0.8}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Voltar ao Painel</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Barra de Navegação Inferior Fixa */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          paddingTop: 10,
          paddingBottom: Math.max(insets.bottom, 12),
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          elevation: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          zIndex: 999,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('ProfileScreen')}
          style={{ alignItems: 'center' }}
          activeOpacity={0.7}
        >
          <Ionicons name="person-outline" size={24} color="#6B7280" />
          <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4, fontWeight: '500' }}>Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleGoHome} style={{ alignItems: 'center' }} activeOpacity={0.7}>
          <Ionicons name="shield-checkmark" size={28} color="#EF4444" />
          <Text style={{ fontSize: 12, color: '#EF4444', marginTop: 2, fontWeight: '700' }}>S.A.F.E.</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={{ alignItems: 'center' }} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={24} color="#6B7280" />
          <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4, fontWeight: '500' }}>Sair</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
