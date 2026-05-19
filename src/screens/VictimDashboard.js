import * as Location from 'expo-location';
import { addDoc, collection, doc, getDoc, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView from 'react-native-maps';

import { auth, db } from '../../src/firebaseConfig';
import EmergencyChat from '../components/EmergencyChat';
import { Strings } from '../constants/Strings';
import { styles } from '../styles/VictimDashboardStyles';

export default function VictimDashboard({ navigation }) {
  const [location, setLocation] = useState(null);
  const [isSending, setIsSending] = useState(false);
  
  const [userName, setUserName] = useState('');
  const [showDetailsForm, setShowDetailsForm] = useState(false); 

  const [idade, setIdade] = useState('');
  const [estaGravida, setEstaGravida] = useState(false);
  const [temCriancas, setTemCriancas] = useState(false);

  const [activeSosId, setActiveSosId] = useState(null);

  // Estados para as Notícias
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);

  // 1. Efeito para carregar a Localização e o Nome
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(Strings.permissionDeniedTitle, Strings.victim.locationError);
        return;
      }
      
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.05, 
        longitudeDelta: 0.05,
      });
    })();

    const fetchUserName = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().nome);
          }
        } catch (error) {
          console.log("Erro ao buscar nome:", error);
        }
      }
    };
    fetchUserName();
  }, []);

  // 2. Efeito: Verifica se a vítima já tem um SOS pendente (Persistência)
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'sos_requests'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pendingRequest = snapshot.docs.find(doc => doc.data().status === 'pendente');
      
      if (pendingRequest) {
        setActiveSosId(pendingRequest.id);
      } else {
        setActiveSosId((prevId) => {
          if (prevId) {
            const completedDoc = snapshot.docs.find(doc => doc.id === prevId && doc.data().status === 'concluido');
            if (completedDoc) {
              Alert.alert("Resgate Concluído ✅", "A central de operações confirmou que a sua ocorrência foi resolvida. Mantenha-se em segurança.");
            }
          }
          return null; 
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // 3. Efeito: Buscar Últimas Notícias de Portugal com a tua API Key
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`https://newsapi.org/v2/top-headlines?country=pt&apiKey=${process.env.EXPO_PUBLIC_NEWS_API_KEY}`);
        const data = await response.json();
        
        if (data.articles) {
          setNews(data.articles.slice(0, 3)); // Mostra apenas as 3 mais recentes
        }
      } catch (error) {
        console.log("Erro ao buscar notícias:", error);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchNews();
  }, []);

  const handleConfirmSOS = async () => {
    if (!location) {
      Alert.alert(Strings.wait, Strings.victim.locationWait);
      return;
    }
    
    setIsSending(true);

    try {
      const docRef = await addDoc(collection(db, 'sos_requests'), {
        userId: auth.currentUser ? auth.currentUser.uid : 'anonimo',
        userEmail: auth.currentUser ? auth.currentUser.email : 'N/A',
        userName: userName || 'Utilizador Desconhecido', 
        latitude: location.latitude,
        longitude: location.longitude,
        status: 'pendente',
        detalhes: {
          idade: idade || 'Não informada',
          gravida: estaGravida,
          criancas: temCriancas,
        },
        timestamp: serverTimestamp()
      });

      await addDoc(collection(db, 'sos_requests', docRef.id, 'messages'), {
        senderId: 'system',
        senderRole: 'sistema',
        text: 'O seu pedido de SOS foi recebido. Um operador irá responder em breve. Por favor, mantenha a calma e permaneça num local seguro.',
        timestamp: serverTimestamp()
      });

      setShowDetailsForm(false);
      setIdade('');
      setEstaGravida(false);
      setTemCriancas(false);

      Alert.alert(Strings.victim.sosSentTitle, Strings.victim.sosSentMessage);

    } catch (error) {
      Alert.alert(Strings.error, Strings.victim.sosError);
    } finally {
      setIsSending(false);
    }
  };

  const handleCancelSOS = () => {
    Alert.alert(
      "Cancelar Emergência",
      "Tem a certeza que já se encontra em segurança e deseja cancelar este pedido de SOS?",
      [
        { text: "Não", style: "cancel" },
        {
          text: "Sim, Cancelar",
          onPress: async () => {
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
      ]
    );
  };

  const handleApoio = () => {
    Alert.alert(Strings.victim.supportAlertTitle, Strings.victim.supportAlertMessage);
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* BOTÃO DE PERFIL FLUTUANTE */}
      <TouchableOpacity 
        style={{
          position: 'absolute',
          top: 45, 
          left: 15,
          zIndex: 999,
          backgroundColor: '#FFFFFF',
          width: 50,
          height: 50,
          borderRadius: 25,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        }}
        onPress={() => navigation.navigate('ProfileScreen')}
      >
        <Text style={{ fontSize: 24 }}>👤</Text>
      </TouchableOpacity>

      <View style={styles.mapContainer}>
        <MapView style={styles.map} showsUserLocation={true} showsMyLocationButton={true} region={location} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.bottomSection} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          {/* MODO 1: BOTÕES INICIAIS */}
          {!showDetailsForm && !activeSosId && (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.actionButton, styles.btnSOS]} onPress={() => setShowDetailsForm(true)}>
                <Text style={styles.btnText}>{Strings.victim.btnSOS}</Text>
                <Text style={styles.btnSubText}>{Strings.victim.btnSOSSub}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, styles.btnApoio]} onPress={handleApoio}>
                <Text style={styles.btnText}>{Strings.victim.btnSupport}</Text>
                <Text style={styles.btnSubText}>{Strings.victim.btnSupportSub}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* MODO 2: FORMULÁRIO SOS (OPCIONAL) */}
          {showDetailsForm && !activeSosId && (
            <View style={{ backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, marginBottom: 20 }}>
              <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Detalhes para o Resgate (Opcional):</Text>
              
              <TextInput
                style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 15, padding: 8, borderRadius: 5 }}
                placeholder="A sua Idade (ex: 35)"
                keyboardType="numeric"
                value={idade}
                onChangeText={setIdade}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                <Text>Está grávida?</Text>
                <Switch value={estaGravida} onValueChange={setEstaGravida} />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text>Tem crianças consigo?</Text>
                <Switch value={temCriancas} onValueChange={setTemCriancas} />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity style={{ backgroundColor: '#ccc', padding: 15, borderRadius: 10, flex: 0.4, alignItems: 'center' }} onPress={() => setShowDetailsForm(false)}>
                  <Text style={{ color: '#333', fontWeight: 'bold' }}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.btnSOS, { padding: 15, borderRadius: 10, flex: 0.55, alignItems: 'center' }]} onPress={handleConfirmSOS} disabled={isSending}>
                  {isSending ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>CONFIRMAR SOS</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* MODO 3: CHAT DE EMERGÊNCIA ATIVO */}
          {activeSosId && (
            <>
              <View style={[styles.statusCard, { borderLeftColor: '#E74C3C', height: 320, padding: 0, overflow: 'hidden', marginBottom: 10 }]}>
                <EmergencyChat 
                  sosId={activeSosId} 
                  currentUserRole="vitima" 
                  currentUserId={auth.currentUser ? auth.currentUser.uid : 'anonimo'} 
                />
              </View>
              
              <TouchableOpacity 
                style={{ backgroundColor: '#E74C3C', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20 }}
                onPress={handleCancelSOS}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Desativar / Cancelar SOS</Text>
              </TouchableOpacity>
            </>
          )}

          {/* LEITOR DE NOTÍCIAS (Substitui o estado de emergência estático) */}
          {!showDetailsForm && !activeSosId && (
            <View style={{ marginBottom: 15 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#2C3E50', marginBottom: 10, marginLeft: 5 }}>
                📰 Últimas Notícias
              </Text>
              
              {loadingNews ? (
                <View style={[styles.statusCard, { alignItems: 'center', padding: 30 }]}>
                  <ActivityIndicator size="large" color="#4361EE" />
                  <Text style={{ marginTop: 10, color: '#7F8C8D' }}>A carregar notícias de Portugal...</Text>
                </View>
              ) : news.length > 0 ? (
                news.map((item, index) => (
                  <View key={index} style={[styles.statusCard, { borderLeftColor: '#4361EE', marginBottom: 10, padding: 15 }]}>
                    <Text style={styles.statusTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.infoText} numberOfLines={3}>
                      {item.description || 'Clique para ler os detalhes da notícia. Acompanhe a situação atualizada.'}
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
                      <Text style={{ fontSize: 11, color: '#95A5A6', fontWeight: 'bold' }}>
                        Fonte: {item.source.name}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.statusCard}>
                  <Text style={styles.infoText}>Não foi possível carregar as notícias neste momento.</Text>
                </View>
              )}
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}