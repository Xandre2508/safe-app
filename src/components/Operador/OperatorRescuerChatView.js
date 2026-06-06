import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../firebaseConfig';

export default function OperatorRescuerChatView({ rescuer, operatorId, onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!rescuer || !rescuer.id) return;

    // Conecta à sala exclusiva DESTE socorrista
    const messagesRef = collection(db, 'operator_rescuer_chats', rescuer.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [rescuer]);

  const sendMessage = async () => {
    if (newMessage.trim() === '' || !rescuer || !rescuer.id) return;

    try {
      const messagesRef = collection(db, 'operator_rescuer_chats', rescuer.id, 'messages');
      await addDoc(messagesRef, {
        text: newMessage,
        senderId: operatorId || 'operador_anonimo',
        senderRole: 'operador', // Define que quem enviou foi a Central
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.log("Erro ao enviar mensagem: ", error);
    }
  };

  const renderMessage = ({ item }) => {
    // Se a mensagem foi enviada pelo 'operador', aparece à direita. Se foi do socorrista, à esquerda.
    const isMe = item.senderRole === 'operador';
    
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.rescuerMessage]}>
        {!isMe && <Text style={styles.senderLabel}>Equipa: {rescuer.nome}</Text>}
        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.rescuerMessageText]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      
      {/* HEADER DO CHAT */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rádio: {rescuer.nome}</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
      />
      
      {/* INPUT MENSAGEM */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Transmitir para equipa..."
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
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  messageList: { padding: 15, flexGrow: 1, justifyContent: 'flex-end' },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 15, marginBottom: 10 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#34495E', borderBottomRightRadius: 0 },
  rescuerMessage: { alignSelf: 'flex-start', backgroundColor: '#3B82F6', borderBottomLeftRadius: 0 },
  senderLabel: { fontSize: 10, fontWeight: 'bold', color: '#DBEAFE', marginBottom: 4 },
  messageText: { fontSize: 15 },
  myMessageText: { color: '#FFF' },
  rescuerMessageText: { color: '#FFF' },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center', marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, fontSize: 15, maxHeight: 100 },
  sendButton: { backgroundColor: '#34495E', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
});