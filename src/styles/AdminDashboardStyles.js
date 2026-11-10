import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  headerContainer: {
    marginBottom: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E3A8A',
    marginBottom: 6,
    textAlign: 'center',
  },
  orgText: {
    fontSize: 15,
    color: '#64748B',
  },
  orgNameHighlight: {
    fontWeight: '700',
    color: '#1E293B',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 18,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  inactiveToggle: {
    backgroundColor: 'transparent',
  },
  activeSocorrista: {
    backgroundColor: '#10B981',
    elevation: 2,
  },
  activeOperador: {
    backgroundColor: '#F59E0B',
    elevation: 2,
  },
  toggleText: {
    fontWeight: '700',
    color: '#64748B',
    fontSize: 13,
  },
  activeToggleText: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  submitButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
    elevation: 3,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  logoutButton: {
    backgroundColor: '#334155',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
