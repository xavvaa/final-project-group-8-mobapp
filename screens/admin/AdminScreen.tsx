// AdminScreen.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AdminScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to the Admin Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default AdminScreen;
