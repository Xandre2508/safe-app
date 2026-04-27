import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

// --- IMPORTAÇÕES DO FIREBASE ---
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';

import { Strings } from '../constants/Strings';
import { styles } from '../styles/RescuerDashboardStyles';

// --- FUNÇÃO AUXILIAR: CÁLCULO DE DISTÂNCIA (HAVERSINE) ---
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function RescuerDashboard({ navigation }) {
  const [location, setLocation] = useState(null);
  const [activeRequests, setActiveRequests] = useState([]);
  const [currentMission, setCurrentMission] = useState(null);

  // 1. Obter localização do Socorrista ao abrir o ecrã
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(Strings.permissionDeniedTitle, Strings.rescuer.locationError);
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
  }, []);

  // 2. Escuta em tempo real os pedidos de SOS num raio de 50km
  useEffect(() => {
    if (!location) return;

    // Filtra apenas pedidos que ainda estão 'pendentes'
    const q = query(collection(db, 'sos_requests'), where('status', '==', 'pendente'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let requests = [];

      snapshot.forEach((document) => {
        const data = document.data();
        
        // Calcula a distância real entre o socorrista e a vítima
        const distance = getDistanceKm(
          location.latitude, location.longitude, 
          data.latitude, data.longitude
        );

        // Filtra pelo raio de 50 km
        if (distance <= 50) {
          requests.push({ id: document.id, distance, ...data });
        }
      });

      // 3. Lógica de Pesos para Prioridade
      const getPriorityWeight = (detalhes) => {
        if (!detalhes) return 4;
        if (detalhes.criancas) return 1; // Prioridade 1: Crianças
        if (detalhes.gravida) return 2;  // Prioridade 2: Grávidas
        
        const idade = parseInt(detalhes.idade);
        if (idade > 65) return 3;       // Prioridade 3: Idosos
        
        return 4; // Outros
      };

      // 4. Ordenação: Primeiro por prioridade, depois por proximidade
      requests.sort((a, b) => {
        const weightA = getPriorityWeight(a.detalhes);
        const weightB = getPriorityWeight(b.detalhes);
        
        if (weightA !== weightB) {
          return weightA - weightB;
        }
        return a.distance - b.distance; 
      });

      setActiveRequests(requests);
      // Define a missão mais prioritária como a missão atual
      setCurrentMission(requests.length > 0 ? requests[0] : null);
    });

    return () => unsubscribe();
  }, [location]);

  // 5. Função para Concluir a Missão
  const handleCompleteMission = async () => {
    if (!currentMission) return;

    Alert.alert(
      "Concluir Resgate",
      "Confirmar que a vítima foi assistida e a missão está terminada?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim, Concluído", 
          onPress: async () => {
            try {
              const docRef = doc(db, 'sos_requests', currentMission.id);
              await updateDoc(docRef, { status: 'concluido' });
              Alert.alert("Sucesso", "A missão foi removida da lista ativa.");
            } catch (error) {
              Alert.alert("Erro", "Não foi possível atualizar o estado no servidor.");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* MAPA COM MARCADOR DA MISSÃO ATUAL */}
      <MapView 
        style={styles.map} 
        showsUserLocation={true}
        showsMyLocationButton={true}
        region={location}
      >
        {currentMission && (
          <Marker 
            coordinate={{ latitude: currentMission.latitude, longitude: currentMission.longitude }}
            title="Vítima Prioritária"
            description={currentMission.userName || currentMission.userEmail}
            pinColor="red"
          />
        )}
      </MapView>

      <View style={styles.contentSection}>
        
        {/* BOTÕES DE ESTADO SUPERIORES */}
        <View style={styles.headerButtons}>
          <View style={styles.greenButton}>
            <Text style={styles.whiteIconText}>⚠️</Text>
            <Text style={styles.whiteText}>Alerta de Ativos</Text>
            <Text style={styles.countText}>{activeRequests.length} Pendentes</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.grayButton, { backgroundColor: currentMission ? '#546E7A' : '#90A4AE' }]}
            onPress={handleCompleteMission}
            disabled={!currentMission}
          >
            <Text style={styles.whiteIconText}>📋</Text>
            <Text style={styles.whiteText}>Missão Atual:</Text>
            <Text style={styles.countText} numberOfLines={1}>
              {currentMission ? 'Marcar Concluído' : 'Sem Missões'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          
          {/* CARTÃO DE RESGATE PRIORITÁRIO (DINÂMICO) */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Resgate Prioritário:</Text>
            {currentMission ? (
              <>
                <Text style={styles.listItem}>📍 Distância: {currentMission.distance.toFixed(1)} km</Text>
                <Text style={styles.listItem}>👤 Nome: {currentMission.userName || "Não informado"}</Text>
                
                {currentMission.detalhes && (
                  <>
                    <Text style={styles.listItem}>🎂 Idade: {currentMission.detalhes.idade}</Text>
                    <Text style={[styles.priorityText, { color: '#D32F2F', fontWeight: 'bold', marginTop: 5 }]}>
                      🔴 PRIORIDADE: 
                      {currentMission.detalhes.criancas ? " CRIANÇAS PRESENTES" : 
                       currentMission.detalhes.gravida ? " GRÁVIDA" : 
                       parseInt(currentMission.detalhes.idade) > 65 ? " IDOSO" : " NORMAL"}
                    </Text>
                  </>
                )}
              </>
            ) : (
              <Text style={styles.listItem}>Nenhum pedido de auxílio num raio de 50km.</Text>
            )}
          </View>

          {/* ATUALIZAÇÃO TÁTICA (ESTÁTICO) */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{Strings.rescuer.tacticalUpdateTitle}</Text>
            <Text style={styles.listItem}>{Strings.rescuer.tacticalUpdate1}</Text>
            <Text style={styles.listItem}>{Strings.rescuer.tacticalUpdate2}</Text>
          </View>

          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.logoutButtonText}>{Strings.logout}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}