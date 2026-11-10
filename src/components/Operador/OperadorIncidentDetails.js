import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { db } from '../../firebaseConfig';
import EmergencyChat from '../Vitima/EmergencyChat';
import MantimentosChat from '../Mantimentos/MantimentosChat';

export default function IncidentDetails({ incident, onBack, currentUserId }) {
  if (!incident) return null;

  const isCritical = incident.detalhes?.criancas || incident.detalhes?.gravida;
  const isMantimento = incident.tipoAlerta === 'MANTIMENTO';
  const collectionName = isMantimento ? 'pedidos_mantimentos' : 'sos_requests';

  const handleApproveCancel = async () => {
    Alert.alert(
      'Encerrar Ocorrência',
      'Confirma que esta ocorrência deve ser dada como concluída e arquivada?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, Encerrar',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateDoc(doc(db, collectionName, incident.id), {
                status: 'concluido',
                cancelRequested: false,
                closedAt: new Date().toISOString(),
                closedBy: currentUserId,
              });

              await addDoc(collection(db, collectionName, incident.id, 'messages'), {
                senderId: currentUserId,
                senderRole: 'operador',
                text: '✅ Ocorrência validada e encerrada pela Central de Operações.',
                timestamp: serverTimestamp(),
              });

              if (onBack) onBack();
            } catch (error) {
              console.warn('[IncidentDetails] Erro ao encerrar ocorrência:', error);
              Alert.alert('Erro', 'Não foi possível encerrar a ocorrência.');
            }
          },
        },
      ]
    );
  };

  const handleRejectCancel = async () => {
    Alert.alert(
      'Recusar Cancelamento',
      'Manter a ocorrência em acompanhamento ativo na Central de Operações?',
      [
        { text: 'Voltar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await updateDoc(doc(db, collectionName, incident.id), {
                cancelRequested: false,
              });

              await addDoc(collection(db, collectionName, incident.id, 'messages'), {
                senderId: currentUserId,
                senderRole: 'operador',
                text: '⚠️ Pedido de cancelamento avaliado pelo operador. A ocorrência mantém-se ATIVA por motivos de segurança.',
                timestamp: serverTimestamp(),
              });
            } catch (error) {
              console.warn('[IncidentDetails] Erro ao recusar cancelamento:', error);
              Alert.alert('Erro', 'Não foi possível processar a resposta.');
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      style={{ flex: 1, backgroundColor: '#F8FAFC' }}
    >
      {/* Barra Superior */}
      <View style={localStyles.topBar}>
        <TouchableOpacity onPress={onBack} style={localStyles.backButton} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={26} color="#3B82F6" />
          <Text style={localStyles.backButtonText}>Voltar</Text>
        </TouchableOpacity>

        <Text style={[localStyles.barTitle, { color: isMantimento ? '#3B82F6' : '#1E293B' }]} numberOfLines={1}>
          {incident.userName || 'Ocorrência'}
        </Text>
      </View>

      {/* Conteúdo e Triagem */}
      <View style={{ flex: 1 }}>
        <View style={{ padding: 14, paddingBottom: 6 }}>
          <View style={localStyles.infoCard}>
            <Text style={localStyles.cardHeaderLabel}>
              DADOS DE {isMantimento ? 'MANTIMENTOS' : 'TRIAGEM DE EMERGÊNCIA'}
            </Text>

            <View style={localStyles.dataRow}>
              <Text style={{ fontSize: 15, marginRight: 8 }}>📍</Text>
              <Text style={localStyles.dataText}>
                <Text style={{ fontWeight: 'bold' }}>Coordenadas:</Text>{' '}
                {incident.latitude ? incident.latitude.toFixed(5) : 'N/A'},{' '}
                {incident.longitude ? incident.longitude.toFixed(5) : 'N/A'}
              </Text>
            </View>

            {isMantimento ? (
              <>
                <View style={localStyles.dataRow}>
                  <Text style={{ fontSize: 15, marginRight: 8 }}>📦</Text>
                  <Text style={localStyles.dataText}>
                    <Text style={{ fontWeight: 'bold' }}>Necessidades:</Text> {incident.detalhes?.descricao}
                  </Text>
                </View>
                <View style={localStyles.dataRow}>
                  <Text style={{ fontSize: 15, marginRight: 8 }}>🔢</Text>
                  <Text style={localStyles.dataText}>
                    <Text style={{ fontWeight: 'bold' }}>Quantidade / Estimativa:</Text> {incident.detalhes?.quantidade}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={localStyles.dataRow}>
                  <Text style={{ fontSize: 15, marginRight: 8 }}>🎂</Text>
                  <Text style={localStyles.dataText}>
                    <Text style={{ fontWeight: 'bold' }}>Idade Informada:</Text>{' '}
                    {incident.detalhes?.idade || 'Não informada'}
                  </Text>
                </View>

                <View style={[localStyles.dataRow, { marginTop: 4 }]}>
                  <Text style={{ fontSize: 15, marginRight: 8 }}>🚨</Text>
                  <Text
                    style={[
                      localStyles.dataText,
                      { color: isCritical ? '#E63946' : '#10B981', fontWeight: '600' },
                    ]}
                  >
                    <Text style={{ color: '#334155', fontWeight: 'bold' }}>Prioridade:{' '}</Text>
                    {incident.detalhes?.criancas
                      ? 'CRÍTICA (Crianças no local)'
                      : incident.detalhes?.gravida
                      ? 'CRÍTICA (Grávida no local)'
                      : 'PADRÃO OPERACIONAL'}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Alerta de Cancelamento Solicitado */}
        {incident.cancelRequested && (
          <View style={localStyles.cancelAlertBox}>
            <Text style={localStyles.cancelAlertText}>
              ⚠️ O Cidadão solicitou o cancelamento desta ocorrência.
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <TouchableOpacity
                style={localStyles.btnRejectCancel}
                onPress={handleRejectCancel}
                activeOpacity={0.8}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Manter Ativo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={localStyles.btnApproveCancel}
                onPress={handleApproveCancel}
                activeOpacity={0.8}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Encerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Módulo de Mensagens em Tempo Real */}
        <View style={{ flex: 1, paddingHorizontal: 12, paddingTop: 4 }}>
          {incident.status === 'pendente' ? (
            isMantimento ? (
              <MantimentosChat
                mantimentoId={incident.id}
                currentUserRole="operador"
                currentUserId={currentUserId}
              />
            ) : (
              <EmergencyChat
                sosId={incident.id}
                currentUserRole="operador"
                currentUserId={currentUserId}
              />
            )
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
              <Text style={{ fontSize: 44, marginBottom: 12 }}>✅</Text>
              <Text style={{ color: '#10B981', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>
                Ocorrência encerrada. O registo foi concluído.
              </Text>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const localStyles = StyleSheet.create({
  topBar: {
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    position: 'relative',
    elevation: 2,
  },
  backButton: {
    position: 'absolute',
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
    marginLeft: 2,
  },
  barTitle: {
    fontSize: 17,
    fontWeight: '700',
    maxWidth: '55%',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeaderLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94A3B8',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dataText: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
  },
  cancelAlertBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 14,
    marginTop: 8,
    marginBottom: 6,
  },
  cancelAlertText: {
    color: '#B91C1C',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  btnRejectCancel: {
    flex: 1,
    backgroundColor: '#64748B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnApproveCancel: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});
