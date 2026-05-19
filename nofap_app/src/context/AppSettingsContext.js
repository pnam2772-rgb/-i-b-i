import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CHALLENGE_TONE, COPY_THEME, ENABLE_PUSH_NOTIFICATIONS } from '../constants/appConfig';
import { getCopy } from '../constants/copyThemes';
import { getOrCreateDisplayName, getOrCreateUserId, setDisplayName as saveDisplayName } from '../services/user';
import { cancelAllNotifications } from '../services/notifications';

const THEME_KEY = 'copyTheme';
const NOTIFICATIONS_KEY = 'notificationsEnabled';
const TONE_KEY = 'challengeTone';

const AppSettingsContext = createContext(null);

export const AppSettingsProvider = ({ children }) => {
  const isExpoGo =
    Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';
  const [themeKey, setThemeKey] = useState(COPY_THEME);
  const [notificationsEnabled, setNotificationsEnabled] = useState(ENABLE_PUSH_NOTIFICATIONS);
  const [challengeTone, setChallengeTone] = useState(CHALLENGE_TONE);
  const [userId, setUserId] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      const storedTheme = await AsyncStorage.getItem(THEME_KEY);
      const resolvedTheme = storedTheme || COPY_THEME;
      const storedNotifications = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      const storedTone = await AsyncStorage.getItem(TONE_KEY);
      const storedUserId = await getOrCreateUserId();
      const storedDisplayName = await getOrCreateDisplayName(storedUserId);

      if (!isMounted) return;

      setThemeKey(resolvedTheme);
      setNotificationsEnabled(
        isExpoGo
          ? false
          : storedNotifications === null
          ? ENABLE_PUSH_NOTIFICATIONS
          : storedNotifications === 'true'
      );
      setChallengeTone(storedTone || CHALLENGE_TONE);
      setUserId(storedUserId);
      setDisplayName(storedDisplayName);
      setIsReady(true);
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateTheme = async (nextTheme) => {
    setThemeKey(nextTheme);
    await AsyncStorage.setItem(THEME_KEY, nextTheme);
  };

  const updateDisplayName = async (nextName) => {
    setDisplayName(nextName);
    await saveDisplayName(nextName);
  };

  const updateNotificationsEnabled = async (nextValue) => {
    if (isExpoGo && nextValue) {
      setNotificationsEnabled(false);
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, 'false');
      return;
    }

    setNotificationsEnabled(nextValue);
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, String(nextValue));
    if (!nextValue) {
      await cancelAllNotifications();
    }
  };

  const updateChallengeTone = async (nextTone) => {
    setChallengeTone(nextTone);
    await AsyncStorage.setItem(TONE_KEY, nextTone);
  };

  const value = useMemo(
    () => ({
      themeKey,
      copy: getCopy(themeKey),
      userId,
      displayName,
      notificationsEnabled,
      isExpoGo,
      challengeTone,
      isReady,
      updateTheme,
      updateDisplayName,
      updateNotificationsEnabled,
      updateChallengeTone,
    }),
    [themeKey, userId, displayName, notificationsEnabled, challengeTone, isReady, isExpoGo]
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
};

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within AppSettingsProvider');
  }
  return context;
};
