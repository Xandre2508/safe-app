import { addDoc, collection, doc, getDoc, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MapView from 'react-native-maps';

import { auth, db } from '../../src/firebaseConfig';
import { Strings } from '../constants/Strings';
import { styles } from '../styles/VictimDashboardStyles';

import ActiveEmergencyView from '../components/Vitima/ActiveEmergencyView';
import InitialActionButtons from '../components/Vitima/InitialActionButtons';
import NewsSection from '../components/Vitima/NewsSection';
import SOSDetailsForm from '../components/Vitima/SOSDetailsForm';

// Custom Hooks
import { useLocation } from '../hooks/useLocation';
import { useNews } from '../hooks/useNews';

// Componentes da UI (Novos Imports)

export default function VictimDashboard({ navigation }) {
  const { location } = useLocation();
  const { news, loadingNews } = useNews();

  const [isSending, setIsSending] = useState(false);
  const [userName, setUserName] = useState('');
  const [showDetailsForm, setShowDetailsForm] = useState(false); 

  const [idade, setIdade] = useState('');
  const [estaGravida, setEstaGravida] = useState(false);
  const [temCriancas, setTemCriancas] = useState(false);

  const [activeSosId, setActiveSosId] = useState(null);

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
        setActiveSosId(pendingRequest.id);
      } else {
        setActiveSosId((prevId) => {
          if (prevId) {
            const completedDoc = snapshot.docs.find(doc => doc.id === prevId && doc.data().status === 'concluido');
            if (completedDoc) Alert.alert("Resgate Concluído ✅", "A ocorrência foi resolvida. Mantenha-se em segurança.");
          }
          return null; 
        });
      }
    });

    return () => unsubscribe();
  }, []);

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
        detalhes: { idade: idade || 'Não informada', gravida: estaGravida, criancas: temCriancas },
        timestamp: serverTimestamp()
      });

      await addDoc(collection(db, 'sos_requests', docRef.id, 'messages'), {
        senderId: 'system', senderRole: 'sistema',
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

  const handleCancelSOS = () => {
    Alert.alert("Cancelar Emergência", "Deseja cancelar este pedido de SOS?", [
      { text: "Não", style: "cancel" },
      { text: "Sim, Cancelar", onPress: async () => {
          if (activeSosId) {
            try {
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

  const handleApoio = () => Alert.alert(Strings.victim.supportAlertTitle, Strings.victim.supportAlertMessage);

  return (
    <SafeAreaView style={styles.container}>
      
      <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('ProfileScreen')}>
        <Text style={styles.profileIcon}>👤</Text>
      </TouchableOpacity>

      <View style={styles.mapContainer}>
        {location && <MapView style={styles.map} showsUserLocation={true} showsMyLocationButton={true} region={location} />}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.bottomSection} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          {!showDetailsForm && !activeSosId && (
            <InitialActionButtons setShowDetailsForm={setShowDetailsForm} handleApoio={handleApoio} />
          )}

          {showDetailsForm && !activeSosId && (
            <SOSDetailsForm 
              idade={idade} setIdade={setIdade}
              estaGravida={estaGravida} setEstaGravida={setEstaGravida}
              temCriancas={temCriancas} setTemCriancas={setTemCriancas}
              setShowDetailsForm={setShowDetailsForm} handleConfirmSOS={handleConfirmSOS} isSending={isSending}
            />
          )}

          {activeSosId && (
            <ActiveEmergencyView 
              activeSosId={activeSosId} 
              currentUserId={auth.currentUser ? auth.currentUser.uid : 'anonimo'} 
              handleCancelSOS={handleCancelSOS} 
            />
          )}

          {!showDetailsForm && !activeSosId && (
            <NewsSection news={news} loadingNews={loadingNews} />
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}