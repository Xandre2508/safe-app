import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  // Estrutura da Nav Bar Superior
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
  navChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  navChatButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB',
  },
  navChatButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginLeft: 6,
  },
  iconBadgeContainer: {
    position: 'relative',
  },
  chatBadgePulse: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  loadingMap: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#E0E0E0' 
  },
  bottomSheetShadow: { 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: -3 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 6, 
    elevation: 15 
  },
  contentSection: { 
    padding: 20, 
    paddingBottom: 40 
  },
  headerButtons: { 
    marginBottom: 15 
  },
  statusBadge: { 
    padding: 14, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  whiteIconText: { 
    color: '#FFF', 
    fontSize: 15, 
    fontWeight: 'bold' 
  },
  countText: { 
    color: '#FFF', 
    fontSize: 17, 
    marginTop: 3,
    fontWeight: '500' 
  },
  card: { 
    backgroundColor: '#F9FAFB', 
    padding: 16, 
    borderRadius: 14, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 10,
    color: '#1F2937'
  },
  highlightDistance: { 
    fontSize: 22, 
    fontWeight: '900', 
    color: '#111827', 
    marginBottom: 8 
  },
  listItem: { 
    fontSize: 16, 
    marginBottom: 5,
    color: '#4B5563'
  },
  priorityBox: { 
    backgroundColor: '#FEF2F2', 
    padding: 12, 
    borderRadius: 10, 
    marginTop: 10, 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FEE2E2'
  },
  priorityText: { 
    color: '#991B1B', 
    fontWeight: 'bold',
    fontSize: 14
  },
  completeButton: { 
    backgroundColor: '#10B981', 
    padding: 15, 
    borderRadius: 10, 
    marginTop: 12, 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  completeButtonText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  chatContainer: { 
    flex: 1, 
    minHeight: 400 
  },
  chatHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15, 
    paddingBottom: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB' 
  },
  backButton: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  backButtonText: { 
    marginLeft: 8, 
    fontSize: 15, 
    fontWeight: 'bold', 
    color: '#1F2937' 
  },
});