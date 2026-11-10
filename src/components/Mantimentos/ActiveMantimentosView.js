import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../styles/VictimDashboardStyles';
import MantimentosChat from './MantimentosChat';

export default function ActiveMantimentosView({
  activePedidoId,
  currentUserId,
  handleCancelPedido,
  onMinimize,
}) {
  return (
    <View style={{ width: '100%' }}>
      {/* Botão de Minimizar */}
      <View style={localStyles.header}>
        <TouchableOpacity onPress={onMinimize} style={localStyles.minimizeBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-down" size={22} color="#4B5563" />
          <Text style={localStyles.minimizeText}>Minimizar para o Mapa</Text>
        </TouchableOpacity>
      </View>

      {/* Caixa do Chat de Mantimentos */}
      <View style={[styles.statusCard, styles.chatContainer, { marginTop: 4 }]}>
        <MantimentosChat
          mantimentoId={activePedidoId}
          currentUserId={currentUserId}
          currentUserRole="vitima"
        />
      </View>

      {/* Botão de Cancelar Pedido */}
      <TouchableOpacity
        style={[
          styles.btnDeactivateSOS,
          {
            backgroundColor: '#EFF6FF',
            borderColor: '#BFDBFE',
            borderWidth: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
        onPress={handleCancelPedido}
        activeOpacity={0.7}
      >
        <Ionicons name="close-circle-outline" size={20} color="#3B82F6" style={{ marginRight: 8 }} />
        <Text style={[styles.btnDeactivateSOSText, { color: '#3B82F6' }]}>
          Cancelar Pedido de Mantimentos
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
