import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import DoctorsScreen from '../screens/admin/DoctorsScreen';
import AppointmentsScreen from '../screens/admin/AdAppointmentsScreen';
import PatientsScreen from '../screens/admin/AdPatientsScreen';
import MoreScreen from '../screens/admin/MoreScreen';

const Tab = createBottomTabNavigator();

const AdminTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'speedometer' : 'speedometer-outline';
              break;
            case 'Doctors':
              iconName = focused ? 'medkit' : 'medkit-outline';
              break;
            case 'Appointments':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Patients':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'More':
              iconName = focused ? 'menu' : 'menu-outline';
              break;
            default:
              iconName = 'help';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007BFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Doctors" component={DoctorsScreen} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Patients" component={PatientsScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
};

export default AdminTabs;