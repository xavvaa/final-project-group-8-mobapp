import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AppointmentsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Book or manage your appointments here</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, color: '#333' },
});

export default AppointmentsScreen;
