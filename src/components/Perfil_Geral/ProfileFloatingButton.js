// src/components/ProfileFloatingButton.js
// Botão flutuante para acessar o perfil do usuário a partir de qualquer tela

import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function ProfileFloatingButton({ navigation, top = 15 }) {
  return (
    <TouchableOpacity 
      style={[styles.floatingButton, { top }]}
      onPress={() => navigation.navigate('ProfileScreen')}
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