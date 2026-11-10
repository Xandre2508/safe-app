import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../styles/VictimDashboardStyles';
import EmergencyChat from './EmergencyChat';

export default function ActiveEmergencyView({ activeSosId, currentUserId, handleCancelSOS, onMinimize }) {
  return (
    <View style={{ width: '100%' }}>
      {/* Botão para Minimizar / Voltar ao Mapa */}
      <View style={localStyles.header}>
        <TouchableOpacity onPress={onMinimize} style={localStyles.minimizeBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-down" size={22} color="#4B5563" />
          <Text style={localStyles.minimizeText}>Minimizar para o Mapa</Text>
        </TouchableOpacity>
      </View>

      {/* Caixa do Chat Tático */}
      <View style={[styles.statusCard, styles.chatContainer, { marginTop: 4 }]}>
        <EmergencyChat
          sosId={activeSosId}
          currentUserId={currentUserId}
          currentUserRole="vitima"
        />
      </View>

      {/* Botão de Solicitação de Cancelamento */}
      <TouchableOpacity
        style={[
          styles.btnDeactivateSOS,
          {
            backgroundColor: '#FEF2F2',
            borderColor: '#FECACA',
            borderWidth: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
        onPress={handleCancelSOS}
        activeOpacity={0.7}
      >
        <Ionicons name="close-circle-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
        <Text style={[styles.btnDeactivateSOSText, { color: '#EF4444' }]}>
          Solicitar Cancelamento ao Operador
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const localStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    marginBottom: 6,
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
    marginLeft: 6,
    fontSize: 13,
  },
});
