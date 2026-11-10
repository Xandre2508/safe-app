import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function ProfileFloatingButton({ onPress, top = 15 }) {
  return (
    <TouchableOpacity
      style={[styles.floatingButton, { top }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.iconText}>👤</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    left: 15,
    zIndex: 999,
    backgroundColor: '#FFFFFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconText: {
    fontSize: 22,
  },
});
