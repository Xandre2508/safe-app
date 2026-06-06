import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // --- Estilos Gerais do Contentor ---
  container: {
    flex: 1,
    backgroundColor: '#F4F6F7',
  },
  headerContainer: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#2C3E50',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#34495E',
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },

  // --- Botão Flutuante do Perfil ---
  profileButton: {
    position: 'absolute',
    top: 15,
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
  profileIcon: {
    fontSize: 24,
  },

  // --- Banner de Notificação Global ---
  notificationBanner: {
    backgroundColor: '#FADBD8',
    padding: 12,
    marginHorizontal: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  notificationIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  notificationText: {
    color: '#C0392B',
    fontWeight: 'bold',
    flex: 1,
  },

  // --- Painel de Estatísticas (Cards Superiores) ---
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    flex: 0.48,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statCardActive: {
    borderColor: '#E74C3C',
    borderBottomWidth: 4,
  },
  statCardDone: {
    borderColor: '#27AE60',
    borderBottomWidth: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statNumberActive: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#C0392B',
  },
  statNumberDone: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E8449',
  },

  // --- Lista de Ocorrências (Scroll) ---
  scrollList: {
    flex: 1,
    paddingHorizontal: 15,
  },

  // --- Cartão de Ocorrência Individual ---
  incidentCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  incidentCardActive: {
    borderColor: '#E74C3C',
    borderLeftWidth: 5,
  },
  incidentCardDone: {
    borderColor: '#27AE60',
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  victimName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },

  // --- Área de Badges nos Cartões ---
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F5',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#1ABC9C',
  },
  chatBadgeIcon: {
    fontSize: 12,
  },
  chatBadgeText: {
    fontSize: 10,
    color: '#16A085',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: '#E74C3C',
  },
  badgeDone: {
    backgroundColor: '#27AE60',
  },
  badgeTextActive: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgeTextDone: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // --- Informações de Localização e Alertas ---
  coordsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCoords: {
    fontSize: 14,
  },
  coordsText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 5,
  },
  warningText: {
    fontSize: 12,
    color: '#E74C3C',
    marginTop: 5,
    fontWeight: '500',
  },

  // --- Botão Sair da Central ---
  exitButton: {
    backgroundColor: '#34495E',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  exitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // ==========================================
  // VISTA B: GESTÃO TÁTICA E INTERFACE DE CHAT
  // ==========================================
  detailsMainContainer: {
    flex: 1,
    width: '100%',
    padding: 15,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    backgroundColor: '#BDC3C7',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  detailsName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
    textAlign: 'right',
    marginRight: 5,
  },
  triagemContainer: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#BDC3C7',
    shadowOpacity: 0.05,
    elevation: 2,
  },
  triagemTitle: {
    fontWeight: 'bold',
    color: '#7F8C8D',
    marginBottom: 5,
    fontSize: 12,
  },
  triagemText: {
    fontSize: 14,
    color: '#333',
  },
  triagemStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  triagemStatusCritical: {
    color: '#E74C3C',
  },
  triagemStatusSafe: {
    color: '#27AE60',
  },
  chatWrapper: {
    flex: 1,
  },
  closedContainer: {
    flex: 1,
    backgroundColor: '#EAFAF1',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#27AE60',
  },
  closedIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  closedText: {
    color: '#27AE60',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});