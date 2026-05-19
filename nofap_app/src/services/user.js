import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_KEY = 'userId';
const DISPLAY_NAME_KEY = 'displayName';

const randomId = () => `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const getOrCreateUserId = async () => {
  const existing = await AsyncStorage.getItem(USER_ID_KEY);
  if (existing) return existing;

  const newId = randomId();
  await AsyncStorage.setItem(USER_ID_KEY, newId);
  return newId;
};

export const getOrCreateDisplayName = async (userId) => {
  const existing = await AsyncStorage.getItem(DISPLAY_NAME_KEY);
  if (existing) return existing;

  const suffix = userId ? userId.slice(-4).toUpperCase() : '0000';
  const fallback = `Tu Si ${suffix}`;
  await AsyncStorage.setItem(DISPLAY_NAME_KEY, fallback);
  return fallback;
};

export const setDisplayName = async (name) => {
  if (!name) return;
  await AsyncStorage.setItem(DISPLAY_NAME_KEY, name);
};
