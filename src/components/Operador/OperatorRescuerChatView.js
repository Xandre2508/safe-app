import { useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';

import { db } from '../../firebaseConfig';

export default function OperatorRescuerChatView({ rescuer, operatorId, onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!rescuer || !rescuer.id) return;

    const messagesRef = collection(db, 'operator_rescuer_chats', rescuer.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setMessages(msgs);
      },
      (error) => console.warn('[OperatorRescuerChatView] Erro no listener:', error)
    );

    return () => unsubscribe();
  }, [rescuer]);

  const sendMessage = async () => {
    const textToSend = newMessage.trim();
    if (!textToSend || !rescuer || !rescuer.id) return;

    try {
      const messagesRef = collection(db, 'operator_rescuer_chats', rescuer.id, 'messages');
      await addDoc(messagesRef, {
        text: textToSend,
        senderId: operatorId || 'operador_central',
        senderRole: 'operador',
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.warn('[OperatorRescuerChatView] Erro ao enviar mensagem:', error);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.senderRole === 'operador';

    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.rescuerMessage]}>
        {!isMe && <Text style={styles.senderLabel}>Equipa: {rescuer.nome || 'Socorrista'}</Text>}
        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.rescuerMessageText]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rádio Tático: {rescuer.nome || 'Socorrista'}</Text>
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        inverted
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Transmitir para equipa de socorro..."
          placeholderTextColor="#9CA3AF"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} activeOpacity={0.8}>
          <Ionicons name="send" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  messageList: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '82%',
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1E3A8A',
    borderBottomRightRadius: 2,
  },
  rescuerMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#3B82F6',
    borderBottomLeftRadius: 2,
  },
  senderLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#DBEAFE',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  rescuerMessageText: {
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    color: '#1F2937',
  },
  sendButton: {
    backgroundColor: '#1E3A8A',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});
