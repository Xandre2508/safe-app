import { useFocusEffect } from '@react-navigation/native';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../src/firebaseConfig';
import { styles } from '../styles/OperatorDashboardStyles';

// Importação dos componentes de apresentação (Presentational Components)
import IncidentDetails from '../components/Operador/OperadorIncidentDetails';
import IncidentList from '../components/Operador/OperadorIncidentList';
import ProfileButton from '../components/Perfil_Geral/ProfileFloatingButton';

export default function OperatorDashboard({ navigation }) {
  // --- ESTADOS DA APLICAÇÃO ---
  const [todasOcorrencias, setTodasOcorrencias] = useState([]); // Array bruto com todos os SOS da BD
  const [selectedIncidentId, setSelectedIncidentId] = useState(null); // Define que SOS o operador está a inspecionar

  // --- MÉTRICAS DERIVADAS ---
  // Obtém o objeto inteiro do incidente atual com base no ID selecionado
  const selectedIncident = todasOcorrencias.find(r => r.id === selectedIncidentId);
  // Conta ativamente quantas ocorrências ainda aguardam despacho/resposta
  const pendingCount = todasOcorrencias.filter(r => r.status === 'pendente').length;

  // --- EFEITO: Escuta Ativa (Tempo Real) ---
  // Utilizamos useFocusEffect em vez de useEffect simples. 
  // Isto garante que se o Operador navegar para outro ecrã e voltar, a escuta é reativada de forma limpa.
  useFocusEffect(
    useCallback(() => {
      // Procura toda a coleção 'sos_requests' (Poderás querer adicionar um filtro temporal no futuro)
      const q = query(collection(db, 'sos_requests'));
      
      // onSnapshot escuta todas as inserções/alterações e dispara os updates à interface instantaneamente
      const unsubscribe = onSnapshot(q, (snapshot) => {
        let requests = [];
        snapshot.forEach((doc) => requests.push({ id: doc.id, ...doc.data() }));
        
        // Algoritmo de Ordenação para o Operador
        // Garante que ocorrências 'pendente' (críticas) forçam sempre o seu lugar no topo da lista
        requests.sort((a, b) => {
          if (a.status === 'pendente' && b.status !== 'pendente') return -1;
          if (a.status !== 'pendente' && b.status === 'pendente') return 1;
          return 0; // Mantém a ordem original entre os restantes
        });

        setTodasOcorrencias(requests);
      });

      // Cleanup: Cancela a escuta da Firebase quando o ecrã perde foco (poupa memória)
      return () => unsubscribe();
    }, [])
  );

  // --- RENDERIZAÇÃO CONDICIONAL ---
  // A lógica aqui é simples: Se selectedIncidentId for NULL, vemos a Lista. 
  // Se contiver um ID, escondemos a Lista e vemos a janela do Chat/Mapa (IncidentDetails).
  return (
    <SafeAreaView style={styles.container}>
      
      {/* Botão de Perfil: Escondido quando o Operador está dentro de uma ocorrência para maximizar espaço de ecrã */}
      {!selectedIncidentId && (
        <ProfileButton onPress={() => navigation.navigate('ProfileScreen')} />
      )}

      {!selectedIncidentId ? (
        // VISTA PRINCIPAL: Lista de Ocorrências
        <IncidentList 
          ocorrencias={todasOcorrencias}
          pendingCount={pendingCount}
          onSelectIncident={setSelectedIncidentId} // Passamos a função que atualiza o estado para abrir o detalhe
          onExit={() => navigation.navigate('Login')}
        />
      ) : (
        // VISTA DE DETALHE: Chat e Gestão da Ocorrência Ativa
        <IncidentDetails 
          incident={selectedIncident} // Passa os dados pré-processados
          onBack={() => setSelectedIncidentId(null)} // Função para fechar os detalhes voltando o ID a null
          currentUserId={auth.currentUser ? auth.currentUser.uid : 'operador_anonimo'}
        />
      )}

    </SafeAreaView>
  );
}