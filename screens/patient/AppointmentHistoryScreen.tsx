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
import { Swipeable } from 'react-native-gesture-handler';

import { AppointmentsStackParamList } from '../../navigation/AppointmentsStackNavigator';

type NavigationProp = StackNavigationProp<AppointmentsStackParamList, 'Appointments'>;
type RouteProps = RouteProp<AppointmentsStackParamList, 'Appointments'>;

type Appointment = {
  id: string;
  userId: string;
  doctorId: string;
  doctorName: string;
  specialty?: string;
  date: string;
  time: string;
  status?: 'pending' | 'approved' | 'canceled';
};

const AppointmentsScreen: React.FC = () => {
  const [removedAppointments, setRemovedAppointments] = useState<string[]>([]);

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

      const userAppointments = allAppointments.filter(
        (appt) => appt.userId === currentUser.id
      );

      setAppointments(userAppointments);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    }
  };

  const renderRightActions = (id: string) => {
  return (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => {
        setAppointments((prev) => prev.filter((appt) => appt.id !== id));
      }}
    >
      <Ionicons name="close-outline" size={30} color="#fff" />
      <Text style={styles.deleteButtonText}>Remove</Text>
    </TouchableOpacity>
  );
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

            const updatedAll = allAppointments.map((item: Appointment) =>
              item.id === id ? { ...item, status: 'canceled' } : item
            );

            const updatedUserAppointments = updatedAll.filter(
              (item: Appointment) => item.userId === currentUser?.id
            );

            await AsyncStorage.setItem('appointments', JSON.stringify(updatedAll));
            setAppointments(updatedUserAppointments);
          } catch (error) {
            console.error('Failed to cancel appointment:', error);
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

  const handleBookAppointment = () => {
    navigation.navigate('Home');
  };

  const getStatusColor = (status?: string) => {
    switch(status) {
      case 'approved': return '#28a745';
      case 'canceled': return '#dc3545';
      case 'pending': 
      default: 
        return '#ffc107';
    }
  };

  const renderItem = ({ item }: { item: Appointment }) => (
  <Swipeable
    renderRightActions={() => renderRightActions(item.id)}
    overshootRight={false}
  >
    <View style={styles.card}>
      <Text style={styles.title}>{item.doctorName}</Text>
      <Text style={styles.specialty}>{item.specialty}</Text>
      <Text style={styles.datetime}>
        {item.date} at {item.time}
      </Text>
      <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
        {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Pending'}
      </Text>

      {(item.status !== 'approved' && item.status !== 'canceled') && (
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
      )}
    </View>
  </Swipeable>
);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1 }}>
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons 
                name="calendar-outline" 
                size={64} 
                color="#888" 
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>No appointments yet</Text>
              <TouchableOpacity 
                style={styles.bookButton}
                onPress={handleBookAppointment}
              >
                <Text style={styles.bookButtonText}>Book an Appointment</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        />
      </View>
    </SafeAreaView>
  );
};

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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 8,
  },
  bookButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    // Ensure the button takes full height of the card
    marginVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default AppointmentsScreen;
