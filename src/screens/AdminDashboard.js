import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../firebaseConfig';

export default function AdminDashboard({ navigation }) {
  const [orgName, setOrgName] = useState('A carregar...');
  const [nomeProfissional, setNomeProfissional] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [novoCargo, setNovoCargo] = useState('socorrista'); // ou 'operador'
  const [loading, setLoading] = useState(false);

  // Vai buscar o nome da organização logada
  useEffect(() => {
    const fetchOrgData = async () => {
      if (auth.currentUser) {
        const orgDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (orgDoc.exists()) setOrgName(orgDoc.data().nome);
      }
    };
    fetchOrgData();
  }, []);

  const handleCreateStaff = async () => {
    if (!nomeProfissional || !email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos do profissional.');
      return;
    }

    setLoading(true);
    try {
      // 1. Cria a conta no Firebase Auth (Atenção: fará login automático nesta conta)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Guarda na BD associando o nome da organização (ORG)
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        nome: nomeProfissional,
        email: email,
        role: novoCargo,
        organizacao: orgName, // LIGAÇÃO À ORG
        createdAt: new Date().toISOString()
      });

      Alert.alert('Sucesso', `${novoCargo} criado com sucesso e associado à org: ${orgName}`);
      
      // Limpa formulário
      setNomeProfissional('');
      setEmail('');
      setPassword('');
    } catch (error) {
      Alert.alert('Erro ao criar profissional', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA', padding: 20 }}>
      <ScrollView>
        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#1A5276' }}>
          Painel de Administração
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 20 }}>Organização: <Text style={{fontWeight: 'bold'}}>{orgName}</Text></Text>

        <View style={{ backgroundColor: '#FFF', padding: 20, borderRadius: 15, shadowOpacity: 0.1, elevation: 3 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>Adicionar Novo Operacional</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
            <TouchableOpacity 
              style={{ flex: 0.48, padding: 10, backgroundColor: novoCargo === 'socorrista' ? '#27AE60' : '#EEE', borderRadius: 8, alignItems: 'center' }} 
              onPress={() => setNovoCargo('socorrista')}>
              <Text style={{ color: novoCargo === 'socorrista' ? '#FFF' : '#333', fontWeight: 'bold' }}>Socorrista</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ flex: 0.48, padding: 10, backgroundColor: novoCargo === 'operador' ? '#E67E22' : '#EEE', borderRadius: 8, alignItems: 'center' }} 
              onPress={() => setNovoCargo('operador')}>
              <Text style={{ color: novoCargo === 'operador' ? '#FFF' : '#333', fontWeight: 'bold' }}>Operador</Text>
            </TouchableOpacity>
          </View>

          <TextInput style={{ backgroundColor: '#FAFAFA', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#DDD', marginBottom: 10 }} placeholder="Nome do Profissional" value={nomeProfissional} onChangeText={setNomeProfissional} />
          <TextInput style={{ backgroundColor: '#FAFAFA', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#DDD', marginBottom: 10 }} placeholder="Email do Profissional" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <TextInput style={{ backgroundColor: '#FAFAFA', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#DDD', marginBottom: 15 }} placeholder="Password Temporária" secureTextEntry value={password} onChangeText={setPassword} />

          <TouchableOpacity style={{ backgroundColor: '#1A5276', padding: 15, borderRadius: 8, alignItems: 'center' }} onPress={handleCreateStaff} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Adicionar Operacional</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={{ backgroundColor: '#333', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 30 }} onPress={() => navigation.navigate('Login')}>
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}