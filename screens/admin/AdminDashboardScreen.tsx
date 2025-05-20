import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const AdminDashboardScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    activeDoctors: 2, // still hardcoded unless you have a source
    registeredPatients: 0
  });

  useFocusEffect(
    useCallback(() => {
      const fetchStats = async () => {
        try {
          const appointmentsData = await AsyncStorage.getItem('appointments');
          const usersData = await AsyncStorage.getItem('registeredUsers');
  
          const appointments = appointmentsData ? JSON.parse(appointmentsData) : [];
          const users = usersData ? JSON.parse(usersData) : [];
  
          const patientUsers = users.filter(u => u.role === 'patient' || !u.role);
  
          setStats({
            todayAppointments: appointments.length,
            activeDoctors: 2,
            registeredPatients: patientUsers.length
          });
        } catch (error) {
          console.error("Error loading dashboard stats:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchStats();
    }, [])
  );
  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }


  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={26} color="#4a90e2" />
          </TouchableOpacity>
        </View>

        {/* Main Cards */}
        <View style={styles.cardsContainer}>
          {/* Appointments Card */}
          <TouchableOpacity 
            style={[styles.card, styles.appointmentsCard]}
            onPress={() => navigation.navigate('Appointments')}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="calendar" size={24} color="#fff" />
              <Text style={styles.cardTitle}>Appointments</Text>
            </View>
            <Text style={styles.cardValue}>{stats.todayAppointments}</Text>
            <Text style={styles.cardSubtitle}>Today's Appointments</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardActionText}>View All →</Text>
            </View>
          </TouchableOpacity>

          {/* Doctors Info Card */}
          <TouchableOpacity 
            style={[styles.card, styles.doctorsCard]}
            onPress={() => navigation.navigate('Doctors')}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="medkit" size={24} color="#fff" />
              <Text style={styles.cardTitle}>Doctors</Text>
            </View>
            <Text style={styles.cardValue}>{stats.activeDoctors}</Text>
            <Text style={styles.cardSubtitle}>Active Doctors</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardActionText}>Manage →</Text>
            </View>
          </TouchableOpacity>

          {/* Patient Records Card */}
          <TouchableOpacity 
            style={[styles.card, styles.patientsCard]}
            onPress={() => navigation.navigate('Patients')}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="people" size={24} color="#fff" />
              <Text style={styles.cardTitle}>Patients</Text>
            </View>
            <Text style={styles.cardValue}>{stats.registeredPatients}</Text>
            <Text style={styles.cardSubtitle}>Registered Patients</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardActionText}>View Records →</Text>
            </View>
          </TouchableOpacity>
        </View>

    
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  cardsContainer: {
    marginBottom: 30,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appointmentsCard: {
    backgroundColor: '#4a90e2',
  },
  doctorsCard: {
    backgroundColor: '#6a11cb',
  },
  patientsCard: {
    backgroundColor: '#4CAF50',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 12,
  },
  cardValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 12,
  },
  cardActionText: {
    color: '#fff',
    fontWeight: '600',
  },
  quickActions: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
});

export default AdminDashboardScreen;