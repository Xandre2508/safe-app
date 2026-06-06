import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../src/firebaseConfig';
import { styles } from '../styles/OperatorDashboardStyles';

// Componentes
import IncidentDetails from '../components/Operador/OperadorIncidentDetails';
import IncidentList from '../components/Operador/OperadorIncidentList';
import OperatorRescuerChatView from '../components/Operador/OperatorRescuerChatView';

export default function OperatorDashboard({ navigation }) {
  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState('sos'); // 'sos' | 'radio'
  const [todasOcorrencias, setTodasOcorrencias] = useState([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [socorristas, setSocorristas] = useState([]);
  const [selectedRescuer, setSelectedRescuer] = useState(null);

  // --- MÉTRICAS ---
  const selectedIncident = todasOcorrencias.find(r => r.id === selectedIncidentId);
  const pendingCount = todasOcorrencias.filter(r => r.status === 'pendente').length;

  // --- EFEITO 1: Ocorrências SOS ---
  useFocusEffect(
    useCallback(() => {
      const q = query(collection(db, 'sos_requests'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        let requests = [];
        snapshot.forEach((doc) => requests.push({ id: doc.id, ...doc.data() }));
        requests.sort((a, b) => {
          if (a.status === 'pendente' && b.status !== 'pendente') return -1;
          if (a.status !== 'pendente' && b.status === 'pendente') return 1;
          return 0; 
        });
        setTodasOcorrencias(requests);
      });
      return () => unsubscribe();
    }, [])
  );

  // --- EFEITO 2: Socorristas ---
  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'socorrista'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let equipa = [];
      snapshot.forEach(doc => equipa.push({ id: doc.id, ...doc.data() }));
      setSocorristas(equipa);
    });
    return () => unsubscribe();
  }, []);

  // --- ACÕES ---
  const handleLogout = () => {
    Alert.alert("Terminar Sessão", "Tens a certeza que queres sair da central?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => navigation.navigate('Login') }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* NAVBAR SUPERIOR FIXA (Escondida se estivermos dentro de um chat para maximizar o ecrã) */}
      {!selectedIncidentId && !selectedRescuer && (
        <SafeAreaView style={styles.navBarContainer}>
          <View style={styles.navBar}>
            
            {/* Botão Perfil */}
            <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('ProfileScreen')}>
              <Ionicons name="person-circle-outline" size={28} color="#4B5563" />
              <Text style={styles.navButtonText}>Perfil</Text>
            </TouchableOpacity>

            {/* Abas Centrais (Toggle SOS/Radio) */}
            <View style={styles.navTabContainer}>
              <TouchableOpacity 
                style={[styles.navTabButton, activeTab === 'sos' && styles.navTabButtonActive]} 
                onPress={() => setActiveTab('sos')}
              >
                <Text style={[styles.navTabText, activeTab === 'sos' && styles.navTabTextActive]}>
                  🚨 SOS ({pendingCount})
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

            {/* Botão Sair */}
            <TouchableOpacity style={styles.navButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={28} color="#EF4444" />
              <Text style={[styles.navButtonText, { color: '#EF4444' }]}>Sair</Text>
            </TouchableOpacity>

          </View>
        </SafeAreaView>
      )}

      {/* ÁREA DE CONTEÚDO */}
      {/* Se não houver nada aberto, aplicamos o padding para não tapar o topo da lista */}
      <View style={(!selectedIncidentId && !selectedRescuer) ? styles.contentPadding : { flex: 1 }}>
        
        {/* ABA: SOS */}
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