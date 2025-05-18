import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, SafeAreaView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const UserDoctorListScreen = ({ navigation }) => {
  const [username, setUsername] = useState('User');
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await AsyncStorage.getItem('doctors');
        if (data) {
          const docs = JSON.parse(data);
          setDoctors(docs);
          setFilteredDoctors(docs);
        }
        const savedUsername = await AsyncStorage.getItem('username');
        if (savedUsername) setUsername(savedUsername);

        const savedAppointments = await AsyncStorage.getItem('appointments');
        if (savedAppointments) setAppointments(JSON.parse(savedAppointments));
      } catch (e) {
        console.error('Failed to load data', e);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredDoctors(doctors);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredDoctors(
        doctors.filter(doc => 
          doc.name.toLowerCase().includes(term) ||
          doc.specialty.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, doctors]);

  const getNextAppointment = () => {
    if (!appointments.length) return null;
    const now = new Date();
    const sorted = appointments
      .map(app => ({
        ...app,
        datetime: new Date(`${app.date}T${app.time}:00`),
      }))
      .filter(app => app.datetime > now)
      .sort((a, b) => a.datetime - b.datetime);
    return sorted[0] || null;
  };

  const nextAppointment = getNextAppointment();

  const getDoctorAvatar = (name) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    return (
      <LinearGradient
        colors={['#6a11cb', '#2575fc']}
        style={styles.avatar}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.avatarText}>{initials}</Text>
      </LinearGradient>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f8f9fa', '#e9f5ff']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Hello,</Text>
            <Text style={styles.usernameText}>{username}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#6a11cb" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search doctors..."
            placeholderTextColor="#999"
            value={searchTerm}
            onChangeText={setSearchTerm}
            clearButtonMode="while-editing"
          />
        </View>

        <Text style={styles.sectionTitle}>Available Doctors</Text>

        <FlatList
          data={filteredDoctors}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.doctorCard}
              onPress={() => navigation.navigate('BookAppointment', { doctor: item })}
            >
              {getDoctorAvatar(item.name)}
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>Dr. {item.name}</Text>
                <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFC107" />
                  <Text style={styles.ratingText}>4.8</Text>
                  <Text style={styles.experienceText}> • 5+ years experience</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </TouchableOpacity>
          )}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  background: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'sans-serif',
  },
  usernameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    fontFamily: 'sans-serif-medium',
  },
  notificationButton: {
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
  upcomingCard: {
    backgroundColor: '#6a11cb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#6a11cb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  noAppointmentCard: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  upcomingTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  upcomingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upcomingDetails: {
    marginLeft: 16,
  },
  upcomingDoctor: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  upcomingSpecialty: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  upcomingTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upcomingDateTime: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
  },
  noAppointmentText: {
    color: '#888',
    marginTop: 8,
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 30,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  doctorInfo: {
    flex: 1,
    marginLeft: 16,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  doctorSpecialty: {
    color: '#666',
    fontSize: 14,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#333',
    fontSize: 13,
    marginLeft: 4,
  },
  experienceText: {
    color: '#888',
    fontSize: 13,
  },
});

export default UserDoctorListScreen;