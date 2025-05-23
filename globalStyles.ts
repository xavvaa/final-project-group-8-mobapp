import { Platform, StatusBar, StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});