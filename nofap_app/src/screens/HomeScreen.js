import { StyleSheet, Text, View, TouchableOpacity, useWindowDimensions, ScrollView, Platform, StatusBar, Modal } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { ENABLE_PUSH_NOTIFICATIONS } from '../constants/appConfig';
import { getFailMessage } from '../constants/challenges';
import { getCurrentStage, getNearestRewardDay } from '../utils/cultivation';
import { registerForPushNotificationsAsync } from '../services/notifications';
import { savePushToken, upsertLeaderboardEntry } from '../services/leaderboard';
import { useAppSettings } from '../context/AppSettingsContext';
import {
  getLastChallengeDay,
  getLastRewardDay,
  setLastChallengeDay,
  setLastRewardDay,
  triggerChallenge,
  triggerReward,
} from '../services/challengeFlow';

const CircularTimer = ({ dimensions, elapsedSeconds, label }) => {
  const formatTime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return {
      days: String(days).padStart(2, '0'),
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(secs).padStart(2, '0'),
    };
  };

  const time = formatTime(elapsedSeconds);

  return (
    <View style={[styles.timerContainer, { 
      width: dimensions.width * 0.65,
      height: dimensions.width * 0.65,
    }]}>
      <View style={[styles.circleBackground, { 
        width: dimensions.width * 0.65,
        height: dimensions.width * 0.65,
        borderRadius: dimensions.width * 0.325,
      }]} />

      <View style={[
        styles.progressCircle,
        { 
          width: dimensions.width * 0.6,
          height: dimensions.width * 0.6,
          borderRadius: dimensions.width * 0.3,
          borderTopColor: colors.gold, 
          borderRightColor: colors.gold 
        },
      ]} />

      <View style={styles.timerContent}>
        <Text style={[styles.timerDays, { fontSize: dimensions.width * 0.12 }]}>{time.days}</Text>
        <Text style={[styles.timerLabel, { fontSize: dimensions.width * 0.035 }]}>{label}</Text>
        <Text style={[styles.timerTime, { fontSize: dimensions.width * 0.045 }]}>
          {time.hours}:{time.minutes}:{time.seconds}
        </Text>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const dimensions = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { copy, themeKey, userId, displayName, challengeTone, notificationsEnabled, isExpoGo } = useAppSettings();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [targetDays, setTargetDays] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [lastRewardDay, setLastRewardDayState] = useState(0);
  const [lastChallengeDay, setLastChallengeDayState] = useState(0);
  const [modalContent, setModalContent] = useState({
    title: '',
    titleColor: colors.gold,
    content: '',
  });
  
  const tabBarHeight = 80;
  const statusBarHeight = Platform.OS === 'android' ? 30 : insets.top;

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(colors.gold);
      StatusBar.setBarStyle('dark-content');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrapUser = async () => {
      const storedRewardDay = await getLastRewardDay();
      const storedChallengeDay = await getLastChallengeDay();

      if (!isMounted) return;

      setLastRewardDayState(storedRewardDay);
      setLastChallengeDayState(storedChallengeDay);

      if (ENABLE_PUSH_NOTIFICATIONS && notificationsEnabled && userId && !isExpoGo) {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await savePushToken({ userId, token, platform: Platform.OS });
        }
      }
    };

    if (userId) {
      bootstrapUser();
    }

    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Load startTime from AsyncStorage and setup interval
  useEffect(() => {
    const initializeTimer = async () => {
      try {
        const savedStartTime = await AsyncStorage.getItem('startTime');
        const savedTargetDays = await AsyncStorage.getItem('targetDays');
        
        if (savedStartTime && savedTargetDays) {
          const parsedStartTime = parseInt(savedStartTime, 10);
          const parsedTargetDays = parseInt(savedTargetDays, 10);
          
          setStartTime(parsedStartTime);
          setTargetDays(parsedTargetDays);
          
          // Calculate initial elapsed time
          const now = Date.now();
          const elapsed = Math.floor((now - parsedStartTime) / 1000);
          setElapsedSeconds(elapsed > 0 ? elapsed : 0);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    initializeTimer();
  }, []);

  // Update timer every second
  useEffect(() => {
    if (startTime === null) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedSeconds(elapsed > 0 ? elapsed : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    if (startTime === null) return;

    const checkMilestones = async () => {
      const elapsedDays = Math.floor(elapsedSeconds / 86400);
      if (elapsedDays <= 0) return;

      const rewardDay = getNearestRewardDay(elapsedDays, themeKey);
      if (rewardDay > lastRewardDay) {
        if (notificationsEnabled) {
          await triggerReward({ day: rewardDay, tone: challengeTone, theme: themeKey });
        }

        await setLastRewardDay(rewardDay);
        setLastRewardDayState(rewardDay);

        const stage = getCurrentStage(rewardDay, themeKey);
        await upsertLeaderboardEntry({
          userId,
          displayName,
          days: rewardDay,
          levelName: stage?.name || '',
        });
      }

      if (elapsedDays >= 8 && lastChallengeDay < 8) {
        if (notificationsEnabled) {
          await triggerChallenge({ day: 8, tone: challengeTone, theme: themeKey });
        }
        await setLastChallengeDay(8);
        setLastChallengeDayState(8);
      }
    };

    checkMilestones();
  }, [elapsedSeconds, lastRewardDay, lastChallengeDay, startTime, userId, displayName, notificationsEnabled, challengeTone, themeKey]);

  // Dev tools - fast forward 1 day
  const handleFastForward1Day = async () => {
    try {
      const newStartTime = startTime - (24 * 60 * 60 * 1000);
      await AsyncStorage.setItem('startTime', newStartTime.toString());
      setStartTime(newStartTime);
      
      const now = Date.now();
      const elapsed = Math.floor((now - newStartTime) / 1000);
      setElapsedSeconds(elapsed > 0 ? elapsed : 0);
    } catch (error) {
      console.error('Error updating time:', error);
    }
  };

  // Dev tools - fast forward 8 days
  const handleFastForward8Days = async () => {
    try {
      const newStartTime = startTime - (8 * 24 * 60 * 60 * 1000);
      await AsyncStorage.setItem('startTime', newStartTime.toString());
      setStartTime(newStartTime);
      
      const now = Date.now();
      const elapsed = Math.floor((now - newStartTime) / 1000);
      setElapsedSeconds(elapsed > 0 ? elapsed : 0);
    } catch (error) {
      console.error('Error updating time:', error);
    }
  };

  // Handle Failure - Show shame modal based on elapsed time
  const handleFailure = () => {
    const elapsedDays = Math.floor(elapsedSeconds / 86400);
    const failCopy = getFailMessage(elapsedDays, themeKey, challengeTone);
    const titleColor = elapsedDays < 3 ? colors.redWarning : colors.gold;

    setModalContent({
      title: failCopy.title,
      titleColor,
      content: failCopy.body,
    });
    setModalVisible(true);
  };

  // Handle Reset - Clear data and go back to Onboarding
  const handleReset = async () => {
    try {
      await AsyncStorage.removeItem('startTime');
      await AsyncStorage.removeItem('targetDays');
      await setLastRewardDay(0);
      await setLastChallengeDay(0);
      setLastRewardDayState(0);
      setLastChallengeDayState(0);
      setModalVisible(false);
      navigation.replace('Onboarding');
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  };

  const elapsedDays = Math.floor(elapsedSeconds / 86400);
  const currentStage = getCurrentStage(elapsedDays, themeKey);

  return (
    <View style={{ flex: 1, backgroundColor: colors.darkNavy }}>
      <ExpoStatusBar style="dark" />
      {/* Header Bar - Thanh DEV with Dev Tools */}
      <View style={[styles.header, { paddingTop: statusBarHeight }]}>
        <Text style={[styles.headerTitle, { fontSize: dimensions.width * 0.04 }]}>{copy.homeHeaderLabel}</Text>
        <View style={styles.headerTabs}>
          <TouchableOpacity 
            style={styles.headerTab}
            onPress={handleFastForward1Day}
          >
            <Text style={[{ fontSize: dimensions.width * 0.032 }]}>{copy.homeFastForward1}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerTab}
            onPress={handleFastForward8Days}
          >
            <Text style={[{ fontSize: dimensions.width * 0.032 }]}>{copy.homeFastForward8}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content ScrollView */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: tabBarHeight + 30,
          paddingHorizontal: 20,
          justifyContent: 'space-evenly',
          alignItems: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Section - Level Info */}
        <View style={styles.topSection}>
          <View style={styles.levelInfo}>
            <Text style={[styles.levelLabel, { fontSize: dimensions.width * 0.03 }]}>{copy.homeLevelLabel}</Text>
            <View style={styles.levelRow}>
              <MaterialIcons name="eco" size={dimensions.width * 0.06} color={colors.gold} />
              <Text style={[styles.levelName, { fontSize: dimensions.width * 0.042 }]}>
                {currentStage?.name || copy.homeStartingLevel}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.avatarButton, { width: dimensions.width * 0.15, height: dimensions.width * 0.15 }]}
            onPress={() => navigation.navigate('MainTabs', { screen: 'SettingsTab' })}
          >
            <MaterialIcons name="person" size={dimensions.width * 0.08} color={colors.gold} />
          </TouchableOpacity>
        </View>

        {/* Central Timer */}
        <CircularTimer
          dimensions={dimensions}
          elapsedSeconds={elapsedSeconds}
          label={copy.homeTimerLabel}
        />

        {/* Quote Section */}
        <View style={[styles.quoteContainer, { paddingHorizontal: dimensions.width * 0.04, paddingVertical: dimensions.height * 0.02 }]}>
          <Text style={[styles.quoteText, { fontSize: dimensions.width * 0.032, lineHeight: dimensions.width * 0.048 }]}>
            {copy.homeQuote}
          </Text>
        </View>

        {/* Fallen Button */}
        <TouchableOpacity 
          style={[styles.fallenButton, { paddingVertical: dimensions.height * 0.022 }]}
          onPress={handleFailure}
        >
          <Text style={[styles.fallenButtonText, { fontSize: dimensions.width * 0.038 }]}>
            {copy.homeFailButton}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Shame Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: dimensions.width * 0.85 }]}>
            {/* Modal Title */}
            <Text style={[styles.modalTitle, { color: modalContent.titleColor, fontSize: dimensions.width * 0.08 }]}>
              {modalContent.title}
            </Text>

            {/* Modal Body */}
            <Text style={[styles.modalBody, { fontSize: dimensions.width * 0.04, marginVertical: dimensions.height * 0.03 }]}>
              {modalContent.content}
            </Text>

            {/* Reset Button */}
            <TouchableOpacity 
              style={[styles.resetButton, { paddingVertical: dimensions.height * 0.02, marginTop: dimensions.height * 0.02 }]}
              onPress={handleReset}
            >
              <Text style={[styles.resetButtonText, { fontSize: dimensions.width * 0.038 }]}>
                {copy.homeResetButton}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.gold,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: colors.darkNavy,
    marginBottom: 8,
  },
  headerTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  headerTab: {
    fontWeight: '600',
    color: colors.darkNavy,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  topSection: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelInfo: {
    flex: 1,
  },
  levelLabel: {
    color: colors.grayText,
    marginBottom: 4,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelName: {
    fontWeight: 'bold',
    color: colors.gold,
  },
  avatarButton: {
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 191, 165, 0.12)',
  },
  timerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circleBackground: {
    position: 'absolute',
    backgroundColor: 'rgba(222, 195, 132, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(222, 195, 132, 0.2)',
  },
  progressCircle: {
    position: 'absolute',
    borderWidth: 6,
    borderColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  timerContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  timerDays: {
    fontWeight: 'bold',
    color: colors.gold,
  },
  timerLabel: {
    color: colors.grayText,
    marginTop: 4,
    letterSpacing: 2,
  },
  timerTime: {
    color: colors.grayText,
    marginTop: 8,
    fontWeight: '500',
  },
  quoteContainer: {
    width: '100%',
    backgroundColor: 'rgba(222, 195, 132, 0.08)',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.gold,
  },
  quoteText: {
    color: colors.grayText,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  fallenButton: {
    width: '100%',
    backgroundColor: colors.redWarning,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.goldDim,
  },
  fallenButtonText: {
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gold,
  },
  modalTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalBody: {
    color: colors.grayText,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  resetButton: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.grayText,
  },
  resetButtonText: {
    fontWeight: 'bold',
    color: colors.darkNavy,
    letterSpacing: 0.5,
  },
});
