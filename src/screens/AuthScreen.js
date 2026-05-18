import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView, // Componente para evitar que o teclado tape os inputs
  Platform, // Permite detetar se o sistema operativo é iOS ou Android
  SafeAreaView,
  ScrollView, // Permite fazer scroll quando o teclado ocupa espaço no ecrã
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
import { auth, db } from '../firebaseConfig';

export default function AuthScreen({ navigation }) {
  // --- 1. ESTADOS (STATE) ---
  const [isLogin, setIsLogin] = useState(true); // Define se a vista atual é Login (true) ou Registo (false)
  const [loading, setLoading] = useState(false); // Controla o indicador de carregamento (spinner) do botão principal
  
  // Dados do formulário atrelados aos inputs
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [nif, setNif] = useState('');
  const [password, setPassword] = useState('');

  // --- 2. ANIMAÇÕES (REFS) ---
  // Uso do useRef para reter a mesma instância do valor animado entre re-renderizações do React
  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const entryOpacity = useRef(new Animated.Value(0)).current;
  const switchFade = useRef(new Animated.Value(1)).current;

  // --- 3. EFEITO DE ENTRADA INICIAL ---
  useEffect(() => {
    // Executa uma sequência de animações ao carregar o ecrã
    Animated.sequence([
      Animated.delay(500), // Aguarda 500ms antes de começar
      Animated.timing(logoTranslateY, {
        toValue: -220, // Move o logótipo para cima no eixo Y
        duration: 1200,
        useNativeDriver: true, // Melhora o desempenho usando o motor nativo
      }),
      Animated.timing(entryOpacity, {
        toValue: 1, // Faz o cartão de formulário aparecer suavemente (Fade In)
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // --- 4. FUNÇÃO DE TROCA SUAVE (LOGIN <-> REGISTO) ---
  const toggleAuth = (type) => {
    // Evita reiniciar a animação se o utilizador clicar na tab onde já se encontra
    if ((type === 'login' && isLogin) || (type === 'register' && !isLogin)) return;

    // Faz o conteúdo esmaecer (Fade Out)
    Animated.timing(switchFade, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsLogin(type === 'login');
      // Limpa os estados dos campos ao alternar de aba para evitar resíduos visuais
      setNome('');
      setNif('');
      setPassword(''); 
      // Faz o novo conteúdo reaparecer (Fade In)
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
      // Solicita à Firebase Auth o envio de um email de redefinição padrão
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Sucesso', `Um link de redefinição foi enviado para: ${email}`);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar o email de recuperação. Verifique o endereço digitado.');
    }
  };

  // --- 6. LÓGICA DE AUTENTICAÇÃO (FIREBASE) ---
  const handleAuthentication = async () => {
    // Validações locais de preenchimento obrigatório
    if (isLogin) {
      if (!email || !password) {
        Alert.alert('Erro', 'Por favor, preencha o email e a password.');
        return;
      }
    } else {
      if (!nome || !email || !nif || !password) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos do registo.');
        return;
      }
    }

    setLoading(true); // Ativa o spinner e desativa o botão de clique duplo

    try {
      if (isLogin) {
        // --- FLUXO DE LOGIN ---
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Procura os detalhes do perfil na Firestore com base no UID único do utilizador
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          
          // Encaminhamento dinâmico focado no cargo ('role') retornado da BD
          if (userData.role === 'vitima') {
            navigation.navigate('VictimDashboard');
          } else if (userData.role === 'socorrista') {
            navigation.navigate('RescuerDashboard');
          } else if (userData.role === 'operador') {
            navigation.navigate('OperatorDashboard');
          } else if (userData.role === 'organizacao') {
            navigation.navigate('AdminDashboard');
          }
        } else {
          Alert.alert('Erro', 'Não foi encontrado um perfil para este utilizador.');
        }

      } else {
        // --- FLUXO DE REGISTO (CONTA AUTOMATICAMENTE DEFINIDA COMO VÍTIMA) ---
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Escreve o documento inicial do utilizador na Firestore
        await setDoc(doc(db, 'users', user.uid), {
          nome: nome,
          email: email,
          nif: nif,
          role: 'vitima', // Fixado estaticamente para automatizar o registo civil
          createdAt: new Date().toISOString()
        });

        Alert.alert('Sucesso', 'Conta S.A.F.E. criada com sucesso!');
        navigation.navigate('VictimDashboard');
      }
    } catch (error) {
      console.error(error);
      let errorMessage = 'Ocorreu um erro inesperado.';
      
      // Mapeamento de códigos de erro amigáveis para o utilizador final
      if (error.code === 'auth/email-already-in-use') errorMessage = 'Este email já está registado.';
      if (error.code === 'auth/weak-password') errorMessage = 'A password deve ter pelo menos 6 caracteres.';
      if (error.code === 'auth/invalid-credential') errorMessage = 'Credenciais incorretas.';

      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false); // Desliga o indicador de carregamento
    }
  };

  // --- 7. INTERFACE GRÁFICA (UI) ---
  return (
    <SafeAreaView style={styles.container}>
      
      {/* KeyboardAvoidingView ajusta a posição do ecrã consoante a presença do teclado */}
      <KeyboardAvoidingView 
        style={{ flex: 1, width: '100%' }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ScrollView permite deslizar a interface caso o teclado ocupe demasiado espaço */}
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
          keyboardShouldPersistTaps="handled" // Permite fechar o teclado ao tocar fora dele
          showsVerticalScrollIndicator={false}
        >

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

            {/* CONTEÚDO QUE DESVANECE AO ALTERNAR AS TABS */}
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

              {/* BOTÃO DE SUBMISSÃO COM RENDERIZAÇÃO CONDICIONAL DE LOADING */}
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

              {/* LINKS ADICIONAIS CONSOANTE O SEPARADOR ATIVO */}
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