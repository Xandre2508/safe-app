import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';

import { db } from '../../firebaseConfig';

export default function MantimentosChat({ mantimentoId, currentUserRole, currentUserId }) {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (!mantimentoId) return;

    const q = query(
      collection(db, 'pedidos_mantimentos', mantimentoId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data({ serverTimestamps: 'estimate' }),
        }));
        setChatMessages(msgs);
      },
      (error) => console.warn('[MantimentosChat] Erro no listener:', error)
    );

    return () => unsubscribe();
  }, [mantimentoId]);

  const handleSendMessage = async () => {
    const textToSend = chatInput.trim();
    if (!textToSend || !mantimentoId) return;

    setChatInput('');

    try {
      await addDoc(collection(db, 'pedidos_mantimentos', mantimentoId, 'messages'), {
        senderId: currentUserId || 'anonimo',
        senderRole: currentUserRole,
        text: textToSend,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.warn('[MantimentosChat] Erro ao enviar mensagem:', error);
      Alert.alert('Erro', 'Não foi possível transmitir a mensagem.');
    }
  };

  const primaryColor = '#3B82F6';

  return (
    <View style={localStyles.container}>
      {currentUserRole === 'vitima' && (
        <View style={localStyles.header}>
          <Text style={[localStyles.headerTitle, { color: primaryColor }]}>📦 Linha de Apoio a Mantimentos</Text>
          <Text style={localStyles.headerSubtitle}>Coordenação de entregas e recolha com a central.</Text>
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        style={localStyles.messagesArea}
        showsVerticalScrollIndicator={false}
      >
        {chatMessages.map((msg) => {
          const isMe = msg.senderRole === currentUserRole;
          const isSystem = msg.senderRole === 'sistema';

          return (
            <View
              key={msg.id}
              style={[
                localStyles.bubble,
                isSystem
                  ? localStyles.systemBubble
                  : isMe
                  ? localStyles.myBubble
                  : localStyles.otherBubble,
              ]}
            >
              {!isSystem && currentUserRole === 'operador' && (
                <Text style={localStyles.senderLabel}>
                  {isMe ? 'Eu (Operador)' : 'Cidadão / Vítima'}
                </Text>
              )}
              <Text
                style={[
                  localStyles.messageText,
                  isSystem ? localStyles.systemText : isMe ? localStyles.myText : localStyles.otherText,
                ]}
              >
                {msg.text}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={localStyles.inputRow}>
        <TextInput
          style={localStyles.textInput}
          placeholder="Escreva a mensagem sobre o pedido..."
          placeholderTextColor="#95A5A6"
          value={chatInput}
          onChangeText={setChatInput}
        />
        <TouchableOpacity
          style={[localStyles.sendButton, { backgroundColor: primaryColor }]}
          onPress={handleSendMessage}
          activeOpacity={0.8}
        >
          <Text style={localStyles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
    marginBottom: 10,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  messagesArea: {
    flex: 1,
    marginBottom: 8,
  },
  bubble: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: '85%',
  },
  systemBubble: {
    alignSelf: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#3B82F6',
  },
  otherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
  },
  senderLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94A3B8',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  systemText: {
    color: '#92400E',
    fontWeight: '500',
  },
  myText: {
    color: '#FFFFFF',
  },
  otherText: {
    color: '#1E293B',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 44,
    color: '#0F172A',
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 8,
    borderRadius: 20,
    paddingHorizontal: 18,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
