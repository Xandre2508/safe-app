import { collection, onSnapshot, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../firebaseConfig';
import { styles } from '../styles/OperatorDashboardStyles';

export default function OperatorDashboard({ navigation }) {
  const [todasOcorrencias, setTodasOcorrencias] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'sos_requests'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let requests = [];
      snapshot.forEach((doc) => requests.push({ id: doc.id, ...doc.data() }));
      
      // MELHORIA DE LÓGICA: Ordena a lista para que os SOS 'pendentes' fiquem sempre no topo!
      requests.sort((a, b) => {
        if (a.status === 'pendente' && b.status !== 'pendente') return -1;
        if (a.status !== 'pendente' && b.status === 'pendente') return 1;
        return 0;
      });

      setTodasOcorrencias(requests);
    });
    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Central de Operações</Text>
      </View>
      
      {/* Cartões Estatísticos Modernos */}
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

      {/* Lista de Ocorrências */}
      <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
        {todasOcorrencias.map((req) => {
          // Variável para facilitar a leitura se o pedido está ativo
          const isPendente = req.status === 'pendente';
          
          return (
            <View 
              key={req.id} 
              style={[styles.incidentCard, isPendente ? styles.incidentCardActive : styles.incidentCardDone]}
            >
              
              <View style={styles.cardHeader}>
                <Text style={styles.victimName} numberOfLines={1}>
                  {req.userName && req.userName.trim() !== '' ? req.userName : 'Vítima Desconhecida'}
                </Text>
                
                {/* Etiqueta (Badge) de Status */}
                <View style={[styles.badge, isPendente ? styles.badgeActive : styles.badgeDone]}>
                  <Text style={isPendente ? styles.badgeTextActive : styles.badgeTextDone}>
                    {isPendente ? 'PENDENTE' : 'CONCLUÍDO'}
                  </Text>
                </View>
              </View>

              {/* Bloco de Coordenadas com Ícone */}
              <View style={styles.coordsContainer}>
                <Text style={{fontSize: 14}}>📍</Text>
                <Text style={styles.coordsText}>
                  Lat: {req.latitude?.toFixed(4)}  |  Lon: {req.longitude?.toFixed(4)}
                </Text>
              </View>
              
            </View>
          );
        })}
      </ScrollView>

      {/* Botão de Sair Estilizado */}
      <TouchableOpacity 
        style={styles.exitButton} 
        onPress={() => navigation.navigate('Login')}
        activeOpacity={0.8}
      >
          <Text style={styles.exitButtonText}>Sair da Central</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}