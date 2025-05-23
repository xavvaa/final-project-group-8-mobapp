import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { globalStyles } from '../../globalStyles';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

type Doctor = {
  id: string;
  name: string;
  specialty: string;
};

type Appointment = {
  id: string;
  doctorId: string;
  date: string; // e.g. "2025-05-23"
  time: string; // e.g. "14:30"
};

type RootStackParamList = {
  PatientHome: undefined;
  Notifications: undefined;
  BookAppointment: { doctor: Doctor };
};

type PatientHomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PatientHome'
>;

type Props = {
  navigation: PatientHomeScreenNavigationProp;
};

const PatientHomeScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState<string>('User');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load doctors data
        const data = await AsyncStorage.getItem('doctors');
        if (data) {
          const docs: Doctor[] = JSON.parse(data);
          setDoctors(docs);
          setFilteredDoctors(docs);
        }

        // Load currentUser and set username
        const storedUser = await AsyncStorage.getItem('currentUser');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUsername(user.username || 'User');
        }

        // Load appointments
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
        doctors.filter(
          (doc) =>
            doc.name.toLowerCase().includes(term) ||
            doc.specialty.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, doctors]);

  const getNextAppointment = (): Appointment | null => {
    if (!appointments.length) return null;
    const now = new Date();
    const sorted = appointments
      .map((app) => ({
        ...app,
        datetime: new Date(`${app.date}T${app.time}:00`),
      }))
      .filter((app) => app.datetime > now)
      .sort((a, b) => a.datetime.getTime() - b.datetime.getTime());
    return sorted[0] || null;
  };

  const nextAppointment = getNextAppointment();

  const getDoctorAvatar = (name: string) => {
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
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
    <SafeAreaView style={[globalStyles.safeArea, styles.container]}>
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
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color="#6a11cb" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#888"
            style={styles.searchIcon}
          />
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
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.doctorCard}
              onPress={() => navigation.navigate('BookAppointment', { doctor: item })}
            >
              {getDoctorAvatar(item.name)}
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{item.name}</Text>
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
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
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
    color: '#333',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 100,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#444',
    fontWeight: '600',
  },
  experienceText: {
    fontSize: 14,
    color: '#444',
  },
});

export default PatientHomeScreen;
