import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function MantimentosDetailsForm({
  descricao,
  setDescricao,
  quantidade,
  setQuantidade,
  setShowMantimentosForm,
  handleConfirmMantimentos,
  isSending,
}) {
  return (
    <View style={localStyles.container}>
      <View style={localStyles.headerContainer}>
        <Ionicons name="cube-outline" size={24} color="#3B82F6" />
        <Text style={localStyles.title}>Pedido de Mantimentos e Apoio</Text>
      </View>

      {/* Descrição do Bem Necessário */}
      <View style={localStyles.inputWrapper}>
        <MaterialCommunityIcons name="format-list-bulleted" size={20} color="#9CA3AF" style={localStyles.inputIcon} />
        <TextInput
          style={localStyles.inputArea}
          placeholder="O que necessita? (ex: Água potável, Alimentos, Agasalhos)"
          placeholderTextColor="#9CA3AF"
          value={descricao}
          onChangeText={setDescricao}
          multiline
        />
      </View>

      {/* Quantidade Estimada */}
      <View style={localStyles.inputWrapper}>
        <MaterialCommunityIcons name="counter" size={20} color="#9CA3AF" style={localStyles.inputIcon} />
        <TextInput
          style={localStyles.inputArea}
          placeholder="Quantidade / Pessoas (ex: 4 garrafões, 3 adultos e 1 bebé)"
          placeholderTextColor="#9CA3AF"
          value={quantidade}
          onChangeText={setQuantidade}
        />
      </View>

      <View style={localStyles.buttonRow}>
        <TouchableOpacity
          style={localStyles.btnCancel}
          onPress={() => setShowMantimentosForm(false)}
          activeOpacity={0.7}
        >
          <Text style={localStyles.btnCancelText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[localStyles.btnConfirm, isSending && { opacity: 0.7 }]}
          onPress={handleConfirmMantimentos}
          disabled={isSending}
          activeOpacity={0.8}
        >
          {isSending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="send" size={18} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={localStyles.btnConfirmText}>SUBMETER PEDIDO</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    marginBottom: 14,
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
    paddingVertical: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 6,
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
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  btnConfirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
