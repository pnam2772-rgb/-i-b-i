import { StyleSheet, Text, View, TouchableOpacity, Alert, useWindowDimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const GOAL_OPTIONS = [
  { id: 7, label: '7 Ngày', realm: '(Luyện Khí Kỳ)' },
  { id: 14, label: '14 Ngày', realm: '(Trúc Cơ Kỳ)' },
  { id: 30, label: '30 Ngày', realm: '(Kim Đan Kỳ)' },
];

const ShieldIcon = ({ dimensions }) => (
  <View style={[styles.shieldContainer, { 
    width: dimensions.width * 0.35,
    height: dimensions.width * 0.35,
    borderRadius: dimensions.width * 0.175,
  }]}>
    <MaterialIcons name="security" size={dimensions.width * 0.15} color="#D4AF37" />
  </View>
);

const GoalButton = ({ goal, isSelected, onPress, dimensions }) => (
  <TouchableOpacity
    style={[
      styles.goalButton,
      isSelected && styles.goalButtonSelected,
      { paddingHorizontal: dimensions.width * 0.04 }
    ]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.goalButtonText,
        isSelected && styles.goalButtonTextSelected,
        { fontSize: dimensions.width * 0.032 }
      ]}
    >
      {goal.label}
    </Text>
    <Text
      style={[
        styles.goalRealmText,
        isSelected && styles.goalRealmTextSelected,
        { fontSize: dimensions.width * 0.024 }
      ]}
    >
      {goal.realm}
    </Text>
  </TouchableOpacity>
);

const BottomNavBar = ({ dimensions }) => (
  <View style={[styles.bottomNav, { height: dimensions.height * 0.08 }]}>
    <TouchableOpacity style={styles.navItem}>
      <MaterialIcons name="home" size={dimensions.width * 0.07} color="#D4AF37" />
      <Text style={[styles.navLabel, { fontSize: dimensions.width * 0.03 }]}>Luyện Công</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItem}>
      <MaterialIcons name="bar-chart" size={dimensions.width * 0.07} color="#6B7C99" />
      <Text style={[styles.navLabel, { fontSize: dimensions.width * 0.03, color: '#6B7C99' }]}>Bảng Xếp</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItem}>
      <MaterialIcons name="settings" size={dimensions.width * 0.07} color="#6B7C99" />
      <Text style={[styles.navLabel, { fontSize: dimensions.width * 0.03, color: '#6B7C99' }]}>Tu Hành</Text>
    </TouchableOpacity>
  </View>
);

export default function OnboardingScreen() {
  const [selectedGoal, setSelectedGoal] = useState(14);
  const navigation = useNavigation();
  const dimensions = useWindowDimensions();
  const statusBarHeight = StatusBar.currentHeight || 0;
  const bottomPadding = 100; // Fixed padding for bottom nav bar
  const topMargin = statusBarHeight + 8;

  const handleStartJourney = () => {
    Alert.alert(
      'Xác nhận',
      `Bước vào luân hồi tu luyện ${selectedGoal} ngày?`,
      [
        { text: 'Nhuống bộ', style: 'cancel' },
        {
          text: 'Bước vào',
          onPress: () => {
            console.log('Journey started!');
            navigation.navigate('Home');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingBottom: bottomPadding }]}>
        {/* Header */}
        <View style={[styles.header, { paddingVertical: dimensions.height * 0.015, marginTop: topMargin }]}>
          <Text style={[styles.headerTitle, { fontSize: dimensions.width * 0.04 }]}>[DỊCH CHUYỂN THỜI GIAN]</Text>
          <View style={styles.headerTabs}>
            <Text style={[styles.headerTab, { fontSize: dimensions.width * 0.032 }]}>TUA 1 NGÀY</Text>
            <Text style={[styles.headerTab, { fontSize: dimensions.width * 0.032 }]}>TUA 8 NGÀY</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Shield Icon */}
          <ShieldIcon dimensions={dimensions} />

          {/* Title */}
          <Text style={[styles.title, { fontSize: dimensions.width * 0.085 }]}>CƯƠNG LĨNH TU ĐẠO</Text>

          {/* Subtitle */}
          <Text style={[styles.subtitle, { fontSize: dimensions.width * 0.033, lineHeight: dimensions.width * 0.048 }]}>
            Hồng trần vạn trượng, một tay buông bỏ, nghịch thiên cải mệnh.
          </Text>

          {/* Goal Selection */}
          <View style={[styles.goalSection, { marginBottom: dimensions.height * 0.04 }]}>
            <Text style={[styles.goalLabel, { fontSize: dimensions.width * 0.033, marginBottom: dimensions.height * 0.018 }]}>Chọn cảnh giới tu luyện:</Text>
            <View style={styles.goalButtonsContainer}>
              {GOAL_OPTIONS.map((goal) => (
                <GoalButton
                  key={goal.id}
                  goal={goal}
                  isSelected={selectedGoal === goal.id}
                  onPress={() => setSelectedGoal(goal.id)}
                  dimensions={dimensions}
                />
              ))}
            </View>
          </View>

          {/* Start Button */}
          <TouchableOpacity
            style={[styles.startButton, { paddingVertical: dimensions.height * 0.02, marginBottom: dimensions.height * 0.018 }]}
            onPress={handleStartJourney}
          >
            <Text style={[styles.startButtonText, { fontSize: dimensions.width * 0.038 }]}>BƯỚC VÀO LUÂN HỒI</Text>
          </TouchableOpacity>

          {/* Footer Note */}
          <Text style={[styles.footerNote, { fontSize: dimensions.width * 0.028, lineHeight: dimensions.width * 0.042 }]}>
            Bút sa gà chết. Một khi đã chọn con đường này, nếu tâm ma trỗi dậy làm loạn, vạn kiếp bất phục.
          </Text>
        </View>

        {/* Bottom Navigation */}
        <BottomNavBar dimensions={dimensions} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080C14',
  },
  container: {
    flex: 1,
    backgroundColor: '#080C14',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  headerTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  headerTab: {
    fontWeight: '600',
    color: '#1a1a1a',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  content: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  shieldContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: '#D4AF37',
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtitle: {
    color: '#B8A583',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  description: {
    color: '#B8A583',
    textAlign: 'center',
  },
  goalSection: {
    width: '100%',
  },
  goalLabel: {
    color: '#D4AF37',
    fontWeight: '700',
  },
  goalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  goalButton: {
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(50, 50, 70, 0.8)',
    paddingHorizontal: 8,
  },
  goalButtonSelected: {
    backgroundColor: '#D4AF37',
  },
  goalButtonText: {
    fontWeight: '700',
    color: '#A89968',
    textAlign: 'center',
  },
  goalRealmText: {
    color: '#8B7C5C',
    fontStyle: 'italic',
    marginTop: 2,
  },
  goalButtonTextSelected: {
    color: '#1a1a1a',
  },
  goalRealmTextSelected: {
    color: '#1a1a1a',
  },
  startButton: {
    width: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#B8860B',
  },
  startButtonText: {
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  footerNote: {
    color: '#7A6E5D',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#0C1018',
    borderTopColor: '#D4AF37',
    borderTopWidth: 2,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    color: '#D4AF37',
    marginTop: 4,
    fontWeight: '600',
  },
});
