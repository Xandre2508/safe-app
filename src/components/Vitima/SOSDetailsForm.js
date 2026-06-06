// src/components/SOSDetailsForm.js
// Formulário para apanhar detalhes adicionais do usuário durante o processo de SOS
// ESTA MERDA É USADA NO VICTIM DASHBOARD OBG

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SOSDetailsForm({ 
  idade, setIdade, 
  estaGravida, setEstaGravida, 
  temCriancas, setTemCriancas, 
  setShowDetailsForm, handleConfirmSOS, isSending 
}) {
  return (
    <View style={localStyles.container}>
      <View style={localStyles.headerContainer}>
        <Ionicons name="shield-alert-outline" size={24} color="#EF4444" />
        <Text style={localStyles.title}>Detalhes para o Resgate:</Text>
      </View>
      
      {/* Campo para a Idade */}
      <View style={localStyles.inputWrapper}>
        <Ionicons name="person-outline" size={20} color="#9CA3AF" style={localStyles.inputIcon} />
        <TextInput
          style={localStyles.inputArea}
          placeholder="A sua Idade (ex: 35)"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          value={idade}
          onChangeText={setIdade}
        />
      </View>

      {/* Switch para grávida */}
      <View style={localStyles.switchRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="baby-carriage" size={20} color={estaGravida ? "#EF4444" : "#6B7280"} />
          <Text style={[localStyles.switchLabel, estaGravida && { color: '#EF4444', fontWeight: 'bold' }]}>
            Está grávida?
          </Text>
        </View>
        <Switch 
          value={estaGravida} 
          onValueChange={setEstaGravida} 
          trackColor={{ false: "#D1D5DB", true: "#FCA5A5" }}
          thumbColor={estaGravida ? "#EF4444" : "#f4f3f4"}
        />
      </View>

      {/* Switch para crianças */}
      <View style={localStyles.switchRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="human-child" size={20} color={temCriancas ? "#EF4444" : "#6B7280"} />
          <Text style={[localStyles.switchLabel, temCriancas && { color: '#EF4444', fontWeight: 'bold' }]}>
            Tem crianças consigo?
          </Text>
        </View>
        <Switch 
          value={temCriancas} 
          onValueChange={setTemCriancas} 
          trackColor={{ false: "#D1D5DB", true: "#FCA5A5" }}
          thumbColor={temCriancas ? "#EF4444" : "#f4f3f4"}
        />
      </View>

      <View style={localStyles.buttonRow}>
        {/* Botão de Cancelar */}
        <TouchableOpacity style={localStyles.btnCancel} onPress={() => setShowDetailsForm(false)}>
          <Text style={localStyles.btnCancelText}>Cancelar</Text>
        </TouchableOpacity>

        {/* Botão de Confirmar */}
        <TouchableOpacity style={[localStyles.btnConfirm, isSending && { opacity: 0.7 }]} onPress={handleConfirmSOS} disabled={isSending}>
          {isSending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="warning-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={localStyles.btnConfirmText}>CONFIRMAR SOS</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Estilos locais para unificar o design com o formulário de mantimentos
const localStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 12,
    minHeight: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputArea: {
    flex: 1,
    color: '#1F2937',
    fontSize: 15,
    paddingVertical: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 15,
    color: '#4B5563',
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12, 
    marginTop: 5,
  },
  btnCancel: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelText: {
    color: '#4B5563',
    fontSize: 15,
    fontWeight: '600',
  },
  btnConfirm: {
    flex: 1.6, 
    backgroundColor: '#EF4444', // Vermelho forte para o SOS
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  btnConfirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  }
});