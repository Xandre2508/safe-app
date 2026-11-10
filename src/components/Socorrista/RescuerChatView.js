import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetFlatList, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';

import { db } from '../../firebaseConfig';

export default function RescuerChatView({ currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!currentUserId) return;

    const messagesRef = collection(db, 'operator_rescuer_chats', currentUserId, 'messages');
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
      (error) => console.warn('[RescuerChatView] Erro no listener rádio:', error)
    );

    return () => unsubscribe();
  }, [currentUserId]);

  const sendMessage = async () => {
    const textToSend = newMessage.trim();
    if (!textToSend || !currentUserId) return;

    try {
      const messagesRef = collection(db, 'operator_rescuer_chats', currentUserId, 'messages');
      await addDoc(messagesRef, {
        text: textToSend,
        senderId: currentUserId,
        senderRole: 'socorrista',
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.warn('[RescuerChatView] Erro ao transmitir mensagem:', error);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === currentUserId;
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.operatorMessage]}>
        {!isMe && <Text style={styles.senderLabel}>Central de Operações</Text>}
        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.operatorMessageText]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <BottomSheetFlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        inverted
      />

      <View style={styles.inputContainer}>
        <BottomSheetTextInput
          style={styles.input}
          placeholder="Transmitir para a central de socorro..."
          placeholderTextColor="#9CA3AF"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} activeOpacity={0.8}>
          <Ionicons name="send" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    overflow: 'hidden',
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
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 2,
  },
  operatorMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E7EB',
    borderBottomLeftRadius: 2,
  },
  senderLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  operatorMessageText: {
    color: '#1F2937',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
    paddingBottom: 15,
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    color: '#1F2937',
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});
