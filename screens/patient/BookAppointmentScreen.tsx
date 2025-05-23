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
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions'

// Define types for your navigation params
type RootStackParamList = {
  DoctorBooking: { doctor: Doctor };
  // other screens...
};

type DoctorBookingScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'DoctorBooking'
>;

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  bio?: string;
  unavailableDates?: Record<string, boolean>;
  timeSlots: string[];
};

type Appointment = {
  id: string;
  userId: string;
  userName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  patientEmail: string;
  patientPhone: string;
  notes: string;
  status: string;
};

const DoctorBookingScreen: React.FC<DoctorBookingScreenProps> = ({
  route,
  navigation,
}) => {
  const { doctor } = route.params;

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  useEffect(() => {
  (async () => {
    if (Platform.OS !== 'web') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission required',
          'Enable notifications to receive booking confirmations.'
        );
      }
    }
  })();
}, []);

useEffect(() => {
  const loadAppointments = async () => {
    try {
      const currentUserData = await AsyncStorage.getItem('currentUser');
      if (!currentUserData) return;

      const currentUser = JSON.parse(currentUserData);
      const saved = await AsyncStorage.getItem('appointments');
      const allAppointments: Appointment[] = saved ? JSON.parse(saved) : [];

      const userAppointments = allAppointments.filter(
        (appt) => appt.userId === currentUser.id
      );

      setAppointments(userAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };
  loadAppointments();
}, []);


  const getMarkedDates = (): Record<string, any> => {
    const marked: Record<string, any> = {};

    // Disable past dates
    const today = moment().format('YYYY-MM-DD');

    // Mark unavailable doctor dates
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

    // Disable past dates for 1 year back to 1 year forward
    const startDate = moment().subtract(1, 'years');
    const endDate = moment().add(1, 'years');
    for (let m = startDate.clone(); m.isBefore(endDate); m.add(1, 'days')) {
      const dateStr = m.format('YYYY-MM-DD');
      if (moment(dateStr).isBefore(today, 'day')) {
        marked[dateStr] = {
          disabled: true,
          disableTouchEvent: true,
        };
      }
    }

    // Mark selected date
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

  try {
    const currentUserData = await AsyncStorage.getItem('currentUser');
    if (!currentUserData) {
      Alert.alert('Error', 'No user logged in.');
      return;
    }

    const currentUser = JSON.parse(currentUserData);

    const saved = await AsyncStorage.getItem('appointments');
    const allAppointments: Appointment[] = saved ? JSON.parse(saved) : [];

    const isDuplicate = allAppointments.some(
      (appt) =>
        appt.userId === currentUser.id &&
        appt.doctorId === doctor.id &&
        appt.date === selectedDate
    );

    if (isDuplicate) {
      Alert.alert(
        'Duplicate Booking',
        `You have already booked Dr. ${doctor.name} on ${selectedDate}.`
      );
      return;
    }

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      date: selectedDate,
      time: selectedTime,
      patientEmail: currentUser.email || '',
      patientPhone: currentUser.phone || '',
      notes: '',
      status: 'Pending',
    };

    const updatedAppointments = [...allAppointments, newAppointment];

    await AsyncStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    setAppointments(
      updatedAppointments.filter((appt) => appt.userId === currentUser.id)
    );

    // --- Save admin notification ---
    const adminNotificationsRaw = await AsyncStorage.getItem('adminNotifications');
    const adminNotifications = adminNotificationsRaw ? JSON.parse(adminNotificationsRaw) : [];

    const newNotification = {
      id: Date.now().toString(),
      title: 'New Appointment Booking',
      message: `User ${currentUser.name} booked Dr. ${doctor.name} on ${selectedDate} at ${selectedTime}.`,
      read: false,
      timestamp: new Date().toISOString(),
    };

    const updatedNotifications = [newNotification, ...adminNotifications];
    await AsyncStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));
    // ------------------------------

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Booking Sent! ✅",
        body: `Appointment with Dr. ${doctor.name} on ${selectedDate} at ${selectedTime} is successfully sent!.`,
        sound: true,
      },
      trigger: null, // Immediate notification
    });

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
            onDayPress={(day: DateData) => {
              if (
                !doctor.unavailableDates?.[day.dateString] &&
                !moment(day.dateString).isBefore(moment(), 'day')
              ) {
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
                doctor.timeSlots.map((time: string) => (
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
