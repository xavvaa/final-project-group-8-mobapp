import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';


const DoctorBookingScreen = ({ route, navigation }) => {
  const { doctor } = route.params;

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const saved = await AsyncStorage.getItem('appointments');
        if (saved) {
          setAppointments(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading appointments:', error);
      }
    };
    loadAppointments();
  }, []);

  const getMarkedDates = () => {
    const marked = {};

    if (doctor.unavailableDates) {
      Object.keys(doctor.unavailableDates).forEach((date) => {
        marked[date] = {
          disabled: true,
          disableTouchEvent: true,
          marked: true,
          dotColor: 'red',
        };
      });
    }

    if (selectedDate && !marked[selectedDate]) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: '#6C63FF',
      };
    }

    return marked;
  };

  const confirmBooking = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Missing Information', 'Please select both a date and a time slot.');
      return;
    }
  
    // Check for duplicate booking on the same date for the same doctor
    const isDuplicate = appointments.some(
      (appt) => appt.doctorId === doctor.id && appt.date === selectedDate
    );
  
    if (isDuplicate) {
      Alert.alert(
        'Duplicate Booking',
        `You have already booked Dr. ${doctor.name} on ${selectedDate}.`
      );
      return;
    }
  
    const newAppointment = {
      id: Date.now().toString(),
      doctorId: doctor.id,
      doctorName: doctor.name,
      date: selectedDate,
      time: selectedTime,
    };
  
    const updatedAppointments = [...appointments, newAppointment];
  
    try {
      await AsyncStorage.setItem('appointments', JSON.stringify(updatedAppointments));
      setAppointments(updatedAppointments);
      Alert.alert(
        'Success',
        `Appointment booked with Dr. ${doctor.name} on ${selectedDate} at ${selectedTime}`
      );
      setModalVisible(false);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Could not save the appointment. Please try again.');
      console.error(error);
    }
  };
  
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F2F5FA' }}>
      <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
  <Ionicons name="arrow-back" size={24} color="#4a90e2" />
  <Text style={styles.backText}>Back to Doctors</Text>
</TouchableOpacity>



        <View style={styles.card}>
          <Text style={styles.doctorName}>Dr. {doctor.name}</Text>
          <Text style={styles.specialty}>{doctor.specialty}</Text>
          <Text style={styles.bio}>{doctor.bio || 'No bio available.'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select a Date</Text>
          <Calendar
            onDayPress={(day) => {
              if (!doctor.unavailableDates?.[day.dateString]) {
                setSelectedDate(day.dateString);
                setSelectedTime('');
              }
            }}
            markedDates={getMarkedDates()}
            theme={{
              todayTextColor: '#6C63FF',
              arrowColor: '#6C63FF',
              selectedDayBackgroundColor: '#6C63FF',
              textDayFontWeight: '600',
            }}
            style={styles.calendar}
          />
        </View>

        {selectedDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏰ Select a Time Slot</Text>
            <View style={styles.timeSlotsContainer}>
              {doctor.timeSlots.length === 0 ? (
                <Text style={{ color: '#777' }}>No available time slots.</Text>
              ) : (
                doctor.timeSlots.map((time) => (
                  <TouchableOpacity
                    key={time}
                    onPress={() => setSelectedTime(time)}
                    style={[
                      styles.timeSlot,
                      selectedTime === time && styles.timeSlotSelected,
                    ]}
                  >
                    <Text
                      style={
                        selectedTime === time
                          ? styles.timeSlotTextSelected
                          : styles.timeSlotText
                      }
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.bookButton,
            (!selectedDate || !selectedTime) && styles.bookButtonDisabled,
          ]}
          disabled={!selectedDate || !selectedTime}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>

        {/* Confirmation Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirm Booking</Text>
              <Text style={styles.modalInfo}>Doctor: Dr. {doctor.name}</Text>
              <Text style={styles.modalInfo}>Date: {selectedDate}</Text>
              <Text style={styles.modalInfo}>Time: {selectedTime}</Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={[styles.modalButton, styles.cancelButton]}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={confirmBooking}
                  style={[styles.modalButton, styles.confirmButton]}
                >
                  <Text style={{ color: 'white' }}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#F2F5FA',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  backText: {
    color: '#4a90e2',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  doctorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  specialty: {
    fontSize: 18,
    color: '#666',
    marginVertical: 4,
  },
  bio: {
    fontSize: 15,
    color: '#444',
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  calendar: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeSlot: {
    borderWidth: 1,
    borderColor: '#6C63FF',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  timeSlotSelected: {
    backgroundColor: '#6C63FF',
  },
  timeSlotText: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  timeSlotTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#b9b6f3',
  },
  bookButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    elevation: 5,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 12,
    color: '#222',
  },
  modalInfo: {
    fontSize: 16,
    marginVertical: 4,
    color: '#444',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  confirmButton: {
    backgroundColor: '#6C63FF',
  },
});

export default DoctorBookingScreen;
