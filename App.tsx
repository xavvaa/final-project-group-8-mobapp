import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import PatientHomeScreen from './screens/patient/PatientHomeScreen';
import AdminScreen from './screens/admin/AdminScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  PatientHome: undefined;
  AdminHome: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PatientHome"
          component={PatientHomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminHome"
          component={AdminScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
