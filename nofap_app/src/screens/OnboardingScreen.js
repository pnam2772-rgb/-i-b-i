import { StyleSheet, Text, View, TouchableOpacity, useWindowDimensions, Alert, StatusBar, Platform, Animated } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { useAppSettings } from '../context/AppSettingsContext';
import { getStagesByTheme } from '../utils/cultivation';

// Snap Carousel Configuration (Dynamic - Responsive)
const getCarouselConfig = (windowWidth) => {
  const ITEM_WIDTH = windowWidth * 0.68;
  const ITEM_SPACING = 16;
  const TOTAL_ITEM_WIDTH = ITEM_WIDTH + ITEM_SPACING;
  
  return { ITEM_WIDTH, ITEM_SPACING, TOTAL_ITEM_WIDTH };
};

const ShieldIcon = ({ dimensions }) => (
  <View style={[styles.shieldContainer, { width: dimensions.width * 0.25, height: dimensions.width * 0.25 }]}>
    <View style={[styles.shieldBackground, { width: dimensions.width * 0.25, height: dimensions.width * 0.25, borderRadius: dimensions.width * 0.125 }]} />
    <MaterialIcons name="security" size={dimensions.width * 0.12} color={colors.gold} />
  </View>
);

const CultivationCard = ({ days, name, desc, animatedIndex, index, ITEM_WIDTH, dimensions, itemSpacing }) => {
  // Interpolate scale và opacity dựa vào vị trí thẻ
  const scale = animatedIndex.interpolate({
    inputRange: [index - 1, index, index + 1],
    outputRange: [0.85, 1, 0.85],
    extrapolate: 'clamp',
  });

  const opacity = animatedIndex.interpolate({
    inputRange: [index - 1, index, index + 1],
    outputRange: [0.6, 1, 0.6],
    extrapolate: 'clamp',
  });

  const daysFontSize = dimensions.width * 0.08;

  return (
    <Animated.View
      style={[
        styles.animatedCardContainer,
        {
          width: ITEM_WIDTH,
          transform: [{ scale }],
          opacity,
          marginHorizontal: itemSpacing / 2,
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
        <View style={styles.daysRow}>
          <Text 
            style={[
              styles.daysText, 
              { 
                color: colors.gold,
                fontSize: daysFontSize,
              }
            ]}
          >
            {days}
          </Text>
          <Text style={[styles.daysUnit, { color: colors.gold, fontSize: dimensions.width * 0.03 }]}>
            ngày
          </Text>
        </View>
        <Text 
          style={[
            styles.nameText, 
            { 
              color: colors.white,
              fontSize: dimensions.width * 0.035,
              marginTop: 4,
            }
          ]}
        >
          {name}
        </Text>
        <Text style={[styles.descText, { fontSize: dimensions.width * 0.028 }]}> 
          {desc}
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

const BottomNavBar = ({ dimensions, copy, onGoHome, onGoLeaderboard, onGoSettings }) => (
  <View style={[styles.bottomNav, { height: dimensions.height * 0.08 }]}>
    <TouchableOpacity style={styles.navItem} onPress={onGoHome}>
      <MaterialIcons name="home" size={dimensions.width * 0.07} color={colors.gold} />
      <Text style={[styles.navLabel, { fontSize: dimensions.width * 0.03 }]}>{copy.tabHome}</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItem} onPress={onGoLeaderboard}>
      <MaterialIcons name="bar-chart" size={dimensions.width * 0.07} color={colors.grayText} />
      <Text style={[styles.navLabel, { fontSize: dimensions.width * 0.03, color: colors.grayText }]}>{copy.tabLeaderboard}</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItem} onPress={onGoSettings}>
      <MaterialIcons name="settings" size={dimensions.width * 0.07} color={colors.grayText} />
      <Text style={[styles.navLabel, { fontSize: dimensions.width * 0.03, color: colors.grayText }]}>{copy.tabSettings}</Text>
    </TouchableOpacity>
  </View>
);

export default function OnboardingScreen() {
  const dimensions = useWindowDimensions();
  const { navigate } = useNavigation();
  const { copy, themeKey } = useAppSettings();
  const CULTIVATION_STAGES = getStagesByTheme(themeKey);
  const [selectedIndex, setSelectedIndex] = useState(9);
  
  // Get responsive carousel config
  const { ITEM_WIDTH, ITEM_SPACING, TOTAL_ITEM_WIDTH } = getCarouselConfig(dimensions.width);
  
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

  const handleGoHome = () => navigate('MainTabs', { screen: 'HomeTab' });
  const handleGoLeaderboard = () => navigate('MainTabs', { screen: 'LeaderboardTab' });
  const handleGoSettings = () => navigate('MainTabs', { screen: 'SettingsTab' });

  const renderCultivationStage = ({ item, index }) => (
    <CultivationCard
      days={item.days}
      name={item.name}
      desc={item.desc}
      animatedIndex={animatedIndex}
      index={index}
      ITEM_WIDTH={ITEM_WIDTH}
      dimensions={dimensions}
      itemSpacing={ITEM_SPACING}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="dark" />
      
      {/* Header Bar - Thanh DEV */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { fontSize: dimensions.width * 0.04 }]}>{copy.homeHeaderLabel}</Text>
        <View style={styles.headerTabs}>
          <Text style={[styles.headerTab, { fontSize: dimensions.width * 0.032 }]}>{copy.onboardingHeaderFast1}</Text>
          <Text style={[styles.headerTab, { fontSize: dimensions.width * 0.032 }]}>{copy.onboardingHeaderFast8}</Text>
        </View>
      </View>

      {/* Main Content - Fixed View (No Scroll) */}
      <View style={styles.mainContent}>
        <View style={[styles.container, { paddingHorizontal: dimensions.width * 0.08 }]}> 
          {/* Section 1: Logo + Title */}
          <View style={[styles.section, { marginTop: dimensions.height * 0.03 }]}>
            <ShieldIcon dimensions={dimensions} />
            <Text style={[styles.title, { fontSize: dimensions.width * 0.07, marginTop: dimensions.height * 0.025 }]}>
              {copy.onboardingTitle}
            </Text>
          </View>

          {/* Section 2: Subtitle */}
          <View style={styles.section}>
            <Text style={[styles.subtitle, { fontSize: 16, lineHeight: 26 }]}>
              {copy.onboardingSubtitle}
            </Text>
          </View>

          {/* Section 3 Label */}
          <View style={styles.section}>
            <Text style={[styles.goalLabel, { fontSize: dimensions.width * 0.035, marginBottom: dimensions.height * 0.01 }]}> 
              {copy.onboardingChooseStage}
            </Text>
          </View>
        </View>

        {/* Carousel Full Width - Outside Container Padding */}
        <View style={styles.carouselSection}>
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
              style={{ width: '100%' }}
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
                  paddingHorizontal: Math.max(0, (dimensions.width - ITEM_WIDTH) / 2 - ITEM_SPACING / 2),
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

        {/* Resume Padded Container */}
        <View style={[styles.container, { paddingHorizontal: dimensions.width * 0.08 }]}> 
          {/* Section 4: Start Button */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.startButton, { paddingVertical: dimensions.height * 0.02 }]}
              onPress={handleStartJourney}
            >
              <Text style={[styles.startButtonText, { fontSize: dimensions.width * 0.04 }]}>{copy.onboardingStartButton}</Text>
            </TouchableOpacity>
          </View>

          {/* Section 5: Warning Text */}
          <View style={styles.section}>
            <Text style={[styles.warningText, { lineHeight: dimensions.width * 0.046 }]}> 
              {copy.onboardingWarning}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Navigation */}
      <BottomNavBar
        dimensions={dimensions}
        copy={copy}
        onGoHome={handleGoHome}
        onGoLeaderboard={handleGoLeaderboard}
        onGoSettings={handleGoSettings}
      />
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mainContent: {
    flex: 1,
    backgroundColor: colors.darkNavy,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  container: {
    backgroundColor: colors.darkNavy,
    alignItems: 'center',
    paddingVertical: 8,
  },
  section: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 4,
  },
  carouselSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
    marginHorizontal: 0,
    paddingHorizontal: 0,
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
    letterSpacing: 1,
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
    marginBottom: 4,
  },
  carouselContainer: {
    width: '100%',
    height: 160,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginHorizontal: 0,
    paddingHorizontal: 0,
  },
  scrollContent: {
    gap: 0,
  },
  animatedCardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cultivationCard: {
    borderRadius: 14,
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 135,
    width: '100%',
  },
  daysText: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  daysRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  daysUnit: {
    fontWeight: '600',
    paddingBottom: 6,
  },
  nameText: {
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    flexWrap: 'wrap',
    numberOfLines: undefined,
  },
  descText: {
    color: colors.grayText,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
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
    padding: 10,
  },
  arrowLeft: {
    left: 0,
  },
  arrowRight: {
    right: 0,
  },
  startButton: {
    width: '90%',
    backgroundColor: colors.mintGreen,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gold,
    marginTop: 4,
    marginBottom: 16,
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
    fontSize: 14,
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
