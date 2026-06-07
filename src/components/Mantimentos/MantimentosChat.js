import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../firebaseConfig';

export default function MantimentosChat({ mantimentoId, currentUserRole, currentUserId }) {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const scrollViewRef = useRef();

  // Listener para buscar mensagens na coleção de mantimentos
  useEffect(() => {
    if (!mantimentoId) return;

    const q = query(
      collection(db, 'pedidos_mantimentos', mantimentoId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data({ serverTimestamps: 'estimate' }) 
      }));
      setChatMessages(msgs);
    });

    return () => unsubscribe();
  }, [mantimentoId]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !mantimentoId) return;

    const messageText = chatInput;
    setChatInput(''); 

    try {
      await addDoc(collection(db, 'pedidos_mantimentos', mantimentoId, 'messages'), {
        senderId: currentUserId,
        senderRole: currentUserRole,
        text: messageText,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível enviar a mensagem.");
    }
  };

  // Cores adaptadas para o tema "Mantimentos" (Azul)
  const isMe = (msg) => msg.senderRole === currentUserRole;
  const isSystem = (msg) => msg.senderRole === 'sistema';
  const primaryColor = '#3B82F6'; // Azul

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#E0E0E0', width: '100%' }}>
      
      {/* Cabeçalho */}
      {currentUserRole === 'vitima' && (
        <View style={{ borderBottomWidth: 1, borderBottomColor: '#EEEEEE', paddingBottom: 8, marginBottom: 10, width: '100%' }}>
          <Text style={{ fontWeight: 'bold', color: primaryColor, fontSize: 16 }}>📦 Chat de Mantimentos</Text>
          <Text style={{ fontSize: 12, color: '#7F8C8D' }}>A sua localização está a ser partilhada.</Text>
        </View>
      )}

      {/* Histórico */}
      <ScrollView 
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        style={{ flex: 1, marginBottom: 10, width: '100%' }} 
        showsVerticalScrollIndicator={false}
      >
        {chatMessages.map((msg) => (
          <View 
            key={msg.id} 
            style={{
              alignSelf: isSystem(msg) ? 'center' : (isMe(msg) ? 'flex-end' : 'flex-start'),
              backgroundColor: isSystem(msg) ? '#FFF3CD' : (isMe(msg) ? primaryColor : '#EAECEE'),
              padding: 10,
              borderRadius: 12,
              marginBottom: 8,
              maxWidth: '85%'
            }}
          >
            {!isSystem(msg) && currentUserRole === 'operador' && (
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: isMe(msg) ? '#D4E6F1' : '#7F8C8D', marginBottom: 2 }}>
                {isMe(msg) ? 'Eu (Operador)' : 'Vítima'}
              </Text>
            )}
            <Text style={{ color: isSystem(msg) ? '#856404' : (isMe(msg) ? '#FFF' : '#333'), fontSize: 14 }}>
              {msg.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, borderTopWidth: 1, borderTopColor: '#EEEEEE', paddingTop: 10, width: '100%' }}>
        <TextInput
          style={{ flex: 1, backgroundColor: '#F4F6F7', borderWidth: 1, borderColor: '#D5DBDB', borderRadius: 20, paddingHorizontal: 15, height: 40 }}
          placeholder="Escreva aqui..."
          value={chatInput}
          onChangeText={setChatInput}
        />
        <TouchableOpacity 
          style={{ marginLeft: 10, backgroundColor: primaryColor, borderRadius: 20, paddingHorizontal: 18, height: 40, justifyContent: 'center' }}
          onPress={handleSendMessage}
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}