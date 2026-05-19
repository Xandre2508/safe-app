import * as Location from 'expo-location';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { db } from '../../src/firebaseConfig';

import { Strings } from '../constants/Strings';
import { styles } from '../styles/RescuerDashboardStyles';

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
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

  useEffect(() => {
    if (!location) return;

    const q = query(collection(db, 'sos_requests'), where('status', '==', 'pendente'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let requests = [];

      snapshot.forEach((document) => {
        const data = document.data();
        const distance = getDistanceKm(location.latitude, location.longitude, data.latitude, data.longitude);

        if (distance <= 50) {
          requests.push({ id: document.id, distance, ...data });
        }
      });

      const getPriorityWeight = (detalhes) => {
        if (!detalhes) return 4;
        if (detalhes.criancas) return 1; 
        if (detalhes.gravida) return 2;  
        const idade = parseInt(detalhes.idade);
        if (idade > 65) return 3;       
        return 4; 
      };

      requests.sort((a, b) => {
        const weightA = getPriorityWeight(a.detalhes);
        const weightB = getPriorityWeight(b.detalhes);
        
        if (weightA !== weightB) return weightA - weightB;
        return a.distance - b.distance; 
      });

      setActiveRequests(requests);
      setCurrentMission(requests.length > 0 ? requests[0] : null);
    });

    return () => unsubscribe();
  }, [location]);

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
      
      {/* BOTÃO DE PERFIL FLUTUANTE */}
      <TouchableOpacity 
        style={{
          position: 'absolute',
          top: 45, // Ajustado ligeiramente para baixo para SafeArea no iPhone
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

      <MapView style={styles.map} showsUserLocation={true} showsMyLocationButton={true} region={location}>
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

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{Strings.rescuer.tacticalUpdateTitle}</Text>
            <Text style={styles.listItem}>{Strings.rescuer.tacticalUpdate1}</Text>
            <Text style={styles.listItem}>{Strings.rescuer.tacticalUpdate2}</Text>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.logoutButtonText}>{Strings.logout}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}