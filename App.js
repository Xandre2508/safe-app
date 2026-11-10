import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from './src/firebaseConfig';
import { initializeNotificationService } from './src/services/notifications';

// Telas da aplicação
import AdminDashboard from './src/screens/AdminDashboard';
import AuthScreen from './src/screens/AuthScreen';
import OperatorDashboard from './src/screens/OperatorDashboard';
import ProfileScreen from './src/screens/ProfileScreen';
import RescuerDashboard from './src/screens/RescuerDashboard';
import VictimDashboard from './src/screens/VictimDashboard';

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Configura os canais de notificações e permissões para Android
    initializeNotificationService();

    // Verificação de sessão persistida do utilizador
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const role = userDoc.data().role;
            if (role === 'socorrista') setInitialRoute('RescuerDashboard');
            else if (role === 'operador') setInitialRoute('OperatorDashboard');
            else if (role === 'organizacao') setInitialRoute('AdminDashboard');
            else setInitialRoute('VictimDashboard');
          } else {
            setInitialRoute('Login');
          }
        } else {
          setInitialRoute('Login');
        }
      } catch (error) {
        console.warn('[App] Erro ao recuperar sessão do utilizador:', error);
        setInitialRoute('Login');
      } finally {
        setIsInitializing(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (isInitializing || !initialRoute) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color="#E63946" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="dark" translucent backgroundColor="transparent" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
              headerShown: false,
              animation: 'default',
            }}
          >
            <Stack.Screen name="Login" component={AuthScreen} />
            <Stack.Screen name="VictimDashboard" component={VictimDashboard} />
            <Stack.Screen name="RescuerDashboard" component={RescuerDashboard} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            <Stack.Screen name="OperatorDashboard" component={OperatorDashboard} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
