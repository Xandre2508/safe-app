import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
  },
  headerContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A5276',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 16,
    flex: 0.48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderBottomWidth: 4, // Linha de destaque na base do cartão
  },
  statCardActive: {
    borderBottomColor: '#E74C3C', // Vermelho
  },
  statCardDone: {
    borderBottomColor: '#27AE60', // Verde
  },
  statTitle: {
    color: '#7F8C8D',
    fontWeight: '700',
    fontSize: 13,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  statNumberActive: {
    color: '#E74C3C',
    fontSize: 32,
    fontWeight: '900',
  },
  statNumberDone: {
    color: '#27AE60',
    fontSize: 32,
    fontWeight: '900',
  },
  scrollList: {
    flex: 1,
  },
  incidentCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 5, // Linha de cor na lateral para identificar rápido
  },
  incidentCardActive: {
    borderLeftColor: '#E74C3C',
  },
  incidentCardDone: {
    borderLeftColor: '#27AE60',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  victimName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2C3E50',
    flex: 1, // Faz com que o nome ocupe o espaço sem empurrar a badge
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: '#FDEDEC', // Fundo vermelho muito claro
  },
  badgeDone: {
    backgroundColor: '#EAFAF1', // Fundo verde muito claro
  },
  badgeTextActive: {
    color: '#E74C3C',
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgeTextDone: {
    color: '#27AE60',
    fontSize: 12,
    fontWeight: 'bold',
  },
  coordsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA', // Fundo acinzentado para destacar as coordenadas
    padding: 10,
    borderRadius: 8,
  },
  coordsText: {
    fontSize: 13,
    color: '#5D6D7E',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginLeft: 8,
  },
  exitButton: {
    backgroundColor: '#34495E', // Um azul noite/cinza escuro mais elegante que o preto puro
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  exitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});