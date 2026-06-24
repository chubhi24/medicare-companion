import React from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { AppProvider } from '../context/AppContext';
import { AccessibilityProvider, useAccessibility } from '../components/AccessibilityProvider';
import { LightTheme, DarkTheme, HighContrastTheme } from '../constants/theme';
import FloatingSOS from '../components/FloatingSOS';

function MainLayout() {
  const { highContrast } = useAccessibility();
  const colorScheme = useColorScheme();

  // Select theme based on accessibility settings
  let theme = LightTheme;
  if (highContrast) {
    theme = HighContrastTheme;
  } else if (colorScheme === 'dark') {
    theme = DarkTheme;
  }

  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="(auth)/forgot-password" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="sos" />
        <Stack.Screen name="appointments/add-edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="medicine/add-edit" options={{ presentation: 'modal' }} />
      </Stack>
      <FloatingSOS />
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <AccessibilityProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AccessibilityProvider>
  );
}
