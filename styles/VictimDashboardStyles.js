// src/styles/VictimDashboardStyles.js
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // ==========================================
  // ESTILOS ORIGINAIS (Base)
  // ==========================================
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  
  mapContainer: {
      height: '10%', // <-- MUITO IMPORTANTE: Trocado de '40%' para uma altura fixa
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

    },
    map: { width: '100%', height: '100%' },

    bottomSection: {
      padding: 20
      // O 'flex: 1' foi removido daqui pois dentro do ScrollView não é necessário e pode causar bugs
    },
  
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
  logoutButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  // ==========================================
  // NOVOS ESTILOS (Adicionados)
  // ==========================================

  // -- Botão de Perfil Flutuante --
  profileButton: {
    position: 'absolute',
    top: 45, 
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
    fontSize: 24 
  },

  // -- Formulário de Detalhes (SOS) --
  detailsFormContainer: { 
    backgroundColor: '#f9f9f9', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 20 
  },
  detailsFormTitle: { 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  inputField: { 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderColor: '#ccc', 
    marginBottom: 15, 
    padding: 8, 
    borderRadius: 5 
  },
  switchRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  formButtonRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  btnCancelForm: { 
    backgroundColor: '#ccc', 
    padding: 15, 
    borderRadius: 10, 
    flex: 0.4, 
    alignItems: 'center' 
  },
  btnCancelFormText: { 
    color: '#333', 
    fontWeight: 'bold' 
  },
  btnConfirmForm: { 
    padding: 15, 
    borderRadius: 10, 
    flex: 0.55, 
    alignItems: 'center',
    backgroundColor: '#E63946' // Igual ao btnSOS
  },

  // -- Chat de Emergência Ativo --
  chatContainer: { 
    borderLeftColor: '#E74C3C', 
    height: 320, 
    padding: 0, 
    overflow: 'hidden', 
    marginBottom: 10 
  },
  btnDeactivateSOS: { 
    backgroundColor: '#E74C3C', 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 20 
  },
  btnDeactivateSOSText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 16 
  },

  // -- Secção de Notícias --
  newsSectionContainer: { 
    marginBottom: 15 
  },
  sectionTitle: { 
    fontWeight: 'bold', 
    fontSize: 18, 
    color: '#2C3E50', 
    marginBottom: 10, 
    marginLeft: 5 
  },
  newsLoadingContainer: { 
    alignItems: 'center', 
    padding: 30 
  },
  newsLoadingText: { 
    marginTop: 10, 
    color: '#7F8C8D' 
  },
  newsCard: { 
    borderLeftColor: '#4361EE', 
    marginBottom: 10, 
    padding: 15 
  },
  newsSourceRow: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    marginTop: 8 
  },
  newsSourceText: { 
    fontSize: 11, 
    color: '#95A5A6', 
    fontWeight: 'bold' 
  }
});