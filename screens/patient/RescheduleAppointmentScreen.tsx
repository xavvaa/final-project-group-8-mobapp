import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppointmentsStackParamList } from '../../navigation/AppointmentsStackNavigator';
import { globalStyles } from '../../globalStyles';

type RescheduleNavigationProp = StackNavigationProp<AppointmentsStackParamList, 'RescheduleAppointment'>;
type RescheduleRouteProp = RouteProp<AppointmentsStackParamList, 'RescheduleAppointment'>;

type Appointment = {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty?: string;
  date: string;
  time: string;
};

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  timeSlots: string[];
  unavailableDates: { [date: string]: boolean };
};

const RescheduleAppointmentScreen: React.FC = () => {
  const navigation = useNavigation<RescheduleNavigationProp>();
  const route = useRoute<RescheduleRouteProp>();
  const { oldAppointment } = route.params;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState(oldAppointment.date);
  const [selectedTime, setSelectedTime] = useState(oldAppointment.time);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchDoctorInfo = async () => {
      try {
        const doctorsData = await AsyncStorage.getItem('doctors');
        const doctors: Doctor[] = doctorsData ? JSON.parse(doctorsData) : [];
        const currentDoctor = doctors.find((doc) => doc.id === oldAppointment.doctorId);
        if (currentDoctor) setDoctor(currentDoctor);
      } catch (error) {
        console.error('Error fetching doctor:', error);
      }
    };

    fetchDoctorInfo();
  }, []);

  // Helper: Check if selectedDate is today or later
  const isDateValid = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // start of today

    const selected = new Date(dateStr);
    selected.setHours(0, 0, 0, 0);

    return selected >= today;
  };

  // Mark dates including disabling past dates
  const getMarkedDates = () => {
    const marked: { [key: string]: any } = {};

    if (doctor?.unavailableDates) {
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

  const handleReschedule = async () => {
    // Validate selected date and time before confirming
    if (!selectedDate || !selectedTime) {
      Alert.alert('Invalid Selection', 'Please select both a date and time.');
      return;
    }

    if (!isDateValid(selectedDate)) {
      Alert.alert('Invalid Date', 'Selected date is in the past. Please select a valid date.');
      return;
    }

    try {
      const data = await AsyncStorage.getItem('appointments');
      let appointments: Appointment[] = data ? JSON.parse(data) : [];

      const updatedAppointments = appointments.map((appt) =>
        appt.id === oldAppointment.id
          ? { ...appt, date: selectedDate, time: selectedTime }
          : appt
      );

      await AsyncStorage.setItem('appointments', JSON.stringify(updatedAppointments));

      setModalVisible(false); // Hide modal immediately

      Alert.alert('Success', 'Appointment rescheduled successfully.', [
        { text: 'OK', onPress: () => navigation.replace('Appointments', { updated: true }) },
      ]);
    } catch (error) {
      console.error('Failed to reschedule appointment:', error);
      Alert.alert('Error', 'Could not update the appointment.');
    }
  };

  if (!doctor) {
    return (
      <SafeAreaView style={[globalStyles.safeArea, styles.safeArea]}>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>Loading doctor info...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[globalStyles.safeArea, styles.safeArea]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Reschedule Appointment</Text>

        <Text style={styles.label}>Doctor</Text>
        <Text style={styles.value}>Dr. {doctor.name}</Text>

        <Text style={styles.label}>Specialty</Text>
        <Text style={styles.value}>{doctor.specialty || 'N/A'}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select a New Date</Text>
          <Calendar
            onDayPress={(day) => {
              if (
                !doctor.unavailableDates?.[day.dateString] &&
                isDateValid(day.dateString)
              ) {
                setSelectedDate(day.dateString);
                setSelectedTime('');
              }
            }}
            markedDates={getMarkedDates()}
            minDate={new Date().toISOString().split('T')[0]} // Disable past dates here
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
            <Text style={styles.sectionTitle}>Select a New Time Slot</Text>
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
            styles.button,
            (!selectedDate || !selectedTime || !isDateValid(selectedDate)) && styles.buttonDisabled,
          ]}
          disabled={!selectedDate || !selectedTime || !isDateValid(selectedDate)}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}>Confirm Reschedule</Text>
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
              <Text style={styles.modalTitle}>Confirm Reschedule</Text>
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
                  onPress={handleReschedule}
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

export default RescheduleAppointmentScreen;

// ... styles unchanged

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F5FA',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  section: {
    marginTop: 20,
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
  button: {
    marginTop: 24,
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#b9b6f3',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
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
