import { useFocusEffect } from '@react-navigation/native';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../src/firebaseConfig';
import { styles } from '../styles/OperatorDashboardStyles';

// Importação doscomponentes filhos
import IncidentDetails from '../components/OperadorIncidentDetails';
import IncidentList from '../components/OperadorIncidentList';
import ProfileButton from '../components/ProfileFloatingButton';

export default function OperatorDashboard({ navigation }) {
  // --- Estados da Aplicação ---
  const [todasOcorrencias, setTodasOcorrencias] = useState([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);

  // --- Seleção e Métricas Derivadas ---
  const selectedIncident = todasOcorrencias.find(r => r.id === selectedIncidentId);
  const pendingCount = todasOcorrencias.filter(r => r.status === 'pendente').length;

  // --- Escuta Ativa do Firestore (Tempo Real) ---
  useFocusEffect(
    useCallback(() => {
      const q = query(collection(db, 'sos_requests'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        let requests = [];
        snapshot.forEach((doc) => requests.push({ id: doc.id, ...doc.data() }));
        
        // Ordenação prioritária: Casos 'pendente' aparecem sempre no topo da lista
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

  // --- Lógica de Renderização Limpa ---
  return (
    <SafeAreaView style={styles.container}>
      
      {!selectedIncidentId && (
        <ProfileButton onPress={() => navigation.navigate('ProfileScreen')} />
      )}

      {!selectedIncidentId ? (
        <IncidentList 
          ocorrencias={todasOcorrencias}
          pendingCount={pendingCount}
          onSelectIncident={setSelectedIncidentId}
          onExit={() => navigation.navigate('Login')}
        />
      ) : (
        <IncidentDetails 
          incident={selectedIncident}
          onBack={() => setSelectedIncidentId(null)}
          currentUserId={auth.currentUser ? auth.currentUser.uid : 'operador_anonimo'}
        />
      )}

    </SafeAreaView>
  );
}