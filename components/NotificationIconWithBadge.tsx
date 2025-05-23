import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

type Props = {
  onPress: () => void;
};

const NotificationIconWithBadge: React.FC<Props> = ({ onPress }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const isFocused = useIsFocused();

  const fetchUnreadCount = async () => {
    try {
      const stored = await AsyncStorage.getItem('adminNotifications');
      if (stored) {
        const notifications = JSON.parse(stored);
        const unread = notifications.filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      } else {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchUnreadCount();
    }
  }, [isFocused]);

  return (
    <TouchableOpacity onPress={onPress} style={{ marginRight: 15 }}>
      <Ionicons name="notifications-outline" size={28} color="#333" />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: 'red',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default NotificationIconWithBadge;
