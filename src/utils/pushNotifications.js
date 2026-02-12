import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import api from '../api';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  try {
    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Ask for permission if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permission denied');
      return null;
    }

    // Get Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: undefined, // Uses app.json's expo.extra.eas.projectId if available
    });
    const token = tokenData.data;

    // Android notification channel
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'ברירת מחדל',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563eb',
      });
    }

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

export async function savePushToken(token) {
  try {
    await api.post('/api/push-token', { token, platform: Platform.OS });
  } catch (error) {
    console.error('Error saving push token:', error);
  }
}

export async function removePushToken() {
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    await api.delete('/api/push-token', { data: { token: tokenData.data } });
  } catch (error) {
    // Silently fail on logout
  }
}
