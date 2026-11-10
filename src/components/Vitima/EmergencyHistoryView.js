import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';

import { auth, db } from '../../firebaseConfig';

export default function EmergencyHistoryView() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('todos');

  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      if (!auth.currentUser) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const qSOS = query(collection(db, 'sos_requests'), where('userId', '==', auth.currentUser.uid));
        const qMant = query(collection(db, 'pedidos_mantimentos'), where('userId', '==', auth.currentUser.uid));

        const [sosSnapshot, mantSnapshot] = await Promise.all([getDocs(qSOS), getDocs(qMant)]);

        const sosData = sosSnapshot.docs.map((d) => ({ id: d.id, ...d.data(), tipo: 'sos' }));
        const mantData = mantSnapshot.docs.map((d) => ({ id: d.id, ...d.data(), tipo: 'mantimento' }));

        const combined = [...sosData, ...mantData].sort((a, b) => {
          const timeA = a.timestamp?.seconds || 0;
          const timeB = b.timestamp?.seconds || 0;
          return timeB - timeA;
        });

        if (isMounted) setHistory(combined);
      } catch (error) {
        console.warn('[EmergencyHistoryView] Erro ao carregar histórico:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recente';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Data não disponível';
    }
  };

  const filteredHistory = history.filter((item) => {
    if (activeFilter === 'todos') return true;
    if (activeFilter === 'mantimento') return item.tipo === 'mantimento';
    return item.status === activeFilter;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pendente':
        return styles.statusPendente;
      case 'concluido':
        return styles.statusConcluido;
      case 'cancelado':
        return styles.statusCancelado;
      default:
        return styles.statusPendente;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#3B82F6" />
        <Text style={styles.loadingText}>A carregar o seu histórico...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Alertas e Pedidos</Text>

      <View style={{ marginBottom: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          {[
            { key: 'todos', label: 'Todos' },
            { key: 'mantimento', label: 'Mantimentos' },
            { key: 'pendente', label: 'Pendentes' },
            { key: 'concluido', label: 'Concluídos' },
            { key: 'cancelado', label: 'Cancelados' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[styles.filterChip, activeFilter === filter.key && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, activeFilter === filter.key && styles.filterTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {filteredHistory.length === 0 ? (
        <Text style={styles.emptyText}>Não foram encontrados registos para este filtro.</Text>
      ) : (
        filteredHistory.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.date}>{formatDate(item.timestamp)}</Text>
              <Text style={[styles.status, getStatusStyle(item.status)]}>
                {item.status ? item.status.toUpperCase() : 'PENDENTE'}
              </Text>
            </View>

            {item.tipo === 'mantimento' ? (
              <Text style={styles.details}>
                📦 Pedido: {item.detalhes?.descricao || 'Mantimentos'} | Qtd: {item.detalhes?.quantidade || '1'}
              </Text>
            ) : (
              <Text style={styles.details}>
                🚨 SOS | Idade: {item.detalhes?.idade || 'N/A'} | Crianças: {item.detalhes?.criancas ? 'Sim' : 'Não'}
              </Text>
            )}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1E293B',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB',
  },
  filterText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  card: {
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  date: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  status: {
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    color: '#334155',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#64748B',
    fontSize: 13,
  },
});
