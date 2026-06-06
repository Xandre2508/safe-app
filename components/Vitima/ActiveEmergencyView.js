import { Ionicons } from '@expo/vector-icons'; // Importamos os ícones para melhorar a usabilidade
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../styles/VictimDashboardStyles';
import EmergencyChat from './EmergencyChat';

export default function ActiveEmergencyView({ activeSosId, currentUserId, handleCancelSOS, onMinimize }) {
  return (
    <View style={{ width: '100%' }}>
      
      {/* NOVO: Botão para Minimizar / Voltar ao Mapa */}
      <View style={localStyles.header}>
        <TouchableOpacity onPress={onMinimize} style={localStyles.minimizeBtn}>
          <Ionicons name="chevron-down" size={24} color="#4B5563" />
          <Text style={localStyles.minimizeText}>Minimizar Chat</Text>
        </TouchableOpacity>
      </View>

      {/* CHAT CONTAINER ORIGINAL */}
      <View style={[styles.statusCard, styles.chatContainer, { marginTop: 5 }]}>
        <EmergencyChat 
          sosId={activeSosId} 
          currentUserId={currentUserId} 
          currentUserRole="vitima"
        />
      </View>
      
      {/* BOTÃO ATUALIZADO: Solicitar Cancelamento */}
      {/* Usamos um estilo "inline" para sobrepor o vermelho forte por um vermelho claro, mais apropriado para uma solicitação */}
      <TouchableOpacity 
        style={[
          styles.btnDeactivateSOS, 
          { backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderWidth: 1, flexDirection: 'row', justifyContent: 'center' }
        ]} 
        onPress={handleCancelSOS}
      >
        <Ionicons name="close-circle-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
        <Text style={[styles.btnDeactivateSOSText, { color: '#EF4444' }]}>
          Solicitar Cancelamento
        </Text>
      </TouchableOpacity>

    </View>
  );
}

// Estilos locais apenas para o botão de minimizar
const localStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Alinha o botão à direita para não atrapalhar
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  minimizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  minimizeText: {
    color: '#4B5563',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  }
});