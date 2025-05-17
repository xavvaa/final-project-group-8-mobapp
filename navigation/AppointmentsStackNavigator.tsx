import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AppointmentsScreen from '../screens/patient/AppointmentHistoryScreen';
import RescheduleAppointmentScreen from '../screens/patient/RescheduleAppointmentScreen';


export type AppointmentsStackParamList = {
  Appointments: undefined;
  RescheduleAppointment: {
    oldAppointment: any;
  };
};

const Stack = createStackNavigator<AppointmentsStackParamList>();

const AppointmentsStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Appointments" component={AppointmentsScreen} />
      <Stack.Screen name="RescheduleAppointment" component={RescheduleAppointmentScreen} />

      
    </Stack.Navigator>
  );
};

export default AppointmentsStackNavigator;
