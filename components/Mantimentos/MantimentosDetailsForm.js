// src/components/Mantimentos/MantimentosDetailsForm.js
// Formulário para pedir mantimentos
// ESTA MERDA TAMBÉM VAI SER USADA NO VICTIM DASHBOARD

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
// Podes continuar a usar o mesmo ficheiro de estilos para manter o design igual
import { styles } from '../../styles/VictimDashboardStyles';

export default function MantimentosDetailsForm({ 
  descricao, setDescricao, 
  quantidade, setQuantidade, 
  urgente, setUrgente, 
  setShowMantimentosForm, handleConfirmMantimentos, isSending 
}) {
  return (
    <View style={localStyles.container}>
      <View style={localStyles.headerContainer}>
        <Ionicons name="cube-outline" size={24} color="#3B82F6" />
        <Text style={localStyles.title}>Pedido de Mantimentos:</Text>
      </View>
      
      {/* Campo para o tipo de mantimento */}
      <View style={localStyles.inputWrapper}>
        <MaterialCommunityIcons name="format-list-bulleted" size={20} color="#9CA3AF" style={localStyles.inputIcon} />
        <TextInput
          style={localStyles.inputArea}
          placeholder="O que precisa? (ex: Água, Comida, Cobertores)"
          placeholderTextColor="#9CA3AF"
          value={descricao}
          onChangeText={setDescricao}
          multiline
        />
      </View>

      {/* Campo para a quantidade */}
      <View style={localStyles.inputWrapper}>
        <MaterialCommunityIcons name="counter" size={20} color="#9CA3AF" style={localStyles.inputIcon} />
        <TextInput
          style={localStyles.inputArea}
          placeholder="Quantidade (ex: 5 garrafões, 3 refeições)"
          placeholderTextColor="#9CA3AF"
          value={quantidade}
          onChangeText={setQuantidade}
        />
      </View>

      {/* Switch para marcar como urgente */}
      <View style={localStyles.switchRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="alert-circle-outline" size={20} color={urgente ? "#EF4444" : "#6B7280"} />
          <Text style={[localStyles.switchLabel, urgente && { color: '#EF4444', fontWeight: 'bold' }]}>
            É um pedido urgente?
          </Text>
        </View>
        <Switch 
          value={urgente} 
          onValueChange={setUrgente} 
          trackColor={{ false: "#D1D5DB", true: "#FCA5A5" }}
          thumbColor={urgente ? "#EF4444" : "#f4f3f4"}
        />
      </View>

      <View style={localStyles.buttonRow}>
        {/* Botão de Cancelar */}
        <TouchableOpacity style={localStyles.btnCancel} onPress={() => setShowMantimentosForm(false)}>
          <Text style={localStyles.btnCancelText}>Cancelar</Text>
        </TouchableOpacity>

        {/* Botão de Confirmar */}
        <TouchableOpacity style={[localStyles.btnConfirm, isSending && { opacity: 0.7 }]} onPress={handleConfirmMantimentos} disabled={isSending}>
          {isSending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="send" size={18} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={localStyles.btnConfirmText}>CONFIRMAR PEDIDO</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Estilos locais apenas para melhorar a aparência deste formulário
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
    marginBottom: 20,
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
    flex: 1.5, 
    backgroundColor: '#3B82F6', 
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
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