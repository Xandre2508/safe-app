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

    const messagesRef = collection(db, 'operator_rescuer_chats', rescuer.id, 'messages');
    
    // MUDANÇA 1: Usar 'desc' para que as mensagens fiquem prontas para a lista invertida
    const q = query(messagesRef, orderBy('timestamp', 'desc'));

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
        senderRole: 'operador',
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.log("Erro ao enviar mensagem: ", error);
    }
  };

  const renderMessage = ({ item }) => {
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
    // MUDANÇA 2: Ajustar o behavior do teclado para funcionar bem no Android ('height') e iOS ('padding')
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rádio: {rescuer.nome}</Text>
      </View>

      <FlatList
        style={{ flex: 1 }} // MUDANÇA 3: OBRIGATÓRIO! Garante que a lista não empurra o input para fora
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        inverted // MUDANÇA 4: Inverte a lista para parecer um chat real
      />
      
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
  
  // MUDANÇA 5: Como a lista está 'inverted', o paddingTop é a margem de baixo (perto do input)
  messageList: { paddingHorizontal: 15, paddingTop: 15, paddingBottom: 20 },
  
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 15, marginBottom: 10 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#34495E', borderBottomRightRadius: 0 },
  rescuerMessage: { alignSelf: 'flex-start', backgroundColor: '#3B82F6', borderBottomLeftRadius: 0 },
  senderLabel: { fontSize: 10, fontWeight: 'bold', color: '#DBEAFE', marginBottom: 4 },
  messageText: { fontSize: 15 },
  myMessageText: { color: '#FFF' },
  rescuerMessageText: { color: '#FFF' },
  
  // MUDANÇA 6: Removido o marginBottom que empurrava a barra para baixo da navegação do Android
  inputContainer: { 
    flexDirection: 'row', 
    padding: 10, 
    backgroundColor: '#FFF', 
    borderTopWidth: 1, 
    borderTopColor: '#E5E7EB', 
    alignItems: 'center', 
    paddingBottom: Platform.OS === 'ios' ? 25 : 10 // Proteção para a barra de home do iPhone
  },
  input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, fontSize: 15, maxHeight: 100 },
  sendButton: { backgroundColor: '#34495E', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
});