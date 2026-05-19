import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

const isExpoGo =
  Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';

if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export const registerForPushNotificationsAsync = async () => {
  if (!Device.isDevice) return null;
  if (isExpoGo) return null;

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
  return Notifications.scheduleNotificationAsync({
    content: { title, body, data },
    trigger: null,
  });
};

export const scheduleLocalNotificationIn = async ({ title, body, data, seconds }) => {
  if (isExpoGo || !seconds || seconds <= 0) return null;

  return Notifications.scheduleNotificationAsync({
    content: { title, body, data },
    trigger: { seconds },
  });
};

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
