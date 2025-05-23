// navigation/AdminDashboardStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdNotificationScreen from '../screens/admin/AdNotificationScreen'; // or wherever it's located

export type AdminDashboardStackParamList = {
  DashboardHome: undefined;
  Notifications: undefined;
};

const Stack = createStackNavigator<AdminDashboardStackParamList>();

const AdminDashboardStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={AdminDashboardScreen} />
      <Stack.Screen name="Notifications" component={AdNotificationScreen} />
    </Stack.Navigator>
  );
};

export default AdminDashboardStack;
