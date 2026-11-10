import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

/**
 * Configuração global do manipulador de notificações em primeiro plano.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Inicializa os canais de notificação necessários no Android (Android 8.0+)
 * e solicita permissões se ainda não tiverem sido concedidas.
 */
export async function initializeNotificationService() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('emergency_alerts', {
        name: 'Alertas de Emergência',
        description: 'Notificações críticas de SOS, mantimentos e ordens de resgate.',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 400, 200, 400],
        lightColor: '#EF4444',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
      });

      await Notifications.setNotificationChannelAsync('radio_messages', {
        name: 'Comunicações Rádio',
        description: 'Mensagens em tempo real entre operadores e socorristas.',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (error) {
    console.warn('[NotificationService] Falha ao configurar canais de notificação:', error);
    return false;
  }
}

/**
 * Dispara uma notificação local formatada para Android e iOS.
 */
export async function sendLocalNotification(title, body, channelId = 'emergency_alerts', data = {}) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data,
        ...(Platform.OS === 'android' ? { channelId } : {}),
      },
      trigger: null,
    });
  } catch (error) {
    console.warn('[NotificationService] Erro ao agendar notificação:', error);
  }
}
