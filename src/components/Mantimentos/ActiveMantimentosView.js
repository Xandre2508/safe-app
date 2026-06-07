import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Se tiveres um ficheiro de estilos próprio para os mantimentos, podes alterar aqui.
// Caso contrário, podes manter o do VictimDashboard se as caixas do chat forem iguais.
import { styles } from '../../styles/VictimDashboardStyles';
// 🔄 ALTERADO: Vamos importar um chat próprio para os mantimentos
import MantimentosChat from './MantimentosChat';

// 🔄 ALTERADO: Nome do componente e props
export default function ActiveMantimentosView({ activePedidoId, currentUserId, handleCancelPedido, onMinimize }) {
  return (
    <View style={{ width: '100%' }}>
      
      {/* Botão para Minimizar / Voltar ao Mapa */}
      <View style={localStyles.header}>
        <TouchableOpacity onPress={onMinimize} style={localStyles.minimizeBtn}>
          <Ionicons name="chevron-down" size={24} color="#4B5563" />
          <Text style={localStyles.minimizeText}>Minimizar Chat</Text>
        </TouchableOpacity>
      </View>

      {/* CHAT CONTAINER */}
      <View style={[styles.statusCard, styles.chatContainer, { marginTop: 5 }]}>
        {/* 🔄 ALTERADO: Usar o componente MantimentosChat com o ID do pedido */}
        <MantimentosChat 
          mantimentoId={activePedidoId} 
          currentUserId={currentUserId} 
          currentUserRole="vitima"
        />
      </View>
      
      {/* BOTÃO ATUALIZADO: Solicitar Cancelamento */}
      <TouchableOpacity 
        style={[
          styles.btnDeactivateSOS, 
          { backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderWidth: 1, flexDirection: 'row', justifyContent: 'center' }
        ]} 
        // 🔄 ALTERADO: Função de cancelar o pedido
        onPress={handleCancelPedido}
      >
        <Ionicons name="close-circle-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
        <Text style={[styles.btnDeactivateSOSText, { color: '#EF4444' }]}>
          Cancelar Pedido
        </Text>
      </TouchableOpacity>

    </View>
  );
}

// Estilos locais para o botão de minimizar
const localStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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