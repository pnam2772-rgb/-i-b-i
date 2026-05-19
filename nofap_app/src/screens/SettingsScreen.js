import { StyleSheet, Text, View, TouchableOpacity, useWindowDimensions, TextInput, Alert, Platform, StatusBar, Switch } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAppSettings } from '../context/AppSettingsContext';

const THEME_OPTIONS = [
  { key: 'normal', label: 'Từ ngữ thường', description: 'Đời thường, kỷ luật, tỉnh thức' },
  { key: 'xianxia', label: 'Tu tiên', description: 'Cảnh giới, đạo tâm, thiên kiếp' },
];

const TONE_OPTIONS = [
  { key: 'safe', label: 'Safe', description: 'Nhẹ nhàng, động viên' },
  { key: 'hardcore', label: 'Hardcore', description: 'Thẳng mặt, mạnh mẽ' },
];

export default function SettingsScreen() {
  const dimensions = useWindowDimensions();
  const {
    themeKey,
    displayName,
    notificationsEnabled,
    isExpoGo,
    challengeTone,
    updateTheme,
    updateDisplayName,
    updateNotificationsEnabled,
    updateChallengeTone,
    copy,
  } = useAppSettings();
  const [selectedTheme, setSelectedTheme] = useState(themeKey);
  const [nameInput, setNameInput] = useState(displayName);
  const [notificationsOn, setNotificationsOn] = useState(notificationsEnabled);
  const [selectedTone, setSelectedTone] = useState(challengeTone);

  useEffect(() => {
    setSelectedTheme(themeKey);
  }, [themeKey]);

  useEffect(() => {
    setNameInput(displayName);
  }, [displayName]);

  useEffect(() => {
    setNotificationsOn(notificationsEnabled);
  }, [notificationsEnabled]);

  useEffect(() => {
    setSelectedTone(challengeTone);
  }, [challengeTone]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(colors.gold);
      StatusBar.setBarStyle('dark-content');
    }
  }, []);

  const handleSave = async () => {
    const trimmedName = nameInput.trim();
    if (!trimmedName) {
      Alert.alert('Thiếu tên', copy.settingsMissingName);
      return;
    }

    const updates = [];

    if (selectedTheme !== themeKey) {
      await updateTheme(selectedTheme);
      updates.push('theme');
    }

    if (trimmedName !== displayName) {
      await updateDisplayName(trimmedName);
      updates.push('name');
    }

    if (notificationsOn !== notificationsEnabled) {
      await updateNotificationsEnabled(notificationsOn);
      updates.push('notifications');
    }

    if (selectedTone !== challengeTone) {
      await updateChallengeTone(selectedTone);
      updates.push('tone');
    }

    if (updates.length === 0) {
      Alert.alert('Không đổi gì', copy.settingsNoChanges);
      return;
    }

    Alert.alert('Đã lưu', copy.settingsSaved);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="dark" />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { fontSize: dimensions.width * 0.05 }]}>{copy.settingsTitle}</Text>
        <Text style={[styles.headerSubtitle, { fontSize: dimensions.width * 0.03 }]}>{copy.settingsSubtitle}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: dimensions.width * 0.04 }]}>{copy.settingsNameLabel}</Text>
          <View style={styles.inputRow}>
            <MaterialIcons name="person" size={20} color={colors.gold} />
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              placeholder={copy.settingsNameLabel}
              placeholderTextColor={colors.grayText}
              style={[styles.textInput, { fontSize: dimensions.width * 0.036 }]}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: dimensions.width * 0.04 }]}>{copy.settingsThemeLabel}</Text>
          {THEME_OPTIONS.map((option) => {
            const isActive = option.key === selectedTheme;
            return (
              <TouchableOpacity
                key={option.key}
                style={[styles.themeCard, isActive && styles.themeCardActive]}
                onPress={() => setSelectedTheme(option.key)}
              >
                <View style={styles.themeHeader}>
                  <Text style={[styles.themeLabel, { fontSize: dimensions.width * 0.038 }]}>{option.label}</Text>
                  {isActive ? (
                    <MaterialIcons name="check-circle" size={20} color={colors.mintGreen} />
                  ) : (
                    <MaterialIcons name="radio-button-unchecked" size={20} color={colors.grayText} />
                  )}
                </View>
                <Text style={[styles.themeDescription, { fontSize: dimensions.width * 0.03 }]}>{option.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: dimensions.width * 0.04 }]}>{copy.settingsNotificationsLabel}</Text>
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { fontSize: dimensions.width * 0.034 }]}>
              {notificationsOn ? 'Bật' : 'Tắt'}
            </Text>
            <Switch
              value={notificationsOn}
              onValueChange={setNotificationsOn}
              disabled={isExpoGo}
              trackColor={{ false: colors.cardBackground, true: colors.mintGreen }}
              thumbColor={notificationsOn ? colors.white : colors.grayText}
            />
          </View>
          {isExpoGo ? (
            <Text style={[styles.toggleHint, { fontSize: dimensions.width * 0.03 }]}>
              Expo Go không hỗ trợ push notification. Dùng dev build để bật.
            </Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: dimensions.width * 0.04 }]}>{copy.settingsToneLabel}</Text>
          {TONE_OPTIONS.map((option) => {
            const isActive = option.key === selectedTone;
            return (
              <TouchableOpacity
                key={option.key}
                style={[styles.themeCard, isActive && styles.themeCardActive]}
                onPress={() => setSelectedTone(option.key)}
              >
                <View style={styles.themeHeader}>
                  <Text style={[styles.themeLabel, { fontSize: dimensions.width * 0.038 }]}>{option.label}</Text>
                  {isActive ? (
                    <MaterialIcons name="check-circle" size={20} color={colors.mintGreen} />
                  ) : (
                    <MaterialIcons name="radio-button-unchecked" size={20} color={colors.grayText} />
                  )}
                </View>
                <Text style={[styles.themeDescription, { fontSize: dimensions.width * 0.03 }]}>{option.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { paddingVertical: dimensions.height * 0.02 }]}
          onPress={handleSave}
        >
          <Text style={[styles.saveButtonText, { fontSize: dimensions.width * 0.04 }]}>{copy.settingsSaveButton}</Text>
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.gold,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.goldDim,
  },
  textInput: {
    flex: 1,
    color: colors.white,
  },
  themeCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  themeCardActive: {
    borderColor: colors.mintGreen,
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  themeLabel: {
    color: colors.white,
    fontWeight: '600',
  },
  themeDescription: {
    color: colors.grayText,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.goldDim,
  },
  toggleLabel: {
    color: colors.white,
    fontWeight: '600',
  },
  toggleHint: {
    color: colors.grayText,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: colors.mintGreen,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  saveButtonText: {
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 1,
  },
});
