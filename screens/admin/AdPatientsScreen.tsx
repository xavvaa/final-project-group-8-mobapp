import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

interface Patient {
  id: string;
  username: string;
  name: string;
  email: string;
  contactNumber: string;
  address: string;
  birthday: string;
  registrationDate: string;
}

const AdPatientsScreen = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPatients = async () => {
    try {
      const storedPatients = await AsyncStorage.getItem('registeredUsers');
      console.log('Stored patients data:', storedPatients); // Debug log
      
      if (storedPatients) {
        const parsedPatients = JSON.parse(storedPatients);
        console.log('Parsed patients:', parsedPatients); // Debug log
        setPatients(parsedPatients);
      } else {
        console.log('No patients found in storage');
        setPatients([]);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      Alert.alert('Error', 'Failed to load patients');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPatients();
  };

  const deletePatient = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this patient?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const updatedPatients = patients.filter(patient => patient.id !== id);
              await AsyncStorage.setItem('registeredUsers', JSON.stringify(updatedPatients));
              setPatients(updatedPatients);
            } catch (error) {
              console.error('Error deleting patient:', error);
              Alert.alert('Error', 'Failed to delete patient');
            }
          },
        },
      ]
    );
  };

  const renderPatientItem = ({ item }: { item: Patient }) => (
    <View style={styles.patientCard}>
      <View style={styles.patientHeader}>
        <Text style={styles.patientName}>{item.name}</Text>
        <TouchableOpacity onPress={() => deletePatient(item.id)}>
          <Ionicons name="trash" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.detailRow}>
        <Ionicons name="person" size={16} color="#666" />
        <Text style={styles.detailText}>@{item.username}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Ionicons name="mail" size={16} color="#666" />
        <Text style={styles.detailText}>{item.email}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Ionicons name="call" size={16} color="#666" />
        <Text style={styles.detailText}>{item.contactNumber}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Ionicons name="home" size={16} color="#666" />
        <Text style={styles.detailText}>{item.address}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Ionicons name="calendar" size={16} color="#666" />
        <Text style={styles.detailText}>
          Born: {new Date(item.birthday).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.detailRow}>
        <Ionicons name="time" size={16} color="#666" />
        <Text style={styles.detailText}>
          Registered: {new Date(item.registrationDate).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Patient Records</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color="#4a90e2" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={patients}
        renderItem={renderPatientItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4a90e2']}
            tintColor="#4a90e2"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={50} color="#cccccc" />
            <Text style={styles.emptyText}>No patients registered yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    padding: 15,
  },
  patientCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});

export default AdPatientsScreen;