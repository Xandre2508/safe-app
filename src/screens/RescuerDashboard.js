// Importa biblioteca para obter a localização GPS do dispositivo
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
// MapView para desenhar os mapas na UI
import MapView from 'react-native-maps';

// Importação de textos (Clean Code) e Estilos
import { Strings } from '../constants/Strings';
import { styles } from '../styles/RescuerDashboardStyles';

export default function RescuerDashboard({ navigation }) {
  // Estado para armazenar as coordenadas de GPS do socorrista
  const [location, setLocation] = useState(null);

  // useEffect: Executa este código automaticamente quando o ecrã é aberto
  useEffect(() => {
    (async () => {
      // Pede permissão ao utilizador para aceder ao GPS
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      // Se a permissão for negada, mostra um erro e para a execução
      if (status !== 'granted') {
        Alert.alert(Strings.permissionDeniedTitle, Strings.rescuer.locationError);
        return; 
      }

      // Obtém a localização atual com alta precisão
      let currentLocation = await Location.getCurrentPositionAsync({});
      
      // Guarda a localização no estado com um zoom predefinido (latitudeDelta/longitudeDelta)
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    })();
  }, []); // Array vazio garante que isto só corre 1 vez

  return (
    <SafeAreaView style={styles.container}>
      
      {/* ÁREA DO MAPA */}
      <MapView 
        style={styles.map} 
        showsUserLocation={true} // Mostra o ponto azul representando o socorrista
        showsMyLocationButton={true} // Botão para recentrar o mapa
        region={location} // A região que o mapa deve focar
      />

      {/* ÁREA DE INFORMAÇÕES E LISTAGENS */}
      <View style={styles.contentSection}>
        
        {/* Painel superior com botões de estatísticas rápidas */}
        <View style={styles.headerButtons}>
          {/* Botão de Alertas Ativos */}
          <View style={styles.greenButton}>
            <Text style={styles.whiteIconText}>⚠️</Text>
            <Text style={styles.whiteText}>{Strings.rescuer.activeAlertsTitle}</Text>
            <Text style={styles.countText}>{Strings.rescuer.activeAlertsCount}</Text>
          </View>
          {/* Botão de Missão Atual */}
          <View style={styles.grayButton}>
            <Text style={styles.whiteIconText}>📋</Text>
            <Text style={styles.whiteText}>{Strings.rescuer.currentMissionTitle}</Text>
            <Text style={styles.countText}>{Strings.rescuer.currentMissionLocation}</Text>
          </View>
        </View>

        {/* Lista de tarefas/ocorrências (ScrollView permite rolar se a lista for grande) */}
        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          
          {/* Cartão de Resgate Pendente */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{Strings.rescuer.priorityRescueTitle}</Text>
            <Text style={styles.listItem}>{Strings.rescuer.priorityRescueLocation}</Text>
            <Text style={styles.listItem}>{Strings.rescuer.priorityRescuePerson}</Text>
            <Text style={styles.priorityText}>{Strings.rescuer.priorityRescueReason}</Text>
          </View>

          {/* Cartão de Atualizações / Informações de campo */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{Strings.rescuer.tacticalUpdateTitle}</Text>
            <Text style={styles.listItem}>{Strings.rescuer.tacticalUpdate1}</Text>
            <Text style={styles.listItem}>{Strings.rescuer.tacticalUpdate2}</Text>
          </View>

          {/* Botão para terminar sessão */}
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