import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;
type RegisterScreenRouteProp = RouteProp<RootStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
  route: RegisterScreenRouteProp;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [birthday, setBirthday] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [existingUsernames, setExistingUsernames] = useState<string[]>([]);
  const [existingEmails, setExistingEmails] = useState<string[]>([]);

  const [errors, setErrors] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    address: '',
    birthday: '',
  });

  const [touched, setTouched] = useState({
    username: false,
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    contactNumber: false,
    address: false,
    birthday: false,
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<string>('');
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  useEffect(() => {
    const loadExistingUsers = async () => {
      try {
        const existingUsers = await AsyncStorage.getItem('registeredUsers');
        if (existingUsers) {
          const users = JSON.parse(existingUsers);
          const usernames = users.map((user: any) => user.username.toLowerCase());
          const emails = users.map((user: any) => user.email.toLowerCase());
          setExistingUsernames(usernames);
          setExistingEmails(emails);
        }
      } catch (error) {
        console.error('Error loading existing users:', error);
      }
    };
    loadExistingUsers();
  }, []);

  const validateUsername = (value: string): boolean => {
    return /^[a-zA-Z0-9_]{3,20}$/.test(value);
  };

  const validateEmail = (value: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validatePasswordStrength = (value: string): boolean => {
    if (value.length < 8) {
      setPasswordStrength('Weak');
      return false;
    } else if (
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value) &&
      !/[\W_]/.test(value)
    ) {
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
      case 'confirmPassword':
        error = value ? (value === password ? '' : 'Passwords do not match') : 'This field is required';
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

  const handleChange = async (field: keyof typeof errors, value: string): Promise<void> => {
    switch (field) {
      case 'username': setUsername(value); break;
      case 'name': setName(value); break;
      case 'email': setEmail(value); break;
      case 'password': setPassword(value); break;
      case 'confirmPassword': setConfirmPassword(value); break;
      case 'contactNumber': setContactNumber(value); break;
      case 'address': setAddress(value); break;
      case 'birthday': setBirthday(value); break;
    }

    setTouched(prev => ({ ...prev, [field]: true }));

    await validateField(field, value);

    if (field === 'password') {
      await validateField('confirmPassword', confirmPassword);
    }
  };

  const handleBlur = (field: keyof typeof touched): void => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleDateChange = (event: any, date?: Date): void => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      setBirthday(formattedDate);
      validateField('birthday', formattedDate);
      setTouched(prev => ({ ...prev, birthday: true }));
    }
  };

  const showDatepicker = (): void => {
    setShowDatePicker(true);
    Keyboard.dismiss();
  };

  useEffect(() => {
    const noErrors = Object.values(errors).every(e => e === '');
    const allTouched = Object.values(touched).every(t => t);
    const allFilled = username && name && email && password && confirmPassword && contactNumber && address && birthday;
    setIsFormValid(noErrors && allTouched && allFilled);
  }, [errors, touched, username, name, email, password, confirmPassword, contactNumber, address, birthday]);

  const handleRegister = async (): Promise<void> => {
    if (!isFormValid) {
      Alert.alert('Error', 'Please fix the errors in the form.');
      return;
    }

    try {
      const newUser = {
        id: Date.now().toString(),
        username,
        name,
        email: email.toLowerCase(),
        contactNumber,
        address,
        birthday,
        registrationDate: new Date().toISOString(),
        password,
      };

      const existingUsers = await AsyncStorage.getItem('registeredUsers');
      const users = existingUsers ? JSON.parse(existingUsers) : [];
      const updatedUsers = [...users, newUser];

      await AsyncStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));

      Alert.alert('Success', 'Registration successful! You are now logged in.');
      navigation.replace('Login');

    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Failed to save user data.');
    }
  };

  return (
    <LinearGradient colors={['#f5f7fa', '#c3cfe2']} style={styles.background}>
      <SafeAreaView style={styles.safeArea} edges={['right', 'left', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={styles.container}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/image/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.header}>Create Account</Text>
              <Text style={styles.subHeader}>Fill in your details to get started</Text>

              {/* Username Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  value={username}
                  onChangeText={(text) => handleChange('username', text)}
                  onBlur={() => handleBlur('username')}
                  placeholder="cool_user123"
                  placeholderTextColor="#888"
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {(touched.username || username) && errors.username && <Text style={styles.error}>{errors.username}</Text>}
              </View>

              {/* Name Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  value={name}
                  onChangeText={(text) => handleChange('name', text)}
                  onBlur={() => handleBlur('name')}
                  placeholder="Ex. Juan Dela Cruz"
                  placeholderTextColor="#888"
                  style={styles.input}
                />
                {(touched.name || name) && errors.name && <Text style={styles.error}>{errors.name}</Text>}
              </View>

              {/* Email Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={(text) => handleChange('email', text)}
                  onBlur={() => handleBlur('email')}
                  placeholder="Email"
                  placeholderTextColor="#888"
                  keyboardType="email-address"
                  style={styles.input}
                  autoCapitalize="none"
                />
                {(touched.email || email) && errors.email && <Text style={styles.error}>{errors.email}</Text>}
              </View>

              {/* Contact Number Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Contact Number</Text>
                <TextInput
                  value={contactNumber}
                  onChangeText={(text) => handleChange('contactNumber', text)}
                  onBlur={() => handleBlur('contactNumber')}
                  placeholder="09XXXXXXXXX"
                  placeholderTextColor="#888"
                  keyboardType="phone-pad"
                  maxLength={11}
                  style={styles.input}
                />
                {(touched.contactNumber || contactNumber) && errors.contactNumber && <Text style={styles.error}>{errors.contactNumber}</Text>}
              </View>

              {/* Address Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                  value={address}
                  onChangeText={(text) => handleChange('address', text)}
                  onBlur={() => handleBlur('address')}
                  placeholder="Your address"
                  placeholderTextColor="#888"
                  style={styles.input}
                />
                {(touched.address || address) && errors.address && <Text style={styles.error}>{errors.address}</Text>}
              </View>

              {/* Birthday Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Birthday</Text>
                <TouchableOpacity onPress={showDatepicker} style={styles.input}>
                  <Text style={birthday ? { color: '#333' } : { color: '#888' }}>
                    {birthday || 'Select your birthday'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}
                {(touched.birthday || birthday) && errors.birthday && <Text style={styles.error}>{errors.birthday}</Text>}
              </View>

              {/* Password Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    value={password}
                    onChangeText={(text) => handleChange('password', text)}
                    onBlur={() => handleBlur('password')}
                    placeholder="Password"
                    placeholderTextColor="#888"
                    secureTextEntry={!showPassword}
                    style={styles.passwordInput}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(prev => !prev)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={20}
                      color="#555"
                    />
                  </TouchableOpacity>
                </View>
                {password && (
                  <View style={styles.strengthContainer}>
                    <Text style={styles.strengthLabel}>Password strength:</Text>
                    <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
                      {passwordStrength}
                    </Text>
                  </View>
                )}
                {(touched.password || password) && errors.password && (
                  <Text style={styles.error}>{errors.password}</Text>
                )}
              </View>

              {/* Confirm Password Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={(text) => handleChange('confirmPassword', text)}
                    onBlur={() => handleBlur('confirmPassword')}
                    placeholder="Confirm Password"
                    placeholderTextColor="#888"
                    secureTextEntry={!showConfirmPassword}
                    style={styles.passwordInput}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(prev => !prev)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye' : 'eye-off'}
                      size={20}
                      color="#555"
                    />
                  </TouchableOpacity>
                </View>
                {(touched.confirmPassword || confirmPassword) && errors.confirmPassword && (
                  <Text style={styles.error}>{errors.confirmPassword}</Text>
                )}
              </View>

              {/* Register Button */}
              <TouchableOpacity
                onPress={handleRegister}
                style={[
                  styles.button,
                  {
                    backgroundColor: isFormValid ? '#4a90e2' : '#cccccc',
                    shadowColor: isFormValid ? '#4a90e2' : '#cccccc',
                  }
                ]}
                disabled={!isFormValid}
              >
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.replace('Login')}>
                  <Text style={styles.loginLink}>Log in</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  background: {
    flex: 1,
  },
  container: {
    padding: 25,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  logo: {
    width: 120,
    height: 120,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    color: '#333',
  },
  subHeader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
    color: '#444',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    justifyContent: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 5,
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
  button: {
    marginTop: 25,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  error: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
  },
  loginLink: {
    color: '#4a90e2',
    fontWeight: '600',
  },
});

export default RegisterScreen;