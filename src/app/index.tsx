import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { HeartPulse } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAccessibility } from '../components/AccessibilityProvider';

export default function SplashScreenGate() {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const { getScaledFontSize, highContrast } = useAccessibility();

  useEffect(() => {
    if (isLoading) return;

    const navigateGate = async () => {
      try {
        const onboardingDone = await AsyncStorage.getItem('onboarding_completed');
        if (onboardingDone !== 'true') {
          router.replace('/onboarding');
        } else if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      } catch (e) {
        router.replace('/(auth)/login');
      }
    };

    navigateGate();
  }, [isLoading, isAuthenticated]);

  const tintColor = highContrast ? '#FFFF00' : '#0D5C75';
  const bgColor = highContrast ? '#000000' : '#F8FAFC';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.content}>
        <HeartPulse size={80} color={tintColor} style={styles.icon} />
        <Text
          variant="headlineLarge"
          style={[
            styles.title,
            {
              fontSize: getScaledFontSize(32),
              color: highContrast ? '#FFFFFF' : '#0F172A',
            },
          ]}
        >
          MediCare Companion
        </Text>
        <Text
          variant="bodyLarge"
          style={[
            styles.subtitle,
            {
              fontSize: getScaledFontSize(18),
              color: highContrast ? '#FFFF00' : '#64748B',
            },
          ]}
        >
          Simple. Clear. Care.
        </Text>
        <ActivityIndicator size="large" color={tintColor} style={styles.spinner} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 40,
    fontWeight: '500',
    textAlign: 'center',
  },
  spinner: {
    marginTop: 20,
  },
});
