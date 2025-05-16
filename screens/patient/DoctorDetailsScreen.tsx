import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Importing Ionicons for the back button icon

const DoctorDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { doctor } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Doctor Profile Picture (Optional) */}
        <View style={styles.profilePictureContainer}>
          <Image 
            source={{ uri: doctor.profilePicture }} // Ensure doctor has profilePicture property
            style={styles.profilePicture}
          />
        </View>

        {/* Doctor's Name */}
        <Text style={styles.name}>{doctor.name}</Text>

        {/* Doctor's Specialization */}
        <Text style={styles.specialization}>{doctor.specialization}</Text>

        {/* Doctor's Bio */}
        <Text style={styles.bio}>
          👁️ Specialist in various eye conditions. Provides comprehensive consultation and care.
        </Text>

        {/* Book Appointment Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('BookAppointment', { doctor })}
        >
          <Text style={styles.buttonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA', // Set the background color for the whole screen
    marginTop: 0, // Remove any extra margin from the top (fixes the color separation)
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff', // Ensures the container has a white background
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingBottom: 40,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#007BFF',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  specialization: {
    fontSize: 18,
    color: '#007BFF',
    textAlign: 'center',
    marginBottom: 15,
  },
  bio: {
    fontSize: 16,
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DoctorDetailsScreen;
