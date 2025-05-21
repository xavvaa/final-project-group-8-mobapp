import React, { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity, 
  StyleSheet, Alert, ScrollView, Platform, Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;
interface Props { navigation: ProfileScreenNavigationProp }

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [user, setUser] = useState({
    username: '', name: '', email: '', contactNumber: '',
    address: '', birthday: '', password: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [touched, setTouched] = useState({
    username: false,
    name: false,
    email: false,
    password: false,
    contactNumber: false,
    address: false,
    birthday: false,
  });
  const [errors, setErrors] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    contactNumber: '',
    address: '',
    birthday: '',
  });
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const [existingUsernames, setExistingUsernames] = useState<string[]>([]);
  const [existingEmails, setExistingEmails] = useState<string[]>([]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('currentUser');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          const usersJSON = await AsyncStorage.getItem('registeredUsers');
          if (usersJSON) {
            const users = JSON.parse(usersJSON);
            const usernames = users.map((u: any) => u.username.toLowerCase());
            const emails = users.map((u: any) => u.email.toLowerCase());
            setExistingUsernames(usernames.filter((u: string) => u !== parsedUser.username.toLowerCase()));
            setExistingEmails(emails.filter((e: string) => e !== parsedUser.email.toLowerCase()));
          }
        }
      } catch {
        Alert.alert('Error', 'Failed to load user data');
      }
    };
    loadUserData();
  }, []);

  const validateUsername = (value: string): boolean => {
    return /^[a-zA-Z0-9_]{3,20}$/.test(value);
  };

  const validateEmail = (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const validatePasswordStrength = (value: string): boolean => {
    if (value.length < 8) {
      setPasswordStrength('Weak');
      return false;
    } else if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value) && !/[\W_]/.test(value)) {
      setPasswordStrength('Medium');
      return true;
    } else if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value)) {
      setPasswordStrength('Strong');
      return true;
    }
    setPasswordStrength('Weak');
    return false;
  };

  const validateContactNumber = (value: string): boolean => {
    return /^09\d{9}$/.test(value);
  };

  const validateBirthday = (value: string): boolean => {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  };

  const getStrengthColor = (): string => {
    switch (passwordStrength) {
      case 'Weak': return '#ff4444';
      case 'Medium': return '#ffbb33';
      case 'Strong': return '#00C851';
      default: return '#aaaaaa';
    }
  };

  const validateField = async (field: keyof typeof errors, value: string): Promise<void> => {
    let error = '';
    switch (field) {
      case 'username':
        if (!value) {
          error = 'This field is required';
        } else if (!validateUsername(value)) {
          error = 'Username must be 3-20 characters (letters, numbers, _)';
        } else if (existingUsernames.includes(value.toLowerCase())) {
          error = 'Username already exists';
        }
        break;
      case 'name':
        error = value ? '' : 'This field is required';
        break;
      case 'email':
        if (!value) {
          error = 'This field is required';
        } else if (!validateEmail(value)) {
          error = 'Enter a valid email address';
        } else if (existingEmails.includes(value.toLowerCase())) {
          error = 'Email already registered';
        }
        break;
      case 'password':
        error = value ? (validatePasswordStrength(value) ? '' : 'Password must include uppercase, lowercase, number, and special character') : 'This field is required';
        break;
      case 'contactNumber':
        error = value ? (validateContactNumber(value) ? '' : 'Contact number must start with 09 and be 11 digits') : 'This field is required';
        break;
      case 'address':
        error = value ? '' : 'This field is required';
        break;
      case 'birthday':
        error = value ? (validateBirthday(value) ? '' : 'Birthday must be in YYYY-MM-DD format') : 'This field is required';
        break;
    }
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleChange = async (field: keyof typeof user, value: string) => {
    setUser(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    await validateField(field, value);
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const saveUserToRegisteredUsers = async (updatedUser: typeof user) => {
    try {
      const usersJSON = await AsyncStorage.getItem('registeredUsers');
      const users = usersJSON ? JSON.parse(usersJSON) : [];
      const index = users.findIndex((u: any) => u.email.toLowerCase() === updatedUser.email.toLowerCase());
      if (index !== -1) {
        users[index] = updatedUser;
        await AsyncStorage.setItem('registeredUsers', JSON.stringify(users));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating registeredUsers:', error);
      return false;
    }
  };

  const verifyPassword = async () => {
    if (!currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }

    if (currentPassword !== user.password) {
      setPasswordError('Incorrect password');
      return;
    }

    setPasswordError('');
    setPasswordModalVisible(false);
    setCurrentPassword('');
    setIsEditing(true);
  };

  const handleSave = async () => {
    let hasErrors = false;
    Object.keys(user).forEach((field) => {
      if (!user[field as keyof typeof user]) {
        setErrors(prev => ({ ...prev, [field]: 'This field is required' }));
        setTouched(prev => ({ ...prev, [field]: true }));
        hasErrors = true;
      }
    });
    
    if (hasErrors) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }
    
    if (Object.values(errors).some(error => error !== '')) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    try {
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      const success = await saveUserToRegisteredUsers(user);
      
      if (success) {
        Alert.alert('Success', 'Your profile has been updated successfully!');
        setIsEditing(false);
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive', onPress: async () => {
          try {
            if (saveTimeout.current) clearTimeout(saveTimeout.current);
            await AsyncStorage.setItem('currentUser', JSON.stringify(user));
            await saveUserToRegisteredUsers(user);
            await AsyncStorage.multiRemove(['userRole', 'currentUser']);
            navigation.replace('Login');
          } catch {
            Alert.alert('Error', 'Failed to save before logout');
          }
        }
      }
    ]);
  };

  const requestEditMode = () => {
    setPasswordModalVisible(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setErrors({
      username: '',
      name: '',
      email: '',
      password: '',
      contactNumber: '',
      address: '',
      birthday: '',
    });
    AsyncStorage.getItem('currentUser').then(storedUser => {
      if (storedUser) setUser(JSON.parse(storedUser));
    });
  };

  const getInitials = (fullName: string) => {
    if (!fullName.trim()) return 'U';
    const names = fullName.trim().split(' ');
    return names.slice(0, 2).map((n) => n[0]).join('').toUpperCase();
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      handleChange('birthday', formattedDate);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
          </View>
          <Text style={styles.userName}>{user.name || 'User Profile'}</Text>
          {user.username && <Text style={styles.usernameText}>@{user.username}</Text>}
          
          {!isEditing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={requestEditMode}
            >
              <Ionicons name="create" size={20} color={PRIMARY_COLOR} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          {[
            { key: 'username', label: 'Username', icon: 'at', keyboard: 'default' },
            { key: 'name', label: 'Full Name', icon: 'person', keyboard: 'default' },
            { key: 'email', label: 'Email', icon: 'mail', keyboard: 'email-address' },
            { key: 'contactNumber', label: 'Contact Number', icon: 'call', keyboard: 'phone-pad' },
            { key: 'address', label: 'Address', icon: 'home', keyboard: 'default' }
          ].map(({ key, label, icon, keyboard }) => (
            <View key={key} style={styles.inputGroup}>
              <Text style={styles.label}>{label}</Text>
              <View style={[
                styles.inputContainer,
                errors[key] && styles.inputError
              ]}>
                <Ionicons name={icon as any} size={20} color="#666" style={styles.icon} />
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={user[key as keyof typeof user]}
                    onChangeText={(text) => handleChange(key as keyof typeof user, text)}
                    onBlur={() => handleBlur(key as keyof typeof touched)}
                    keyboardType={keyboard}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    editable={isEditing}
                  />
                ) : (
                  <Text style={styles.readOnlyText}>{user[key as keyof typeof user]}</Text>
                )}
              </View>
              {(touched[key as keyof typeof touched] || isEditing) && errors[key] && (
                <Text style={styles.errorText}>{errors[key]}</Text>
              )}
            </View>
          ))}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Birthday</Text>
            <TouchableOpacity
              style={[
                styles.inputContainer,
                errors.birthday && styles.inputError
              ]}
              onPress={() => isEditing && setShowDatePicker(true)}
              activeOpacity={isEditing ? 0.7 : 1}
            >
              <Ionicons name="calendar" size={20} color="#666" style={styles.icon} />
              <Text style={styles.readOnlyText}>
                {user.birthday || (isEditing ? 'Select a date' : '')}
              </Text>
            </TouchableOpacity>
            {(touched.birthday || isEditing) && errors.birthday && (
              <Text style={styles.errorText}>{errors.birthday}</Text>
            )}
            {showDatePicker && (
              <DateTimePicker
                value={user.birthday ? new Date(user.birthday) : new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Security</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[
              styles.inputContainer,
              errors.password && styles.inputError
            ]}>
              <Ionicons name="lock-closed" size={20} color="#666" style={styles.icon} />
              {isEditing ? (
                <>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={user.password}
                    onChangeText={(text) => handleChange('password', text)}
                    onBlur={() => handleBlur('password')}
                    secureTextEntry={!showPassword}
                    placeholder="Your password"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color="#666" />
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.readOnlyText}>••••••••</Text>
              )}
            </View>
            {(touched.password || isEditing) && errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
            {isEditing && user.password && (
              <View style={styles.strengthContainer}>
                <Text style={styles.strengthLabel}>Password strength:</Text>
                <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
                  {passwordStrength}
                </Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.actionButton, 
            { backgroundColor: isEditing ? PRIMARY_COLOR : SECONDARY_COLOR }
          ]} 
          onPress={isEditing ? handleSave : handleLogout}
        >
          <Ionicons name={isEditing ? 'save' : 'log-out'} size={24} color="#fff" />
          <Text style={styles.actionButtonText}>
            {isEditing ? 'Save Profile' : 'Log Out'}
          </Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity
            style={[
              styles.actionButton, 
              { backgroundColor: '#666', marginTop: 10 }
            ]}
            onPress={cancelEdit}
          >
            <Ionicons name="close" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Password Verification Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={passwordModalVisible}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Verify Your Identity</Text>
            <Text style={styles.modalText}>Please enter your current password to edit your profile</Text>
            
            <View style={styles.modalInputContainer}>
              <TextInput
                style={styles.modalInput}
                placeholder="Current Password"
                secureTextEntry={true}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                autoFocus={true}
              />
              {passwordError && <Text style={styles.modalError}>{passwordError}</Text>}
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                onPress={() => setPasswordModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: PRIMARY_COLOR }]}
                onPress={verifyPassword}
              >
                <Text style={styles.modalButtonText}>Verify</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const PRIMARY_COLOR = '#4a90e2';
const SECONDARY_COLOR = '#e94b3c';
const BG_COLOR = '#f8f9fa';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG_COLOR },
  container: { padding: 20, paddingBottom: 40 },
  header: { 
    alignItems: 'center', 
    marginBottom: 30, 
    paddingTop: 20,
    position: 'relative' 
  },
  avatar: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center', alignItems: 'center', marginBottom: 15,
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8,
  },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  userName: { fontSize: 24, fontWeight: '600', color: '#333' },
  usernameText: { fontSize: 16, color: '#666', marginTop: 5 },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
    backgroundColor: '#fff',
  },
  editButtonText: {
    marginLeft: 6,
    color: PRIMARY_COLOR,
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
  },
  sectionTitle: {
    fontSize: 18, fontWeight: '600', color: '#444',
    marginBottom: 20, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '500', color: '#666', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f1f3f5', borderRadius: 10,
    paddingHorizontal: 15, paddingVertical: Platform.OS === 'android' ? 2 : 0,
  },
  inputError: {
    borderWidth: 1,
    borderColor: SECONDARY_COLOR,
    backgroundColor: '#fef0ef',
  },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#333' },
  readOnlyText: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#333' },
  errorText: {
    color: SECONDARY_COLOR,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  strengthContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  strengthLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 5,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButton: {
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 15, 
    borderRadius: 10, 
    marginTop: 20, 
    gap: 10,
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3,
    shadowRadius: 8, 
    elevation: 5,
  },
  actionButtonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '600' 
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
    textAlign: 'center',
  },
  modalInputContainer: {
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalError: {
    color: SECONDARY_COLOR,
    fontSize: 12,
    marginTop: 5,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default ProfileScreen;