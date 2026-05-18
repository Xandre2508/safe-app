import { collection, onSnapshot, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../firebaseConfig';

export default function OperatorDashboard({ navigation }) {
  const [todasOcorrencias, setTodasOcorrencias] = useState([]);

  useEffect(() => {
    // Operador vê TODAS as ocorrências para gestão
    const q = query(collection(db, 'sos_requests'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let requests = [];
      snapshot.forEach((doc) => requests.push({ id: doc.id, ...doc.data() }));
      setTodasOcorrencias(requests);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#E5E5E5', padding: 15 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#2C3E50', marginBottom: 15 }}>Central de Operações</Text>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
        <View style={{ backgroundColor: '#E74C3C', padding: 15, borderRadius: 10, flex: 0.48 }}>
           <Text style={{ color: '#FFF', fontWeight: 'bold' }}>SOS Ativos</Text>
           <Text style={{ color: '#FFF', fontSize: 24 }}>{todasOcorrencias.filter(r => r.status === 'pendente').length}</Text>
        </View>
        <View style={{ backgroundColor: '#27AE60', padding: 15, borderRadius: 10, flex: 0.48 }}>
           <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Concluídos</Text>
           <Text style={{ color: '#FFF', fontSize: 24 }}>{todasOcorrencias.filter(r => r.status === 'concluido').length}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {todasOcorrencias.map((req) => (
          <View key={req.id} style={{ backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>Vítima: {req.userName}</Text>
            <Text>Status: {req.status === 'pendente' ? '🔴 Pendente' : '🟢 Concluído'}</Text>
            <Text style={{ fontSize: 12, color: '#7F8C8D', marginTop: 5 }}>Lat: {req.latitude.toFixed(4)} | Lon: {req.longitude.toFixed(4)}</Text>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={{ backgroundColor: '#000', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 }} onPress={() => navigation.navigate('Login')}>
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Sair da Central</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}