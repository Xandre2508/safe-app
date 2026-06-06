import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../../src/firebaseConfig'; // Ajusta o path conforme a tua estrutura

export default function RescuerChatView({ currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!currentUserId) return;

    // Conecta à sala exclusiva deste socorrista
    const messagesRef = collection(db, 'operator_rescuer_chats', currentUserId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  const sendMessage = async () => {
    if (newMessage.trim() === '' || !currentUserId) return;

    try {
      const messagesRef = collection(db, 'operator_rescuer_chats', currentUserId, 'messages');
      await addDoc(messagesRef, {
        text: newMessage,
        senderId: currentUserId,
        senderRole: 'socorrista',
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.log("Erro ao enviar mensagem: ", error);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === currentUserId;
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.operatorMessage]}>
        {!isMe && <Text style={styles.senderLabel}>Central</Text>}
        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.operatorMessageText]}>
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
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Informa a central..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  messageList: {
    padding: 15,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3B82F6', // Azul para o socorrista
    borderBottomRightRadius: 0,
  },
  operatorMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E7EB', // Cinza para a central
    borderBottomLeftRadius: 0,
  },
  senderLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
  },
  myMessageText: {
    color: '#FFF',
  },
  operatorMessageText: {
    color: '#1F2937',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
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