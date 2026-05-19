import { StyleSheet, Text, View, TouchableOpacity, useWindowDimensions, Alert, StatusBar, Platform, Animated } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';

// Snap Carousel Configuration
const ITEM_WIDTH = 140;
const ITEM_SPACING = 20;
const TOTAL_ITEM_WIDTH = ITEM_WIDTH + ITEM_SPACING;

// Hệ Thống Cảnh Giới (Bản Mở Rộng)
const CULTIVATION_STAGES = [
  { days: 1, name: 'Tạp Dịch Đệ Tử' },
  { days: 3, name: 'Ngoại Môn Đệ Tử' },
  { days: 7, name: 'Nội Môn Đệ Tử' },
  { days: 9, name: 'Luyện Khí Kỳ' },
  { days: 11, name: 'Trúc Cơ Kỳ' },
  { days: 13, name: 'Kết Đan Kỳ' },
  { days: 15, name: 'Kim Đan Kỳ' },
  { days: 17, name: 'Nguyên Anh Kỳ' },
  { days: 19, name: 'Hóa Thần Kỳ' },
  { days: 21, name: 'Luyện Hư Kỳ' },
  { days: 23, name: 'Hợp Thể Kỳ' },
  { days: 30, name: 'Đại Thừa Kỳ (1 tháng)' },
  { days: 45, name: 'Độ Kiếp Kỳ (45 ngày)' },
  { days: 60, name: 'Địa Tiên (2 tháng)' },
  { days: 90, name: 'Thiên Tiên (3 tháng)' },
  { days: 180, name: 'Tiên Tôn (6 tháng)' },
  { days: 365, name: 'Tiên Đế (1 năm)' },
  { days: 999, name: 'Hồng Trần Tiên / Đạo Tổ' },
];

const ShieldIcon = ({ dimensions }) => (
  <View style={[styles.shieldContainer, { width: dimensions.width * 0.25, height: dimensions.width * 0.25 }]}>
    <View style={[styles.shieldBackground, { width: dimensions.width * 0.25, height: dimensions.width * 0.25, borderRadius: dimensions.width * 0.125 }]} />
    <MaterialIcons name="security" size={dimensions.width * 0.12} color={colors.gold} />
  </View>
);

const CultivationCard = ({ days, name, animatedIndex, index }) => {
  // Interpolate scale và opacity dựa vào vị trí thẻ
  const scale = animatedIndex.interpolate({
    inputRange: [index - 1, index, index + 1],
    outputRange: [0.8, 1, 0.8],
    extrapolate: 'clamp',
  });

  const opacity = animatedIndex.interpolate({
    inputRange: [index - 1, index, index + 1],
    outputRange: [0.4, 1, 0.4],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.animatedCardContainer,
        {
          width: ITEM_WIDTH,
          marginRight: ITEM_SPACING,
          transform: [{ scale }],
          opacity,
        },
      ]}
    >
      <View
        style={[
          styles.cultivationCard,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.gold,
          },
        ]}
      >
        <Text style={[styles.daysText, { color: colors.gold }]}>
          {days}
        </Text>
        <Text style={[styles.nameText, { color: colors.grayText }]}>
          {name}
        </Text>
      </View>
    </Animated.View>
  );
};

const NavigationArrow = ({ direction, onPress, isDisabled }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={isDisabled}
    style={[
      styles.arrowButton,
      direction === 'left' ? styles.arrowLeft : styles.arrowRight,
      { opacity: isDisabled ? 0.2 : 0.5 },
    ]}
  >
    <Ionicons
      name={direction === 'left' ? 'chevron-back' : 'chevron-forward'}
      size={28}
      color={colors.gold}
    />
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
  const [selectedIndex, setSelectedIndex] = useState(9);
  
  // Animated Values
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  
  // Calculate animated index based on scrollX
  const animatedIndex = Animated.divide(scrollX, TOTAL_ITEM_WIDTH);

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(colors.gold);
      StatusBar.setBarStyle('dark-content');
    }
  }, []);

  // Calculate center offset to position item in center of screen
  const getCenterOffset = (index) => {
    return index * TOTAL_ITEM_WIDTH;
  };

  // Handle scroll end to update selectedIndex
  const handleMomentumScrollEnd = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / TOTAL_ITEM_WIDTH);
    const clampedIndex = Math.max(0, Math.min(index, CULTIVATION_STAGES.length - 1));
    setSelectedIndex(clampedIndex);
  };

  // Navigate to specific item
  const handleScrollToIndex = (index) => {
    const offset = getCenterOffset(index);
    flatListRef.current?.scrollToOffset({ offset, animated: true });
  };

  // Arrow Navigation
  const handleScrollLeft = () => {
    const newIndex = Math.max(0, selectedIndex - 1);
    handleScrollToIndex(newIndex);
  };

  const handleScrollRight = () => {
    const newIndex = Math.min(CULTIVATION_STAGES.length - 1, selectedIndex + 1);
    handleScrollToIndex(newIndex);
  };

  const handleStartJourney = async () => {
    try {
      const targetDays = CULTIVATION_STAGES[selectedIndex].days;
      const startTime = Date.now();
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('startTime', startTime.toString());
      await AsyncStorage.setItem('targetDays', targetDays.toString());
      
      // Navigate after successful save
      navigate('MainTabs');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu dữ liệu. Vui lòng thử lại.');
      console.error('Error saving data:', error);
    }
  };

  const renderCultivationStage = ({ item, index }) => (
    <CultivationCard
      days={item.days}
      name={item.name}
      animatedIndex={animatedIndex}
      index={index}
    />
  );

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

        {/* Section 3: Cultivation Stages Selection - SNAP CAROUSEL */}
        <View style={styles.section}>
          <Text style={[styles.goalLabel, { fontSize: dimensions.width * 0.036, marginBottom: dimensions.height * 0.02 }]}>
            Chọn cảnh giới tu luyện:
          </Text>
          
          <View style={styles.carouselContainer}>
            {/* Left Arrow */}
            <NavigationArrow
              direction="left"
              onPress={handleScrollLeft}
              isDisabled={selectedIndex === 0}
            />

            {/* Snap Carousel */}
            <Animated.FlatList
              ref={flatListRef}
              data={CULTIVATION_STAGES}
              renderItem={renderCultivationStage}
              keyExtractor={(item, index) => index.toString()}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              scrollEnabled={true}
              scrollEventThrottle={16}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
              onMomentumScrollEnd={handleMomentumScrollEnd}
              snapToInterval={TOTAL_ITEM_WIDTH}
              decelerationRate="fast"
              contentContainerStyle={[
                styles.scrollContent,
                {
                  paddingLeft: (dimensions.width - ITEM_WIDTH) / 2,
                  paddingRight: (dimensions.width - ITEM_WIDTH) / 2,
                },
              ]}
            />

            {/* Right Arrow */}
            <NavigationArrow
              direction="right"
              onPress={handleScrollRight}
              isDisabled={selectedIndex === CULTIVATION_STAGES.length - 1}
            />
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
  carouselContainer: {
    width: '100%',
    height: 140,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scrollContent: {
    gap: 0,
  },
  animatedCardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cultivationCard: {
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 110,
  },
  daysText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
  nameText: {
    fontWeight: '500',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 13,
  },
  arrowButton: {
    position: 'absolute',
    zIndex: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  arrowLeft: {
    left: 8,
  },
  arrowRight: {
    right: 8,
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
