import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../firebaseConfig';

export default function MantimentosChat({ mantimentosId, currentUserRole, currentUserId }) {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  
  const scrollViewRef = useRef();

  // Listener para mensagens de MANTIMENTOS
  useEffect(() => {
    if (!mantimentosId) return;

    const q = query(
      collection(db, 'pedidos_mantimentos', mantimentosId, 'messages'),
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
  }, [mantimentosId]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !mantimentosId) return;

    const messageText = chatInput;
    setChatInput(''); 

    try {
      await addDoc(collection(db, 'pedidos_mantimentos', mantimentosId, 'messages'), {
        senderId: currentUserId,
        senderRole: currentUserRole,
        text: messageText,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível enviar a mensagem.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#BFDBFE', width: '100%' }}>
      
      {/* Cabeçalho do Chat de Mantimentos */}
      {currentUserRole === 'vitima' && (
        <View style={{ borderBottomWidth: 1, borderBottomColor: '#EFF6FF', paddingBottom: 8, marginBottom: 10, width: '100%' }}>
          <Text style={{ fontWeight: 'bold', color: '#3B82F6', fontSize: 16 }}>📦 Chat de Mantimentos</Text>
          <Text style={{ fontSize: 12, color: '#60A5FA' }}>A sua localização foi enviada ao operador.</Text>
        </View>
      )}

      {/* Histórico de Mensagens */}
      <ScrollView 
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        style={{ flex: 1, marginBottom: 10, width: '100%' }} 
        showsVerticalScrollIndicator={false}
      >
        {chatMessages.map((msg) => {
          const isMe = msg.senderRole === currentUserRole;
          const isSystem = msg.senderRole === 'sistema';
          
          return (
            <View 
              key={msg.id} 
              style={{
                alignSelf: isSystem ? 'center' : (isMe ? 'flex-end' : 'flex-start'),
                backgroundColor: isSystem ? '#EFF6FF' : (isMe ? '#3B82F6' : '#F3F4F6'),
                padding: 10,
                borderRadius: 12,
                marginBottom: 8,
                maxWidth: '85%'
              }}
            >
              <Text style={{ color: isSystem ? '#2563EB' : (isMe ? '#FFF' : '#333'), fontSize: 14 }}>
                {msg.text}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Área de Input */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, borderTopWidth: 1, borderTopColor: '#EFF6FF', paddingTop: 10, width: '100%' }}>
        <TextInput
          style={{ flex: 1, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 20, paddingHorizontal: 15, height: 40 }}
          placeholder="Escreva aqui..."
          value={chatInput}
          onChangeText={setChatInput}
        />
        <TouchableOpacity 
          style={{ marginLeft: 10, backgroundColor: '#3B82F6', borderRadius: 20, paddingHorizontal: 18, height: 40, justifyContent: 'center' }}
          onPress={handleSendMessage}
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}