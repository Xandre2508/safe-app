import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F7' },
  
  // --- ESTRUTURA DA NAV BAR SUPERIOR FIXA ---
  navBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  navButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 2,
  },
  
  // --- ABAS INTEGRADAS NA NAVBAR (Toggle) ---
  navTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 4,
    width: 220, 
  },
  navTabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 16,
  },
  navTabButtonActive: {
    backgroundColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  navTabText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  navTabTextActive: {
    color: '#FFF',
  },

  // --- ESPAÇAMENTO PARA O CONTEÚDO ---
  contentPadding: {
    paddingTop: 110, // Empurra as listas para baixo para não ficarem escondidas pela Navbar
    flex: 1,
  },

  // --- Lista de Socorristas (Rádio) ---
  rescuerCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 12, marginHorizontal: 15, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  rescuerInfo: { flex: 1, marginLeft: 15 },
  rescuerName: { fontSize: 16, fontWeight: 'bold', color: '#2C3E50' },
  rescuerStatus: { fontSize: 13, color: '#27AE60', marginTop: 4, fontWeight: '600' },
  chatIconButton: { backgroundColor: '#EFF6FF', padding: 10, borderRadius: 20 },

  // --- Lista de Ocorrências (SOS) ---
  notificationBanner: { backgroundColor: '#FADBD8', padding: 12, marginHorizontal: 15, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#E74C3C' },
  notificationText: { color: '#C0392B', fontWeight: 'bold', flex: 1 },
  statsContainer: { flexDirection: 'row', paddingHorizontal: 15, justifyContent: 'space-between', marginBottom: 15 },
  statCard: { flex: 0.48, padding: 15, borderRadius: 10, alignItems: 'center', borderWidth: 1, backgroundColor: '#FFF', borderColor: 'transparent', elevation: 2 },
  statCardActive: { borderColor: '#E74C3C', borderBottomWidth: 4 },
  statCardDone: { borderColor: '#27AE60', borderBottomWidth: 4 },
  statTitle: { fontSize: 14, color: '#7F8C8D', fontWeight: 'bold', marginBottom: 5 },
  statNumberActive: { fontSize: 26, fontWeight: 'bold', color: '#C0392B' },
  statNumberDone: { fontSize: 26, fontWeight: 'bold', color: '#1E8449' },
  scrollList: { flex: 1, paddingHorizontal: 15 },
  incidentCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: 'transparent', elevation: 3 },
  incidentCardActive: { borderColor: '#E74C3C', borderLeftWidth: 5 },
  incidentCardDone: { borderColor: '#27AE60', opacity: 0.7 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  victimName: { fontSize: 16, fontWeight: 'bold', color: '#2C3E50', flex: 1 },
  badgesRow: { flexDirection: 'row', alignItems: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeActive: { backgroundColor: '#E74C3C' },
  badgeDone: { backgroundColor: '#27AE60' },
  badgeTextActive: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  badgeTextDone: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  coordsContainer: { flexDirection: 'row', alignItems: 'center' },
  coordsText: { fontSize: 14, color: '#7F8C8D', marginLeft: 5 },
  warningText: { fontSize: 12, color: '#E74C3C', marginTop: 5, fontWeight: '500' },
  
  // Badges extra
  chatBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  chatBadgeIcon: { fontSize: 10, marginRight: 4 },
  chatBadgeText: { fontSize: 10, color: '#3B82F6', fontWeight: 'bold' },
});