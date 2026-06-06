// src/components/OperadorIncidentList.js
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../styles/OperatorDashboardStyles';

export default function IncidentList({ ocorrencias, pendingCount, onSelectIncident }) {
  return (
    <>
      {/* Banner de Notificação de Alerta Crítico */}
      {pendingCount > 0 && (
        <View style={styles.notificationBanner}>
          <Text style={{ marginRight: 8, fontSize: 16 }}>🔔</Text>
          <Text style={styles.notificationText}>
            Atenção: Existem {pendingCount} pedido(s) a aguardar apoio tático!
          </Text>
        </View>
      )}
      
      {/* Cartões Informativos de Resumo Estatístico */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.statCardActive]}>
           <Text style={styles.statTitle}>SOS Ativos</Text>
           <Text style={styles.statNumberActive}>{pendingCount}</Text>
        </View>
        
        <View style={[styles.statCard, styles.statCardDone]}>
           <Text style={styles.statTitle}>Concluídos</Text>
           <Text style={styles.statNumberDone}>
             {ocorrencias.filter(r => r.status === 'concluido').length}
           </Text>
        </View>
      </View>

      {/* Listagem de Ocorrências em tempo real */}
      <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
        {ocorrencias.map((req) => {
          if(req.status === 'cancelado') return null; 

          const isPendente = req.status === 'pendente';
          return (
            <TouchableOpacity 
              key={req.id} 
              style={[styles.incidentCard, isPendente ? styles.incidentCardActive : styles.incidentCardDone]}
              onPress={() => onSelectIncident(req.id)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.victimName} numberOfLines={1}>
                  {req.userName && req.userName.trim() !== '' ? req.userName : 'Vítima Desconhecida'}
                </Text>
                
                <View style={styles.badgesRow}>
                  {isPendente && (
                    <View style={styles.chatBadge}>
                      <Text style={styles.chatBadgeIcon}>💬</Text>
                      <Text style={styles.chatBadgeText}>Chat Aberto</Text>
                    </View>
                  )}
                  <View style={[styles.badge, isPendente ? styles.badgeActive : styles.badgeDone]}>
                    <Text style={isPendente ? styles.badgeTextActive : styles.badgeTextDone}>
                      {isPendente ? 'PENDENTE' : 'CONCLUÍDO'}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.coordsContainer}>
                <Text style={{ marginRight: 4 }}>📍</Text>
                <Text style={styles.coordsText}>
                  Lat: {req.latitude?.toFixed(4)} | Lon: {req.longitude?.toFixed(4)}
                </Text>
              </View>

              {req.detalhes && isPendente && (
                <Text style={styles.warningText}>
                  ⚠️ {req.detalhes.criancas ? "Crianças Presentes" : req.detalhes.gravida ? "Grávida na ocorrência" : `Idade: ${req.detalhes.idade}`}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </>
  );
}