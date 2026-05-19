import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from './src/theme/colors';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { AppSettingsProvider } from './src/context/AppSettingsContext';
import { useAppSettings } from './src/context/AppSettingsContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// MainTabs component - Bottom Tab Navigator
function MainTabs() {
  const { copy } = useAppSettings();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.veryDarkNavy,
          borderTopColor: colors.gold,
          borderTopWidth: 2,
          height: 60,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home';
          } else if (route.name === 'LeaderboardTab') {
            iconName = focused ? 'bar-chart' : 'bar-chart';
          } else if (route.name === 'SettingsTab') {
            iconName = focused ? 'settings' : 'settings';
          }
          
          return <MaterialIcons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.grayText,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 4,
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={{
          title: copy.tabHome,
        }}
      />
      <Tab.Screen 
        name="LeaderboardTab" 
        component={LeaderboardScreen}
        options={{
          title: copy.tabLeaderboard,
        }}
      />
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsScreen}
        options={{
          title: copy.tabSettings,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppSettingsProvider>
        <NavigationContainer>
          <StatusBar barStyle="light-content" />
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: colors.darkNavy },
            }}
          >
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="MainTabs" component={MainTabs} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppSettingsProvider>
    </SafeAreaProvider>
  );
}
