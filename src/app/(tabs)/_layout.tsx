import React from 'react';
import { Tabs } from 'expo-router';
import { useAccessibility } from '../../components/AccessibilityProvider';
import { useTheme } from 'react-native-paper';
import { Home, Pill, BarChart3, UserCog } from 'lucide-react-native';

export default function TabLayout() {
  const { getScaledFontSize, highContrast } = useAccessibility();
  const theme = useTheme();

  // Dynamic tab bar heights and colors
  const activeColor = highContrast ? '#FFFF00' : theme.colors.primary;
  const inactiveColor = highContrast ? '#888888' : '#64748B';
  const tabBgColor = highContrast ? '#000000' : theme.colors.surface;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          height: 80, // Enhanced size for senior navigation
          backgroundColor: tabBgColor,
          borderTopWidth: highContrast ? 2 : 1,
          borderTopColor: highContrast ? '#FFFF00' : '#E2E8F0',
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: getScaledFontSize(13),
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ focused, color }) => (
            <Home size={focused ? 28 : 24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="medicine"
        options={{
          title: 'Medicines',
          tabBarIcon: ({ focused, color }) => (
            <Pill size={focused ? 28 : 24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Reports',
          tabBarIcon: ({ focused, color }) => (
            <BarChart3 size={focused ? 28 : 24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'My Profile',
          tabBarIcon: ({ focused, color }) => (
            <UserCog size={focused ? 28 : 24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}
