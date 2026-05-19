import { StyleSheet, Text, View, TouchableOpacity, useWindowDimensions, Alert, StatusBar, Platform } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';

const ShieldIcon = ({ dimensions }) => (
  <View style={[styles.shieldContainer, { width: dimensions.width * 0.25, height: dimensions.width * 0.25 }]}>
    <View style={[styles.shieldBackground, { width: dimensions.width * 0.25, height: dimensions.width * 0.25, borderRadius: dimensions.width * 0.125 }]} />
    <MaterialIcons name="security" size={dimensions.width * 0.12} color={colors.gold} />
  </View>
);

const GoalButton = ({ days, realm, isSelected, onPress, dimensions }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.goalButton,
      {
        flex: 1,
        paddingVertical: dimensions.height * 0.04,
        marginHorizontal: dimensions.width * 0.02,
        backgroundColor: isSelected ? colors.gold : colors.cardBackground,
        borderWidth: 2,
        borderColor: isSelected ? colors.gold : colors.mintGreen,
      },
    ]}
  >
    <Text style={[styles.daysText, { fontSize: dimensions.width * 0.05, color: isSelected ? colors.darkNavy : colors.gold, marginBottom: dimensions.height * 0.01 }]}>
      {days} Ngày
    </Text>
    <Text style={[styles.realmText, { fontSize: dimensions.width * 0.025, color: isSelected ? colors.darkNavy : colors.grayText }]}>
      ({realm})
    </Text>
  </TouchableOpacity>
);

const BottomNavBar = ({ dimensions }) => (
  <View style={[styles.bottomNav, { height: dimensions.height * 0.08 }]}>
    <TouchableOpacity style={styles.navItem}>
      <MaterialIcons name="home" size={dimensions.width * 0.07} color={colors.gold} />
      <Text style={[styles.navLabel, { fontSize: dimensions.width * 0.03 }]}>Luyện Công</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItem}>
      <MaterialIcons name="bar-chart" size={dimensions.width * 0.07} color={colors.grayText} />
      <Text style={[styles.navLabel, { fontSize: dimensions.width * 0.03, color: colors.grayText }]}>Bảng Phong Thần</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItem}>
      <MaterialIcons name="settings" size={dimensions.width * 0.07} color={colors.grayText} />
      <Text style={[styles.navLabel, { fontSize: dimensions.width * 0.03, color: colors.grayText }]}>Công Pháp</Text>
    </TouchableOpacity>
  </View>
);

export default function OnboardingScreen() {
  const dimensions = useWindowDimensions();
  const { navigate } = useNavigation();
  const [selectedGoal, setSelectedGoal] = useState(1);

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(colors.gold);
      StatusBar.setBarStyle('dark-content');
    }
  }, []);

  const GOAL_OPTIONS = [
    { days: 7, realm: 'Luyện Khí Kỳ' },
    { days: 14, realm: 'Trúc Cơ Kỳ' },
    { days: 30, realm: 'Kim Đan Kỳ' },
  ];

  const handleStartJourney = async () => {
    try {
      const goalDays = GOAL_OPTIONS[selectedGoal].days;
      const startTime = Date.now();
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('startTime', startTime.toString());
      await AsyncStorage.setItem('targetDays', goalDays.toString());
      
      // Navigate after successful save
      navigate('MainTabs');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu dữ liệu. Vui lòng thử lại.');
      console.error('Error saving data:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="dark" />
      
      {/* Header Bar - Thanh DEV */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { fontSize: dimensions.width * 0.04 }]}>[DỊCH CHUYỂN THỜI GIAN]</Text>
        <View style={styles.headerTabs}>
          <Text style={[styles.headerTab, { fontSize: dimensions.width * 0.032 }]}>TUA 1 NGÀY</Text>
          <Text style={[styles.headerTab, { fontSize: dimensions.width * 0.032 }]}>TUA 8 NGÀY</Text>
        </View>
      </View>

      {/* Main Content - Fixed View (No Scroll) */}
      <View style={[styles.container, { paddingHorizontal: dimensions.width * 0.08 }]}>
        {/* Section 1: Logo + Title */}
        <View style={styles.section}>
          <ShieldIcon dimensions={dimensions} />
          <Text style={[styles.title, { fontSize: dimensions.width * 0.07, marginTop: dimensions.height * 0.045 }]}>
            CƯƠNG LĨNH TU ĐẠO
          </Text>
        </View>

        {/* Section 2: Subtitle - ENLARGED */}
        <View style={styles.section}>
          <Text style={[styles.subtitle, { fontSize: 18, lineHeight: 28 }]}>
            Hồng trần vạn trượng, một tay buông bỏ, nghịch thiên cải mệnh.
          </Text>
        </View>

        {/* Section 3: Goal Selection */}
        <View style={styles.section}>
          <Text style={[styles.goalLabel, { fontSize: dimensions.width * 0.036, marginBottom: dimensions.height * 0.03 }]}>
            Chọn cảnh giới tu luyện:
          </Text>
          <View style={styles.buttonRow}>
            {GOAL_OPTIONS.map((option, index) => (
              <GoalButton
                key={index}
                days={option.days}
                realm={option.realm}
                isSelected={selectedGoal === index}
                onPress={() => setSelectedGoal(index)}
                dimensions={dimensions}
              />
            ))}
          </View>
        </View>

        {/* Section 4: Start Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.startButton, { paddingVertical: dimensions.height * 0.028 }]}
            onPress={handleStartJourney}
          >
            <Text style={[styles.startButtonText, { fontSize: dimensions.width * 0.042 }]}>BƯỚC VÀO LUÂN HỒI</Text>
          </TouchableOpacity>
        </View>

        {/* Section 5: Warning Text */}
        <View style={styles.section}>
          <Text style={[styles.warningText, { fontSize: dimensions.width * 0.03, lineHeight: dimensions.width * 0.045 }]}>
            Bút sa gà chết. Một khi đã chọn con đường này, nếu tâm ma trỗi dậy làm loạn, vạn kiếp bất phục.
          </Text>
        </View>
      </View>

      {/* Bottom Navigation */}
      <BottomNavBar dimensions={dimensions} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.darkNavy,
  },
  header: {
    backgroundColor: colors.gold,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  container: {
    flex: 1,
    backgroundColor: colors.darkNavy,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
  },
  section: {
    width: '100%',
    alignItems: 'center',
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
  shieldContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldBackground: {
    position: 'absolute',
    backgroundColor: 'rgba(222, 195, 132, 0.15)',
    borderWidth: 2,
    borderColor: colors.gold,
  },
  title: {
    fontWeight: 'bold',
    color: colors.gold,
    textAlign: 'center',
    marginTop: 0,
  },
  subtitle: {
    color: colors.grayText,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 8,
  },
  goalLabel: {
    color: colors.gold,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    gap: 0,
  },
  goalButton: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysText: {
    fontWeight: 'bold',
  },
  realmText: {
    fontWeight: '500',
  },
  startButton: {
    width: '90%',
    backgroundColor: colors.mintGreen,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.gold,
  },
  startButtonText: {
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 1,
  },
  warningText: {
    color: colors.grayText,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 12,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.veryDarkNavy,
    borderTopColor: colors.gold,
    borderTopWidth: 2,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    color: colors.gold,
    marginTop: 4,
    fontWeight: '600',
  },
});
