import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2C3E50',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 25,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  orgBadge: {
    backgroundColor: '#E8F8F5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#117A65',
  },
  orgBadgeTitle: {
    color: '#117A65',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 2,
  },
  orgBadgeName: {
    color: '#117A65',
    fontSize: 15,
  },
  label: {
    color: '#7F8C8D',
    fontWeight: '600',
    fontSize: 13,
    marginBottom: 6,
  },
  disabledInput: {
    backgroundColor: '#EAECEE',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    color: '#7F8C8D',
    fontSize: 15,
  },
  input: {
    backgroundColor: '#FAFAFA',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 24,
    fontSize: 15,
    color: '#2C3E50',
  },
  saveButton: {
    backgroundColor: '#1A5276',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    marginTop: 25,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#E74C3C',
    fontWeight: '700',
    fontSize: 15,
  }
});