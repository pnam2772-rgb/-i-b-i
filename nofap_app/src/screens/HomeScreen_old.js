import { StyleSheet, Text, View, TouchableOpacity, useWindowDimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

const CircularTimer = ({ dimensions }) => {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 6 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => {
        let { days, hours, minutes, seconds } = prevTime;
        seconds += 1;

        if (seconds >= 60) {
          seconds = 0;
          minutes += 1;
        }
        if (minutes >= 60) {
          minutes = 0;
          hours += 1;
        }
        if (hours >= 24) {
          hours = 0;
          days += 1;
        }

        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (value) => String(value).padStart(2, '0');

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
          borderTopColor: '#D4AF37', 
          borderRightColor: '#D4AF37' 
        },
      ]} />

      <View style={styles.timerContent}>
        <Text style={[styles.timerDays, { fontSize: dimensions.width * 0.12 }]}>{formatTime(time.days)}</Text>
        <Text style={[styles.timerLabel, { fontSize: dimensions.width * 0.035 }]}>NGÀY</Text>
        <Text style={[styles.timerTime, { fontSize: dimensions.width * 0.045 }]}>
          {formatTime(time.hours)}:{formatTime(time.minutes)}:{formatTime(time.seconds)}
        </Text>
      </View>
    </View>
  );
};

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

export default function HomeScreen() {
  const dimensions = useWindowDimensions();
  const statusBarHeight = StatusBar.currentHeight || 0;
  const bottomPadding = 100; // Fixed padding for bottom nav bar
  const topMargin = statusBarHeight + 8;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingBottom: bottomPadding }]}>
        {/* Back Button Area */}
        <View style={styles.backButtonArea}>
          <TouchableOpacity>
            <MaterialIcons name="arrow-back" size={32} color="#D4AF37" />
          </TouchableOpacity>
        </View>

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
          {/* Top Section - Avatar & Level */}
          <View style={styles.topSection}>
            <View style={styles.levelInfo}>
              <Text style={[styles.levelLabel, { fontSize: dimensions.width * 0.03 }]}>Cảnh giới hiện tại</Text>
              <View style={styles.levelRow}>
                <MaterialIcons name="eco" size={dimensions.width * 0.06} color="#D4AF37" />
                <Text style={[styles.levelName, { fontSize: dimensions.width * 0.042 }]}>PHÀM NHÂN TỤC TỬ</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.avatarButton, { width: dimensions.width * 0.15, height: dimensions.width * 0.15 }]}>
              <MaterialIcons name="person" size={dimensions.width * 0.08} color="#D4AF37" />
            </TouchableOpacity>
          </View>

          {/* Central Timer */}
          <CircularTimer dimensions={dimensions} />

          {/* Quote Section */}
          <View style={[styles.quoteContainer, { paddingHorizontal: dimensions.width * 0.04, paddingVertical: dimensions.height * 0.02 }]}>
            <Text style={[styles.quoteText, { fontSize: dimensions.width * 0.032, lineHeight: dimensions.width * 0.048 }]}>
              "Nghịch thiên nhi hành, tu luyện tâm tính mới là đại đạo."
            </Text>
          </View>

          {/* Fallen Button */}
          <TouchableOpacity style={[styles.fallenButton, { paddingVertical: dimensions.height * 0.022 }]}>
            <Text style={[styles.fallenButtonText, { fontSize: dimensions.width * 0.038 }]}>TÂM MA TRỖI DẬY (THẤT BẠI)</Text>
          </TouchableOpacity>
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
  },
  backButtonArea: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'space-around',
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
    color: '#B8A583',
    marginBottom: 4,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelName: {
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  avatarButton: {
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
  },
  timerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circleBackground: {
    position: 'absolute',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
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
    color: '#FFFFFF',
  },
  timerLabel: {
    color: '#B8A583',
    marginTop: 4,
    letterSpacing: 2,
  },
  timerTime: {
    color: '#B8A583',
    marginTop: 8,
    fontWeight: '500',
  },
  quoteContainer: {
    width: '100%',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
  },
  quoteText: {
    color: '#B8A583',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  fallenButton: {
    width: '100%',
    backgroundColor: '#C41E3A',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8B1428',
  },
  fallenButtonText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
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
