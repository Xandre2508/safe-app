import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { auth, db } from '../../src/firebaseConfig';
import { styles } from '../styles/AdminDashboardStyles';

export default function AdminDashboard({ navigation }) {
  const [orgName, setOrgName] = useState('A carregar...');
  const [nomeProfissional, setNomeProfissional] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [novoCargo, setNovoCargo] = useState('socorrista');
  const [loading, setLoading] = useState(false);

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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        nome: nomeProfissional,
        email: email,
        role: novoCargo,
        organizacao: orgName,
        createdAt: new Date().toISOString()
      });
      Alert.alert('Sucesso', `${novoCargo === 'socorrista' ? 'Socorrista' : 'Operador'} adicionado com sucesso!`);
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
    <SafeAreaView style={styles.safeArea}>
      
      {/* BOTÃO DE PERFIL FLUTUANTE */}
      <TouchableOpacity 
        style={{
          position: 'absolute',
          top: 15,
          left: 15,
          zIndex: 999,
          backgroundColor: '#FFFFFF',
          width: 50,
          height: 50,
          borderRadius: 25,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        }}
        onPress={() => navigation.navigate('ProfileScreen')}
      >
        <Text style={{ fontSize: 24 }}>👤</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.headerContainer}>
            <Text style={styles.mainTitle}>Painel de Administração</Text>
            <Text style={styles.orgText}>Organização: <Text style={styles.orgNameHighlight}>{orgName}</Text></Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Adicionar Novo Operacional</Text>
            
            <View style={styles.toggleContainer}>
              <TouchableOpacity style={[styles.toggleButton, novoCargo === 'socorrista' ? styles.activeSocorrista : styles.inactiveToggle]} onPress={() => setNovoCargo('socorrista')}>
                <Text style={[styles.toggleText, novoCargo === 'socorrista' && styles.activeToggleText]}>Socorrista</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.toggleButton, novoCargo === 'operador' ? styles.activeOperador : styles.inactiveToggle]} onPress={() => setNovoCargo('operador')}>
                <Text style={[styles.toggleText, novoCargo === 'operador' && styles.activeToggleText]}>Operador</Text>
              </TouchableOpacity>
            </View>

            <TextInput style={styles.input} placeholder="Nome do Profissional" placeholderTextColor="#95A5A6" value={nomeProfissional} onChangeText={setNomeProfissional} />
            <TextInput style={styles.input} placeholder="Email do Profissional" placeholderTextColor="#95A5A6" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder="Password Temporária" placeholderTextColor="#95A5A6" secureTextEntry value={password} onChangeText={setPassword} />

            <TouchableOpacity style={styles.submitButton} onPress={handleCreateStaff} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Adicionar Operacional</Text>}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.logoutButtonText}>Sair</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}