import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AdminDashboardStack from '../navigation/AdminDashboardStack';
import DoctorsScreen from '../screens/admin/DoctorsScreen';
import AppointmentsScreen from '../screens/admin/AdAppointmentsScreen';
import PatientsScreen from '../screens/admin/AdPatientsScreen';
import MoreScreen from '../screens/admin/MoreScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

const AdminTabs = () => {
  const navigation = useNavigation();

 const handleLogout = async () => {
  try {
    await AsyncStorage.multiRemove(['currentUser', 'authToken']); 
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  } catch (error) {
    console.error('Failed to logout properly', error);
  }
};


  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

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
            case 'Log out':
              iconName = focused ? 'log-out' : 'log-out-outline';
              break;
            default:
              iconName = 'help';
          }

          return (
            <Ionicons
              name={iconName as keyof typeof Ionicons.glyphMap}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: '#007BFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardStack} />
      <Tab.Screen name="Doctors" component={DoctorsScreen} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Patients" component={PatientsScreen} />
      <Tab.Screen
        name="Log out"
        component={MoreScreen}
        listeners={{
          tabPress: (e) => {
            e.preventDefault(); 
            Alert.alert('Logout', 'Are you sure you want to logout?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Logout',
                style: 'destructive',
                onPress: handleLogout,
              },
            ]);
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminTabs;
