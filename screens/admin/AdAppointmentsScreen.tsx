import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { notifyUpdates } from '../../data/sharedState';

type Appointment = {
  id: string;
  patientName: string;
  doctor: string;
  specialty: string;
  status: string;
  date: string;
  time: string;
  patientEmail?: string;
  patientPhone?: string;
  notes?: string;
  userName?: string;
  doctorName?: string;
};

type SortOption = 'dateAsc' | 'dateDesc';

const AdAppointmentsScreen = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOption, setSortOption] = useState<SortOption>('dateAsc');

  // Helper function to parse appointment dates consistently
  const parseAppointmentDate = (appointment: Appointment): number => {
    try {
      // Assuming date is in YYYY-MM-DD format and time is in HH:MM format
      const [year, month, day] = appointment.date.split('-');
      const [hours, minutes] = appointment.time.split(':');
      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      ).getTime();
    } catch (e) {
      console.error('Error parsing date:', e);
      return 0; // Fallback value
    }
  };

  const fetchAppointments = async () => {
    try {
      const storedAppointments = await AsyncStorage.getItem('appointments');
      if (storedAppointments) {
        const parsedAppointments = JSON.parse(storedAppointments);
        const validatedAppointments = parsedAppointments.map((app: any) => ({
          ...app,
          patientName: app.userName || app.patientName || 'Unknown Patient',
          doctor: app.doctorName || app.doctor || 'Unknown Doctor',
          specialty: app.specialty || 'General',
          status: app.status || 'Pending',
          date: app.date || new Date().toISOString().split('T')[0],
          time: app.time || '--:--',
          patientEmail: app.patientEmail || '',
          patientPhone: app.patientPhone || '',
          notes: app.notes || ''
        }));

        setAppointments(validatedAppointments);
        filterAppointments(validatedAppointments, searchQuery, statusFilter);
      } else {
        setAppointments([]);
        setFilteredAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      } finally {
        setRefreshing(false);
      }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments(appointments, searchQuery, statusFilter);
  }, [searchQuery, statusFilter, appointments, sortOption]);

