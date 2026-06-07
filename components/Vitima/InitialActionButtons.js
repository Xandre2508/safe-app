// src/components/InitialActionButtons.js
// Componente para exibir os botões iniciais de ação na tela da vítima, como SOS e pedido de apoio
// ESTA MERDA É USADA NO VICTIM DASHBOARD OBG

import { Text, TouchableOpacity, View } from 'react-native';
import { Strings } from '../../constants/Strings';
import { styles } from '../../styles/VictimDashboardStyles';

export default function InitialActionButtons({ setShowDetailsForm, setShowMantimentosForm }) {
  return (
    <View style={styles.buttonRow}>
      <TouchableOpacity style={[styles.actionButton, styles.btnSOS]} onPress={() => setShowDetailsForm(true)}>
        <Text style={styles.btnText}>{Strings.victim.btnSOS}</Text>
        <Text style={styles.btnSubText}>{Strings.victim.btnSOSSub}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionButton, styles.btnApoio]} onPress={() => setShowMantimentosForm(true)}>
        <Text style={styles.btnText}>{Strings.victim.btnSupport}</Text>
        <Text style={styles.btnSubText}>{Strings.victim.btnSupportSub}</Text>
      </TouchableOpacity>
    </View>
  );
}