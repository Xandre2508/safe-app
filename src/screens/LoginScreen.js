import { useState } from 'react';
import { Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from './styles/LoginScreenStyles'; // Importação dos estilos

export default function LoginScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nif, setNif] = useState('');
  const [userRole, setUserRole] = useState('vitima'); 

  const handleAuthentication = () => {
    if (isLogin) {
      Alert.alert("Simulação de Login", "A verificar na Base de Dados... A redirecionar!");
      navigation.navigate('VictimDashboard'); 
    } else {
      Alert.alert("Simulação de Registo", `Conta de ${userRole} criada com sucesso!`);
      
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