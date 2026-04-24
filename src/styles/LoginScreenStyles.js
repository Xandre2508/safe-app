import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E5E5E5', alignItems: 'center', justifyContent: 'center' },
  placeholderLogo: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#1C3E5A', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 25, marginBottom: 20, padding: 5 },
  tab: { paddingVertical: 10, paddingHorizontal: 30, borderRadius: 20 },
  activeTab: { backgroundColor: '#E0EEF5' },
  card: { width: '85%', backgroundColor: '#FFF', padding: 25, borderRadius: 15, elevation: 5 },
  label: { fontSize: 12, marginBottom: 5, color: '#333', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#EEE', borderRadius: 8, marginBottom: 15, padding: 10, backgroundColor: '#FAFAFA' },
  
  // Estilos da escolha de tipo de conta no registo
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  roleButton: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#DDD', borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  activeRoleVitima: { backgroundColor: '#333', borderColor: '#333' },
  activeRoleSocorrista: { backgroundColor: '#2E8B57', borderColor: '#2E8B57' },
  roleText: { color: '#555', fontWeight: 'bold' },
  activeRoleText: { color: '#FFF' },

  // Botão principal único
  mainButton: { backgroundColor: '#333', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  mainButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  
  forgotPassword: { textAlign: 'center', marginTop: 15, fontSize: 12, textDecorationLine: 'underline' }
});