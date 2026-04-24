// Importação dos hooks do React (useState para gerir variáveis de estado)
import { useState } from 'react';
// Importação dos componentes base do React Native para construir a interface
import { Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Importação das nossas constantes de texto (Strings) para não termos texto "hardcoded"
import { Strings } from '../constants/Strings';
// Importação dos estilos separados para manter o ficheiro limpo
import { styles } from './styles/LoginScreenStyles';

export default function LoginScreen({ navigation }) {
  // --- GESTÃO DE ESTADO (STATE) ---
  // isLogin: Define se o utilizador está a ver o formulário de Login (true) ou Registo (false)
  const [isLogin, setIsLogin] = useState(true);
  
  // Variáveis para armazenar o que o utilizador escreve nos inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nif, setNif] = useState('');
  
  // Define o tipo de conta a criar por defeito (Vítima)
  const [userRole, setUserRole] = useState('vitima'); 

  // --- FUNÇÕES ---
  // Função que gere o clique no botão principal (Entrar ou Criar Conta)
  const handleAuthentication = () => {
    if (isLogin) {
      // Simulação de login - Mostra um alerta usando as nossas Strings centralizadas
      Alert.alert(Strings.login.simLoginTitle, Strings.login.simLoginMessage);
      // Redireciona para o dashboard principal
      navigation.navigate('VictimDashboard'); 
    } else {
      // Simulação de registo - Mostra alerta de sucesso com o tipo de conta
      Alert.alert(Strings.login.simRegistoTitle, Strings.login.simRegistoMessage(userRole));
      
      // Redirecionamento condicional: Vitimas vão para um lado, Socorristas para outro
      if (userRole === 'vitima') {
        navigation.navigate('VictimDashboard');
      } else {
        navigation.navigate('RescuerDashboard');
      }
    }
  };

  // --- INTERFACE (UI) ---
  return (
    // SafeAreaView garante que a app não fica escondida pelo "notch" do telemóvel
    <SafeAreaView style={styles.container}>
      
      {/* Logótipo provisório da App */}
      <View style={styles.placeholderLogo}>
        <Text style={{color: 'white', fontWeight: 'bold'}}>{Strings.appName}</Text>
      </View>
      
      {/* Abas superiores para alternar entre Login e Registo */}
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setIsLogin(true)} style={[styles.tab, isLogin && styles.activeTab]}>
          <Text style={{fontWeight: isLogin ? 'bold' : 'normal'}}>{Strings.login.tabLogin}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsLogin(false)} style={[styles.tab, !isLogin && styles.activeTab]}>
          <Text style={{fontWeight: !isLogin ? 'bold' : 'normal'}}>{Strings.login.tabRegister}</Text>
        </TouchableOpacity>
      </View>

      {/* Cartão principal com o formulário */}
      <View style={styles.card}>
        
        {/* Campo de Email (Sempre visível) */}
        <Text style={styles.label}>{Strings.login.emailLabel}</Text>
        <TextInput 
          style={styles.input} 
          placeholder={Strings.login.emailPlaceholder} 
          value={email} 
          onChangeText={setEmail} 
          autoCapitalize="none" // Evita que emails comecem com letra maiúscula
        />
        
        {/* Campos visíveis APENAS no formulário de Registo */}
        {!isLogin && (
          <>
            <Text style={styles.label}>{Strings.login.nifLabel}</Text>
            <TextInput 
              style={styles.input} 
              placeholder={Strings.login.nifPlaceholder} 
              keyboardType="numeric" // Abre o teclado de números
              value={nif} 
              onChangeText={setNif} 
            />
            
            {/* Seleção do Tipo de Conta (Vítima ou Socorrista) */}
            <Text style={styles.label}>{Strings.login.accountTypeLabel}</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity 
                style={[styles.roleButton, userRole === 'vitima' && styles.activeRoleVitima]} 
                onPress={() => setUserRole('vitima')}
              >
                <Text style={[styles.roleText, userRole === 'vitima' && styles.activeRoleText]}>
                  {Strings.login.roleVictim}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.roleButton, userRole === 'socorrista' && styles.activeRoleSocorrista]} 
                onPress={() => setUserRole('socorrista')}
              >
                <Text style={[styles.roleText, userRole === 'socorrista' && styles.activeRoleText]}>
                  {Strings.login.roleRescuer}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        
        {/* Campo de Password (Sempre visível) */}
        <Text style={styles.label}>{Strings.login.passwordLabel}</Text>
        <TextInput 
          style={styles.input} 
          placeholder={Strings.login.passwordPlaceholder} 
          secureTextEntry // Esconde os caracteres (***)
          value={password} 
          onChangeText={setPassword} 
        />

        {/* Repetir Password (Apenas no Registo) */}
        {!isLogin && (
          <>
            <Text style={styles.label}>{Strings.login.repeatPasswordLabel}</Text>
            <TextInput 
              style={styles.input} 
              placeholder={Strings.login.repeatPasswordPlaceholder} 
              secureTextEntry 
            />
          </>
        )}

        {/* Botão de Submissão */}
        <TouchableOpacity style={styles.mainButton} onPress={handleAuthentication}>
          <Text style={styles.mainButtonText}>
            {isLogin ? Strings.login.btnEnter : Strings.login.btnCreateAccount}
          </Text>
        </TouchableOpacity>

        {/* Link para recuperar password (Apenas no Login) */}
        {isLogin && (
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>{Strings.login.forgotPassword}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}