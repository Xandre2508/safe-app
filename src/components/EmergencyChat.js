import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../firebaseConfig';

export default function EmergencyChat({ sosId, currentUserRole, currentUserId }) {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  
  // Ref para controlar o Scroll do chat automaticamente
  const scrollViewRef = useRef();

  // Listener para buscar as mensagens do SOS específico
  useEffect(() => {
    if (!sosId) return;

    const q = query(
      collection(db, 'sos_requests', sosId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // CORREÇÃO: { serverTimestamps: 'estimate' } força o Firebase a estimar 
      // um tempo local para que a TUA mensagem apareça instantaneamente no teu ecrã!
      const msgs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data({ serverTimestamps: 'estimate' }) 
      }));
      setChatMessages(msgs);
    });

    return () => unsubscribe();
  }, [sosId]);

  // Função para enviar mensagem
  const handleSendMessage = async () => {
    if (!chatInput.trim() || !sosId) return;

    const messageText = chatInput;
    setChatInput(''); // Limpa o input imediatamente

    try {
      await addDoc(collection(db, 'sos_requests', sosId, 'messages'), {
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
    // CORREÇÃO: width: '100%' garante que os balões da direita não saem do ecrã
    <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#E0E0E0', width: '100%' }}>
      
      {/* Cabeçalho do Chat para a Vítima */}
      {currentUserRole === 'vitima' && (
        <View style={{ borderBottomWidth: 1, borderBottomColor: '#EEEEEE', paddingBottom: 8, marginBottom: 10, width: '100%' }}>
          <Text style={{ fontWeight: 'bold', color: '#E74C3C', fontSize: 16 }}>🚨 Chat de Emergência</Text>
          <Text style={{ fontSize: 12, color: '#7F8C8D' }}>A sua localização está a ser partilhada.</Text>
        </View>
      )}

      {/* Histórico de Mensagens */}
      <ScrollView 
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })} // CORREÇÃO: Auto-scroll para a base ao receber mensagens
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
                backgroundColor: isSystem ? '#FFF3CD' : (isMe ? (currentUserRole === 'operador' ? '#2980B9' : '#E74C3C') : '#EAECEE'),
                padding: 10,
                borderRadius: 12,
                marginBottom: 8,
                maxWidth: '85%',
                borderWidth: isSystem ? 1 : 0,
                borderColor: '#FFEEBA'
              }}
            >
              {!isSystem && currentUserRole === 'operador' && (
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: isMe ? '#D4E6F1' : '#7F8C8D', marginBottom: 2 }}>
                  {isMe ? 'Eu (Operador)' : 'Vítima'}
                </Text>
              )}
              <Text style={{ color: isSystem ? '#856404' : (isMe ? '#FFF' : '#333'), fontSize: 14 }}>
                {msg.text}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Área de Input de Texto */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, borderTopWidth: 1, borderTopColor: '#EEEEEE', paddingTop: 10, width: '100%' }}>
        <TextInput
          style={{ flex: 1, backgroundColor: '#F4F6F7', borderWidth: 1, borderColor: '#D5DBDB', borderRadius: 20, paddingHorizontal: 15, height: 40 }}
          placeholder={currentUserRole === 'operador' ? "Instruções de segurança..." : "Escreva aqui..."}
          placeholderTextColor="#95A5A6"
          value={chatInput}
          onChangeText={setChatInput}
        />
        <TouchableOpacity 
          style={{ marginLeft: 10, backgroundColor: currentUserRole === 'operador' ? '#2980B9' : '#E74C3C', borderRadius: 20, paddingHorizontal: 18, height: 40, justifyContent: 'center' }}
          onPress={handleSendMessage}
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}