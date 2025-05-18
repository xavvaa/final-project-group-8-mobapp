import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const AdAppointmentsScreen = () => {
  const [appointments, setAppointments] = useState<Array<any>>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = async () => {
    try {
      const storedAppointments = await AsyncStorage.getItem('appointments');
      if (storedAppointments) {
        const parsedAppointments = JSON.parse(storedAppointments);
        // Ensure all appointments have required fields
        const validatedAppointments = parsedAppointments.map((app: any) => ({
          id: app.id || '',
          patientName: app.patientName || 'Unknown Patient',
          status: app.status || 'Pending',
          doctor: app.doctor || 'Unknown Doctor',
          specialty: app.specialty || 'General',
          date: app.date || new Date().toISOString(),
          time: app.time || '--:--',
          patientEmail: app.patientEmail || '',
          patientPhone: app.patientPhone || '',
          notes: app.notes || ''
        }));
        setAppointments(validatedAppointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const cancelAppointment = (id: string) => {
    Alert.alert(
      'Confirm Cancellation',
      'Are you sure you want to cancel this appointment?',
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const updatedAppointments = appointments.filter(app => app.id !== id);
              await AsyncStorage.setItem('appointments', JSON.stringify(updatedAppointments));
              setAppointments(updatedAppointments);
              Alert.alert('Success', 'Appointment cancelled successfully');
            } catch (error) {
              console.error('Error cancelling appointment:', error);
              Alert.alert('Error', 'Failed to cancel appointment');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch((status || '').toLowerCase()) {
      case 'confirmed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'cancelled':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const names = name.split(' ');
    return names
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const renderAppointmentItem = ({ item }: { item: any }) => (
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
          <Ionicons name="person" size={18} color="#6a11cb" style={styles.detailIcon} />
          <Text style={styles.detailText}>Dr. {item.doctor}</Text>
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

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => cancelAppointment(item.id)}
        >
          <Ionicons name="close-circle" size={18} color="#fff" />
          <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
        </TouchableOpacity>
      </View>
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
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <Ionicons name="refresh" size={24} color="#6a11cb" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={appointments}
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
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  refreshButton: {
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6a11cb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerText: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },
  detailsContainer: {
    marginVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    marginRight: 10,
    width: 24,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 15,
    color: '#555',
    flex: 1,
  },
  actionButtons: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#ff4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 8,
  },
});

export default AdAppointmentsScreen;