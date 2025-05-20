import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Modal,
  Image,
  SafeAreaView,
  Platform,
  StatusBar,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { defaultDoctors, Doctor } from '../../data/doctors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DoctorsScreen = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const [loading, setLoading] = useState(true);

  // Get today's date string in YYYY-MM-DD format
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const savedDoctors = await AsyncStorage.getItem('doctors');
        if (savedDoctors) {
          setDoctors(JSON.parse(savedDoctors));
        } else {
          await AsyncStorage.setItem('doctors', JSON.stringify(defaultDoctors));
          setDoctors(defaultDoctors);
        }
      } catch (err) {
        console.error('Error loading doctors:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadDoctors();
  }, []);

  const toggleDateAvailability = (date: string) => {
    if (!selectedDoctor) return;

    // Prevent toggling past dates
    if (date < todayStr) return;

    const updatedDoctors = doctors.map(doctor => {
      if (doctor.id === selectedDoctor.id) {
        const updatedUnavailableDates = { ...doctor.unavailableDates };
        if (updatedUnavailableDates[date]) {
          delete updatedUnavailableDates[date];
        } else {
          updatedUnavailableDates[date] = true;
        }
        return { ...doctor, unavailableDates: updatedUnavailableDates };
      }
      return doctor;
    });

    setDoctors(updatedDoctors);
    setSelectedDoctor(updatedDoctors.find(d => d.id === selectedDoctor.id) || null);
    saveDoctorsToStorage(updatedDoctors);
  };

  const addTimeSlot = () => {
    if (!newTimeSlot.trim() || !selectedDoctor) return;

    const updatedDoctors = doctors.map(doctor => {
      if (doctor.id === selectedDoctor.id) {
        return {
          ...doctor,
          timeSlots: [...doctor.timeSlots, newTimeSlot.trim()]
        };
      }
      return doctor;
    });

    setDoctors(updatedDoctors);
    setSelectedDoctor(updatedDoctors.find(d => d.id === selectedDoctor.id) || null);
    setNewTimeSlot('');
    saveDoctorsToStorage(updatedDoctors);
  };

  const removeTimeSlot = (time: string) => {
    if (!selectedDoctor) return;

    const updatedDoctors = doctors.map(doctor => {
      if (doctor.id === selectedDoctor.id) {
        return {
          ...doctor,
          timeSlots: doctor.timeSlots.filter(t => t !== time)
        };
      }
      return doctor;
    });

    setDoctors(updatedDoctors);
    setSelectedDoctor(updatedDoctors.find(d => d.id === selectedDoctor.id) || null);
    saveDoctorsToStorage(updatedDoctors);
  };

  const saveDoctorsToStorage = async (doctorsList: Doctor[]) => {
    try {
      await AsyncStorage.setItem('doctors', JSON.stringify(doctorsList));
    } catch (err) {
      console.error('Error saving doctors to storage:', err);
    }
  };

  const renderDoctorItem = ({ item }: { item: Doctor }) => (
    <TouchableOpacity 
      style={styles.doctorCard}
      onPress={() => {
        setSelectedDoctor(item);
        setSelectedDate('');
        setIsEditing(false);
      }}
    >
      <Image source={{ uri: item.image }} style={styles.doctorImage} />
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>{item.name}</Text>
        <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  const renderTimeSlot = (time: string) => (
    <View key={time} style={styles.timeSlot}>
      <Text style={styles.timeSlotText}>{time}</Text>
      {isEditing && (
        <TouchableOpacity onPress={() => removeTimeSlot(time)}>
          <Ionicons name="close-circle" size={20} color="#ff4444" style={styles.timeSlotIcon} />
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a90e2" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={doctors}
        renderItem={renderDoctorItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />

      <Modal
        visible={!!selectedDoctor}
        animationType="slide"
        onRequestClose={() => setSelectedDoctor(null)}
      >
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setSelectedDoctor(null)}>
                  <Ionicons name="arrow-back" size={24} color="#4a90e2" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Doctor Details</Text>
                <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                  <Text style={styles.editButton}>
                    {isEditing ? 'Done' : 'Edit'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.doctorDetails}>
                <Image source={{ uri: selectedDoctor?.image || '' }} style={styles.detailImage} />
                <Text style={styles.detailName}>{selectedDoctor?.name}</Text>
                <Text style={styles.detailSpecialty}>{selectedDoctor?.specialty}</Text>
                <Text style={styles.detailBio}>{selectedDoctor?.bio}</Text>
              </View>

              <Text style={styles.sectionTitle}>Set Unavailable Dates</Text>
              <Calendar
                minDate={todayStr} // Disable all dates before today
                markedDates={selectedDoctor ? Object.keys(selectedDoctor.unavailableDates).reduce((acc, date) => {
                  acc[date] = { selected: true, selectedColor: '#ff4444' };
                  return acc;
                }, {} as { [date: string]: any }) : {}}
                onDayPress={(day) => {
                  if (isEditing && day.dateString >= todayStr) {
                    toggleDateAvailability(day.dateString);
                  }
                  setSelectedDate(day.dateString);
                }}
                theme={{
                  todayTextColor: '#4a90e2',
                  selectedDayBackgroundColor: '#4a90e2',
                  arrowColor: '#4a90e2',
                }}
              />

              {selectedDate && (
                <Text style={styles.selectedDateText}>
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  {selectedDoctor?.unavailableDates[selectedDate] 
                    ? ' (Marked as Unavailable)' 
                    : ' (Available)'}
                </Text>
              )}

              <Text style={styles.timeSlotsHeader}>Time Slots</Text>
              <View style={styles.timeSlotsContainer}>
                {selectedDoctor?.timeSlots.map(renderTimeSlot)}
              </View>

              {isEditing && (
                <>
                  <Text style={styles.sectionTitle}>Add New Time Slot</Text>
                  <View style={styles.addTimeSlotContainer}>
                    <TextInput
                      style={styles.timeInput}
                      value={newTimeSlot}
                      onChangeText={setNewTimeSlot}
                      placeholder="Add new time (e.g., 2:15 PM)"
                      placeholderTextColor="#999"
                    />
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={addTimeSlot}
                    >
                      <Ionicons name="add" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: Platform.OS === 'ios' ? 34 : 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    color: '#4a90e2',
    fontSize: 16,
    fontWeight: '600',
  },
  doctorDetails: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  detailName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  detailSpecialty: {
    fontSize: 16,
    color: '#4a90e2',
    marginBottom: 12,
  },
  detailBio: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  selectedDateText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginVertical: 12,
  },
  timeSlotsHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  timeSlot: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    margin: 6,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    flexDirection: 'row',
  },
  timeSlotText: {
    color: '#1976D2',
    fontWeight: '500',
  },
  timeSlotIcon: {
    marginLeft: 6,
  },
  addTimeSlotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
    marginRight: 12,
  },
  addButton: {
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 8,
  },
});

export default DoctorsScreen;
