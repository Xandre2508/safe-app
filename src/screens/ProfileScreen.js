import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../firebaseConfig';

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (auth.currentUser) {
          const docRef = doc(db, 'users', auth.currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            setNome(data.nome || '');
          }
        }
      } catch (error) {
        Alert.alert("Erro", "Não foi possível carregar o perfil.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(docRef, { nome: nome });
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Falha ao atualizar o perfil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={{flex: 1, justifyContent: 'center'}}><ActivityIndicator size="large" color="#1A5276" /></View>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' }}>O Meu Perfil</Text>

      <View style={{ backgroundColor: '#FFF', padding: 20, borderRadius: 15, shadowOpacity: 0.1, elevation: 3 }}>
        
        {/* Mostra a Organização caso seja um Socorrista ou Operador */}
        {userData?.organizacao && (
          <View style={{ backgroundColor: '#E8F8F5', padding: 10, borderRadius: 8, marginBottom: 15 }}>
            <Text style={{ color: '#117A65', fontWeight: 'bold' }}>Vínculo Profissional:</Text>
            <Text style={{ color: '#117A65' }}>{userData.organizacao}</Text>
          </View>
        )}

        <Text style={{ color: '#7F8C8D', marginBottom: 5 }}>Cargo / Tipo de Conta</Text>
        <TextInput style={{ backgroundColor: '#EAECEE', padding: 12, borderRadius: 8, marginBottom: 15, color: '#7F8C8D' }} value={userData?.role.toUpperCase()} editable={false} />

        <Text style={{ color: '#7F8C8D', marginBottom: 5 }}>Email</Text>
        <TextInput style={{ backgroundColor: '#EAECEE', padding: 12, borderRadius: 8, marginBottom: 15, color: '#7F8C8D' }} value={userData?.email} editable={false} />

        <Text style={{ color: '#333', fontWeight: 'bold', marginBottom: 5 }}>Nome Completo</Text>
        <TextInput style={{ backgroundColor: '#FAFAFA', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#DDD', marginBottom: 20 }} value={nome} onChangeText={setNome} />

        <TouchableOpacity style={{ backgroundColor: '#1A5276', padding: 15, borderRadius: 8, alignItems: 'center' }} onPress={handleUpdateProfile} disabled={saving}>
          {saving ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Guardar Alterações</Text>}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => navigation.goBack()}>
        <Text style={{ color: '#E74C3C', fontWeight: 'bold' }}>Voltar ao Dashboard</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}