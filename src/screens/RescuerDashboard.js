// Importa o pacote de localização do Expo para aceder ao GPS do dispositivo
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
// Importa o MapView para renderizar mapas nativos (Google Maps no Android, Apple Maps no iOS)
import MapView from 'react-native-maps';
import { styles } from './styles/RescuerDashboardStyles';

export default function RescuerDashboard({ navigation }) {
  // Estado para armazenar as coordenadas atuais do socorrista
  const [location, setLocation] = useState(null);

  // useEffect: Corre automaticamente uma vez quando o ecrã é carregado
  useEffect(() => {
    // Função assíncrona para pedir permissões e obter a localização
    (async () => {
      // Pede permissão ao utilizador para aceder ao GPS
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão Negada', 'Precisamos da sua localização para o mapa.');
        return; // Pára a execução se não houver permissão
      }

      // Se tiver permissão, obtém as coordenadas exatas
      let currentLocation = await Location.getCurrentPositionAsync({});
      
      // Guarda a localização no estado com um zoom (latitudeDelta e longitudeDelta) pré-definido
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    })();
  }, []); // O array vazio [] garante que isto só corre 1 vez ao iniciar

  return (
    <SafeAreaView style={styles.container}>
      {/* MAPA: Fica na parte superior do ecrã */}
      <MapView 
        style={styles.map} 
        showsUserLocation={true} // Mostra o ponto azul representando o utilizador
        showsMyLocationButton={true} // Mostra o botão para centrar no utilizador
        region={location} // A região inicial baseada no estado que capturámos no useEffect
      />

      {/* ÁREA DE CONTEÚDO: Estatísticas e lista de tarefas do socorrista */}
      <View style={styles.contentSection}>
        
        {/* Cartões superiores informativos (Estatísticas rápidas) */}
        <View style={styles.headerButtons}>
          <View style={styles.greenButton}>
            <Text style={styles.whiteIconText}>⚠️</Text>
            <Text style={styles.whiteText}>Alerta de Ativos</Text>
            <Text style={styles.countText}>12 Pendentes</Text>
          </View>
          <View style={styles.grayButton}>
            <Text style={styles.whiteIconText}>📋</Text>
            <Text style={styles.whiteText}>Missão Atual:</Text>
            <Text style={styles.countText}>Setor Leste</Text>
          </View>
        </View>

        {/* ScrollView permite fazer scroll na lista caso haja muitas ocorrências */}
        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          
          {/* Cartão de uma ocorrência específica */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Resgate Prioritário:</Text>
            <Text style={styles.listItem}>📍 Rua de Santa Catarina, Porto</Text>
            <Text style={styles.listItem}>👤 Maria Santos (82 anos)</Text>
            <Text style={styles.priorityText}>🔴 Prioridade Máxima - Idade e Fumo</Text>
          </View>

          {/* Cartão de informações táticas */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Atualização Tática:</Text>
            <Text style={styles.listItem}>Bombeiros a 5 minutos do local.</Text>
            <Text style={styles.listItem}>Vento forte de Noroeste.</Text>
          </View>

          {/* Botão para terminar sessão (volta ao ecrã de Login) */}
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.logoutButtonText}>Sair / Voltar ao Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}