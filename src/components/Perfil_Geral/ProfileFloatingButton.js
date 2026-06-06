import { StyleSheet, Text, TouchableOpacity } from 'react-native';

// 1. Muda 'navigation' para 'onPress' aqui nos parâmetros
export default function ProfileFloatingButton({ onPress, top = 15 }) {
  return (
    <TouchableOpacity 
      style={[styles.floatingButton, { top }]}
      onPress={onPress} // 2. Passa diretamente a função recebida do pai
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
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  iconText: {
    fontSize: 24,
  }
});