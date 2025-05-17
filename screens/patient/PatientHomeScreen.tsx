import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect} from '@react-navigation/native';

const mockDoctors = [
  { id: '1', name: 'Dr. Ana Cruz', specialization: 'Retina Specialist' },
  { id: '2', name: 'Dr. Mateo Santos', specialization: 'Pediatric Ophthalmologist' },
  { id: '3', name: 'Dr. Liza Ramos', specialization: 'Cataract Specialist' },
];

const PatientHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('Patient');
  const [search, setSearch] = useState('');
  const [appointments, setAppointments] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        const name = await AsyncStorage.getItem('userName');
        if (name) setUserName(name);
      };
  
      const loadAppointments = async () => {
        try {
          const data = await AsyncStorage.getItem('appointments');
          const parsed = data ? JSON.parse(data) : [];
          setAppointments(parsed);
        } catch (err) {
          console.error('Failed to load appointments:', err);
        }
      };
  
      loadUser();
      loadAppointments();
    }, [])
  );
  

  const filteredDoctors = mockDoctors.filter((doc) =>
    doc.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.greeting}>Hi, {userName} 👋</Text>
        <Text style={styles.subGreeting}>Search for an Eye Doctor</Text>

        <TextInput
          placeholder="Search doctors..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />

        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.appointmentCard}>
              <Text style={styles.cardDoctor}>{item.doctor}</Text>
              <Text style={styles.cardDate}>{item.date}</Text>
            </View>
          )}
        />

        <Text style={styles.sectionTitle}>Available Doctors</Text>
       <FlatList
  data={filteredDoctors}
  keyExtractor={(item) => item.id}
  showsVerticalScrollIndicator={false}
  renderItem={({ item }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      onPress={() => navigation.navigate('DoctorDetails', { doctor: item })}
    >
      <Text style={styles.cardDoctor}>{item.name}</Text>
      <Text style={styles.cardDate}>{item.specialization}</Text>
    </TouchableOpacity>
  )}
/>



      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  container: {
    padding: 20,
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subGreeting: {
    fontSize: 16,
    marginBottom: 20,
    color: '#555',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 10,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginRight: 15,
    elevation: 2,
  },
  doctorCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e3e3e3',
  },
  cardDoctor: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardDate: {
    color: '#666',
    fontSize: 14,
    marginTop: 5,
  },
});

export default PatientHomeScreen;
