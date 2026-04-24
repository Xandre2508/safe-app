import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importação dos nossos ecrãs
import LoginScreen from './src/screens/LoginScreen';
import RescuerDashboard from './src/screens/RescuerDashboard';
import VictimDashboard from './src/screens/VictimDashboard';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="VictimDashboard" component={VictimDashboard} />
        <Stack.Screen name="RescuerDashboard" component={RescuerDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}