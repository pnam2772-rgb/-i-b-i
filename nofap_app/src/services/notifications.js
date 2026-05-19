import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

const isExpoGo =
  Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';

const loadNotificationsModule = async () => {
  if (isExpoGo) return null;

  const Notifications = await import('expo-notifications');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  return Notifications;
};

if (!isExpoGo) {
  loadNotificationsModule();
}

export const registerForPushNotificationsAsync = async () => {
  if (!Device.isDevice) return null;
  if (isExpoGo) return null;

  const Notifications = await loadNotificationsModule();
  if (!Notifications) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  const tokenData = await Notifications.getExpoPushTokenAsync();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#DEC384',
    });
  }

  return tokenData?.data ?? null;
};

export const scheduleLocalNotification = async ({ title, body, data }) => {
  if (isExpoGo) return null;

  const Notifications = await loadNotificationsModule();
  if (!Notifications) return null;
  return Notifications.scheduleNotificationAsync({
    content: { title, body, data },
    trigger: null,
  });
};

export const scheduleLocalNotificationIn = async ({ title, body, data, seconds }) => {
  if (isExpoGo || !seconds || seconds <= 0) return null;

  const Notifications = await loadNotificationsModule();
  if (!Notifications) return null;

  return Notifications.scheduleNotificationAsync({
    content: { title, body, data },
    trigger: { seconds },
  });
};

export const cancelAllNotifications = async () => {
  if (isExpoGo) return;

  const Notifications = await loadNotificationsModule();
  if (!Notifications) return;

  await Notifications.cancelAllScheduledNotificationsAsync();
};
