import { useFocusEffect } from '@react-navigation/native'; // <-- NOVO IMPORT
import { collection, onSnapshot, query } from 'firebase/firestore';
import { useCallback, useState } from 'react'; // <-- IMPORTAMOS useCallback
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import EmergencyChat from '../components/EmergencyChat';
import { auth, db } from '../firebaseConfig';
import { styles } from '../styles/OperatorDashboardStyles';

export default function OperatorDashboard({ navigation }) {
  const [todasOcorrencias, setTodasOcorrencias] = useState([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);

  const selectedIncident = todasOcorrencias.find(r => r.id === selectedIncidentId);

  // CORREÇÃO: Substituímos o useEffect pelo useFocusEffect
  // Isto garante que o ecrã refaz a ligação à base de dados SEMPRE que o operador abre a app
  useFocusEffect(
    useCallback(() => {
      const q = query(collection(db, 'sos_requests'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        let requests = [];
        snapshot.forEach((doc) => requests.push({ id: doc.id, ...doc.data() }));
        
        requests.sort((a, b) => {
          if (a.status === 'pendente' && b.status !== 'pendente') return -1;
          if (a.status !== 'pendente' && b.status === 'pendente') return 1;
          return 0; // Opcional: Aqui podíamos ordenar por data para ter os mais recentes no topo
        });

        setTodasOcorrencias(requests);
      });

      // Limpa a ligação quando o operador sai do ecrã (ex: faz logout)
      return () => unsubscribe();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      
      {/* BOTÃO DE PERFIL FLUTUANTE */}
      {!selectedIncidentId && (
        <TouchableOpacity 
          style={{
            position: 'absolute',
            top: 15,
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
      )}

      {/* VISTA A: LISTAGEM COMPLETA DE OCORRÊNCIAS */}
      {!selectedIncidentId ? (
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Central de Operações</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, styles.statCardActive]}>
               <Text style={styles.statTitle}>SOS Ativos</Text>
               <Text style={styles.statNumberActive}>{todasOcorrencias.filter(r => r.status === 'pendente').length}</Text>
            </View>
            
            <View style={[styles.statCard, styles.statCardDone]}>
               <Text style={styles.statTitle}>Concluídos</Text>
               <Text style={styles.statNumberDone}>{todasOcorrencias.filter(r => r.status === 'concluido').length}</Text>
            </View>
          </View>

          <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
            {todasOcorrencias.map((req) => {
              const isPendente = req.status === 'pendente';
              return (
                <TouchableOpacity 
                  key={req.id} 
                  style={[styles.incidentCard, isPendente ? styles.incidentCardActive : styles.incidentCardDone]}
                  onPress={() => setSelectedIncidentId(req.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.victimName} numberOfLines={1}>
                      {req.userName && req.userName.trim() !== '' ? req.userName : 'Vítima Desconhecida'}
                    </Text>
                    <View style={[styles.badge, isPendente ? styles.badgeActive : styles.badgeDone]}>
                      <Text style={isPendente ? styles.badgeTextActive : styles.badgeTextDone}>
                        {isPendente ? 'PENDENTE' : 'CONCLUÍDO'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.coordsContainer}>
                    <Text style={{fontSize: 14}}>📍</Text>
                    <Text style={styles.coordsText}>Lat: {req.latitude?.toFixed(4)} | Lon: {req.longitude?.toFixed(4)}</Text>
                  </View>
                  {req.detalhes && isPendente && (
                    <Text style={{ fontSize: 12, color: '#E74C3C', marginTop: 5, fontWeight: '500' }}>
                      ⚠️ {req.detalhes.criancas ? "Crianças Presentes" : req.detalhes.gravida ? "Grávida na ocorrência" : `Idade: ${req.detalhes.idade}`}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={styles.exitButton} onPress={() => navigation.navigate('Login')} activeOpacity={0.8}>
              <Text style={styles.exitButtonText}>Sair da Central</Text>
          </TouchableOpacity>
        </>
      ) : (
        
        // VISTA B: INTERFACE DE GESTÃO TÁTICA E CHAT COM A VÍTIMA SELECIONADA
        selectedIncident && (
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={{ flex: 1, width: '100%', padding: 15 }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <TouchableOpacity 
                style={{ backgroundColor: '#BDC3C7', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8 }}
                onPress={() => setSelectedIncidentId(null)}
              >
                <Text style={{ color: '#333', fontWeight: 'bold' }}>⬅ Voltar</Text>
              </TouchableOpacity>
              
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2C3E50', flex: 1, textAlign: 'right', marginRight: 5 }} numberOfLines={1}>
                {selectedIncident.userName}
              </Text>
            </View>

            <View style={{ backgroundColor: '#FFF', padding: 12, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#BDC3C7', shadowOpacity: 0.05, elevation: 2 }}>
              <Text style={{ fontWeight: 'bold', color: '#7F8C8D', marginBottom: 5, fontSize: 12 }}>DADOS DE TRIAGEM COLETADOS:</Text>
              <Text style={{ fontSize: 14, color: '#333' }}>📍 Coordenadas: {selectedIncident.latitude?.toFixed(5)}, {selectedIncident.longitude?.toFixed(5)}</Text>
              <Text style={{ fontSize: 14, color: '#333' }}>🎂 Idade Declarada: {selectedIncident.detalhes?.idade || 'Não informada'}</Text>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: selectedIncident.detalhes?.criancas || selectedIncident.detalhes?.gravida ? '#E74C3C' : '#27AE60' }}>
                🚨 Estado: {selectedIncident.detalhes?.criancas ? "CRÍTICO (Crianças Presentes)" : selectedIncident.detalhes?.gravida ? "CRÍTICO (Grávida)" : "Atendimento Padrão"}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              {selectedIncident.status === 'pendente' ? (
                <EmergencyChat 
                  sosId={selectedIncidentId} 
                  currentUserRole="operador" 
                  currentUserId={auth.currentUser ? auth.currentUser.uid : 'operador_anonimo'} 
                />
              ) : (
                <View style={{ flex: 1, backgroundColor: '#EAFAF1', padding: 20, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#27AE60' }}>
                  <Text style={{ fontSize: 28, marginBottom: 10 }}>✅</Text>
                  <Text style={{ color: '#27AE60', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>
                    Esta ocorrência foi marcada como concluída por um socorrista. O chat em tempo real encontra-se arquivado.
                  </Text>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        )
      )}
    </SafeAreaView>
  );
}