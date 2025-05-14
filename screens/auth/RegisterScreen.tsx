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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;
type RegisterScreenRouteProp = RouteProp<RootStackParamList, 'Register'>;

type Props = {
  navigation: RegisterScreenNavigationProp;
  route: RegisterScreenRouteProp;
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validatePasswordStrength = (value: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value);

  const validate = () => {
    const newErrors = {
      name: name ? '' : 'This field is required',
      email: email
        ? validateEmail(email)
          ? ''
          : 'Enter a valid email address'
        : 'This field is required',
      password: password
        ? validatePasswordStrength(password)
          ? ''
          : 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
        : 'This field is required',
      confirmPassword: confirmPassword
        ? confirmPassword === password
          ? ''
          : 'Passwords do not match'
        : 'This field is required',
    };

    setErrors(newErrors);
    return newErrors;
  };

  const handleRegister = async () => {
    const validationErrors = validate();
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.values(validationErrors).some((e) => e !== '')) {
      Alert.alert('Error', 'Please fix the errors in the form.');
      return;
    }

    try {
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userPassword', password);
      Alert.alert('Success', 'Registration successful!');
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to save user data.');
    }
  };

  useEffect(() => {
    const newErrors = { ...errors };

    if (touched.name) {
      newErrors.name = name ? '' : 'This field is required';
    }
    if (touched.email) {
      newErrors.email = email
        ? validateEmail(email)
          ? ''
          : 'Enter a valid email address'
        : 'This field is required';
    }
    if (touched.password) {
      newErrors.password = password
        ? validatePasswordStrength(password)
          ? ''
          : 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
        : 'This field is required';
    }
    if (touched.confirmPassword) {
      newErrors.confirmPassword = confirmPassword
        ? confirmPassword === password
          ? ''
          : 'Passwords do not match'
        : 'This field is required';
    }

    setErrors(newErrors);
  }, [name, email, password, confirmPassword]);

  const handleBlur = (field: keyof typeof touched) => {
    setTouched({ ...touched, [field]: true });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.header}>Register</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            onBlur={() => handleBlur('name')}
            placeholder="Ex. Juan Dela Cruz"
            style={styles.input}
          />
          {touched.name && errors.name ? <Text style={styles.error}>{errors.name}</Text> : null}

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            onBlur={() => handleBlur('email')}
            placeholder="Email"
            keyboardType="email-address"
            style={styles.input}
          />
          {touched.email && errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            onBlur={() => handleBlur('password')}
            placeholder="Password"
            secureTextEntry
            style={styles.input}
          />
          {touched.password && errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onBlur={() => handleBlur('confirmPassword')}
            placeholder="Confirm Password"
            secureTextEntry
            style={styles.input}
          />
          {touched.confirmPassword && errors.confirmPassword ? (
            <Text style={styles.error}>{errors.confirmPassword}</Text>
          ) : null}

          <TouchableOpacity onPress={handleRegister} style={styles.button}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.link}>
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
    backgroundColor: '#007BFF',
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
