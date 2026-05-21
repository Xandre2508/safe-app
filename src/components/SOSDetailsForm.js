import { ActivityIndicator, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/VictimDashboardStyles';

export default function SOSDetailsForm({ 
  idade, setIdade, 
  estaGravida, setEstaGravida, 
  temCriancas, setTemCriancas, 
  setShowDetailsForm, handleConfirmSOS, isSending 
}) {
  return (
    <View style={styles.detailsFormContainer}>
      <Text style={styles.detailsFormTitle}>Detalhes para o Resgate (Opcional):</Text>
      
      <TextInput
        style={styles.inputField}
        placeholder="A sua Idade (ex: 35)"
        keyboardType="numeric"
        value={idade}
        onChangeText={setIdade}
      />

      <View style={styles.switchRow}>
        <Text>Está grávida?</Text>
        <Switch value={estaGravida} onValueChange={setEstaGravida} />
      </View>

      <View style={styles.switchRow}>
        <Text>Tem crianças consigo?</Text>
        <Switch value={temCriancas} onValueChange={setTemCriancas} />
      </View>

      <View style={styles.formButtonRow}>
        <TouchableOpacity style={styles.btnCancelForm} onPress={() => setShowDetailsForm(false)}>
          <Text style={styles.btnCancelFormText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnConfirmForm} onPress={handleConfirmSOS} disabled={isSending}>
          {isSending ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>CONFIRMAR SOS</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}