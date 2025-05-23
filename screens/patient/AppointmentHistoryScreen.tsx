import React, { useState, useCallback, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { globalStyles } from '../../globalStyles';
import { parseISO, format } from 'date-fns';
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
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  notes?: string;
};

const AppointmentsScreen: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();

  const loadAppointments = async () => {
    try {
      setRefreshing(true);
      const currentUserData = await AsyncStorage.getItem('currentUser');
      const storedAppointments = await AsyncStorage.getItem('appointments');

      if (!currentUserData) return;

      const currentUser = JSON.parse(currentUserData);
      const allAppointments: Appointment[] = storedAppointments
        ? JSON.parse(storedAppointments)
        : [];

      const userAppointments = allAppointments
        .filter((appt) => appt.userId === currentUser.id)
        .map(appt => ({
          ...appt,
          patientName: currentUser.name || 'Patient',
          patientEmail: currentUser.email,
          patientPhone: currentUser.phone,
          status: appt.status || 'pending'
        }));

      setAppointments(userAppointments);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setRefreshing(false);
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
              const updatedAppointments = appointments.map(app =>
                app.id === id ? { ...app, status: 'canceled' } : app
              );
              await AsyncStorage.setItem('appointments', JSON.stringify(updatedAppointments));
              setAppointments(updatedAppointments);
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

  const handleRefresh = () => {
    loadAppointments();
  };

  const handleEdit = (appointment: Appointment) => {
    navigation.navigate('RescheduleAppointment', {
      oldAppointment: appointment,
    });
  };

  const handleBookAppointment = () => {
    navigation.navigate('Home');
  };

  const getStatusColor = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'declined': return '#F44336';
      case 'canceled': return '#F44336';
      default: return '#2196F3';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const names = name.split(' ');
    return names.slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };

  const renderItem = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(item.patientName)}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.patientName}>{item.patientName}</Text>
          <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Pending'}
          </Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Ionicons name="people" size={18} color="#6a11cb" style={styles.detailIcon} />
          <Text style={styles.detailText}>
            Appointment with <Text style={{ fontWeight: 'bold' }}>{item.doctorName}</Text>
          </Text>
        </View>

        {item.specialty && (
          <View style={styles.detailRow}>
            <Ionicons name="medkit" size={18} color="#6a11cb" style={styles.detailIcon} />
            <Text style={styles.detailText}>{item.specialty}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={18} color="#6a11cb" style={styles.detailIcon} />
          <Text style={styles.detailText}>
            {item.date} • {item.time}
          </Text>
        </View>

        {item.patientEmail && (
          <View style={styles.detailRow}>
            <Ionicons name="mail" size={18} color="#6a11cb" style={styles.detailIcon} />
            <Text style={styles.detailText}>{item.patientEmail}</Text>
          </View>
        )}

        {item.patientPhone && (
          <View style={styles.detailRow}>
            <Ionicons name="call" size={18} color="#6a11cb" style={styles.detailIcon} />
            <Text style={styles.detailText}>{item.patientPhone}</Text>
          </View>
        )}
      </View>

      {item.status !== 'canceled' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEdit(item)}
          >
            <Ionicons name="create-outline" size={18} color="#fff" />
            <Text style={styles.editButtonText}>Reschedule</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => deleteAppointment(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color="#fff" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[globalStyles.safeArea, styles.safeArea]}>
      <LinearGradient
        colors={['#f8f9fa', '#e9f5ff']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Appointments</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search appointments..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContainer}
          >
            {['All', 'Pending', 'Confirmed', 'Canceled'].map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton, 
                  statusFilter === status && styles.activeFilter,
                  { marginRight: 8 }
                ]}
                onPress={() => setStatusFilter(status)}
              >
                <Text style={styles.filterButtonText}>{status}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={appointments.filter(app => 
            statusFilter === 'All' || 
            app.status?.toLowerCase() === statusFilter.toLowerCase()
          )}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#6a11cb"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No appointments found</Text>
              <TouchableOpacity 
                style={styles.bookButton}
                onPress={handleBookAppointment}
              >
                <Text style={styles.bookButtonText}>Book New Appointment</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={styles.listContainer}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  background: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    marginTop: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 8,
  },
  filterScrollContainer: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ddd',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#6a11cb',
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 20,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6a11cb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerText: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailIcon: {
    marginRight: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  editButtonText: {
    color: '#fff',
    marginLeft: 6,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#fff',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
  },
  bookButton: {
    backgroundColor: '#6a11cb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default AppointmentsScreen;