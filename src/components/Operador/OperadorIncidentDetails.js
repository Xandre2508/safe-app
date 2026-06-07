// src/components/Operador/OperadorIncidentDetails.js
import { Ionicons } from '@expo/vector-icons'; 
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Alert, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../firebaseConfig'; 

// IMPORTA OS DOIS CHATS
import EmergencyChat from '../Vitima/EmergencyChat';
import MantimentosChat from '../Mantimentos/MantimentosChat';

export default function IncidentDetails({ incident, onBack, currentUserId }) {
  if (!incident) return null; 

  const isCritical = incident.detalhes?.criancas || incident.detalhes?.gravida;
  const isMantimento = incident.tipoAlerta === 'MANTIMENTO';

  // Coleção onde vamos guardar os dados dependendo do tipo
  const collectionName = isMantimento ? 'pedidos_mantimentos' : 'sos_requests';

  // --- FUNÇÕES DE GESTÃO DO PEDIDO DE CANCELAMENTO ---
  const handleApproveCancel = async () => {
    Alert.alert(
      "Confirmar Cancelamento",
      "Tem a certeza que deseja encerrar esta ocorrência?",
      [
        { text: "Não", style: "cancel" },
        { text: "Sim, Encerrar", onPress: async () => {
            try {
              // Atualiza o estado
              await updateDoc(doc(db, collectionName, incident.id), {
                status: 'concluido', 
                cancelRequested: false
              });
              
              // Envia mensagem final
              await addDoc(collection(db, collectionName, incident.id, 'messages'), {
                senderId: currentUserId,
                senderRole: 'operador',
                text: '✅ O operador confirmou o seu pedido. A ocorrência foi encerrada com sucesso.',
                timestamp: serverTimestamp()
              });

              if(onBack) onBack(); 

            } catch (error) {
              Alert.alert("Erro", "Não foi possível cancelar a ocorrência.");
            }
          }
        }
      ]
    );
  };

  const handleRejectCancel = async () => {
    Alert.alert(
      "Recusar Cancelamento",
      "Vai manter o pedido ativo e ignorar o pedido da vítima.",
      [
        { text: "Voltar", style: "cancel" },
        { text: "Confirmar", onPress: async () => {
            try {
              await updateDoc(doc(db, collectionName, incident.id), {
                cancelRequested: false
              });
              
              await addDoc(collection(db, collectionName, incident.id, 'messages'), {
                senderId: currentUserId,
                senderRole: 'operador',
                text: '⚠️ O seu pedido de cancelamento foi recusado pelo operador por motivos de segurança. A ocorrência continua ATIVA e a central está a acompanhar.',
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} 
      style={{ flex: 1, backgroundColor: '#F4F6F7' }} 
    >
      {/* 1. NAVBAR SUPERIOR (ESTILO NATIVO CENTRADO) */}
      <View style={{ 
        paddingTop: Platform.OS === 'ios' ? 55 : 20, 
        paddingBottom: 15,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', 
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        elevation: 3,
        position: 'relative' 
      }}>
        
        <TouchableOpacity 
          onPress={onBack} 
          style={{ 
            position: 'absolute', 
            left: 10, 
            bottom: 10, 
            flexDirection: 'row', 
            alignItems: 'center', 
            padding: 5,
            zIndex: 20
          }}
        >
          <Ionicons name="chevron-back" size={26} color="#3B82F6" />
          <Text style={{ fontSize: 17, color: '#3B82F6', fontWeight: '500', marginLeft: -2 }}>Voltar</Text>
        </TouchableOpacity>

        <Text 
          style={{ fontSize: 18, fontWeight: '700', color: isMantimento ? '#3B82F6' : '#1F2937', maxWidth: '50%', textAlign: 'center' }} 
          numberOfLines={1}
        >
          {incident.userName}
        </Text>
      </View>

      {/* 2. ÁREA DE CONTEÚDO E CHAT */}
      <View style={{ flex: 1 }}>
        
        {/* Painel Consolidado de Dados de Triagem */}
        <View style={{ padding: 15, paddingBottom: 5 }}>
          <View style={{ 
            backgroundColor: '#FFF', padding: 16, borderRadius: 12, 
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 2,
            borderWidth: 1, borderColor: '#F3F4F6'
          }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#9CA3AF', marginBottom: 10, letterSpacing: 0.5 }}>
              DADOS DE {isMantimento ? 'MANTIMENTOS' : 'TRIAGEM'}
            </Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Text style={{ fontSize: 16, marginRight: 8 }}>📍</Text>
              <Text style={{ fontSize: 15, color: '#374151' }}><Text style={{ fontWeight: 'bold' }}>Coordenadas:</Text> {incident.latitude?.toFixed(5)}, {incident.longitude?.toFixed(5)}</Text>
            </View>
            
            {/* Lógica condicional: Se for mantimento mostra descrição, se for SOS mostra idade */}
            {isMantimento ? (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 16, marginRight: 8 }}>📦</Text>
                  <Text style={{ fontSize: 15, color: '#374151' }}><Text style={{ fontWeight: 'bold' }}>Pedido:</Text> {incident.detalhes?.descricao}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, marginRight: 8 }}>🔢</Text>
                  <Text style={{ fontSize: 15, color: '#374151' }}><Text style={{ fontWeight: 'bold' }}>Qtd:</Text> {incident.detalhes?.quantidade}</Text>
                </View>
              </>
            ) : (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 16, marginRight: 8 }}>🎂</Text>
                  <Text style={{ fontSize: 15, color: '#374151' }}><Text style={{ fontWeight: 'bold' }}>Idade Declarada:</Text> {incident.detalhes?.idade || 'Não informada'}</Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Text style={{ fontSize: 16, marginRight: 8 }}>🚨</Text>
                  <Text style={{ fontSize: 15, color: isCritical ? '#E74C3C' : '#27AE60', fontWeight: '600' }}>
                    <Text style={{ color: '#374151', fontWeight: 'bold' }}>Estado: </Text>
                    {incident.detalhes?.criancas ? "CRÍTICO (Crianças)" : incident.detalhes?.gravida ? "CRÍTICO (Grávida)" : "Atendimento Padrão"}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* BANNER DE PEDIDO DE CANCELAMENTO */}
        {incident.cancelRequested && (
          <View style={{
            backgroundColor: '#FEF2F2', borderColor: '#EF4444', borderWidth: 2, 
            borderRadius: 10, padding: 15, marginHorizontal: 15, marginTop: 10, marginBottom: 5
          }}>
            <Text style={{ color: '#B91C1C', fontWeight: 'bold', fontSize: 15, marginBottom: 12, textAlign: 'center' }}>
              🚨 A VÍTIMA SOLICITOU O CANCELAMENTO!
            </Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity 
                style={{ flex: 1, backgroundColor: '#4B5563', padding: 12, borderRadius: 8, marginRight: 5, alignItems: 'center' }}
                onPress={handleRejectCancel}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Recusar / Manter</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={{ flex: 1, backgroundColor: '#EF4444', padding: 12, borderRadius: 8, marginLeft: 5, alignItems: 'center' }}
                onPress={handleApproveCancel}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Encerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Módulo de Mensagens Dinâmico */}
        <View style={{ flex: 1, paddingHorizontal: 10, paddingTop: 5 }}>
          {incident.status === 'pendente' ? (
            // A MAGIA ACONTECE AQUI: Escolhe qual componente de chat renderizar
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
              <Text style={{ fontSize: 40, marginBottom: 10 }}>✅</Text>
              <Text style={{ color: '#27AE60', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>
                Ocorrência encerrada. O chat foi arquivado.
              </Text>
            </View>
          )}
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}