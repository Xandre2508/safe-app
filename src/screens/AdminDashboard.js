import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../src/firebaseConfig';
import { styles } from '../styles/AdminDashboardStyles';

export default function AdminDashboard({ navigation }) {
  // --- ESTADOS (STATE) ---
  const [orgName, setOrgName] = useState('A carregar...'); // Nome da organização a que o Admin pertence
  const [nomeProfissional, setNomeProfissional] = useState(''); // Dados do novo colaborador
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [novoCargo, setNovoCargo] = useState('socorrista'); // Define se a conta a criar é de 'socorrista' ou 'operador'
  const [loading, setLoading] = useState(false); // Controla o estado de loading durante a submissão

  // --- EFEITO: Carregar dados da Organização ---
  useEffect(() => {
    const fetchOrgData = async () => {
      if (auth.currentUser) {
        // Vai buscar o documento do Admin atual à Firestore para descobrir a que organização pertence
        const orgDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (orgDoc.exists()) setOrgName(orgDoc.data().nome);
      }
    };
    fetchOrgData();
  }, []);

  // --- FUNÇÃO: Criar Novo Profissional ---
  const handleCreateStaff = async () => {
    // Validação básica: impede submissões com campos vazios
    if (!nomeProfissional || !email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos do profissional.');
      return;
    }
    setLoading(true); // Inicia o feedback visual (spinner)
    
    try {
      // Passo 1: Cria a conta na Firebase Auth
      // Nota: Esta função faz login automático na nova conta. Num cenário real de produção, 
      // poderás precisar de usar Firebase Admin SDK no backend para evitar que o Admin perca a sessão atual.
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Passo 2: Guarda os dados adicionais na Firestore associados ao novo UID
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        nome: nomeProfissional,
        email: email,
        role: novoCargo, // Atribui o cargo escolhido no toggle
        organizacao: orgName, // Vincula o funcionário à mesma organização do Admin
        createdAt: new Date().toISOString()
      });
      
      Alert.alert('Sucesso', `${novoCargo === 'socorrista' ? 'Socorrista' : 'Operador'} adicionado com sucesso!`);
      
      // Limpa os campos após sucesso
      setNomeProfissional('');
      setEmail('');
      setPassword('');
    } catch (error) {
      Alert.alert('Erro ao criar profissional', error.message);
    } finally {
      setLoading(false); // Pára o spinner
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* BOTÃO DE PERFIL FLUTUANTE */}
      {/* Posicionado de forma absoluta para não interferir com o layout do ScrollView */}
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

      {/* KeyboardAvoidingView: Impede que o teclado tape os inputs ao escrever */}
      <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Cabeçalho dinâmico com o nome da organização */}
          <View style={styles.headerContainer}>
            <Text style={styles.mainTitle}>Painel de Administração</Text>
            <Text style={styles.orgText}>Organização: <Text style={styles.orgNameHighlight}>{orgName}</Text></Text>
          </View>

          {/* Cartão de Formulário para adicionar Operacionais */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Adicionar Novo Operacional</Text>
            
            {/* Toggle de Seleção de Cargo (Socorrista vs Operador) */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity style={[styles.toggleButton, novoCargo === 'socorrista' ? styles.activeSocorrista : styles.inactiveToggle]} onPress={() => setNovoCargo('socorrista')}>
                <Text style={[styles.toggleText, novoCargo === 'socorrista' && styles.activeToggleText]}>Socorrista</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.toggleButton, novoCargo === 'operador' ? styles.activeOperador : styles.inactiveToggle]} onPress={() => setNovoCargo('operador')}>
                <Text style={[styles.toggleText, novoCargo === 'operador' && styles.activeToggleText]}>Operador</Text>
              </TouchableOpacity>
            </View>

            {/* Inputs de dados */}
            <TextInput style={styles.input} placeholder="Nome do Profissional" placeholderTextColor="#95A5A6" value={nomeProfissional} onChangeText={setNomeProfissional} />
            <TextInput style={styles.input} placeholder="Email do Profissional" placeholderTextColor="#95A5A6" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder="Password Temporária" placeholderTextColor="#95A5A6" secureTextEntry value={password} onChangeText={setPassword} />

            {/* Botão de Submissão Dinâmico (Mostra loading ou texto) */}
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