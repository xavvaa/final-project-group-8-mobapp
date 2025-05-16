import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PatientHomeScreen from '../screens/patient/PatientHomeScreen';
import DoctorDetailsScreen from '../screens/patient/DoctorDetailsScreen';
import BookAppointmentScreen from '../screens/patient/BookAppointmentScreen';
import AppointmentsScreen from '../screens/patient/AppointmentHistoryScreen';
import RescheduleAppointmentScreen from '../screens/patient/RescheduleAppointmentScreen'; // Import your new screen

export type PatientStackParamList = {
  Home: undefined;
  DoctorDetails: { doctor: any };
  BookAppointment: {
    doctor: any;
    editing?: boolean;
    oldAppointment?: any;
  };
  Appointments: undefined; // Added Appointments screen (no params)
  RescheduleAppointment: {
    oldAppointment: any; // The appointment object to reschedule
  };
};

const Stack = createStackNavigator<PatientStackParamList>();

const PatientStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={PatientHomeScreen} />
      <Stack.Screen name="DoctorDetails" component={DoctorDetailsScreen} />
      <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
      <Stack.Screen name="Appointments" component={AppointmentsScreen} />
      <Stack.Screen name="RescheduleAppointment" component={RescheduleAppointmentScreen} />
    </Stack.Navigator>
  );
};

export default PatientStackNavigator;
