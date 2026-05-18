import * as Location from 'expo-location';
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView from 'react-native-maps';

import { Strings } from '../constants/Strings';
import { auth, db } from '../firebaseConfig';
import { styles } from '../styles/VictimDashboardStyles';

export default function VictimDashboard({ navigation }) {
  const [location, setLocation] = useState(null);
  const [isSending, setIsSending] = useState(false);
  
  const [userName, setUserName] = useState('');
  const [showDetailsForm, setShowDetailsForm] = useState(false); 

  const [idade, setIdade] = useState('');
  const [estaGravida, setEstaGravida] = useState(false);
  const [temCriancas, setTemCriancas] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(Strings.permissionDeniedTitle, Strings.victim.locationError);
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

    const fetchUserName = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().nome);
          }
        } catch (error) {
          console.log("Erro ao buscar nome:", error);
        }
      }
    };
    fetchUserName();
  }, []);

  const handleConfirmSOS = async () => {
    if (!location) {
      Alert.alert(Strings.wait, Strings.victim.locationWait);
      return;
    }
    
    setIsSending(true);

    try {
      await addDoc(collection(db, 'sos_requests'), {
        userId: auth.currentUser ? auth.currentUser.uid : 'anonimo',
        userEmail: auth.currentUser ? auth.currentUser.email : 'N/A',
        userName: userName || 'Utilizador Desconhecido', 
        latitude: location.latitude,
        longitude: location.longitude,
        status: 'pendente',
        detalhes: {
          idade: idade || 'Não informada',
          gravida: estaGravida,
          criancas: temCriancas,
        },
        timestamp: serverTimestamp()
      });

      Alert.alert(Strings.victim.sosSentTitle, Strings.victim.sosSentMessage);
      
      setShowDetailsForm(false);
      setIdade('');
      setEstaGravida(false);
      setTemCriancas(false);

    } catch (error) {
      Alert.alert(Strings.error, Strings.victim.sosError);
    } finally {
      setIsSending(false);
    }
  };

  const handleApoio = () => {
    Alert.alert(Strings.victim.supportAlertTitle, Strings.victim.supportAlertMessage);
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

      <View style={styles.mapContainer}>
        <MapView style={styles.map} showsUserLocation={true} showsMyLocationButton={true} region={location} />
      </View>

      <ScrollView style={styles.bottomSection} showsVerticalScrollIndicator={false}>
        {!showDetailsForm ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.actionButton, styles.btnSOS]} onPress={() => setShowDetailsForm(true)}>
              <Text style={styles.btnText}>{Strings.victim.btnSOS}</Text>
              <Text style={styles.btnSubText}>{Strings.victim.btnSOSSub}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.btnApoio]} onPress={handleApoio}>
              <Text style={styles.btnText}>{Strings.victim.btnSupport}</Text>
              <Text style={styles.btnSubText}>{Strings.victim.btnSupportSub}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, marginBottom: 20 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Detalhes para o Resgate (Opcional):</Text>
            
            <TextInput
              style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 15, padding: 8, borderRadius: 5 }}
              placeholder="A sua Idade (ex: 35)"
              keyboardType="numeric"
              value={idade}
              onChangeText={setIdade}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text>Está grávida?</Text>
              <Switch value={estaGravida} onValueChange={setEstaGravida} />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text>Tem crianças consigo?</Text>
              <Switch value={temCriancas} onValueChange={setTemCriancas} />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity style={{ backgroundColor: '#ccc', padding: 15, borderRadius: 10, flex: 0.4, alignItems: 'center' }} onPress={() => setShowDetailsForm(false)}>
                <Text style={{ color: '#333', fontWeight: 'bold' }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btnSOS, { padding: 15, borderRadius: 10, flex: 0.55, alignItems: 'center' }]} onPress={handleConfirmSOS} disabled={isSending}>
                {isSending ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>CONFIRMAR SOS</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>{Strings.victim.emergencyStateTitle}</Text>
          <Text style={styles.alertText}>{Strings.victim.criticalAlert}</Text>
          <Text style={styles.infoText}>{Strings.victim.fireInfo}</Text>
          <Text style={styles.infoText}>{Strings.victim.followInstructions}</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.logoutButtonText}>{Strings.logout}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}