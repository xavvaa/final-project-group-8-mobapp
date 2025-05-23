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
  ActivityIndicator
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
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [isFormValid, setIsFormValid] = useState(false);

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const validate = (field: 'email' | 'password', value: string) => {
    let error = '';

    if (!value) {
      error = 'This field is required';
    } else if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = 'Enter a valid email address';
    } else if (field === 'password' && value.length < 6) {
      error = 'Password must be at least 6 characters';
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  useEffect(() => {
    const noErrors = Object.values(errors).every((e) => e === '');
    const allTouched = Object.values(touched).every((t) => t);
    const allFilled = email !== '' && password !== '';
    setIsFormValid(noErrors && allTouched && allFilled);
  }, [errors, touched, email, password]);

  // In LoginScreen.tsx
  const handleLogin = async () => {
    if (!isFormValid) {
      Alert.alert('Error', 'Please fix the errors in the form.');
      return;
    }
  
    setLoading(true);
  
    try {
      // Admin login (hardcoded for demo - remove in production)
      if (email === 'admin@gmail.com' && password === 'admin123') {
        await AsyncStorage.setItem('userRole', 'admin');
        navigation.replace('AdminTabs');
        return;
      }
  
      // Patient login
      const usersJSON = await AsyncStorage.getItem('registeredUsers');
      const users = usersJSON ? JSON.parse(usersJSON) : [];
      
      // Find the user with matching email (case insensitive)
      const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  
      if (!user) {
        Alert.alert('Error', 'User not found');
        return;
      }
  
      // Check the password for the found user
      if (password !== user.password) {
        Alert.alert('Error', 'Invalid password');
        return;
      }
  
      // Successful login
      await AsyncStorage.setItem('userRole', 'patient');
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      navigation.replace('PatientTabs');
      
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to log in. Please try again.');
    } finally {
      setLoading(false);
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
          
          <Text style={styles.header}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                validate('email', text);
              }}
              placeholder="Enter your email"
              keyboardType="email-address"
              style={styles.input}
              onBlur={() => handleBlur('email')}
              autoCapitalize="none"
            />
            {touched.email && errors.email ? (
              <Text style={styles.error}>{errors.email}</Text>
            ) : null}

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  validate('password', text);
                }}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
                onBlur={() => handleBlur('password')}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="#555"
                />
              </TouchableOpacity>
            </View>
            {touched.password && errors.password ? (
              <Text style={styles.error}>{errors.password}</Text>
            ) : null}

            <TouchableOpacity
              onPress={handleLogin}
              style={[
                styles.button, 
                { 
                  backgroundColor: isFormValid ? '#4a90e2' : '#cccccc',
                  opacity: loading ? 0.7 : 1
                }
              ]}
              disabled={!isFormValid || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.replace('Register')}>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: 25,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    width: '100%',
    padding: 15,
    marginBottom: 5,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    fontSize: 16,
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 5,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
    color: '#444',
    fontSize: 14,
  },
  error: {
    color: '#ff4444',
    fontSize: 12,
    marginBottom: 15,
    marginLeft: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#4a90e2',
    fontSize: 14,
  },
  button: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  signupText: {
    color: '#666',
  },
  signupLink: {
    color: '#4a90e2',
    fontWeight: '600',
  },
});

export default LoginScreen;