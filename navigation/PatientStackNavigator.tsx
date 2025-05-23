import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PatientHomeScreen from '../screens/patient/PatientHomeScreen';
import BookAppointmentScreen from '../screens/patient/BookAppointmentScreen';
import AppointmentsScreen from '../screens/patient/AppointmentHistoryScreen';
import RescheduleAppointmentScreen from '../screens/patient/RescheduleAppointmentScreen';

export type PatientStackParamList = {
  Home: undefined;
  DoctorDetails: { doctor: any };
  BookAppointment: {
    doctor: any;
    editing?: boolean;
    oldAppointment?: any;
  };
  Appointments: undefined;
  RescheduleAppointment: { oldAppointment: any };
  RescheduleHome: { oldAppointment: any };
};

const Stack = createStackNavigator<PatientStackParamList>();

const PatientStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={PatientHomeScreen} />
      <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
      <Stack.Screen name="RescheduleAppointment" component={RescheduleAppointmentScreen} />
      <Stack.Screen name="Appointments" component={AppointmentsScreen} />
    </Stack.Navigator>
  );
};

export default PatientStackNavigator;
