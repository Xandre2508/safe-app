import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { auth, db } from '../firebaseConfig';
import styles from '../styles/AuthScreenStyles';

export default function AuthScreen({ navigation }) {
  // Estados do formulário
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [nif, setNif] = useState('');
  const [password, setPassword] = useState('');

  // Animações de entrada e alternância
  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const entryOpacity = useRef(new Animated.Value(0)).current;
  const switchFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animação inicial ao abrir o ecrã
    Animated.sequence([
      Animated.delay(300),
      Animated.timing(logoTranslateY, {
        toValue: -200,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(entryOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [entryOpacity, logoTranslateY]);

  const toggleAuth = (type) => {
    if ((type === 'login' && isLogin) || (type === 'register' && !isLogin)) return;

    Animated.timing(switchFade, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setIsLogin(type === 'login');
      setNome('');
      setNif('');
      setPassword('');

      Animated.timing(switchFade, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert('Recuperação de Palavra-passe', 'Por favor, introduza o seu email no campo de texto.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      Alert.alert('Sucesso', `Enviámos um link de redefinição para: ${trimmedEmail}`);
    } catch (error) {
      console.warn('[AuthScreen] Erro no reset de password:', error);
      Alert.alert('Erro', 'Não foi possível enviar o email de recuperação. Verifique se o endereço é válido.');
    }
  };

  const handleAuthentication = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (isLogin) {
      if (!cleanEmail || !cleanPassword) {
        Alert.alert('Campos Obrigatórios', 'Preencha o email e a palavra-passe.');
        return;
      }
    } else {
      if (!nome.trim() || !cleanEmail || !nif.trim() || !cleanPassword) {
        Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os campos do registo.');
        return;
      }
      if (cleanPassword.length < 6) {
        Alert.alert('Segurança', 'A palavra-passe deve conter pelo menos 6 caracteres.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        const user = userCredential.user;

        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const role = userData.role;

          if (role === 'vitima') navigation.replace('VictimDashboard');
          else if (role === 'socorrista') navigation.replace('RescuerDashboard');
          else if (role === 'operador') navigation.replace('OperatorDashboard');
          else if (role === 'organizacao') navigation.replace('AdminDashboard');
          else navigation.replace('VictimDashboard');
        } else {
          Alert.alert('Perfil Incompleto', 'Conta autenticada mas sem registo de perfil. Contacte o suporte.');
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
          nome: nome.trim(),
          email: cleanEmail,
          nif: nif.trim(),
          role: 'vitima',
          createdAt: new Date().toISOString(),
        });

        Alert.alert('Bem-vindo ao S.A.F.E.', 'A sua conta de cidadão foi criada com sucesso.');
        navigation.replace('VictimDashboard');
      }
    } catch (error) {
      console.warn('[AuthScreen] Erro de autenticação:', error);
      let errorMessage = 'Ocorreu um erro no acesso ao sistema.';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este endereço de email já se encontra registado.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'O formato do email introduzido é inválido.';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Credenciais incorretas. Verifique o email e a palavra-passe.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Falha de comunicação. Verifique a sua ligação à internet.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiadas tentativas consecutivas. Tente novamente mais tarde.';
          break;
        default:
          if (error.message) errorMessage = error.message;
      }

      Alert.alert('Erro de Acesso', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1, width: '100%' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logótipo Animado */}
          <Animated.View style={[styles.logoContainer, { transform: [{ translateY: logoTranslateY }] }]}>
            <Image source={require('../assets/SAFE_LOGO.png')} style={styles.logo} resizeMode="contain" />
          </Animated.View>

          {/* Cartão de Autenticação */}
          <Animated.View style={[styles.formContainer, { opacity: entryOpacity }]}>
            {/* Seletor Login / Registo */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, isLogin && styles.activeTab]}
                onPress={() => toggleAuth('login')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Iniciar Sessão</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, !isLogin && styles.activeTab]}
                onPress={() => toggleAuth('register')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Novo Registo</Text>
              </TouchableOpacity>
            </View>

            {/* Conteúdo do Formulário */}
            <Animated.View style={{ width: '100%', opacity: switchFade, alignItems: 'center' }}>
              <Text style={styles.title}>
                {isLogin ? 'Bem-vindo ao Sistema S.A.F.E.' : 'Registo de Cidadão'}
              </Text>

              {!isLogin && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Nome Completo"
                    placeholderTextColor="#999"
                    value={nome}
                    onChangeText={setNome}
                    autoCapitalize="words"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Número de Identificação Fiscal (NIF)"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    maxLength={9}
                    value={nif}
                    onChangeText={setNif}
                  />
                </>
              )}

              <TextInput
                style={styles.input}
                placeholder="Endereço de Email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Palavra-passe"
                placeholderTextColor="#999"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity
                style={styles.button}
                onPress={handleAuthentication}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>{isLogin ? 'Entrar' : 'Criar Conta de Cidadão'}</Text>
                )}
              </TouchableOpacity>

              {isLogin ? (
                <TouchableOpacity onPress={handleForgotPassword} style={{ paddingVertical: 8 }}>
                  <Text style={styles.linkText}>Esqueceu-se da palavra-passe?</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.linkText}>Ao registar-se, aceita os Termos e Condições do Serviço S.A.F.E.</Text>
              )}
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
