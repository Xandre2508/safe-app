import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import styles from '../styles/AuthScreenStyles';

// --- IMPORTAÇÕES DO FIREBASE ---
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function AuthScreen({ navigation }) {
  // --- 1. ESTADOS (STATE) ---
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false); // Estado para controlar o loading do botão
  
  // Dados do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [nif, setNif] = useState('');
  const [password, setPassword] = useState('');
  
  // Tipo de conta (Vítima ou Socorrista)
  const [userRole, setUserRole] = useState('vitima');

  // --- 2. ANIMAÇÕES (REFS) ---
  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const entryOpacity = useRef(new Animated.Value(0)).current;
  const switchFade = useRef(new Animated.Value(1)).current;

  // --- 3. EFEITO DE ENTRADA ---
  useEffect(() => {
    Animated.sequence([
      Animated.delay(500), // Espera meio segundo
      Animated.timing(logoTranslateY, {
        toValue: -220, // Sobe o logótipo
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(entryOpacity, {
        toValue: 1, // Faz aparecer o formulário
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // --- 4. FUNÇÃO DE TROCA (LOGIN <-> REGISTO) ---
  const toggleAuth = (type) => {
    if ((type === 'login' && isLogin) || (type === 'register' && !isLogin)) return;

    Animated.timing(switchFade, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsLogin(type === 'login');
      // Limpa os campos ao trocar de separador
      setPassword(''); 
      Animated.timing(switchFade, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  // --- 5. LÓGICA DE AUTENTICAÇÃO REAL (FIREBASE) ---
  const handleAuthentication = async () => {
    // Validação básica de campos vazios
    if (isLogin) {
      if (!email || !password) {
        Alert.alert('Erro', 'Por favor, preencha o email e a password.');
        return;
      }
    } else {
      if (!nome || !email || !nif || !password) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos.');
        return;
      }
    }

    setLoading(true); // Ativa o indicador de carregamento

    try {
      if (isLogin) {
        // --- PROCESSO DE LOGIN ---
        // 1. Autentica no Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Procura o perfil do utilizador no Firestore para saber o cargo (role)
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          
          // 3. Redireciona consoante o cargo guardado na BD
          if (userData.role === 'vitima') {
            navigation.navigate('VictimDashboard');
          } else {
            navigation.navigate('RescuerDashboard');
          }
        } else {
          Alert.alert('Erro', 'Não foi encontrado um perfil para este utilizador.');
        }

      } else {
        // --- PROCESSO DE REGISTO ---
        // 1. Cria o utilizador no Firebase Auth (Email/Pass)
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Cria o documento do utilizador no Firestore com os dados extra
        // Usamos o UID do Auth como ID do documento para ligação direta
        await setDoc(doc(db, 'users', user.uid), {
          nome: nome,
          email: email,
          nif: nif,
          role: userRole, // 'vitima' ou 'socorrista'
          createdAt: new Date().toISOString()
        });

        Alert.alert('Sucesso', `Conta de ${userRole} criada com sucesso!`);
        
        // 3. Redireciona logo após o registo
        if (userRole === 'vitima') {
          navigation.navigate('VictimDashboard');
        } else {
          navigation.navigate('RescuerDashboard');
        }
      }
    } catch (error) {
      // Tratamento de erros amigável
      console.error(error);
      let errorMessage = 'Ocorreu um erro inesperado.';
      
      if (error.code === 'auth/email-already-in-use') errorMessage = 'Este email já está registado.';
      if (error.code === 'auth/weak-password') errorMessage = 'A password deve ter pelo menos 6 caracteres.';
      if (error.code === 'auth/invalid-credential') errorMessage = 'Credenciais incorretas.';
      if (error.code === 'auth/user-not-found') errorMessage = 'Utilizador não encontrado.';

      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false); // Desliga o loading independentemente do resultado
    }
  };

  // --- 6. INTERFACE (UI) ---
  return (
    <SafeAreaView style={styles.container}>
      
      {/* LOGÓTIPO ANIMADO */}
      <Animated.View style={[styles.logoContainer, { transform: [{ translateY: logoTranslateY }] }]}>
        <Image
          source={require('../assets/SAFE_LOGO.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* CARTÃO DO FORMULÁRIO ANIMADO */}
      <Animated.View style={[styles.formContainer, { opacity: entryOpacity }]}>

        {/* SEPARADORES (TAB LOGIN / REGISTO) */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, isLogin && styles.activeTab]}
            onPress={() => toggleAuth('login')}
          >
            <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, !isLogin && styles.activeTab]}
            onPress={() => toggleAuth('register')}
          >
            <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Registo</Text>
          </TouchableOpacity>
        </View>

        {/* CONTEÚDO QUE DESVANECE AO TROCAR */}
        <Animated.View style={{ width: '100%', opacity: switchFade, alignItems: 'center' }}>
          <Text style={styles.title}>
            {isLogin ? 'Bem-vindo de volta' : 'Crie a sua conta S.A.F.E.'}
          </Text>

          {/* CAMPOS EXCLUSIVOS DO REGISTO */}
          {!isLogin && (
            <>
              <TextInput 
                style={styles.input} 
                placeholder="Nome Completo" 
                placeholderTextColor="#999" 
                value={nome}
                onChangeText={setNome}
              />
              <TextInput 
                style={styles.input} 
                placeholder="NIF" 
                keyboardType="numeric"
                placeholderTextColor="#999" 
                value={nif}
                onChangeText={setNif}
              />

              {/* SELETOR DE TIPO DE CONTA */}
              <View style={styles.roleContainer}>
                <TouchableOpacity 
                  style={[styles.roleButton, userRole === 'vitima' && styles.activeRoleVitima]} 
                  onPress={() => setUserRole('vitima')}
                >
                  <Text style={[styles.roleText, userRole === 'vitima' && styles.activeRoleText]}>Vítima</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.roleButton, userRole === 'socorrista' && styles.activeRoleSocorrista]} 
                  onPress={() => setUserRole('socorrista')}
                >
                  <Text style={[styles.roleText, userRole === 'socorrista' && styles.activeRoleText]}>Socorrista</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* CAMPOS COMUNS (EMAIL E PASSWORD) */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
          />

          {/* BOTÃO DE SUBMISSÃO COM LOADING */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleAuthentication}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>{isLogin ? 'Entrar' : 'Criar Conta'}</Text>
            )}
          </TouchableOpacity>

          {/* LINKS ADICIONAIS */}
          {isLogin ? (
            <TouchableOpacity>
              <Text style={styles.linkText}>Esqueceu-se da password?</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.linkText}>Ao registar-se aceita os Termos de Serviço.</Text>
          )}

        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}