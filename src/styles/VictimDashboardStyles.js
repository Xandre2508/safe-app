// src/styles/VictimDashboardStyles.js
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  
  mapContainer: {
    height: '40%',
    width: '100%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: '#FFF',
    zIndex: 1
  },
  map: { width: '100%', height: '100%' },
  
  bottomSection: { padding: 20, flex: 1 },
  
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  actionButton: { 
    width: '48%', 
    height: 100, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  btnSOS: { backgroundColor: '#E63946' },
  btnApoio: { backgroundColor: '#4361EE' },
  btnText: { color: '#FFF', fontWeight: '900', fontSize: 26, letterSpacing: 1 },
  btnSubText: { color: '#FFF', fontSize: 13, opacity: 0.9, marginTop: 4 },
  
  statusCard: { 
    backgroundColor: '#FFF', 
    padding: 18, 
    borderRadius: 16, 
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#FCA311'
  },
  statusTitle: { fontWeight: '700', fontSize: 15, marginBottom: 8, color: '#2B2D42' },
  alertText: { color: '#E63946', fontWeight: 'bold', marginBottom: 6, fontSize: 14 },
  infoText: { fontSize: 13, color: '#6D6875', lineHeight: 20 },
  
  logoutButton: { 
    backgroundColor: '#2B2D42', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10,
    marginBottom: 40 
  },
  logoutButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});