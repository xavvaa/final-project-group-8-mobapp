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
import { Ionicons } from '@expo/vector-icons';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
  route: LoginScreenRouteProp;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [isFormValid, setIsFormValid] = useState(false);

  const validate = (field: 'email' | 'password', value: string) => {
    let error = '';

    if (!value) {
      error = 'This field is required';
    } else if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = 'Enter a valid email address';
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  useEffect(() => {
    const noErrors = Object.values(errors).every((e) => e === '');
    const allTouched = Object.values(touched).every((t) => t);
    const allFilled = email !== '' && password !== '';
    setIsFormValid(noErrors && allTouched && allFilled);
  }, [errors, touched, email, password]);

  const handleLogin = async () => {
    if (!isFormValid) {
      Alert.alert('Error', 'Please fix the errors in the form.');
      return;
    }

    if (email === 'admin@gmail.com' && password === 'admin123') {
      navigation.replace('AdminHome');
      return;
    }

    try {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const storedPassword = await AsyncStorage.getItem('userPassword');

      if (email === storedEmail && password === storedPassword) {
        navigation.replace('PatientTabs');
      } else {
        Alert.alert('Error', 'Invalid email or password');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to log in.');
    }
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate(field, field === 'email' ? email : password);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.header}>Login</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              validate('email', text);
            }}
            placeholder="Email"
            keyboardType="email-address"
            style={styles.input}
            onBlur={() => handleBlur('email')}
          />
          {touched.email && errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                validate('password', text);
              }}
              placeholder="Password"
              secureTextEntry={!showPassword}
              style={styles.passwordInput}
              onBlur={() => handleBlur('password')}
            />
            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
              <Ionicons
                name={showPassword ? 'eye' : 'eye-off'}
                size={24}
                color="#555"
              />
            </TouchableOpacity>
          </View>
          {touched.password && errors.password ? (
            <Text style={styles.error}>{errors.password}</Text>
          ) : null}

          <TouchableOpacity
            onPress={handleLogin}
            style={[styles.button, { backgroundColor: isFormValid ? '#007BFF' : '#999' }]}
            disabled={!isFormValid}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.replace('Register')} style={styles.link}>
            <Text style={styles.linkText}>Don't have an account? Register</Text>
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
    marginBottom: 5,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 3,
    marginTop: 10,
    fontWeight: '500',
    color: '#333',
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

export default LoginScreen;
