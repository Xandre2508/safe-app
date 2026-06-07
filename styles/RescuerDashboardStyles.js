import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E5E5E5' },
  map: { width: '100%', height: '35%' },
  contentSection: { padding: 15, flex: 1 },
  headerButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  greenButton: { backgroundColor: '#1E8449', padding: 15, borderRadius: 15, width: '48%', alignItems: 'center' },
  grayButton: { backgroundColor: '#5D6D7E', padding: 15, borderRadius: 15, width: '48%', alignItems: 'center' },
  whiteIconText: { fontSize: 24, marginBottom: 5 },
  whiteText: { color: '#FFF', fontSize: 12, textAlign: 'center' },
  countText: { color: '#FFF', fontWeight: 'bold', fontSize: 14, textAlign: 'center', marginTop: 5 },
  listContainer: { flex: 1 },
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 15 },
  sectionTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 5 },
  listItem: { fontSize: 14, color: '#000000', marginBottom: 5 },
  priorityText: { fontSize: 14, color: '#E32636', fontWeight: 'bold', marginTop: 5 },
  logoutButton: { backgroundColor: '#000000', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  logoutButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});