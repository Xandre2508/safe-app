import { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  
  // Estados para guardar os dados do formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nif, setNif] = useState('');
  
  // Estado crucial para a Base de Dados: define o tipo de utilizador no Registo
  const [userRole, setUserRole] = useState('vitima'); 

  // Função que vai lidar com a Base de Dados (Por agora, simula o processo)
  const handleAuthentication = () => {
    if (isLogin) {
      // Aqui entrará o código do Firebase para fazer Login.
      // Por agora, vamos simular que a base de dados devolveu que é uma vítima.
      // Quando tivermos a BD, ela vai ler o 'role' do utilizador e decidir.
      Alert.alert("Simulação de Login", "A verificar na Base de Dados... A redirecionar!");
      navigation.navigate('VictimDashboard'); 
    } else {
      // Aqui entrará o código do Firebase para fazer o Registo (gravar email, pass, NIF e o userRole)
      Alert.alert("Simulação de Registo", `Conta de ${userRole} criada com sucesso!`);
      
      // Depois de registar, enviamos para o dashboard correspondente
      if (userRole === 'vitima') {
        navigation.navigate('VictimDashboard');
      } else {
        navigation.navigate('RescuerDashboard');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.placeholderLogo}>
        <Text style={{color: 'white', fontWeight: 'bold'}}>S.A.F.E. LOGO</Text>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setIsLogin(true)} style={[styles.tab, isLogin && styles.activeTab]}>
          <Text style={{fontWeight: isLogin ? 'bold' : 'normal'}}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsLogin(false)} style={[styles.tab, !isLogin && styles.activeTab]}>
          <Text style={{fontWeight: !isLogin ? 'bold' : 'normal'}}>Registo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Email:</Text>
        <TextInput style={styles.input} placeholder="Email..." value={email} onChangeText={setEmail} autoCapitalize="none" />
        
        {!isLogin && (
          <>
            <Text style={styles.label}>NIF:</Text>
            <TextInput style={styles.input} placeholder="NIF..." keyboardType="numeric" value={nif} onChangeText={setNif} />
            
            <Text style={styles.label}>Tipo de Conta:</Text>
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
        
        <Text style={styles.label}>Password:</Text>
        <TextInput style={styles.input} placeholder="Password..." secureTextEntry value={password} onChangeText={setPassword} />

        {!isLogin && (
          <>
            <Text style={styles.label}>Repetir Password:</Text>
            <TextInput style={styles.input} placeholder="Repetir Password..." secureTextEntry />
          </>
        )}

        {/* AGORA TEMOS APENAS UM BOTÃO DINÂMICO */}
        <TouchableOpacity style={styles.mainButton} onPress={handleAuthentication}>
          <Text style={styles.mainButtonText}>{isLogin ? 'Entrar' : 'Criar Conta'}</Text>
        </TouchableOpacity>

        {isLogin && (
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Esqueceu-se da password?</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  placeholderLogo: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#1C3E5A', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 25, marginBottom: 20, padding: 5 },
  tab: { paddingVertical: 10, paddingHorizontal: 30, borderRadius: 20 },
  activeTab: { backgroundColor: '#E0EEF5' },
  card: { width: '85%', backgroundColor: '#FFF', padding: 25, borderRadius: 15, elevation: 5 },
  label: { fontSize: 12, marginBottom: 5, color: '#333', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#EEE', borderRadius: 8, marginBottom: 15, padding: 10, backgroundColor: '#FAFAFA' },
  
  // Estilos da escolha de tipo de conta no registo
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  roleButton: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#DDD', borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  activeRoleVitima: { backgroundColor: '#333', borderColor: '#333' },
  activeRoleSocorrista: { backgroundColor: '#2E8B57', borderColor: '#2E8B57' },
  roleText: { color: '#555', fontWeight: 'bold' },
  activeRoleText: { color: '#FFF' },

  // Botão principal único
  mainButton: { backgroundColor: '#333', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  mainButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  
  forgotPassword: { textAlign: 'center', marginTop: 15, fontSize: 12, textDecorationLine: 'underline' }
});