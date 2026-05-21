import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { db } from '../../src/firebaseConfig';

import { Strings } from '../constants/Strings';
import { styles } from '../styles/RescuerDashboardStyles';

// --- FUNÇÃO UTILITÁRIA: Cálculo de Distância (Fórmula de Haversine) ---
// Esta função matemática calcula a distância em linha reta (em quilómetros) 
// entre dois pontos na Terra, usando as suas latitudes e longitudes.
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Raio médio da Terra em quilómetros
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Retorna a distância final em km
};

export default function RescuerDashboard({ navigation }) {
  // --- 1. ESTADOS DA APLICAÇÃO ---
  const [location, setLocation] = useState(null); // Coordenadas do socorrista (Falta preencher isto com o GPS!)
  const [activeRequests, setActiveRequests] = useState([]); // Lista de todas as emergências no raio de 50km
  const [currentMission, setCurrentMission] = useState(null); // A ocorrência nº1 (mais prioritária/próxima)

  // --- 2. MOTOR DE BUSCA E TRIAGEM (LIFECYCLE) ---
  useEffect(() => {
    // Se ainda não tivermos a localização do socorrista, aborta a pesquisa para não dar erro
    if (!location) return;

    // Cria a query para ir buscar à Firestore APENAS os pedidos que ainda estão pendentes
    const q = query(collection(db, 'sos_requests'), where('status', '==', 'pendente'));

    // onSnapshot: Fica à escuta em tempo real de novas ocorrências
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let requests = [];

      // 1º Passo: Filtragem por Distância
      snapshot.forEach((document) => {
        const data = document.data();
        // Calcula a distância entre o socorrista e o pedido de SOS
        const distance = getDistanceKm(location.latitude, location.longitude, data.latitude, data.longitude);

        // Apenas adiciona à lista se estiver num raio máximo de 50 km
        if (distance <= 50) {
          requests.push({ id: document.id, distance, ...data });
        }
      });

      // --- ALGORITMO DE TRIAGEM ---
      // Atribui um "peso" de gravidade. Quanto menor o número, maior a urgência.
      const getPriorityWeight = (detalhes) => {
        if (!detalhes) return 4; // Sem detalhes = Prioridade Normal (Baixa)
        if (detalhes.criancas) return 1; // Prioridade Máxima: Crianças envolvidas
        if (detalhes.gravida) return 2;  // Prioridade Alta: Grávidas
        const idade = parseInt(detalhes.idade);
        if (idade > 65) return 3;       // Prioridade Média: Idosos
        return 4;                       // Prioridade Normal: Adultos saudáveis
      };

      // 2º Passo: Ordenação da Lista de Resgate
      requests.sort((a, b) => {
        const weightA = getPriorityWeight(a.detalhes);
        const weightB = getPriorityWeight(b.detalhes);
        
        // Regra 1: Ordena primeiro pela gravidade da situação (peso menor vem primeiro)
        if (weightA !== weightB) return weightA - weightB;
        // Regra 2: Em caso de empate na gravidade, ordena pelo mais perto fisicamente
        return a.distance - b.distance; 
      });

      // Atualiza os estados: Guarda a lista toda e destaca automaticamente o 1º da lista como missão atual
      setActiveRequests(requests);
      setCurrentMission(requests.length > 0 ? requests[0] : null);
    });

    // Limpa a escuta à base de dados quando o socorrista sai do ecrã
    return () => unsubscribe();
  }, [location]); // Este efeito corre sempre que a localização do socorrista muda

  // --- 3. FUNÇÕES DE AÇÃO ---
  // Função para fechar uma ocorrência quando o socorrista termina o resgate
  const handleCompleteMission = async () => {
    if (!currentMission) return;

    // Pede confirmação para evitar toques acidentais
    Alert.alert(
      "Concluir Resgate",
      "Confirmar que a vítima foi assistida e a missão está terminada?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim, Concluído", 
          onPress: async () => {
            try {
              // Atualiza o estado da ocorrência específica na Firebase para 'concluido'
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

  // --- 4. RENDERIZAÇÃO DA INTERFACE (UI) ---
  return (
    <SafeAreaView style={styles.container}>
      
      {/* BOTÃO DE PERFIL FLUTUANTE */}
      <TouchableOpacity 
        style={{
          position: 'absolute',
          top: 45, 
          left: 15,
          zIndex: 999, // Mantém o botão sempre por cima do mapa e de outros elementos
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

      {/* MAPA INTERATIVO */}
      {/* O mapa tenta centrar-se na 'location' do socorrista */}
      <MapView style={styles.map} showsUserLocation={true} showsMyLocationButton={true} region={location}>
        {/* Renderiza o marcador vermelho APENAS para a missão mais prioritária */}
        {currentMission && (
          <Marker 
            coordinate={{ latitude: currentMission.latitude, longitude: currentMission.longitude }}
            title="Vítima Prioritária"
            description={currentMission.userName || currentMission.userEmail}
            pinColor="red"
          />
        )}
      </MapView>

      {/* PAINEL DE INFORMAÇÕES TÁTICAS (Metade inferior do ecrã) */}
      <View style={styles.contentSection}>
        
        {/* Botões de Cabeçalho (Estatísticas rápidas) */}
        <View style={styles.headerButtons}>
          <View style={styles.greenButton}>
            <Text style={styles.whiteIconText}>⚠️</Text>
            <Text style={styles.whiteText}>Alerta de Ativos</Text>
            <Text style={styles.countText}>{activeRequests.length} Pendentes</Text>
          </View>
          
          {/* Botão de Conclusão da Missão (Muda de cor consoante exista missão ou não) */}
          <TouchableOpacity 
            style={[styles.grayButton, { backgroundColor: currentMission ? '#546E7A' : '#90A4AE' }]}
            onPress={handleCompleteMission}
            disabled={!currentMission} // Bloqueia o botão se não houver missões
          >
            <Text style={styles.whiteIconText}>📋</Text>
            <Text style={styles.whiteText}>Missão Atual:</Text>
            <Text style={styles.countText} numberOfLines={1}>
              {currentMission ? 'Marcar Concluído' : 'Sem Missões'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Detalhes com Scroll */}
        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          
          {/* Cartão da Missão Prioritária Atual */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Resgate Prioritário:</Text>
            {currentMission ? (
              <>
                <Text style={styles.listItem}>📍 Distância: {currentMission.distance.toFixed(1)} km</Text>
                <Text style={styles.listItem}>👤 Nome: {currentMission.userName || "Não informado"}</Text>
                {/* Lógica de renderização condicional para os avisos vermelhos de prioridade */}
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

          {/* Cartão de Atualizações Táticas (Strings Estáticas via constantes) */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{Strings.rescuer.tacticalUpdateTitle}</Text>
            <Text style={styles.listItem}>{Strings.rescuer.tacticalUpdate1}</Text>
            <Text style={styles.listItem}>{Strings.rescuer.tacticalUpdate2}</Text>
          </View>

          {/* Botão de Terminar Sessão */}
          <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.logoutButtonText}>{Strings.logout}</Text>
          </TouchableOpacity>
          
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}