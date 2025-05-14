import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import AdminDashboard from '../screens/admin/AdminScreen';
import PatientHome from '../screens/patient/PatientHomeScreen';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator>
      {user.role === 'admin' ? (
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="PatientHome" component={PatientHome} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
