import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
  scrollList: {
    flex: 1,
    paddingHorizontal: 15,
  },
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
  coordsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coordsText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 5,
  },
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
});