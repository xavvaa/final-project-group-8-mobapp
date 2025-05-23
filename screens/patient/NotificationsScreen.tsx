import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Swipeable } from 'react-native-gesture-handler';

const SCREEN_WIDTH = Dimensions.get('window').width;

const PatientNotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const loadUserAndNotifications = async () => {
      try {
        const userData = await AsyncStorage.getItem('currentUser');
        if (userData) {
          const user = JSON.parse(userData);
          setUserEmail(user.email);

          const notificationsData = await AsyncStorage.getItem(`notifications_${user.email}`);
          const parsedNotifications = notificationsData ? JSON.parse(notificationsData) : [];
          setNotifications(parsedNotifications);
        }
      } catch (error) {
        console.error('Error loading notifications or user:', error);
      }
    };

    loadUserAndNotifications();
  }, []);

  const resolveNotification = useCallback(async (id: string) => {
    Alert.alert(
      'Resolve Notification',
      'Are you sure you want to resolve this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resolve',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedNotifications = notifications.filter(n => n.id !== id);
              setNotifications(updatedNotifications);
              await AsyncStorage.setItem(`notifications_${userEmail}`, JSON.stringify(updatedNotifications));
            } catch (error) {
              console.error('Failed to resolve notification:', error);
            }
          },
        },
      ]
    );
  }, [notifications, userEmail]);

  const renderRightActions = (id: string) => {
    return (
      <View style={styles.resolveButtonContainer}>
        <Text
          style={styles.resolveButtonText}
          onPress={() => resolveNotification(id)}
        >
          Resolve
        </Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item.id)}
      overshootRight={false}
    >
      <View style={styles.notificationCard}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
      </View>
    </Swipeable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications yet.</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f7f9fc' },
  container: { flex: 1, padding: 16, backgroundColor: '#f7f9fc' },
  notificationCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 6,
    color: '#222',
  },
  message: {
    fontSize: 15,
    color: '#555',
    marginBottom: 10,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  resolveButtonContainer: {
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    borderRadius: 12,
    marginVertical: 6,
  },
  resolveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    paddingHorizontal: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#777',
    fontSize: 16,
  },
});

export default PatientNotificationsScreen;
