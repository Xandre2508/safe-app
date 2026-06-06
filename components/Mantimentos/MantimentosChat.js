// src/components/Vitima/MantimentosChat.js
// Componente de chat para comunicação em tempo real entre vítima e operador durante um pedido de mantimentos
// ESTA MERDA TAMBÉM É USADA NO MANTIMENTOS DASHBOARD OBG

import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../firebaseConfig';

// 🔄 ALTERADO: Mudámos a prop 'sosId' para 'pedidoId'
export default function MantimentosChat({ pedidoId, currentUserRole, currentUserId }) {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  
  const scrollViewRef = useRef();

  // Listener para buscar as mensagens do Pedido específico
  useEffect(() => {
    if (!pedidoId) return;

    // 🔄 ALTERADO: Apontar para a coleção 'pedidos_mantimentos'
    const q = query(
      collection(db, 'pedidos_mantimentos', pedidoId, 'messages'),
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
  }, [pedidoId]);

  // Função para enviar mensagem
  const handleSendMessage = async () => {
    if (!chatInput.trim() || !pedidoId) return;

    const messageText = chatInput;
    setChatInput(''); 

    try {
      // 🔄 ALTERADO: Gravar na coleção 'pedidos_mantimentos'
      await addDoc(collection(db, 'pedidos_mantimentos', pedidoId, 'messages'), {
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
    <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#E0E0E0', width: '100%' }}>
      
      {/* Cabeçalho do Chat para a Vítima */}
      {currentUserRole === 'vitima' && (
        <View style={{ borderBottomWidth: 1, borderBottomColor: '#EEEEEE', paddingBottom: 8, marginBottom: 10, width: '100%' }}>
          {/* 🔄 ALTERADO: Ícone, texto e cor alterados para Azul (#3B82F6) */}
          <Text style={{ fontWeight: 'bold', color: '#3B82F6', fontSize: 16 }}>📦 Chat de Mantimentos</Text>
          <Text style={{ fontSize: 12, color: '#7F8C8D' }}>A gerir as suas necessidades com o operador.</Text>
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
                // 🔄 ALTERADO: Cor do balão mudou de Vermelho para Azul (#3B82F6) para o utilizador
                backgroundColor: isSystem ? '#FFF3CD' : (isMe ? (currentUserRole === 'operador' ? '#2980B9' : '#3B82F6') : '#EAECEE'),
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
                  {isMe ? 'Eu (Operador)' : 'Utilizador'}
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
          placeholder={currentUserRole === 'operador' ? "Instruções sobre os mantimentos..." : "Escreva aqui..."}
          placeholderTextColor="#95A5A6"
          value={chatInput}
          onChangeText={setChatInput}
        />
        <TouchableOpacity 
          // 🔄 ALTERADO: Cor do botão de enviar mudou para Azul (#3B82F6)
          style={{ marginLeft: 10, backgroundColor: currentUserRole === 'operador' ? '#2980B9' : '#3B82F6', borderRadius: 20, paddingHorizontal: 18, height: 40, justifyContent: 'center' }}
          onPress={handleSendMessage}
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}