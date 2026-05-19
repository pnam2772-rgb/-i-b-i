import { Audio } from 'expo-av';

const VOICEOVER_MAP = {
  reward_1: null,
  reward_3: null,
  reward_7: null,
  reward_9: null,
  reward_11: null,
  reward_13: null,
  reward_15: null,
  reward_17: null,
  reward_19: null,
  reward_21: null,
  reward_23: null,
  reward_30: null,
  reward_60: null,
  reward_90: null,
  reward_999: null,
  challenge_8: null,
  fail_low: null,
  fail_mid: null,
  fail_high: null,
};

export const playVoiceover = async (key) => {
  const source = VOICEOVER_MAP[key];
  if (!source) return;

  const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: true });
  sound.setOnPlaybackStatusUpdate((status) => {
    if (!status.isLoaded) return;
    if (status.didJustFinish) {
      sound.unloadAsync();
    }
  });
};
