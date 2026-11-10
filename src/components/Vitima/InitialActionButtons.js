import { Text, TouchableOpacity, View } from 'react-native';
import { Strings } from '../../constants/Strings';
import { styles } from '../../styles/VictimDashboardStyles';

export default function InitialActionButtons({ setShowDetailsForm, setShowMantimentosForm }) {
  return (
    <View style={styles.buttonRow}>
      <TouchableOpacity
        style={[styles.actionButton, styles.btnSOS]}
        onPress={() => setShowDetailsForm(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.btnText}>{Strings.victim.btnSOS}</Text>
        <Text style={styles.btnSubText}>{Strings.victim.btnSOSSub}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.btnApoio]}
        onPress={() => setShowMantimentosForm(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.btnText}>{Strings.victim.btnSupport}</Text>
        <Text style={styles.btnSubText}>{Strings.victim.btnSupportSub}</Text>
      </TouchableOpacity>
    </View>
  );
}
