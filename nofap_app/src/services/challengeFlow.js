import AsyncStorage from '@react-native-async-storage/async-storage';
import { getChallengeMessage, getRewardMessage } from '../constants/challenges';
import { scheduleLocalNotification } from './notifications';
import { ENABLE_VOICEOVER } from '../constants/appConfig';
import { playVoiceover } from './voiceover';

const LAST_REWARD_KEY = 'lastRewardDay';
const LAST_CHALLENGE_KEY = 'lastChallengeDay';

export const getLastRewardDay = async () => {
  const stored = await AsyncStorage.getItem(LAST_REWARD_KEY);
  return stored ? parseInt(stored, 10) : 0;
};

export const getLastChallengeDay = async () => {
  const stored = await AsyncStorage.getItem(LAST_CHALLENGE_KEY);
  return stored ? parseInt(stored, 10) : 0;
};

export const setLastRewardDay = async (day) => {
  await AsyncStorage.setItem(LAST_REWARD_KEY, String(day));
};

export const setLastChallengeDay = async (day) => {
  await AsyncStorage.setItem(LAST_CHALLENGE_KEY, String(day));
};

export const triggerReward = async ({ day, tone }) => {
  const message = getRewardMessage(day, tone);
  if (!message) return false;

  await scheduleLocalNotification({
    title: 'Thưởng cột mốc',
    body: message,
    data: { type: 'reward', day },
  });

  if (ENABLE_VOICEOVER) {
    await playVoiceover(`reward_${day}`);
  }

  return true;
};

export const triggerChallenge = async ({ day, tone }) => {
  const message = getChallengeMessage(day, tone);
  if (!message) return false;

  await scheduleLocalNotification({
    title: 'Thử thách',
    body: message,
    data: { type: 'challenge', day },
  });

  if (ENABLE_VOICEOVER) {
    await playVoiceover(`challenge_${day}`);
  }

  return true;
};
