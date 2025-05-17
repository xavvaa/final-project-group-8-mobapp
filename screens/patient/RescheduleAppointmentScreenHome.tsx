import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { CommonActions } from '@react-navigation/native';

const availableTimeSlots = [
  '09:00 AM',
  '10:30 AM',
  '01:00 PM',
  '02:30 PM',
  '04:00 PM',
];

const RescheduleAppointmentScreenHome: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { oldAppointment, fromScreen } = route.params as { oldAppointment: any, fromScreen: 'Home' | 'Appointments' };


  const [selectedDate, setSelectedDate] = useState<string>(oldAppointment.date);
  const [selectedTime, setSelectedTime] = useState<string>(oldAppointment.time);

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Validation Error', 'Please select both a new date and time.');
      return;
    }
  
    try {
      const stored = await AsyncStorage.getItem('appointments');
      const appointments = stored ? JSON.parse(stored) : [];
  
      const updatedAppointments = appointments.map((appt: any) =>
        appt.id === oldAppointment.id
          ? { ...appt, date: selectedDate, time: selectedTime }
          : appt
      );
  
      await AsyncStorage.setItem('appointments', JSON.stringify(updatedAppointments));
  
      Alert.alert('Success', 'Appointment rescheduled successfully.');
  
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Home', params: { updated: true } }],
        })
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to reschedule appointment.');
      console.error(error);
    }
  };
  

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Reschedule Appointment</Text>
          </View>

          {/* Doctor Info */}
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>Dr. {oldAppointment.doctor}</Text>
            <Text style={styles.doctorSpecialty}>{oldAppointment.specialty}</Text>
          </View>

          {/* Date Picker */}
          <Text style={styles.label}>Select New Date</Text>
          <Calendar
            minDate={new Date().toISOString().split('T')[0]}
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              setSelectedTime(''); // reset time when date changes
            }}
            markedDates={{
              [selectedDate]: {
                selected: true,
                marked: true,
                selectedColor: '#007BFF',
              },
            }}
            theme={{
              selectedDayBackgroundColor: '#007BFF',
              todayTextColor: '#007BFF',
              arrowColor: '#007BFF',
            }}
            style={{ borderRadius: 12, marginBottom: 10 }}
          />

          {/* Time Slots */}
          {selectedDate ? (
            <>
              <Text style={styles.label}>Select New Time</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 10 }}
              >
                {availableTimeSlots.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeSlot,
                      selectedTime === time && styles.selectedTime,
                    ]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        selectedTime === time && { color: '#fff' },
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : (
            <Text style={styles.note}>Please select a date to choose time slots.</Text>
          )}

          {/* Confirm Button */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              !(selectedDate && selectedTime) && styles.confirmButtonDisabled,
            ]}
            disabled={!(selectedDate && selectedTime)}
            onPress={handleReschedule}
          >
            <Text style={styles.confirmButtonText}>Confirm Reschedule</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RescheduleAppointmentScreenHome;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  contentContainer: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  doctorInfo: {
    marginBottom: 20,
    alignItems: 'center',
  },
  doctorName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  doctorSpecialty: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  note: {
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
  timeSlot: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#007BFF',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTime: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  timeSlotText: {
    color: '#007BFF',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 40,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
