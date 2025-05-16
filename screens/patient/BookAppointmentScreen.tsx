import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Importing Ionicons for the back button icon

const availableTimeSlots = [
  '09:00 AM',
  '10:30 AM',
  '01:00 PM',
  '02:30 PM',
  '04:00 PM',
];

const BookAppointmentScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const navigation = useNavigation();
  const route = useRoute(); // To get the doctor data passed via route params
  const { doctor } = route.params; // Dynamically retrieve doctor info from route params

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) return;

    const newAppointment = {
      id: Date.now().toString(),
      doctor: doctor.name, // Use the dynamic doctor's name
      specialty: doctor.specialty, // Add any other doctor details
      date: selectedDate,
      time: selectedTime,
    };

    try {
      const existing = await AsyncStorage.getItem('appointments');
      const parsed = existing ? JSON.parse(existing) : [];
      const updated = [...parsed, newAppointment];

      await AsyncStorage.setItem('appointments', JSON.stringify(updated));

      Alert.alert(
        'Appointment Confirmed',
        `Your appointment with Dr. ${doctor.name} is set on ${selectedDate} at ${selectedTime}.`,
        [
          {
            text: 'OK',
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              }),
          },
        ]
      );

      setSelectedDate('');
      setSelectedTime('');
    } catch (err) {
      console.error('Failed to save appointment:', err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
  style={styles.contentContainer}
  contentContainerStyle={{ paddingBottom: 40 }}
  keyboardShouldPersistTaps="handled"
>
  {/* Header with Back Button */}
  <View style={styles.header}>
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <Ionicons name="arrow-back" size={24} color="#333" />
    </TouchableOpacity>
    <Text style={styles.title}>Book an Appointment</Text>
  </View>

  {/* Doctor Info */}
  <View style={styles.doctorInfo}>
    <Text style={styles.doctorName}>{doctor.name}</Text>
    <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
  </View>

  {/* Calendar Picker */}
  <Text style={styles.label}>Select Date</Text>
  <Calendar
    minDate={new Date().toISOString().split('T')[0]}
    onDayPress={(day) => {
      setSelectedDate(day.dateString);
      setSelectedTime('');
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
    }}
  />

  {/* Time Picker */}
  {selectedDate ? (
    <>
      <Text style={styles.label}>Select Time</Text>
      <FlatList
        data={availableTimeSlots}
        horizontal
        keyExtractor={(item) => item}
        contentContainerStyle={{ marginVertical: 10 }}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.timeSlot,
              selectedTime === item && styles.selectedTime,
            ]}
            onPress={() => setSelectedTime(item)}
          >
            <Text
              style={[
                styles.timeSlotText,
                selectedTime === item && { color: '#fff' },
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </>
  ) : (
    <Text style={styles.note}>Please select a date to view time slots.</Text>
  )}

  {/* Book Button */}
  <TouchableOpacity
    style={[
      styles.bookButton,
      !(selectedDate && selectedTime) && styles.bookButtonDisabled,
    ]}
    disabled={!(selectedDate && selectedTime)}
    onPress={handleBook}
  >
    <Text style={styles.bookButtonText}>Book Appointment</Text>
  </TouchableOpacity>
</ScrollView>
    </SafeAreaView>
  );
};

export default BookAppointmentScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA', // Ensures a consistent background color
  },
  contentContainer: {
    flex: 1,
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
  timeSlotContainer: {
    marginVertical: 10,
    paddingBottom: 10,
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
  bookButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 40,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
