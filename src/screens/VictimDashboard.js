import { addDoc, collection, doc, getDoc, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MapView from 'react-native-maps';

// Importação das configurações e constantes
import { auth, db } from '../../src/firebaseConfig';
import { Strings } from '../constants/Strings';
import { styles } from '../styles/VictimDashboardStyles';

// Importação dos Componentes Visuais (Modularização)
import ActiveEmergencyView from '../components/Vitima/ActiveEmergencyView';
import InitialActionButtons from '../components/Vitima/InitialActionButtons';
import NewsSection from '../components/Vitima/NewsSection';
import SOSDetailsForm from '../components/Vitima/SOSDetailsForm';

// Importação dos Custom Hooks que isolam a lógica de GPS e Notícias
import { useLocation } from '../hooks/useLocation';
import { useNews } from '../hooks/useNews';

export default function VictimDashboard({ navigation }) {
  // --- 1. HOOKS EXTERNOS ---
  const { location } = useLocation(); // Obtém as coordenadas GPS em tempo real
  const { news, loadingNews } = useNews(); // Obtém as notícias (ex: da GNews API)

  // --- 2. ESTADOS DA APLICAÇÃO ---
  // Controlo da Interface
  const [isSending, setIsSending] = useState(false); // Bloqueia o botão durante o envio para evitar duplicações
  const [showDetailsForm, setShowDetailsForm] = useState(false); // Alterna entre os botões iniciais e o formulário de SOS
  
  // Dados do Utilizador e Emergência
  const [userName, setUserName] = useState(''); // Guarda o nome do utilizador logado
  const [activeSosId, setActiveSosId] = useState(null); // Guarda o ID de uma emergência a decorrer (se existir)

  // Campos do Formulário de Triagem
  const [idade, setIdade] = useState('');
  const [estaGravida, setEstaGravida] = useState(false);
  const [temCriancas, setTemCriancas] = useState(false);

  // --- 3. EFEITOS (LIFECYCLE) ---

  // Efeito A: Carregar o nome do utilizador da base de dados ao entrar no ecrã
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

  // Efeito B: Escuta ativa (Tempo Real) para detetar se o utilizador tem um SOS em curso
  useEffect(() => {
    if (!auth.currentUser) return; // Segurança: Garante que há um utilizador logado
    
    // Cria uma query para procurar pedidos de SOS pertencentes a este utilizador
    const q = query(collection(db, 'sos_requests'), where('userId', '==', auth.currentUser.uid));

    // onSnapshot cria um 'listener' que reage instantaneamente a mudanças na base de dados
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Procura se existe algum pedido com o estado 'pendente'
      const pendingRequest = snapshot.docs.find(doc => doc.data().status === 'pendente');
      
      if (pendingRequest) {
        // Se existir, guarda o ID para bloquear o ecrã no modo de "Emergência Ativa"
        setActiveSosId(pendingRequest.id);
      } else {
        // Se não houver pendentes, verifica se um pedido anterior acabou de ser 'concluido' pelos socorristas
        setActiveSosId((prevId) => {
          if (prevId) {
            const completedDoc = snapshot.docs.find(doc => doc.id === prevId && doc.data().status === 'concluido');
            if (completedDoc) Alert.alert("Resgate Concluído ✅", "A ocorrência foi resolvida. Mantenha-se em segurança.");
          }
          return null; // Liberta o ecrã de emergência
        });
      }
    });

    // Função de limpeza: remove o listener quando o componente é desmontado
    return () => unsubscribe();
  }, []);

  // --- 4. FUNÇÕES DE AÇÃO ---

  // Função para criar e enviar o pedido de SOS para a Firebase
  const handleConfirmSOS = async () => {
    if (!location) return Alert.alert(Strings.wait, Strings.victim.locationWait); // Impede o envio sem GPS
    setIsSending(true); // Ativa o "loading" no botão

    try {
      // 1º Passo: Cria o documento principal da ocorrência na coleção 'sos_requests'
      const docRef = await addDoc(collection(db, 'sos_requests'), {
        userId: auth.currentUser ? auth.currentUser.uid : 'anonimo',
        userEmail: auth.currentUser ? auth.currentUser.email : 'N/A',
        userName: userName || 'Utilizador Desconhecido', 
        latitude: location.latitude,
        longitude: location.longitude,
        status: 'pendente', // Estado inicial da ocorrência
        detalhes: { idade: idade || 'Não informada', gravida: estaGravida, criancas: temCriancas }, // Triagem
        timestamp: serverTimestamp() // Hora oficial do servidor da Firebase
      });

      // 2º Passo: Cria imediatamente a subcoleção de mensagens (Chat) atrelada a este pedido
      await addDoc(collection(db, 'sos_requests', docRef.id, 'messages'), {
        senderId: 'system', 
        senderRole: 'sistema',
        text: 'O seu pedido de SOS foi recebido. Um operador irá responder em breve.',
        timestamp: serverTimestamp()
      });

      // 3º Passo: Limpa o formulário e esconde a vista de submissão
      setShowDetailsForm(false);
      setIdade(''); setEstaGravida(false); setTemCriancas(false);
      Alert.alert(Strings.victim.sosSentTitle, Strings.victim.sosSentMessage);

    } catch (error) {
      Alert.alert(Strings.error, Strings.victim.sosError);
    } finally {
      setIsSending(false); // Desativa o "loading" independentemente de sucesso ou erro
    }
  };

  // Função para cancelar o pedido de SOS atual
  const handleCancelSOS = () => {
    Alert.alert("Cancelar Emergência", "Deseja cancelar este pedido de SOS?", [
      { text: "Não", style: "cancel" },
      { text: "Sim, Cancelar", onPress: async () => {
          if (activeSosId) {
            try {
              // Apenas altera o estado do documento para 'cancelado' (não o apaga para manter histórico)
              await updateDoc(doc(db, 'sos_requests', activeSosId), { status: 'cancelado' });
              Alert.alert("Cancelado", "O seu pedido de socorro foi cancelado.");
            } catch (error) {
              Alert.alert("Erro", "Não foi possível cancelar o pedido.");
            }
          }
        }
      }
    ]);
  };

  // Botão de apoio geral (função placeholder)
  const handleApoio = () => Alert.alert(Strings.victim.supportAlertTitle, Strings.victim.supportAlertMessage);

  // --- 5. RENDERIZAÇÃO DA INTERFACE (UI) ---
  return (
    <SafeAreaView style={styles.container}>
      
      {/* Botão de navegação para o perfil */}
      <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('ProfileScreen')}>
        <Text style={styles.profileIcon}>👤</Text>
      </TouchableOpacity>

      {/* Renderização do Mapa Condicional (Só mostra quando o GPS carregar) */}
      <View style={styles.mapContainer}>
        {location && <MapView style={styles.map} showsUserLocation={true} showsMyLocationButton={true} region={location} />}
      </View>

      {/* KeyboardAvoidingView empurra a interface para cima para o teclado não tapar os inputs */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.bottomSection} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          {/* LÓGICA DE CONDICIONAMENTO DE VISTAS (O que mostrar e quando?) */}

          {/* VISTA 1: Estado Normal - Mostra apenas os botões de ação (SOS vermelho / Apoio) */}
          {!showDetailsForm && !activeSosId && (
            <InitialActionButtons setShowDetailsForm={setShowDetailsForm} handleApoio={handleApoio} />
          )}

          {/* VISTA 2: Formulário de Triagem - Mostra quando o utilizador clica em SOS */}
          {showDetailsForm && !activeSosId && (
            <SOSDetailsForm 
              idade={idade} setIdade={setIdade}
              estaGravida={estaGravida} setEstaGravida={setEstaGravida}
              temCriancas={temCriancas} setTemCriancas={setTemCriancas}
              setShowDetailsForm={setShowDetailsForm} handleConfirmSOS={handleConfirmSOS} isSending={isSending}
            />
          )}

          {/* VISTA 3: Emergência Ativa - Mostra o chat e substitui todo o resto se houver um SOS pendente */}
          {activeSosId && (
            <ActiveEmergencyView 
              activeSosId={activeSosId} 
              currentUserId={auth.currentUser ? auth.currentUser.uid : 'anonimo'} 
              handleCancelSOS={handleCancelSOS} 
            />
          )}

          {/* Secção de Notícias - Só é mostrada no Estado Normal (esconde-se durante o form e na emergência) */}
          {!showDetailsForm && !activeSosId && (
            <NewsSection news={news} loadingNews={loadingNews} />
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}