import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import AdminTabs from './navigation/AdminTabs';
import PatientTabs from './navigation/PatientTabNavigator';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="AdminTabs" component={AdminTabs} />
        <Stack.Screen name="PatientTabs" component={PatientTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;