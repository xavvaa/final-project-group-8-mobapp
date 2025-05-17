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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;
type RegisterScreenRouteProp = RouteProp<RootStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
  route: RegisterScreenRouteProp;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<string>('');
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

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

  const getStrengthColor = (): string => {
    switch (passwordStrength) {
      case 'Weak': return 'red';
      case 'Medium': return 'orange';
      case 'Strong': return 'green';
      default: return 'gray';
    }
  };

  const validateField = (field: keyof typeof errors, value: string): void => {
    let error = '';
    switch (field) {
      case 'name':
        error = value ? '' : 'This field is required';
        break;
      case 'email':
        error = value ? (validateEmail(value) ? '' : 'Enter a valid email address') : 'This field is required';
        break;
      case 'password':
        error = value ? (validatePasswordStrength(value) ? '' : 'Password must include uppercase, lowercase, number, and special character') : 'This field is required';
        break;
      case 'confirmPassword':
        error = value ? (value === password ? '' : 'Passwords do not match') : 'This field is required';
        break;
    }
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleBlur = (field: keyof typeof touched): void => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, 
      field === 'name' ? name :
      field === 'email' ? email :
      field === 'password' ? password :
      confirmPassword
    );
  };

  useEffect(() => {
    const noErrors = Object.values(errors).every(e => e === '');
    const allTouched = Object.values(touched).every(t => t);
    const allFilled = name && email && password && confirmPassword;
    setIsFormValid(noErrors && allTouched && allFilled);
  }, [errors, touched, name, email, password, confirmPassword]);

  const handleRegister = async (): Promise<void> => {
    if (!isFormValid) {
      Alert.alert('Error', 'Please fix the errors in the form.');
      return;
    }

    try {
      await AsyncStorage.setItem('userName', name);
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userPassword', password);
      Alert.alert('Success', 'Registration successful!');
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to save user data.');
    }
  };

  return (
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

          <Text style={styles.header}>Register</Text>

          {/* Name Field */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            onBlur={() => handleBlur('name')}
            placeholder="Ex. Juan Dela Cruz"
            style={styles.input}
          />
          {touched.name && errors.name && <Text style={styles.error}>{errors.name}</Text>}

          {/* Email Field */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            onBlur={() => handleBlur('email')}
            placeholder="Email"
            keyboardType="email-address"
            style={styles.input}
          />
          {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

          {/* Password Field */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              onBlur={() => handleBlur('password')}
              placeholder="Password"
              secureTextEntry={!showPassword}
              style={styles.passwordInput}
            />
            <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
              <Ionicons 
                name={showPassword ? 'eye' : 'eye-off'} 
                size={24} 
                color="#555" 
              />
            </TouchableOpacity>
          </View>
          {password && (
            <Text style={{ 
              color: getStrengthColor(), 
              alignSelf: 'flex-start', 
              marginBottom: 5 
            }}>
              Strength: {passwordStrength}
            </Text>
          )}
          {touched.password && errors.password && (
            <Text style={styles.error}>{errors.password}</Text>
          )}

          {/* Confirm Password Field */}
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="Confirm Password"
              secureTextEntry={!showConfirmPassword}
              style={styles.passwordInput}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(prev => !prev)}>
              <Ionicons 
                name={showConfirmPassword ? 'eye' : 'eye-off'} 
                size={24} 
                color="#555" 
              />
            </TouchableOpacity>
          </View>
          {touched.confirmPassword && errors.confirmPassword && (
            <Text style={styles.error}>{errors.confirmPassword}</Text>
          )}

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            style={[
              styles.button, 
              { backgroundColor: isFormValid ? '#007BFF' : '#999' }
            ]}
            disabled={!isFormValid}
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>

          {/* Login Link */}
          <TouchableOpacity 
            onPress={() => navigation.replace('Login')} 
            style={styles.link}
          >
            <Text style={styles.linkText}>Already have an account? Log in</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 3,
    marginTop: 10,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
  },
  error: {
    color: 'red',
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginLeft: 5,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  link: {
    marginTop: 10,
  },
  linkText: {
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;