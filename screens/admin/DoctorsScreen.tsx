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
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { defaultDoctors, Doctor as BaseDoctor } from '../../data/doctors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { subscribeToUpdates } from '../../data/sharedState';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Booking {
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  notes?: string;
}

interface Doctor extends BaseDoctor {
  bookings: {
    [date: string]: {
      [time: string]: Booking;
    };
  };
  unavailableDates: {
    [date: string]: boolean;
  };
}

const DoctorsScreen = () => {
  const navigation = useNavigation();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<{ time: string, booking: Booking } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
const [tempTime, setTempTime] = useState(new Date());

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const loadDoctors = async () => {
    try {
      setRefreshing(true);
      const savedDoctors = await AsyncStorage.getItem('doctors');
      if (savedDoctors) {
        const parsedDoctors = JSON.parse(savedDoctors) as Doctor[];
        const doctorsWithBookings = parsedDoctors.map((doctor) => ({
          ...doctor,
          bookings: doctor.bookings || {},
          unavailableDates: doctor.unavailableDates || {}
        }));
        setDoctors(doctorsWithBookings);
      } else {
        const defaultWithBookings = defaultDoctors.map(doctor => ({
          ...doctor,
          bookings: {},
          unavailableDates: {}
        })) as Doctor[];
        await AsyncStorage.setItem('doctors', JSON.stringify(defaultWithBookings));
        setDoctors(defaultWithBookings);
      }
    } catch (err) {
      console.error('Error loading doctors:', err);
      Alert.alert('Error', 'Failed to load doctors');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

useEffect(() => {
  loadDoctors();
  
  // Subscribe to updates
  const unsubscribe = subscribeToUpdates(loadDoctors);
  
  // Cleanup subscription on unmount
  return () => {
    unsubscribe();
  };
}, []);
  const toggleDateAvailability = (date: string) => {
    if (!selectedDoctor) return;
    if (date < todayStr) return;

    const updatedDoctors = doctors.map(doctor => {
      if (doctor.id === selectedDoctor.id) {
        const updatedUnavailableDates = { ...doctor.unavailableDates };
        if (updatedUnavailableDates[date]) {
          delete updatedUnavailableDates[date];
        } else {
          updatedUnavailableDates[date] = true;
        }
        setHasUnsavedChanges(true);
        return { ...doctor, unavailableDates: updatedUnavailableDates };
      }
      return doctor;
    });

    setDoctors(updatedDoctors);
    setSelectedDoctor(updatedDoctors.find(d => d.id === selectedDoctor.id) || null);
  };

  const handleSaveChanges = async () => {
    await saveDoctorsToStorage(doctors);
    setHasUnsavedChanges(false);
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    if (isEditing && hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to save them?',
        [
          {
            text: 'Save',
            onPress: () => {
              handleSaveChanges().then(() => {
                setIsEditing(false);
              });
            }
          },
          {
            text: "Don't Save",
            style: 'destructive',
            onPress: () => {
              // Revert to the original state from storage
              AsyncStorage.getItem('doctors').then(savedDoctors => {
                if (savedDoctors) {
                  const parsedDoctors = JSON.parse(savedDoctors) as Doctor[];
                  const doctorsWithBookings = parsedDoctors.map((doctor) => ({
                    ...doctor,
                    bookings: doctor.bookings || {},
                    unavailableDates: doctor.unavailableDates || {}
                  }));
                  setDoctors(doctorsWithBookings);
                  if (selectedDoctor) {
                    const updatedDoctor = doctorsWithBookings.find(d => d.id === selectedDoctor.id) || null;
                    setSelectedDoctor(updatedDoctor);
                  }
                }
                setHasUnsavedChanges(false);
                setIsEditing(false);
              });
            }
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => { } // Stay in edit mode
          }
        ]
      );
    } else {
      setIsEditing(!isEditing);
    }
  };

  const addTimeSlot = () => {
    if (!newTimeSlot.trim() || !selectedDoctor) return;

    const updatedDoctors = doctors.map(doctor => {
      if (doctor.id === selectedDoctor.id) {
        setHasUnsavedChanges(true);
        return {
          ...doctor,
          timeSlots: [...new Set([...doctor.timeSlots, newTimeSlot.trim()])]
        };
      }
      return doctor;
    });

    setDoctors(updatedDoctors);
    setSelectedDoctor(updatedDoctors.find(d => d.id === selectedDoctor.id) || null);
    setNewTimeSlot('');
  };

  const removeTimeSlot = (time: string) => {
    if (!selectedDoctor) return;

    const updatedDoctors = doctors.map(doctor => {
      if (doctor.id === selectedDoctor.id) {
        setHasUnsavedChanges(true);
        return {
          ...doctor,
          timeSlots: doctor.timeSlots.filter(t => t !== time)
        };
      }
      return doctor;
    });

    setDoctors(updatedDoctors);
    setSelectedDoctor(updatedDoctors.find(d => d.id === selectedDoctor.id) || null);
  };

  const saveDoctorsToStorage = async (doctorsList: Doctor[]) => {
    try {
      await AsyncStorage.setItem('doctors', JSON.stringify(doctorsList));
      Alert.alert('Success', 'Changes saved successfully');
    } catch (err) {
      console.error('Error saving doctors to storage:', err);
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  const getMarkedDates = () => {
    if (!selectedDoctor) return {};

    const markedDates: { [date: string]: any } = {};
    const today = new Date().toISOString().split('T')[0];

    // Mark unavailable dates (keeping your preferred styling)
    Object.keys(selectedDoctor.unavailableDates || {}).forEach(date => {
      markedDates[date] = {
        marked: true,
        dotColor: '#ff4444',
        disabled: true,
        disableTouchEvent: !isEditing,
        selected: selectedDate === date, // Always show selection
        selectedColor: isEditing ? '#ff4444' : '#E3F2FD', // Lighter blue for normal view
        customStyles: {
          container: {
            backgroundColor: isEditing ? '#ffeeee' : '#fafafa', // Your style + light gray for normal
            borderColor: isEditing ? '#ff4444' : '#dddddd',
            borderWidth: isEditing ? 1 : 0.5,
            opacity: date < today ? 0.6 : 1 // Dim past dates
          },
          text: {
            color: selectedDate === date
              ? (isEditing ? 'white' : 'black')
              : '#d2d2d2', // Gray text for unavailable
            fontWeight: selectedDate === date ? 'bold' : 'normal'
          }
        }
      };
    });

    // Mark dates with bookings
    Object.keys(selectedDoctor.bookings || {}).forEach(date => {
      if (selectedDoctor.unavailableDates[date]) return;

      markedDates[date] = {
        ...markedDates[date],
        marked: true,
        dotColor: '#4a90e2',
        selected: selectedDate === date,
        customStyles: {
          container: {
            backgroundColor: selectedDate === date
              ? (isEditing ? '#e3f2fd' : '#E3F2FD')
              : undefined,
            borderColor: isEditing ? '#4a90e2' : undefined,
            borderWidth: isEditing ? 1 : 0
          },
          text: {
            color: selectedDate === date ? (isEditing ? 'white' : 'black') : undefined
          }
        }
      };
    });

    // Ensure selected date styling
    if (selectedDate) {
      const isUnavailable = selectedDoctor.unavailableDates[selectedDate];

      markedDates[selectedDate] = {
        ...markedDates[selectedDate],
        selected: true,
        selectedColor: isEditing
          ? (isUnavailable ? '#ff4444' : '#4a90e2')
          : '#E3F2FD',
        customStyles: {
          container: {
            backgroundColor: isEditing
              ? (isUnavailable ? '#ffeeee' : '#e3f2fd')
              : '#E3F2FD', // Light blue background in normal view
            borderWidth: isEditing ? 2 : 1,
            borderColor: isEditing
              ? (isUnavailable ? '#ff4444' : '#4a90e2')
              : '#4a90e2' // Blue border in normal view
          },
          text: {
            color: isEditing ? 'white' : 'black',
            fontWeight: 'bold'
          }
        }
      };
    }

    return markedDates;
  };
  const renderTimeSlot = (time: string) => {
    if (!selectedDoctor || !selectedDate) return null;

    const booking = selectedDoctor.bookings[selectedDate]?.[time];
    const isBooked = !!booking;
    const isDateUnavailable = selectedDoctor.unavailableDates[selectedDate];

    return (
      <View style={styles.timeSlotContainer} key={time}>
        <TouchableOpacity
          style={[
            styles.timeSlot,
            isBooked && styles.bookedTimeSlot,
            isDateUnavailable && styles.disabledTimeSlot
          ]}
          disabled={isDateUnavailable}
          onPress={() => {
            if (isBooked) {
              setSelectedBooking({ time, booking });
            }
          }}
        >
          <Text style={[
            styles.timeSlotText,
            isBooked && styles.bookedTimeSlotText,
            isDateUnavailable && styles.disabledTimeSlotText
          ]}>
            {time}
          </Text>
          {isBooked && (
            <Text style={styles.bookedBadge}>Booked</Text>
          )}
        </TouchableOpacity>

        {isEditing && !isBooked && !isDateUnavailable && (
          <TouchableOpacity
            style={styles.removeTimeSlotButton}
            onPress={() => removeTimeSlot(time)}
          >
            <Ionicons name="close-circle" size={20} color="#ff4444" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderDoctorItem = ({ item }: { item: Doctor }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      onPress={() => {
        setSelectedDoctor(item);
        setSelectedDate('');
        setIsEditing(false);
        setHasUnsavedChanges(false);
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

  const renderBookingModal = () => (
    <Modal
      visible={!!selectedBooking}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setSelectedBooking(null)}
    >
      <View style={styles.bookingModalContainer}>
        <View style={styles.bookingModalContent}>
          <Text style={styles.bookingModalTitle}>Booking Details</Text>

          <View style={styles.bookingDetailRow}>
            <Text style={styles.bookingDetailLabel}>Time:</Text>
            <Text style={styles.bookingDetailValue}>{selectedBooking?.time}</Text>
          </View>

          <View style={styles.bookingDetailRow}>
            <Text style={styles.bookingDetailLabel}>Patient:</Text>
            <Text style={styles.bookingDetailValue}>{selectedBooking?.booking.patientName}</Text>
          </View>

          {selectedBooking?.booking.patientEmail && (
            <View style={styles.bookingDetailRow}>
              <Text style={styles.bookingDetailLabel}>Email:</Text>
              <Text style={styles.bookingDetailValue}>{selectedBooking.booking.patientEmail}</Text>
            </View>
          )}

          {selectedBooking?.booking.patientPhone && (
            <View style={styles.bookingDetailRow}>
              <Text style={styles.bookingDetailLabel}>Phone:</Text>
              <Text style={styles.bookingDetailValue}>{selectedBooking.booking.patientPhone}</Text>
            </View>
          )}

          {selectedBooking?.booking.notes && (
            <View style={styles.bookingDetailRow}>
              <Text style={styles.bookingDetailLabel}>Notes:</Text>
              <Text style={styles.bookingDetailValue}>{selectedBooking.booking.notes}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.bookingModalCloseButton}
            onPress={() => setSelectedBooking(null)}
          >
            <Text style={styles.bookingModalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadDoctors}
            colors={['#4a90e2']}
            tintColor="#4a90e2"
          />
        }
      />

      <Modal
        visible={!!selectedDoctor}
        animationType="slide"
        onRequestClose={() => {
          if (hasUnsavedChanges) {
            Alert.alert(
              'Unsaved Changes',
              'You have unsaved changes. Do you want to save them?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel'
                },
                {
                  text: "Don't Save",
                  style: 'destructive',
                  onPress: () => {
                    loadDoctors().then(() => {
                      setSelectedDoctor(null);
                      setHasUnsavedChanges(false);
                    });
                  }
                },
                {
                  text: 'Save',
                  onPress: handleSaveChanges
                }
              ]
            );
          } else {
            setSelectedDoctor(null);
          }
        }}
      >
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView
              style={styles.modalContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={loadDoctors}
                  colors={['#4a90e2']}
                  tintColor="#4a90e2"
                />
              }
            >
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => {
                  if (hasUnsavedChanges) {
                    Alert.alert(
                      'Unsaved Changes',
                      'You have unsaved changes. Do you want to save them?',
                      [
                        {
                          text: 'Cancel',
                          style: 'cancel'
                        },
                        {
                          text: "Don't Save",
                          style: 'destructive',
                          onPress: () => {
                            loadDoctors().then(() => {
                              setSelectedDoctor(null);
                              setHasUnsavedChanges(false);
                            });
                          }
                        },
                        {
                          text: 'Save',
                          onPress: handleSaveChanges
                        }
                      ]
                    );
                  } else {
                    setSelectedDoctor(null);
                  }
                }}>
                  <Ionicons name="arrow-back" size={24} color="#4a90e2" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Doctor Details</Text>
                {/* Replace the editButtonsContainer section with this: */}
                <View style={styles.editButtonsContainer}>
                  <TouchableOpacity onPress={handleEditToggle}>
                    <Text style={styles.editButton}>
                      {isEditing ? 'Cancel' : 'Edit'}
                    </Text>
                  </TouchableOpacity>
                  {isEditing && (
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleSaveChanges}
                    >
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.doctorDetails}>
                <Image source={{ uri: selectedDoctor?.image || '' }} style={styles.detailImage} />
                <Text style={styles.detailName}>{selectedDoctor?.name}</Text>
                <Text style={styles.detailSpecialty}>{selectedDoctor?.specialty}</Text>
                <Text style={styles.detailBio}>{selectedDoctor?.bio}</Text>
              </View>

              <Text style={styles.sectionTitle}>Set Unavailable Dates</Text>
              <Calendar
                minDate={todayStr}
                markedDates={getMarkedDates()}
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
                markingType={'custom'}
              />

              {selectedDate && selectedDoctor && (
                <Text style={styles.selectedDateText}>
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  {Object.keys(selectedDoctor.bookings[selectedDate] || []).length > 0 ?
                    ` (${Object.keys(selectedDoctor.bookings[selectedDate] || []).length}/${selectedDoctor.timeSlots.length} slots booked)` :
                    selectedDoctor.unavailableDates[selectedDate] ? ' (Unavailable)' : ' (Available)'}
                </Text>
              )}

              <Text style={styles.timeSlotsHeader}>Time Slots</Text>
              <View style={styles.timeSlotsContainer}>
                {selectedDoctor?.timeSlots.map((time) => (
                  <View key={time}>
                    {renderTimeSlot(time)}
                  </View>
                ))}
              </View>

              {isEditing && (
  <>
    <Text style={styles.sectionTitle}>Add Time Slot</Text>
    <View style={styles.addTimeSlotContainer}>
      <TouchableOpacity 
        style={styles.timePickerButton}
        onPress={() => setShowTimePicker(true)}
      >
        <Text style={styles.timePickerButtonText}>
          {newTimeSlot || 'Select a time'}
        </Text>
        <Ionicons name="time-outline" size={20} color="#4a90e2" />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.addButton, !newTimeSlot && styles.addButtonDisabled]}
        onPress={addTimeSlot}
        disabled={!newTimeSlot}
      >
        <Ionicons name="add" size={20} color="white" />
      </TouchableOpacity>
    </View>

    {showTimePicker && (
      <View style={styles.timePickerModal}>
        <View style={styles.timePickerHeader}>
          <Text style={styles.timePickerTitle}>Select Time</Text>
          <TouchableOpacity onPress={() => setShowTimePicker(false)}>
            <Ionicons name="close" size={24} color="#4a90e2" />
          </TouchableOpacity>
        </View>
        <DateTimePicker
          value={tempTime}
          mode="time"
          display="spinner"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) {
              setTempTime(selectedTime);
              const hours = selectedTime.getHours();
              const minutes = selectedTime.getMinutes();
              const ampm = hours >= 12 ? 'PM' : 'AM';
              const formattedHours = hours % 12 || 12;
              const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
              setNewTimeSlot(`${formattedHours}:${formattedMinutes} ${ampm}`);
            }
          }}
        />
      </View>
    )}
  </>
)}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {renderBookingModal()}
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
  editButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginRight: 12,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  editButton: {
    color: '#4a90e2',
    fontSize: 16,
    fontWeight: '600',
  },
  unsavedChangesButton: {
    color: '#FFA500',
    fontWeight: 'bold',
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
  timeSlotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 4,
  },
  timeSlot: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    flexDirection: 'row',
  },
  bookedTimeSlot: {
    backgroundColor: '#FFEBEE',
  },
  disabledTimeSlot: {
    backgroundColor: '#f5f5f5',
  },
  timeSlotText: {
    color: '#1976D2',
    fontWeight: '500',
  },
  bookedTimeSlotText: {
    color: '#F44336',
  },
  disabledTimeSlotText: {
    color: '#aaa',
  },
  bookedBadge: {
    fontSize: 10,
    color: '#F44336',
    marginLeft: 6,
    fontWeight: 'bold',
  },
  removeTimeSlotButton: {
    marginLeft: 8,
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
  bookingModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bookingModalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  bookingModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  bookingDetailRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  bookingDetailLabel: {
    fontWeight: '600',
    width: 80,
    color: '#555',
  },
  bookingDetailValue: {
    flex: 1,
    color: '#333',
  },
  bookingModalCloseButton: {
    marginTop: 20,
    backgroundColor: '#4a90e2',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  bookingModalCloseText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveButtonDisabled: {
    backgroundColor: '#cccccc',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginRight: 12,
  },
  timePicker: {
  flex: 1,
  marginRight: 12,
},
timePickerButton: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderWidth: 1,
  borderColor: '#4a90e2',
  borderRadius: 8,
  paddingVertical: 12,
  paddingHorizontal: 16,
  marginRight: 12,
},
timePickerButtonText: {
  color: '#333',
  fontSize: 16,
},
timePickerModal: {
  backgroundColor: 'white',
  borderRadius: 10,
  padding: 20,
  marginTop: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
},
timePickerHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 10,
},
timePickerTitle: {
  fontSize: 18,
  fontWeight: '600',
  color: '#333',
},
addButtonDisabled: {
  backgroundColor: '#cccccc',
},
});

export default DoctorsScreen;