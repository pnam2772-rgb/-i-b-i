import { StyleSheet, Text, View, TouchableOpacity, useWindowDimensions, ScrollView, Platform, StatusBar, Modal } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CircularTimer = ({ dimensions, elapsedSeconds }) => {
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
          borderTopColor: '#E6B800', 
          borderRightColor: '#E6B800' 
        },
      ]} />

      <View style={styles.timerContent}>
        <Text style={[styles.timerDays, { fontSize: dimensions.width * 0.12 }]}>{time.days}</Text>
        <Text style={[styles.timerLabel, { fontSize: dimensions.width * 0.035 }]}>NGÀY</Text>
        <Text style={[styles.timerTime, { fontSize: dimensions.width * 0.045 }]}>
          {time.hours}:{time.minutes}:{time.seconds}
        </Text>
      </View>
    </View>
  );
};

const BottomNavBar = ({ dimensions }) => (
  <View style={[styles.bottomNav, { height: dimensions.height * 0.08 }]}>
    <TouchableOpacity style={styles.navItem}>
      <MaterialIcons name="home" size={dimensions.width * 0.07} color="#E6B800" />
      <Text style={[styles.navLabel, { fontSize: dimensions.width * 0.03 }]}>Luyện Công</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItem}>
      <MaterialIcons name="bar-chart" size={dimensions.width * 0.07} color="#D5D0C4" />
      <Text style={[styles.navLabel, { fontSize: dimensions.width * 0.03, color: '#D5D0C4' }]}>Bảng Phong Thần</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItem}>
      <MaterialIcons name="settings" size={dimensions.width * 0.07} color="#D5D0C4" />
      <Text style={[styles.navLabel, { fontSize: dimensions.width * 0.03, color: '#D5D0C4' }]}>Công Pháp</Text>
    </TouchableOpacity>
  </View>
);

export default function HomeScreen() {
  const dimensions = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [targetDays, setTargetDays] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    titleColor: '#E6B800',
    content: '',
    backgroundColor: '#1A1953',
  });
  
  const tabBarHeight = 80;
  const statusBarHeight = Platform.OS === 'android' ? 30 : insets.top;

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#E6B800');
      StatusBar.setBarStyle('dark-content');
    }
  }, []);

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
    let title = '';
    let titleColor = '#E6B800';
    let content = '';

    if (elapsedDays < 3) {
      title = 'PHẾ VẬT!';
      titleColor = '#C41E3A'; // Red
      content = 'Mới tu luyện được vài canh giờ mà đã đầu hàng dục vọng? Đạo tâm của ngươi yếu nhớt đến mức này sao?';
    } else if (elapsedDays < 7) {
      title = 'ĐẠO TÂM LUNG LAY!';
      titleColor = '#FF8C42'; // Orange
      content = 'Sắp chạm tới ngưỡng cửa đột phá mà lại tẩu hỏa nhập ma. Thật đáng tiếc!';
    } else {
      title = 'KIẾP NẠN KHÓ TRÁNH!';
      titleColor = '#C41E3A'; // Red
      content = 'Trúc Cơ chưa vững đã đòi hái hoa bắt bướm. Rớt đài! Bọn ở Bảng Phong Thần đang cười vào mặt ngươi kìa.';
    }

    setModalContent({
      title,
      titleColor,
      content,
      backgroundColor: '#1A1953',
    });
    setModalVisible(true);
  };

  // Handle Reset - Clear data and go back to Onboarding
  const handleReset = async () => {
    try {
      await AsyncStorage.removeItem('startTime');
      await AsyncStorage.removeItem('targetDays');
      setModalVisible(false);
      navigation.replace('Onboarding');
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0F1419' }}>
      <ExpoStatusBar style="dark" />
      {/* Header Bar - Thanh DEV with Dev Tools */}
      <View style={[styles.header, { paddingTop: statusBarHeight }]}>
        <Text style={[styles.headerTitle, { fontSize: dimensions.width * 0.04 }]}>[DỊCH CHUYỂN THỜI GIAN]</Text>
        <View style={styles.headerTabs}>
          <TouchableOpacity 
            style={styles.headerTab}
            onPress={handleFastForward1Day}
          >
            <Text style={[{ fontSize: dimensions.width * 0.032 }]}>TUA 1 NGÀY</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerTab}
            onPress={handleFastForward8Days}
          >
            <Text style={[{ fontSize: dimensions.width * 0.032 }]}>TUA 8 NGÀY</Text>
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
            <Text style={[styles.levelLabel, { fontSize: dimensions.width * 0.03 }]}>Cảnh giới hiện tại</Text>
            <View style={styles.levelRow}>
              <MaterialIcons name="eco" size={dimensions.width * 0.06} color="#E6B800" />
              <Text style={[styles.levelName, { fontSize: dimensions.width * 0.042 }]}>PHÀM NHÂN TỤC TỬ</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.avatarButton, { width: dimensions.width * 0.15, height: dimensions.width * 0.15 }]}>
            <MaterialIcons name="person" size={dimensions.width * 0.08} color="#E6B800" />
          </TouchableOpacity>
        </View>

        {/* Central Timer */}
        <CircularTimer dimensions={dimensions} elapsedSeconds={elapsedSeconds} />

        {/* Quote Section */}
        <View style={[styles.quoteContainer, { paddingHorizontal: dimensions.width * 0.04, paddingVertical: dimensions.height * 0.02 }]}>
          <Text style={[styles.quoteText, { fontSize: dimensions.width * 0.032, lineHeight: dimensions.width * 0.048 }]}>
            "Nghịch thiên nhi hành, tu luyện tâm tính mới là đại đạo."
          </Text>
        </View>

        {/* Fallen Button */}
        <TouchableOpacity 
          style={[styles.fallenButton, { paddingVertical: dimensions.height * 0.022 }]}
          onPress={handleFailure}
        >
          <Text style={[styles.fallenButtonText, { fontSize: dimensions.width * 0.038 }]}>TÂM MA TRỖI DẬY (THẤT BẠI)</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavBar dimensions={dimensions} />

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
                Nhục nhã bấm làm lại
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
    backgroundColor: '#E6B800',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#0F1419',
    marginBottom: 8,
  },
  headerTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  headerTab: {
    fontWeight: '600',
    color: '#0F1419',
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
    color: '#D5D0C4',
    marginBottom: 4,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelName: {
    fontWeight: 'bold',
    color: '#E6B800',
  },
  avatarButton: {
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#E6B800',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(230, 184, 0, 0.12)',
  },
  timerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circleBackground: {
    position: 'absolute',
    backgroundColor: 'rgba(230, 184, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(230, 184, 0, 0.2)',
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
    color: '#E6B800',
  },
  timerLabel: {
    color: '#D5D0C4',
    marginTop: 4,
    letterSpacing: 2,
  },
  timerTime: {
    color: '#D5D0C4',
    marginTop: 8,
    fontWeight: '500',
  },
  quoteContainer: {
    width: '100%',
    backgroundColor: 'rgba(230, 184, 0, 0.08)',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E6B800',
  },
  quoteText: {
    color: '#D5D0C4',
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
    backgroundColor: '#0A0F17',
    borderTopColor: '#E6B800',
    borderTopWidth: 2,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    color: '#E6B800',
    marginTop: 4,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1953',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E6B800',
  },
  modalTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalBody: {
    color: '#D5D0C4',
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  resetButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D5D0C4',
  },
  resetButtonText: {
    fontWeight: 'bold',
    color: '#0F1419',
    letterSpacing: 0.5,
  },
});
