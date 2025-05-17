// navigation/PatientTabNavigator.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import PatientHomeScreen from '../screens/patient/PatientHomeScreen';
import AppointmentsScreen from '../screens/patient/AppointmentHistoryScreen';
import NotificationsScreen from '../screens/patient/NotificationsScreen';
import AppointmentHistoryScreen from '../screens/patient/AppointmentHistoryScreen';
import PatientProfileScreen from '../screens/patient/PatientProfileScreen';
import PatientStackNavigator from './PatientStackNavigator';
import AppointmentsStackNavigator from './AppointmentsStackNavigator';

const Tab = createBottomTabNavigator();

const PatientTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string = '';

          switch (route.name) {
            case 'Home':
              iconName = 'home-outline';
              break;
            case 'Appointments':
              iconName = 'calendar-outline';
              break;
            case 'Notifications':
              iconName = 'notifications-outline';
              break;
            case 'History':
              iconName = 'time-outline';
              break;
            case 'Profile':
              iconName = 'person-outline';
              break;
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007BFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={PatientStackNavigator} />
      <Tab.Screen name="History" component={AppointmentsStackNavigator} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={PatientProfileScreen} />
    </Tab.Navigator>
  );
};

export default PatientTabNavigator;
