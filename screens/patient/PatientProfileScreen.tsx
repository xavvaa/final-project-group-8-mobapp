import React, { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [user, setUser] = useState({
    username: '',
    name: '',
    email: '',
    contactNumber: '',
    address: '',
    birthday: '',
    password: '',
  });

  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('currentUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load user data');
      }
    };
    loadUserData();
  }, []);

  const scheduleSave = () => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      try {
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      } catch (error) {
        Alert.alert('Error', 'Failed to save changes');
      }
    }, 1000);
  };

  const handleChange = (field: keyof typeof user, value: string) => {
    setUser((prev) => ({ ...prev, [field]: value }));
    scheduleSave();
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['userRole', 'currentUser']);
            navigation.replace('Login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getInitials = (fullName: string) => {
    if (!fullName.trim()) return 'U';
    const names = fullName.trim().split(' ');
    return names
      .slice(0, 2)
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase();
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="at" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                value={user.username}
                onChangeText={(text) => handleChange('username', text)}
                placeholder="Your username"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                value={user.name}
                onChangeText={(text) => handleChange('name', text)}
                placeholder="Your full name"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                value={user.email}
                onChangeText={(text) => handleChange('email', text)}
                keyboardType="email-address"
                placeholder="Your email"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                value={user.contactNumber}
                onChangeText={(text) => handleChange('contactNumber', text)}
                keyboardType="phone-pad"
                placeholder="09XXXXXXXXX"
                maxLength={11}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Birthday</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="calendar" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                value={user.birthday}
                onChangeText={(text) => handleChange('birthday', text)}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="home"
                size={20}
                color="#666"
                style={[styles.icon, { alignSelf: 'flex-start', marginTop: 10 }]}
              />
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                value={user.address}
                onChangeText={(text) => handleChange('address', text)}
                placeholder="Your complete address"
                multiline
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Security</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                value={user.password}
                onChangeText={(text) => handleChange('password', text)}
                secureTextEntry
                placeholder="Your password"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out" size={24} color="#fff" />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const PRIMARY_COLOR = '#4a90e2';
const SECONDARY_COLOR = '#e94b3c';
const BG_COLOR = '#f8f9fa';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  usernameText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SECONDARY_COLOR,
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: SECONDARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    gap: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ProfileScreen;