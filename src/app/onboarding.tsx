import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  HeartPulse, 
  Accessibility, 
  Users, 
  AlertOctagon,
  Volume2
} from 'lucide-react-native';
import { useAccessibility } from '../components/AccessibilityProvider';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { getScaledFontSize, highContrast, speak, triggerHaptic } = useAccessibility();

  const slides = [
    {
      title: 'Welcome to MediCare Companion',
      description: 'Your simple, easy-to-use assistant that reminds you to take your medicines on time, everyday.',
      icon: <HeartPulse size={80} color={highContrast ? '#FFFF00' : '#0D5C75'} />,
      speechText: 'Welcome to MediCare Companion. Your simple, easy-to-use assistant that reminds you to take your medicines on time, everyday.',
    },
    {
      title: 'Accessibility Tailored for You',
      description: 'Designed specifically for seniors. Change text size, turn on high contrast colors, or enable voice reading at any time.',
      icon: <Accessibility size={80} color={highContrast ? '#FFFF00' : '#0D5C75'} />,
      speechText: 'Accessibility Tailored for You. Designed specifically for seniors. You can change text size, turn on high contrast colors, or enable voice reading at any time.',
    },
    {
      title: 'Caregiver Support & Peace of Mind',
      description: 'Add your children or doctor as caregivers. If you miss a dose for 30 minutes, they will automatically get alerted.',
      icon: <Users size={80} color={highContrast ? '#FFFF00' : '#0D5C75'} />,
      speechText: 'Caregiver Support. Add your children or doctor as caregivers. If you miss a dose for 30 minutes, they will automatically get alerted.',
    },
    {
      title: 'Emergency SOS Integration',
      description: 'The floating red button is always available. Tap it to immediately call your emergency contact and send your GPS location.',
      icon: <AlertOctagon size={80} color={highContrast ? '#FFFF00' : '#C62828'} />,
      speechText: 'Emergency SOS. The floating red button is always available on your screen. Tap it to immediately call your emergency contact and send your GPS location.',
    },
  ];

  // Speak the slide content when it changes
  useEffect(() => {
    speak(slides[currentSlide].speechText);
  }, [currentSlide]);

  const handleNext = () => {
    triggerHaptic(50);
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleBack = () => {
    triggerHaptic(30);
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboarding_completed', 'true');
      triggerHaptic(80);
      speak("Onboarding complete. Let's sign in.");
      router.replace('/(auth)/login');
    } catch (e) {
      router.replace('/(auth)/login');
    }
  };

  const currentThemeColor = highContrast ? '#FFFF00' : '#0D5C75';
  const bgColor = highContrast ? '#000000' : '#F0F9FF'; // soft blue tint background

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.topRightHeader}>
        <TouchableOpacity 
          onPress={() => speak(slides[currentSlide].speechText)} 
          style={[styles.audioHelper, { borderColor: currentThemeColor, borderWidth: highContrast ? 2 : 1 }]}
          accessibilityLabel="Read this screen aloud"
        >
          <Volume2 size={24} color={currentThemeColor} />
          <Text style={{ fontSize: getScaledFontSize(14), color: currentThemeColor, fontWeight: 'bold', marginLeft: 6 }}>Read Aloud</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Rounded Card Layout */}
        <Card 
          style={[
            styles.card, 
            { 
              backgroundColor: highContrast ? '#000000' : '#FFFFFF',
              borderColor: highContrast ? '#FFFF00' : '#E2E8F0',
              borderWidth: highContrast ? 3 : 1
            }
          ]}
        >
          <Card.Content style={styles.cardContent}>
            <View style={styles.iconWrapper}>
              {slides[currentSlide].icon}
            </View>

            <Text
              variant="headlineMedium"
              style={[
                styles.title,
                {
                  fontSize: getScaledFontSize(26),
                  color: highContrast ? '#FFFFFF' : '#0F172A',
                  fontWeight: 'bold',
                },
              ]}
            >
              {slides[currentSlide].title}
            </Text>

            <Text
              variant="bodyLarge"
              style={[
                styles.description,
                {
                  fontSize: getScaledFontSize(18),
                  color: highContrast ? '#FFFF00' : '#475569',
                  lineHeight: getScaledFontSize(26),
                },
              ]}
            >
              {slides[currentSlide].description}
            </Text>
          </Card.Content>
        </Card>

        {/* Slide Indicators */}
        <View style={styles.indicatorContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor: index === currentSlide 
                    ? currentThemeColor 
                    : (highContrast ? '#888888' : '#CBD5E1'),
                  width: index === currentSlide ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Senior Touch-target Compliant Button Bar (min 56px height) */}
      <View style={styles.buttonContainer}>
        {currentSlide > 0 ? (
          <Button
            mode="outlined"
            onPress={handleBack}
            style={[styles.navButton, styles.backBtn, highContrast && styles.hcBorder]}
            contentStyle={styles.btnContent}
            labelStyle={{ fontSize: getScaledFontSize(16), fontWeight: 'bold' }}
            textColor={highContrast ? '#FFFFFF' : '#475569'}
          >
            Back
          </Button>
        ) : (
          <Button
            mode="text"
            onPress={finishOnboarding}
            style={styles.navButton}
            contentStyle={styles.btnContent}
            labelStyle={{ fontSize: getScaledFontSize(16), fontWeight: 'bold' }}
            textColor={highContrast ? '#FFFF00' : '#475569'}
          >
            Skip All
          </Button>
        )}

        <Button
          mode="contained"
          onPress={handleNext}
          style={[styles.navButton, styles.nextBtn]}
          buttonColor={highContrast ? '#FFFF00' : '#0D5C75'}
          textColor={highContrast ? '#000000' : '#FFFFFF'}
          contentStyle={styles.btnContent}
          labelStyle={{ fontSize: getScaledFontSize(18), fontWeight: 'bold' }}
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  topRightHeader: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  audioHelper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  cardContent: {
    alignItems: 'center',
  },
  iconWrapper: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  indicatorContainer: {
    flexDirection: 'row',
    marginTop: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    gap: 16,
  },
  navButton: {
    flex: 1,
    borderRadius: 16,
  },
  btnContent: {
    height: 58, // Senior-accessible tap target
  },
  backBtn: {
    borderColor: '#94A3B8',
  },
  nextBtn: {
    elevation: 3,
  },
  hcBorder: {
    borderColor: '#FFFFFF',
    borderWidth: 2,
    backgroundColor: '#000000',
  },
});
