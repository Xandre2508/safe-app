import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView, // Evita que o teclado oculte os campos de input
  Platform, // Permite distinguir iOS e Android para ajustes de layout
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import styles from '../styles/AuthScreenStyles';

// --- IMPORTAÇÕES DO FIREBASE ---
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../src/firebaseConfig';

export default function AuthScreen({ navigation }) {
  // --- 1. ESTADOS (STATE) ---
  const [isLogin, setIsLogin] = useState(true); // true = Ecrã de Login | false = Ecrã de Registo
  const [loading, setLoading] = useState(false); // Spinner do botão principal
  
  // Variáveis do Formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [nif, setNif] = useState('');
  const [password, setPassword] = useState('');

  // --- 2. ANIMAÇÕES (REFS) ---
  // Utilizamos refs para os valores animados persistirem entre re-renderizações do componente
  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const entryOpacity = useRef(new Animated.Value(0)).current;
  const switchFade = useRef(new Animated.Value(1)).current;

  // --- 3. EFEITOS DE ARRANQUE ---
  useEffect(() => {
    // Sequência visual que ocorre logo que a app abre
    Animated.sequence([
      Animated.delay(500), 
      Animated.timing(logoTranslateY, {
        toValue: -220, // Empurra o logotipo para o topo do ecrã
        duration: 1200,
        useNativeDriver: true, 
      }),
      Animated.timing(entryOpacity, {
        toValue: 1, // Faz aparecer a caixa de formulário suavemente
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // --- 4. FUNÇÃO: Alternar entre Login/Registo ---
  const toggleAuth = (type) => {
    if ((type === 'login' && isLogin) || (type === 'register' && !isLogin)) return;

    // Efeito de 'Fade Out' do formulário atual
    Animated.timing(switchFade, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsLogin(type === 'login');
      // Limpar campos por segurança ao trocar de tab
      setNome(''); setNif(''); setPassword(''); 
      // Efeito de 'Fade In' do novo formulário
      Animated.timing(switchFade, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  // --- 5. RECUPERAÇÃO DE PASSWORD ---
  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Atenção', 'Por favor, insira o seu email no campo para redefinir a password.');
      return;
    }
    try {
      // Envia email gerado pela Firebase Auth
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Sucesso', `Um link de redefinição foi enviado para: ${email}`);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar o email de recuperação. Verifique o endereço digitado.');
    }
  };

  // --- 6. LÓGICA DE AUTENTICAÇÃO PRINCIPAL ---
  const handleAuthentication = async () => {
    // Validações Base
    if (isLogin) {
      if (!email || !password) return Alert.alert('Erro', 'Preencha o email e a password.');
    } else {
      if (!nome || !email || !nif || !password) return Alert.alert('Erro', 'Preencha todos os campos.');
    }

    setLoading(true);

    try {
      if (isLogin) {
        // --- FLUXO: LOGIN ---
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Vai à Firestore descobrir quem é este utilizador e que cargo tem
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          
          // ROTEAMENTO DINÂMICO BASEADO NO ROLE
          // É isto que garante que o Operador não acede à vista de Vítima e vice-versa
          if (userData.role === 'vitima') navigation.navigate('VictimDashboard');
          else if (userData.role === 'socorrista') navigation.navigate('RescuerDashboard');
          else if (userData.role === 'operador') navigation.navigate('OperatorDashboard');
          else if (userData.role === 'organizacao') navigation.navigate('AdminDashboard');
        } else {
          Alert.alert('Erro', 'Não foi encontrado um perfil para este utilizador na base de dados.');
        }

      } else {
        // --- FLUXO: REGISTO (Sempre como Vítima/Civil) ---
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Regista os dados extra na Firestore
        await setDoc(doc(db, 'users', user.uid), {
          nome: nome,
          email: email,
          nif: nif,
          role: 'vitima', // Fixado estaticamente (só a Organização cria Operadores/Socorristas)
          createdAt: new Date().toISOString()
        });

        Alert.alert('Sucesso', 'Conta S.A.F.E. criada com sucesso!');
        navigation.navigate('VictimDashboard'); // Redireciona diretamente para o mapa
      }
    } catch (error) {
      // Tradução de Erros da Firebase para Português
      let errorMessage = 'Ocorreu um erro inesperado.';
      if (error.code === 'auth/email-already-in-use') errorMessage = 'Este email já está registado.';
      if (error.code === 'auth/weak-password') errorMessage = 'A password deve ter pelo menos 6 caracteres.';
      if (error.code === 'auth/invalid-credential') errorMessage = 'Credenciais incorretas.';

      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false); 
    }
  };

  // --- 7. RENDERIZAÇÃO DA UI ---
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1, width: '100%' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
          keyboardShouldPersistTaps="handled" 
          showsVerticalScrollIndicator={false}
        >

          {/* Renderização do Logotipo Animado */}
          <Animated.View style={[styles.logoContainer, { transform: [{ translateY: logoTranslateY }] }]}>
            <Image source={require('../assets/SAFE_LOGO.png')} style={styles.logo} resizeMode="contain" />
          </Animated.View>

          {/* Renderização do Cartão Branco do Formulário */}
          <Animated.View style={[styles.formContainer, { opacity: entryOpacity }]}>

            {/* Abas (Tabs) */}
            <View style={styles.tabContainer}>
              <TouchableOpacity style={[styles.tabButton, isLogin && styles.activeTab]} onPress={() => toggleAuth('login')}>
                <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tabButton, !isLogin && styles.activeTab]} onPress={() => toggleAuth('register')}>
                <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Registo</Text>
              </TouchableOpacity>
            </View>

            {/* Conteúdo do Formulário */}
            <Animated.View style={{ width: '100%', opacity: switchFade, alignItems: 'center' }}>
              <Text style={styles.title}>{isLogin ? 'Bem-vindo de volta' : 'Crie a sua conta S.A.F.E.'}</Text>

              {/* Campos condicionalmente renderizados apenas se estivermos em "Registo" */}
              {!isLogin && (
                <>
                  <TextInput style={styles.input} placeholder="Nome Completo" placeholderTextColor="#999" value={nome} onChangeText={setNome} />
                  <TextInput style={styles.input} placeholder="NIF" keyboardType="numeric" placeholderTextColor="#999" value={nif} onChangeText={setNif} />
                </>
              )}

              {/* Campos Partilhados */}
              <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" placeholderTextColor="#999" value={email} onChangeText={setEmail} />
              <TextInput style={styles.input} placeholder="Password" secureTextEntry placeholderTextColor="#999" value={password} onChangeText={setPassword} />

              <TouchableOpacity style={styles.button} onPress={handleAuthentication} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>{isLogin ? 'Entrar' : 'Criar Conta'}</Text>}
              </TouchableOpacity>

              {/* Links úteis no rodapé do formulário */}
              {isLogin ? (
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.linkText}>Esqueceu-se da password?</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.linkText}>Ao registar-se aceita os Termos de Serviço.</Text>
              )}

            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}