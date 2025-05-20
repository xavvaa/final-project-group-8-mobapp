import React, { useState, useCallback, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { AppointmentsStackParamList } from '../../navigation/AppointmentsStackNavigator';

type NavigationProp = StackNavigationProp<AppointmentsStackParamList, 'Appointments'>;
type RouteProps = RouteProp<AppointmentsStackParamList, 'Appointments'>;

type Appointment = {
  id: string;
  userId: string;       // ✅ NEW
  doctorId: string;
  doctorName: string;
  specialty?: string;
  date: string;
  time: string;
  status?: 'pending' | 'approved' | 'canceled';
};

const AppointmentsScreen: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();

  const loadAppointments = async () => {
    try {
      const currentUserData = await AsyncStorage.getItem('currentUser');
      const storedAppointments = await AsyncStorage.getItem('appointments');

      if (!currentUserData) return;

      const currentUser = JSON.parse(currentUserData);
      const allAppointments: Appointment[] = storedAppointments
        ? JSON.parse(storedAppointments)
        : [];

      // ✅ Filter only current user's appointments
      const userAppointments = allAppointments.filter(
        (appt) => appt.userId === currentUser.id
      );

      setAppointments(userAppointments);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    }
  };

  const deleteAppointment = (id: string) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const currentUserData = await AsyncStorage.getItem('currentUser');
              const currentUser = currentUserData ? JSON.parse(currentUserData) : null;

              const saved = await AsyncStorage.getItem('appointments');
              const allAppointments = saved ? JSON.parse(saved) : [];

              const updatedAll = allAppointments.filter(
                (item: Appointment) => item.id !== id
              );

              const updatedUserAppointments = updatedAll.filter(
                (item: Appointment) => item.userId === currentUser?.id
              );

              await AsyncStorage.setItem('appointments', JSON.stringify(updatedAll));
              setAppointments(updatedUserAppointments);
            } catch (error) {
              console.error('Failed to delete appointment:', error);
            }
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, [])
  );

  useEffect(() => {
    if (route.params?.updated) {
      loadAppointments();
    }
  }, [route.params]);

  const handleEdit = (appointment: Appointment) => {
    navigation.navigate('RescheduleAppointment', {
      oldAppointment: appointment,
    });
  };

  const getStatusColor = (status?: string) => {
    switch(status) {
      case 'approved': return '#28a745';  // green
      case 'canceled': return '#dc3545';  // red
      case 'pending': 
      default: 
        return '#ffc107'; // yellow/orange for pending or undefined
    }
  };

  const renderItem = ({ item }: { item: Appointment }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.doctorName}</Text>
      <Text style={styles.specialty}>{item.specialty}</Text>
      <Text style={styles.datetime}>
        {item.date} at {item.time}
      </Text>
      <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
        {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Pending'}
      </Text>
  
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editBtn}>
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.actionText}>Reschedule</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteAppointment(item.id)} style={styles.cancelBtn}>
          <Ionicons name="trash-outline" size={18} color="#fff" />
          <Text style={styles.actionText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1 }}>
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No appointments yet.</Text>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </SafeAreaView>
  );
};

export default AppointmentsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    paddingTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  datetime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
  },
  cancelBtn: {
    flexDirection: 'row',
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
  },
  editBtn: {
    flexDirection: 'row',
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 16,
    color: '#888',
  },
  statusText: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 8,
  },
  
});
