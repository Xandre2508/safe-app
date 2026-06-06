import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';

export default function EmergencyHistoryView() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar qual o filtro selecionado
  const [activeFilter, setActiveFilter] = useState('todos');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!auth.currentUser) return;

      try {
        const q = query(
          collection(db, 'sos_requests'),
          where('userId', '==', auth.currentUser.uid),
          orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const fetchedHistory = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setHistory(fetchedHistory);
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Data desconhecida';
    const date = timestamp.toDate();
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Lógica que filtra a lista original baseada no botão selecionado
  const filteredHistory = history.filter(item => {
    if (activeFilter === 'todos') return true;
    return item.status === activeFilter;
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF3B30" />
        <Text style={styles.loadingText}>A carregar histórico...</Text>
      </View>
    );
  }

  // Define as cores consoante o estado do pedido
  const getStatusStyle = (status) => {
    switch(status) {
      case 'pendente': return styles.statusPendente;
      case 'concluido': return styles.statusConcluido;
      case 'cancelado': return styles.statusCancelado;
      default: return styles.statusPendente;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Alertas</Text>
      
      {/* Barra de Filtros Horizontal */}
      <View style={{ marginBottom: 15 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          {['todos', 'pendente', 'concluido', 'cancelado'].map((filterType) => (
            <TouchableOpacity
              key={filterType}
              style={[
                styles.filterChip,
                activeFilter === filterType && styles.filterChipActive
              ]}
              onPress={() => setActiveFilter(filterType)}
            >
              <Text style={[
                styles.filterText,
                activeFilter === filterType && styles.filterTextActive
              ]}>
                {/* Coloca a primeira letra em maiúscula */}
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Renderizar a lista 'filteredHistory' em vez da original */}
      {filteredHistory.length === 0 ? (
        <Text style={styles.emptyText}>Não tem pedidos de socorro neste estado.</Text>
      ) : (
        filteredHistory.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.date}>{formatDate(item.timestamp)}</Text>
              <Text style={[styles.status, getStatusStyle(item.status)]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.details}>
              Idade: {item.detalhes?.idade || 'N/A'} | Crianças: {item.detalhes?.criancas ? 'Sim' : 'Não'}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

// Estilos locais atualizados com os filtros e novas cores
const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  // --- Estilos dos Filtros ---
  filterContainer: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#3B82F6', 
    borderColor: '#3B82F6',
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  // --- Estilos dos Cartões ---
  card: {
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  statusPendente: {
    backgroundColor: '#FEF3C7', 
    color: '#92400E', 
  },
  statusConcluido: {
    backgroundColor: '#D1FAE5', 
    color: '#065F46', 
  },
  statusCancelado: {
    backgroundColor: '#FEE2E2', 
    color: '#991B1B', 
  },
  details: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#6B7280',
  }
});