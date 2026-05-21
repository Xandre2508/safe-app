// src/components/OperadorIncidentDetails.js
// Componente para exibir os detalhes de uma ocorrência selecionada pelo operador, incluindo o chat de emergência
// ESTA MERDA É USADA NO OPERATOR DASHBOARD OBG

import { KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../styles/OperatorDashboardStyles';
import EmergencyChat from '../Vitima/EmergencyChat'; // Ajusta o caminho se necessário

export default function IncidentDetails({ incident, onBack, currentUserId }) {
  // Garantia de segurança: se o incident for null por algum motivo, não rebenta a app
  if (!incident) return null; 

  const isCritical = incident.detalhes?.criancas || incident.detalhes?.gravida;

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