const filterAppointments = (data: Appointment[], query: string, status: string) => {
  let filtered = data;

  if (status !== 'All') {
    filtered = filtered.filter(app => app.status.toLowerCase() === status.toLowerCase());
  }

  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(app =>
      app.patientName.toLowerCase().includes(lowerQuery) ||
      app.doctor.toLowerCase().includes(lowerQuery) ||
      app.specialty.toLowerCase().includes(lowerQuery) ||
      app.date.toLowerCase().includes(lowerQuery) ||
      app.time.toLowerCase().includes(lowerQuery)
    );
  }

  // Apply sorting
  filtered = [...filtered].sort((a, b) => {
    const dateA = parseAppointmentDate(a);
    const dateB = parseAppointmentDate(b);
    return sortOption === 'dateAsc' ? dateA - dateB : dateB - dateA;
  });

  setFilteredAppointments(filtered);
};

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const declineAppointment = (id: string) => {
    Alert.alert(
      'Confirm Decline',
      'Are you sure you want to decline this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const updatedAppointments = appointments.map(app =>
                app.id === id ? { ...app, status: 'Declined' } : app
              );
              await AsyncStorage.setItem('appointments', JSON.stringify(updatedAppointments));
              setAppointments(updatedAppointments);
              filterAppointments(updatedAppointments, searchQuery, statusFilter);
            } catch (error) {
              console.error('Error declining appointment:', error);
            }
          }
        }
      ]
    );
  };

  const approveAppointment = async (id: string) => {
  try {
    const appointmentToApprove = appointments.find(app => app.id === id);
    if (!appointmentToApprove) return;

    const updatedAppointments = appointments.map(app =>
      app.id === id ? { ...app, status: 'Confirmed' } : app
    );

    const storedDoctors = await AsyncStorage.getItem('doctors');
    if (storedDoctors) {
      const doctors = JSON.parse(storedDoctors);
      const doctorIndex = doctors.findIndex((d: any) => d.name === appointmentToApprove.doctor);
      
      if (doctorIndex !== -1) {
        if (!doctors[doctorIndex].bookings) {
          doctors[doctorIndex].bookings = {};
        }
        if (!doctors[doctorIndex].bookings[appointmentToApprove.date]) {
          doctors[doctorIndex].bookings[appointmentToApprove.date] = {};
        }
        
        doctors[doctorIndex].bookings[appointmentToApprove.date][appointmentToApprove.time] = {
          patientName: appointmentToApprove.patientName,
          patientEmail: appointmentToApprove.patientEmail,
          patientPhone: appointmentToApprove.patientPhone,
          notes: appointmentToApprove.notes
        };

        await AsyncStorage.setItem('doctors', JSON.stringify(doctors));
      }
    }

    await AsyncStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    setAppointments(updatedAppointments);
    filterAppointments(updatedAppointments, searchQuery, statusFilter);
    Alert.alert('Success', 'Appointment approved successfully');
    
    // Notify all subscribers that appointments were updated
    notifyUpdates();
  } catch (error) {
    console.error('Error approving appointment:', error);
    Alert.alert('Error', 'Failed to approve appointment');
  }
};

  const getStatusColor = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'declined': return '#F44336';
      case 'cancelled': return '#F44336';
      default: return '#2196F3';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const names = name.split(' ');
    return names.slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };

  const renderAppointmentItem = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(item.patientName)}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.patientName}>{item.patientName}</Text>
          <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Ionicons name="people" size={18} color="#6a11cb" style={styles.detailIcon} />
          <Text style={styles.detailText}>
            Appointment with <Text style={{ fontWeight: 'bold' }}>{item.doctor}</Text>
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="medkit" size={18} color="#6a11cb" style={styles.detailIcon} />
          <Text style={styles.detailText}>{item.specialty}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={18} color="#6a11cb" style={styles.detailIcon} />
          <Text style={styles.detailText}>
            {new Date(item.date).toLocaleDateString()} • {item.time}
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

        {item.notes && (
          <View style={styles.detailRow}>
            <Ionicons name="document-text" size={18} color="#6a11cb" style={styles.detailIcon} />
            <Text style={styles.detailText}>{item.notes}</Text>
          </View>
        )}
      </View>

      {item.status.toLowerCase() === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => approveAppointment(item.id)}
          >
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.declineButton}
            onPress={() => declineAppointment(item.id)}
          >
            <Ionicons name="close-circle" size={18} color="#fff" />
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#f8f9fa', '#e9f5ff']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Appointments</Text>
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={() => setSortOption(sortOption === 'dateAsc' ? 'dateDesc' : 'dateAsc')}
          >
            <Ionicons 
              name={sortOption === 'dateAsc' ? 'arrow-down' : 'arrow-up'} 
              size={20} 
              color="#6a11cb" 
            />
            <Text style={styles.sortButtonText}>
              {sortOption === 'dateAsc' ? 'Oldest' : 'Newest'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search appointments..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={styles.filterContainer}>
            {['All', 'Pending', 'Confirmed', 'Declined'].map(status => (
              <TouchableOpacity
                key={status}
                style={[styles.filterButton, statusFilter === status && styles.activeFilter]}
                onPress={() => setStatusFilter(status)}
              >
                <Text style={styles.filterButtonText}>{status}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <FlatList
          data={filteredAppointments}
          renderItem={renderAppointmentItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
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
              <Text style={styles.emptySubtext}>Pull down to refresh</Text>
            </View>
          }
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  background: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  refreshButton: {
    padding: 8
  },
  searchContainer: {
    marginBottom: 8
  },
  searchInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 8
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#ddd'
  },
  activeFilter: {
    backgroundColor: '#6a11cb'
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  listContainer: {
    paddingBottom: 100
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6a11cb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  headerText: {
    flex: 1
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    color: '#fff',
    fontSize: 12,
    marginTop: 4
  },
  detailsContainer: {
    marginTop: 8
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  detailIcon: {
    marginRight: 6
  },
  detailText: {
    fontSize: 14,
    color: '#333'
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8
  },
  approveButtonText: {
    color: '#fff',
    marginLeft: 6
  },
  declineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  declineButtonText: {
    color: '#fff',
    marginLeft: 6
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 4
  },
  sortButton: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 8,
  backgroundColor: '#f0e6ff',
  borderRadius: 20,
},
sortButtonText: {
  marginLeft: 4,
  color: '#6a11cb',
  fontWeight: 'bold',
}
});

export default AdAppointmentsScreen;