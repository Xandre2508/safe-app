import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../styles/VictimDashboardStyles';
import MantimentosChat from './MantimentosChat'; // Certifica-te que este componente existe

export default function ActiveMantimentosView({ activeMantimentosId, currentUserId, handleCancelSOS, onMinimize }) {
  return (
    <View style={{ width: '100%' }}>
      
      {/* Botão para Minimizar */}
      <View style={localStyles.header}>
        <TouchableOpacity onPress={onMinimize} style={localStyles.minimizeBtn}>
          <Ionicons name="chevron-down" size={24} color="#4B5563" />
          <Text style={localStyles.minimizeText}>Minimizar Chat</Text>
        </TouchableOpacity>
      </View>

      {/* CHAT CONTAINER - Aqui usamos o teu chat de mantimentos */}
      <View style={[styles.statusCard, styles.chatContainer, { marginTop: 5, borderColor: '#BFDBFE', borderWidth: 1 }]}>
        <MantimentosChat 
          activeId={activeMantimentosId} 
          currentUserId={currentUserId} 
          currentUserRole="vitima"
        />
      </View>
      
      {/* BOTÃO DE CANCELAMENTO (Azul para Mantimentos) */}
      <TouchableOpacity 
        style={[
          styles.btnDeactivateSOS, 
          { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1, flexDirection: 'row', justifyContent: 'center' }
        ]} 
        onPress={handleCancelSOS}
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
  header: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 15, marginBottom: 5 },
  minimizeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  minimizeText: { color: '#4B5563', fontWeight: '600', marginLeft: 4, fontSize: 14 }
});