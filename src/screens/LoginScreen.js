// Importação de hooks do React para gerir o estado (dados que podem mudar) do componente
import { useState } from 'react';
// Importação de componentes visuais do React Native
// SafeAreaView: Garante que o conteúdo não fica escondido atrás das bordas/notches dos telemóveis
// Alert: Para mostrar pop-ups nativos do sistema
import { Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
// Importação do ficheiro de estilos separado (Clean Code)
import { styles } from './styles/LoginScreenStyles';

export default function LoginScreen({ navigation }) {
  // --- ESTADOS DO COMPONENTE ---
  // isLogin: Controla se estamos no ecrã de Login (true) ou de Registo (false)
  const [isLogin, setIsLogin] = useState(true);
  
  // Variáveis para guardar o que o utilizador escreve nos campos de texto
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nif, setNif] = useState('');
  
  // userRole: Define que tipo de conta está a ser criada (vitima por defeito)
  const [userRole, setUserRole] = useState('vitima'); 

  // --- FUNÇÕES ---
  // Função que é chamada ao clicar no botão "Entrar" ou "Criar Conta"
  const handleAuthentication = () => {
    if (isLogin) {
      // SIMULAÇÃO: Num cenário real, aqui irias chamar a tua API ou Firebase para validar o login
      Alert.alert("Simulação de Login", "A verificar na Base de Dados... A redirecionar!");
      // Após o login, redireciona para o dashboard da vítima (podes depois adaptar para verificar o tipo de user)
      navigation.navigate('VictimDashboard'); 
    } else {
      // SIMULAÇÃO: Registo de uma nova conta
      Alert.alert("Simulação de Registo", `Conta de ${userRole} criada com sucesso!`);
      
      // Redirecionamento condicional baseado no tipo de conta escolhida no registo
      if (userRole === 'vitima') {
        navigation.navigate('VictimDashboard');
      } else {
        navigation.navigate('RescuerDashboard');
      }
    }
  };

  // --- INTERFACE DE UTILIZADOR (UI) ---
  return (
    <SafeAreaView style={styles.container}>
      {/* Logótipo da Aplicação (Atualmente um espaço reservado) */}
      <View style={styles.placeholderLogo}>
        <Text style={{color: 'white', fontWeight: 'bold'}}>S.A.F.E. LOGO</Text>
      </View>
      
      {/* Botões superiores para alternar entre "Login" e "Registo" */}
      <View style={styles.tabContainer}>
        {/* TouchableOpacity é usado em vez de Button porque permite maior personalização de estilo */}
        <TouchableOpacity onPress={() => setIsLogin(true)} style={[styles.tab, isLogin && styles.activeTab]}>
          <Text style={{fontWeight: isLogin ? 'bold' : 'normal'}}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsLogin(false)} style={[styles.tab, !isLogin && styles.activeTab]}>
          <Text style={{fontWeight: !isLogin ? 'bold' : 'normal'}}>Registo</Text>
        </TouchableOpacity>
      </View>

      {/* Cartão principal que contém o formulário */}
      <View style={styles.card}>
        <Text style={styles.label}>Email:</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Email..." 
          value={email} 
          onChangeText={setEmail} 
          autoCapitalize="none" // Evita que a primeira letra fique maiúscula automaticamente (útil para emails)
        />
        
        {/* Se NÃO estivermos no login (ou seja, estamos no Registo), mostramos os campos extra */}
        {!isLogin && (
          <>
            <Text style={styles.label}>NIF:</Text>
            <TextInput 
              style={styles.input} 
              placeholder="NIF..." 
              keyboardType="numeric" // Abre o teclado numérico
              value={nif} 
              onChangeText={setNif} 
            />
            
            <Text style={styles.label}>Tipo de Conta:</Text>
            {/* Escolha do tipo de utilizador (Vítima ou Socorrista) */}
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
        <TextInput 
          style={styles.input} 
          placeholder="Password..." 
          secureTextEntry // Oculta o texto digitado (ex: ******)
          value={password} 
          onChangeText={setPassword} 
        />

        {/* Campo de repetição de password apenas visível no Registo */}
        {!isLogin && (
          <>
            <Text style={styles.label}>Repetir Password:</Text>
            <TextInput style={styles.input} placeholder="Repetir Password..." secureTextEntry />
          </>
        )}

        {/* Botão de submissão do formulário */}
        <TouchableOpacity style={styles.mainButton} onPress={handleAuthentication}>
          <Text style={styles.mainButtonText}>{isLogin ? 'Entrar' : 'Criar Conta'}</Text>
        </TouchableOpacity>

        {/* Link de recuperação de password apenas visível no Login */}
        {isLogin && (
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Esqueceu-se da password?</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}