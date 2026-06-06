import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importação dos nossos ecrãs
import AdminDashboard from './src/screens/AdminDashboard';
import AuthScreen from './src/screens/AuthScreen';
import OperatorDashboard from './src/screens/OperatorDashboard';
import ProfileScreen from './src/screens/ProfileScreen';
import RescuerDashboard from './src/screens/RescuerDashboard';
import VictimDashboard from './src/screens/VictimDashboard';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      {/* O screenOptions aqui já esconde o cabeçalho para TODOS os ecrãs */}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        <Stack.Screen name="Login" component={AuthScreen} />
        <Stack.Screen name="VictimDashboard" component={VictimDashboard} />
        <Stack.Screen name="RescuerDashboard" component={RescuerDashboard} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="OperatorDashboard" component={OperatorDashboard} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}