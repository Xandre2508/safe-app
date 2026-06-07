import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react'; 
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BottomSheetFlatList, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { db } from '../../../src/firebaseConfig'; 

export default function RescuerChatView({ currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!currentUserId) return;

    const messagesRef = collection(db, 'operator_rescuer_chats', currentUserId, 'messages');
    
    // 1. MUDANÇA: 'desc' em vez de 'asc'. A mensagem mais recente vem primeiro.
    const q = query(messagesRef, orderBy('timestamp', 'desc'));

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
    <View style={styles.container}>
      
      <BottomSheetFlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        // 2. MUDANÇA: O grande truque dos chats! Vira a lista ao contrário
        inverted 
      />
      
      <View style={styles.inputContainer}>
        <BottomSheetTextInput
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
    // NOTA: Como a lista está invertida, o paddingTop visualmente é o "fundo" do chat!
    paddingTop: 15, 
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 0,
  },
  operatorMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E7EB', 
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
    paddingBottom: 15, 
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