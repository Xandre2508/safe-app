// src/components/OperadorIncidentDetails.js
// Componente para exibir os detalhes de uma ocorrência selecionada pelo operador, incluindo o chat de emergência

import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Alert, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../firebaseConfig'; // Garante que o caminho para o firebaseConfig está correto
import { styles } from '../../styles/OperatorDashboardStyles';
import EmergencyChat from '../Vitima/EmergencyChat';

export default function IncidentDetails({ incident, onBack, currentUserId }) {
  // Garantia de segurança: se o incident for null por algum motivo, não rebenta a app
  if (!incident) return null; 

  const isCritical = incident.detalhes?.criancas || incident.detalhes?.gravida;

  // --- FUNÇÕES DE GESTÃO DO PEDIDO DE CANCELAMENTO ---
  const handleApproveCancel = async () => {
    Alert.alert(
      "Confirmar Cancelamento",
      "Tem a certeza que deseja encerrar esta ocorrência?",
      [
        { text: "Não", style: "cancel" },
        { text: "Sim, Encerrar", onPress: async () => {
            try {
              // 1. Muda o status para concluído e retira a flag
              await updateDoc(doc(db, 'sos_requests', incident.id), {
                status: 'concluido', 
                cancelRequested: false
              });
              
              // 2. Envia mensagem para o chat a avisar a vítima
              await addDoc(collection(db, 'sos_requests', incident.id, 'messages'), {
                senderId: currentUserId,
                senderRole: 'operador',
                text: '✅ O operador confirmou o seu pedido. A ocorrência foi encerrada com sucesso.',
                timestamp: serverTimestamp()
              });

              // 3. Volta para a lista de ocorrências
              if(onBack) onBack(); 

            } catch (error) {
              Alert.alert("Erro", "Não foi possível cancelar o SOS.");
            }
          }
        }
      ]
    );
  };

  const handleRejectCancel = async () => {
    Alert.alert(
      "Recusar Cancelamento",
      "Vai manter o SOS ativo e ignorar o pedido da vítima.",
      [
        { text: "Voltar", style: "cancel" },
        { text: "Confirmar", onPress: async () => {
            try {
              // 1. Remove apenas a flag de pedido de cancelamento, mantendo o status 'pendente'
              await updateDoc(doc(db, 'sos_requests', incident.id), {
                cancelRequested: false
              });
              
              // 2. Avisa a vítima no chat
              await addDoc(collection(db, 'sos_requests', incident.id, 'messages'), {
                senderId: currentUserId,
                senderRole: 'operador',
                text: '⚠️ O seu pedido de cancelamento foi recusado pelo operador por motivos de segurança. O SOS continua ATIVO e o socorro está a caminho.',
                timestamp: serverTimestamp()
              });

            } catch (error) {
              Alert.alert("Erro", "Não foi possível processar a recusa.");
            }
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.detailsMainContainer}
    >
      {/* Cabeçalho da Vista de Gestão */}
      <View style={styles.detailsHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBack}
        >
          <Text style={styles.backButtonText}>⬅ Voltar</Text>
        </TouchableOpacity>
        
        <Text style={styles.detailsName} numberOfLines={1}>
          {incident.userName}
        </Text>
      </View>

      {/* Painel Consolidado de Dados Coletados na Triagem */}
      <View style={styles.triagemContainer}>
        <Text style={styles.triagemTitle}>DADOS DE TRIAGEM COLETADOS:</Text>
        <Text style={styles.triagemText}>
          📍 Coordenadas: {incident.latitude?.toFixed(5)}, {incident.longitude?.toFixed(5)}
        </Text>
        <Text style={styles.triagemText}>
          🎂 Idade Declarada: {incident.detalhes?.idade || 'Não informada'}
        </Text>
        
        <Text style={[
          styles.triagemStatus, 
          isCritical ? styles.triagemStatusCritical : styles.triagemStatusSafe
        ]}>
          🚨 Estado: {incident.detalhes?.criancas ? "CRÍTICO (Crianças Presentes)" : incident.detalhes?.gravida ? "CRÍTICO (Grávida)" : "Atendimento Padrão"}
        </Text>
      </View>

      {/* NOVO: BANNER DE PEDIDO DE CANCELAMENTO */}
      {incident.cancelRequested && (
        <View style={{
          backgroundColor: '#FEF2F2', borderColor: '#EF4444', borderWidth: 2, 
          borderRadius: 10, padding: 15, marginHorizontal: 15, marginBottom: 10
        }}>
          <Text style={{ color: '#B91C1C', fontWeight: 'bold', fontSize: 16, marginBottom: 15, textAlign: 'center' }}>
            🚨 A VÍTIMA SOLICITOU O CANCELAMENTO DESTE SOS!
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {/* Botão de Recusar (Mantém a emergência) */}
            <TouchableOpacity 
              style={{ flex: 1, backgroundColor: '#4B5563', padding: 12, borderRadius: 8, marginRight: 5, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, elevation: 2 }}
              onPress={handleRejectCancel}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Recusar / Manter</Text>
            </TouchableOpacity>

            {/* Botão de Aceitar (Encerra a emergência) */}
            <TouchableOpacity 
              style={{ flex: 1, backgroundColor: '#EF4444', padding: 12, borderRadius: 8, marginLeft: 5, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, elevation: 2 }}
              onPress={handleApproveCancel}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Encerrar SOS</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Contentor do Módulo de Mensagens ou Feedback de Conclusão */}
      <View style={styles.chatWrapper}>
        {incident.status === 'pendente' ? (
          <EmergencyChat 
            sosId={incident.id} 
            currentUserRole="operador" 
            currentUserId={currentUserId} 
          />
        ) : (
          <View style={styles.closedContainer}>
            <Text style={styles.closedIcon}>✅</Text>
            <Text style={styles.closedText}>
              Esta ocorrência encontra-se encerrada. O histórico do chat foi arquivado.
            </Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}