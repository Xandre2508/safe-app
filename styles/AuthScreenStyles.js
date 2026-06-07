import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 250,
  },
  formContainer: {
    width: '85%',
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginTop: 220, 
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 25,
    padding: 5,
    marginBottom: 20,
    width: '100%',
  },
  tabButton: { 
    flex: 1, 
    paddingVertical: 10, 
    alignItems: 'center', 
    borderRadius: 20 
  },
  activeTab: { 
    backgroundColor: 'white', 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: { color: '#888', fontWeight: '600' },
  activeTabText: { color: '#1A5276' },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  input: {
    width: '100%',
    height: 48,
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
    color: '#333'
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  roleButton: {
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
    backgroundColor: '#FAFAFA'
  },
  activeRoleVitima: {
    backgroundColor: '#E74C3C', 
    borderColor: '#E74C3C',
  },
  activeRoleSocorrista: {
    backgroundColor: '#27AE60', 
    borderColor: '#27AE60',
  },
  roleText: {
    fontWeight: '600',
    color: '#888',
  },
  activeRoleText: {
    color: 'white',
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#1A5276', 
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 15,
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  linkText: { color: '#666', fontSize: 12 }
});

export default styles;