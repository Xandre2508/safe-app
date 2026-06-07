import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebaseConfig';

export default function MantimentosChat({ pedidoId, currentUserRole, currentUserId }) {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const scrollViewRef = useRef();

  useEffect(() => {
    if (!pedidoId) return;
    const q = query(collection(db, 'pedidos_mantimentos', pedidoId, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChatMessages(msgs);
    });
    return () => unsubscribe();
  }, [pedidoId]);

  const handleSendMessage = async () => {
    console.log("A tentar enviar mensagem..."); // Debug
    if (!chatInput.trim() || !pedidoId) {
        console.log("Erro: Input vazio ou ID inválido");
        return;
    }
    const messageText = chatInput;
    setChatInput(''); 
    try {
      await addDoc(collection(db, 'pedidos_mantimentos', pedidoId, 'messages'), {
        senderId: currentUserId,
        senderRole: currentUserRole,
        text: messageText,
        timestamp: serverTimestamp()
      });
      console.log("Mensagem enviada!");
    } catch (error) { 
        Alert.alert("Erro", "Não foi possível enviar a mensagem."); 
        console.error(error);
    }
  };

  const handleCancelPedido = () => {
    console.log("A tentar cancelar pedido...");
    Alert.alert("Solicitar Cancelamento", "Desejas cancelar este pedido?", [
      { text: "Voltar", style: "cancel" },
      { text: "Confirmar", onPress: async () => {
          try {
            await updateDoc(doc(db, 'pedidos_mantimentos', pedidoId), { status: 'cancelado' });
            await addDoc(collection(db, 'pedidos_mantimentos', pedidoId, 'messages'), {
                senderId: currentUserId,
                senderRole: currentUserRole,
                text: '⚠️ Utilizador cancelou o pedido.',
                timestamp: serverTimestamp()
            });
            Alert.alert("Sucesso", "Pedido cancelado.");
          } catch (error) { Alert.alert("Erro", "Falha ao cancelar."); }
        }
      }
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, width: '100%' }}>
      <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#BFDBFE' }}>
        
        {/* Cabeçalho */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EEEEEE', paddingBottom: 8, marginBottom: 10 }}>
          <Text style={{ fontWeight: 'bold', color: '#3B82F6', fontSize: 16 }}>📦 Chat de Mantimentos</Text>
          
          {/* Se não vês o botão, verifica se o currentUserRole está mesmo a chegar como 'vitima' */}
          <TouchableOpacity 
             onPress={handleCancelPedido} 
             style={{ backgroundColor: '#FEE2E2', padding: 5, borderRadius: 6 }}
             hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
             <Ionicons name="trash" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })} 
          style={{ flex: 1, marginBottom: 10 }} 
          showsVerticalScrollIndicator={false}
        >
          {chatMessages.map((msg) => (
             <View key={msg.id} style={{
                alignSelf: msg.senderRole === 'sistema' ? 'center' : (msg.senderId === currentUserId ? 'flex-end' : 'flex-start'),
                backgroundColor: msg.senderRole === 'sistema' ? '#FFF3CD' : (msg.senderId === currentUserId ? '#3B82F6' : '#EAECEE'),
                padding: 10, borderRadius: 12, marginBottom: 8, maxWidth: '85%'
              }}>
                <Text style={{ color: msg.senderRole === 'sistema' ? '#856404' : (msg.senderId === currentUserId ? '#FFF' : '#333') }}>{msg.text}</Text>
             </View>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={{ flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EEEEEE', paddingTop: 10 }}>
          <TextInput
            style={{ flex: 1, backgroundColor: '#F4F6F7', borderRadius: 20, paddingHorizontal: 15, height: 40 }}
            placeholder="Escreva aqui..."
            value={chatInput}
            onChangeText={setChatInput}
          />
          <TouchableOpacity 
            style={{ marginLeft: 10, backgroundColor: '#3B82F6', borderRadius: 20, paddingHorizontal: 18, height: 40, justifyContent: 'center' }} 
            onPress={handleSendMessage}
            hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
          >
            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}