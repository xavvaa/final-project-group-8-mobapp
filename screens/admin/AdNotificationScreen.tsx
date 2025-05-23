import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

type Notification = {
  id: string;
  title: string;
  message?: string;  
  body?: string;     
  read: boolean;
  timestamp: string;
};

const AdNotificationScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const stored = await AsyncStorage.getItem('adminNotifications');
        if (stored) {
          setNotifications(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    loadNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    await AsyncStorage.setItem('adminNotifications', JSON.stringify(updated));
  };

  const deleteNotification = async (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    await AsyncStorage.setItem('adminNotifications', JSON.stringify(updated));
  };

  const renderRightActions = (progress: Animated.AnimatedInterpolation, id: string) => {
    return (
      <TouchableOpacity
        onPress={() => deleteNotification(id)}
        style={styles.deleteButton}
      >
        <Ionicons name="checkmark-done" size={24} color="#fff" />
        <Text style={styles.deleteText}>Resolve</Text>
      </TouchableOpacity>
    );
  };

 const renderItem = ({ item }: { item: Notification }) => (
  <Swipeable renderRightActions={(progress) => renderRightActions(progress, item.id)}>
    <TouchableOpacity
      onPress={() => markAsRead(item.id)}
      style={[styles.notification, item.read ? styles.read : styles.unread]}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text>{item.message ?? item.body ?? 'No details available.'}</Text>
      <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
    </TouchableOpacity>
  </Swipeable>
);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Admin Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No notifications yet.</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 15 },
  notification: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unread: {
    borderLeftWidth: 5,
    borderLeftColor: '#6C63FF',
  },
  read: {
    opacity: 0.6,
  },
  title: {
    fontWeight: '700',
    marginBottom: 5,
  },
  timestamp: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: 5,
    borderRadius: 8,
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
});

export default AdNotificationScreen;
