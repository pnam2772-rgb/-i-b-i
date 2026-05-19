import { StyleSheet, Text, View, TouchableOpacity, useWindowDimensions, Platform, StatusBar, FlatList } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fetchLeaderboard } from '../services/leaderboard';
import { useAppSettings } from '../context/AppSettingsContext';

export default function LeaderboardScreen() {
  const dimensions = useWindowDimensions();
  const { copy, themeKey } = useAppSettings();
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(colors.gold);
      StatusBar.setBarStyle('dark-content');
    }
  }, []);

  const fallbackRankings =
    themeKey === 'normal'
      ? [
          { id: 'mock-1', rank: 1, displayName: 'Minh', days: 45, levelName: '1 Tháng' },
          { id: 'mock-2', rank: 2, displayName: 'Huy', days: 38, levelName: '1 Tháng' },
          { id: 'mock-3', rank: 3, displayName: 'An', days: 30, levelName: '1 Tháng' },
          { id: 'mock-4', rank: 4, displayName: 'Linh', days: 21, levelName: '3 Tuần' },
          { id: 'mock-5', rank: 5, displayName: 'Tuấn', days: 14, levelName: 'Ngày 15' },
        ]
      : [
          { id: 'mock-1', rank: 1, displayName: 'Vô Thiên', days: 45, levelName: 'Hóa Thần Kỳ' },
          { id: 'mock-2', rank: 2, displayName: 'Động Bát Quái', days: 38, levelName: 'Kim Đan Kỳ' },
          { id: 'mock-3', rank: 3, displayName: 'Trúc Cơ Tuyệt Tuyên', days: 30, levelName: 'Trúc Cơ Kỳ' },
          { id: 'mock-4', rank: 4, displayName: 'Tuấn Anh', days: 21, levelName: 'Luyện Khí Kỳ' },
          { id: 'mock-5', rank: 5, displayName: 'Thành Công Giả', days: 14, levelName: 'Luyện Khí Kỳ' },
        ];

  useEffect(() => {
    let isMounted = true;

    const loadLeaderboard = async () => {
      try {
        const data = await fetchLeaderboard();
        if (!isMounted) return;
        if (data.length > 0) {
          setRankings(data);
        } else {
          setRankings(fallbackRankings);
        }
      } catch (error) {
        if (isMounted) {
          setRankings(fallbackRankings);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadLeaderboard();

    return () => {
      isMounted = false;
    };
  }, [themeKey]);

  const renderRankingItem = ({ item }) => (
    <View style={[styles.rankingCard, { marginHorizontal: dimensions.width * 0.05, marginVertical: dimensions.height * 0.01 }]}>
      <View style={styles.rankBadge}>
        <Text style={[styles.rankNumber, { fontSize: dimensions.width * 0.05 }]}>{item.rank}</Text>
      </View>
      <View style={styles.playerInfo}>
        <Text style={[styles.playerName, { fontSize: dimensions.width * 0.04 }]}>{item.displayName}</Text>
        <Text style={[styles.playerLevel, { fontSize: dimensions.width * 0.03 }]}>{item.levelName}</Text>
      </View>
      <Text style={[styles.daysCount, { fontSize: dimensions.width * 0.045 }]}>{item.days} Ngày</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { fontSize: dimensions.width * 0.05 }]}>{copy.leaderboardTitle}</Text>
        <Text style={[styles.headerSubtitle, { fontSize: dimensions.width * 0.03 }]}>{copy.leaderboardSubtitle}</Text>
      </View>

      {/* Leaderboard Content */}
      <FlatList
        data={rankings}
        renderItem={renderRankingItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          paddingBottom: 100,
          paddingTop: 20,
        }}
        scrollEnabled
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={[styles.emptyText, { fontSize: dimensions.width * 0.035 }]}>Chưa có dữ liệu</Text>
          ) : null
        }
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
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: colors.darkNavy,
    marginBottom: 4,
  },
  headerSubtitle: {
    color: colors.darkNavy,
    fontStyle: 'italic',
  },
  rankingCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.gold,
  },
  rankBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontWeight: 'bold',
    color: colors.darkNavy,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontWeight: '600',
    color: colors.gold,
    marginBottom: 4,
  },
  playerLevel: {
    color: colors.grayText,
    fontStyle: 'italic',
  },
  daysCount: {
    fontWeight: 'bold',
    color: colors.mintGreen,
  },
  emptyText: {
    color: colors.grayText,
    textAlign: 'center',
    marginTop: 20,
  },
});
