import React, { createContext, useContext, useState, useEffect } from 'react';
import { Vibration, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AccessibilityContextType {
  fontSizeScale: number;
  highContrast: boolean;
  voiceGuidance: boolean;
  setFontSizeScale: (scale: number) => void;
  setHighContrast: (active: boolean) => void;
  setVoiceGuidance: (active: boolean) => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  triggerHaptic: (duration?: number | number[]) => void;
  getScaledFontSize: (baseSize: number) => number;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSizeScale, setFontSizeScaleState] = useState<number>(1.0);
  const [highContrast, setHighContrastState] = useState<boolean>(false);
  const [voiceGuidance, setVoiceGuidanceState] = useState<boolean>(false);

  useEffect(() => {
    // Load persisted settings
    const loadSettings = async () => {
      try {
        const scale = await AsyncStorage.getItem('user_font_scale');
        const contrast = await AsyncStorage.getItem('user_high_contrast');
        const guidance = await AsyncStorage.getItem('user_voice_guidance');

        if (scale) setFontSizeScaleState(parseFloat(scale));
        if (contrast) setHighContrastState(contrast === 'true');
        if (guidance) setVoiceGuidanceState(guidance === 'true');
      } catch (e) {
        console.error('Failed to load accessibility settings', e);
      }
    };
    loadSettings();
  }, []);

  const setFontSizeScale = async (scale: number) => {
    setFontSizeScaleState(scale);
    await AsyncStorage.setItem('user_font_scale', scale.toString());
    triggerHaptic(30);
  };

  const setHighContrast = async (active: boolean) => {
    setHighContrastState(active);
    await AsyncStorage.setItem('user_high_contrast', active.toString());
    triggerHaptic(50);
  };

  const setVoiceGuidance = async (active: boolean) => {
    setVoiceGuidanceState(active);
    await AsyncStorage.setItem('user_voice_guidance', active.toString());
    triggerHaptic(50);
    if (active) {
      speak("Voice guidance enabled.");
    } else {
      stopSpeaking();
    }
  };

  const speak = (text: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9; // Slightly slower for elderly
        window.speechSynthesis.speak(utterance);
      }
    } else {
      Speech.stop();
      Speech.speak(text, { rate: 0.85 });
    }
  };

  const stopSpeaking = () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } else {
      Speech.stop();
    }
  };

  const triggerHaptic = (duration: number | number[] = 50) => {
    Vibration.vibrate(duration);
  };

  const getScaledFontSize = (baseSize: number) => {
    return Math.round(baseSize * fontSizeScale);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        fontSizeScale,
        highContrast,
        voiceGuidance,
        setFontSizeScale,
        setHighContrast,
        setVoiceGuidance,
        speak,
        stopSpeaking,
        triggerHaptic,
        getScaledFontSize,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
