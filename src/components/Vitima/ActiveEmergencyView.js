// ESTA MERDA É USADA NO VICTIM DASHBOARD OBG

import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../styles/VictimDashboardStyles';
import EmergencyChat from './EmergencyChat';

export default function ActiveEmergencyView({ activeSosId, currentUserId, handleCancelSOS }) {
  return (
    <>
      <View style={[styles.statusCard, styles.chatContainer]}>
        <EmergencyChat 
          sosId={activeSosId} 
          currentUserRole="vitima" 
          currentUserId={currentUserId} 
        />
      </View>
      
      <TouchableOpacity style={styles.btnDeactivateSOS} onPress={handleCancelSOS}>
        <Text style={styles.btnDeactivateSOSText}>Desativar / Cancelar SOS</Text>
      </TouchableOpacity>
    </>
  );
}