import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { auth, db, createStaffAccount } from '../firebaseConfig';
import ProfileFloatingButton from '../components/Perfil_Geral/ProfileFloatingButton';
import { styles } from '../styles/AdminDashboardStyles';

export default function AdminDashboard({ navigation }) {
  const [orgName, setOrgName] = useState('A carregar...');
  const [nomeProfissional, setNomeProfissional] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [novoCargo, setNovoCargo] = useState('socorrista');
  const [loading, setLoading] = useState(false);

  // Carregar dados da organização associada ao administrador
  useEffect(() => {
    let isMounted = true;

    const fetchOrgData = async () => {
      try {
        if (auth.currentUser) {
          const orgDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (orgDoc.exists() && isMounted) {
            const data = orgDoc.data();
            setOrgName(data.organizacao || data.nome || 'Organização Central');
          }
        }
      } catch (error) {
        console.warn('[AdminDashboard] Erro ao carregar dados da organização:', error);
      }
    };

    fetchOrgData();

    // Tratamento do botão físico de voltar no Android
    const onBackPress = () => {
      handleLogout();
      return true;
    };

    const backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      isMounted = false;
      backHandlerSubscription.remove();
    };
  }, []);

  // Criar novo utilizador (Socorrista ou Operador) sem perder a sessão de Administrador
  const handleCreateStaff = async () => {
    const cleanNome = nomeProfissional.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanNome || !cleanEmail || !cleanPassword) {
      Alert.alert('Dados Incompletos', 'Preencha o nome, email e palavra-passe do profissional.');
      return;
    }

    if (cleanPassword.length < 6) {
      Alert.alert('Palavra-passe Curta', 'A palavra-passe temporária deve conter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      // Criação segura através de instância secundária sem terminar sessão do Admin
      const newUser = await createStaffAccount(cleanEmail, cleanPassword);

      // Registo na base de dados Firestore com associação direta à organização do Admin
      await setDoc(doc(db, 'users', newUser.uid), {
        nome: cleanNome,
        email: cleanEmail,
        role: novoCargo,
        organizacao: orgName,
        createdAt: new Date().toISOString(),
      });

      Alert.alert(
        'Sucesso',
        `Conta de ${novoCargo === 'socorrista' ? 'Socorrista' : 'Operador'} criada com sucesso para ${cleanNome}.`
      );

      setNomeProfissional('');
      setEmail('');
      setPassword('');
    } catch (error) {
      console.warn('[AdminDashboard] Erro ao criar profissional:', error);
      let msg = error.message;
      if (error.code === 'auth/email-already-in-use') {
        msg = 'Este endereço de email já se encontra em uso.';
      }
      Alert.alert('Erro ao Criar Profissional', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Terminar Sessão', 'Deseja sair do Painel de Administração?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            navigation.replace('Login');
          } catch (err) {
            console.warn('[AdminDashboard] Erro ao terminar sessão:', err);
            navigation.replace('Login');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ProfileFloatingButton onPress={() => navigation.navigate('ProfileScreen')} top={15} />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <Text style={styles.mainTitle}>Painel de Gestão e Controlo</Text>
            <Text style={styles.orgText}>
              Organização: <Text style={styles.orgNameHighlight}>{orgName}</Text>
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Registar Novo Operacional</Text>

            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  novoCargo === 'socorrista' ? styles.activeSocorrista : styles.inactiveToggle,
                ]}
                onPress={() => setNovoCargo('socorrista')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.toggleText,
                    novoCargo === 'socorrista' && styles.activeToggleText,
                  ]}
                >
                  Socorrista
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  novoCargo === 'operador' ? styles.activeOperador : styles.inactiveToggle,
                ]}
                onPress={() => setNovoCargo('operador')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.toggleText,
                    novoCargo === 'operador' && styles.activeToggleText,
                  ]}
                >
                  Operador de Central
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nome do Profissional"
              placeholderTextColor="#95A5A6"
              value={nomeProfissional}
              onChangeText={setNomeProfissional}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Email Institucional"
              placeholderTextColor="#95A5A6"
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Palavra-passe Temporária (mín. 6 caracteres)"
              placeholderTextColor="#95A5A6"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateStaff}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Criar Credenciais de Acesso</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
            <Text style={styles.logoutButtonText}>Encerrar Sessão</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
