import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import AdminScreen from './screens/admin/AdminScreen';
import PatientTabNavigator from './navigation/PatientTabNavigator'; // 👈 Import Tab Navigator

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  PatientTabs: undefined; // 👈 Rename from PatientHome
  AdminHome: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="PatientTabs" component={PatientTabNavigator} />
        <Stack.Screen name="AdminHome" component={AdminScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
