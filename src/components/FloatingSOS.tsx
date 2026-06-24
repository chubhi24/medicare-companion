import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { PhoneCall } from 'lucide-react-native';
import { router, usePathname } from 'expo-router';
import { useAccessibility } from './AccessibilityProvider';

export const FloatingSOS: React.FC = () => {
  const { triggerHaptic, speak } = useAccessibility();
  const pathname = usePathname();

  // Hide the SOS floating button on onboarding, auth screens, or the SOS page itself to avoid visual clutter
  const shouldHide = 
    pathname === '/sos' || 
    pathname?.includes('/(auth)') || 
    pathname === '/onboarding';

  if (shouldHide) return null;

  const handlePress = () => {
    triggerHaptic(100);
    speak("Opening emergency S O S screen.");
    router.push('/sos');
  };

  return (
    <TouchableOpacity
      style={styles.sosButton}
      onPress={handlePress}
      accessibilityLabel="Emergency SOS button. Tap to alert your caregiver and call emergency contacts."
      accessibilityRole="button"
    >
      <View style={styles.innerContainer}>
        <PhoneCall size={32} color="#FFFFFF" strokeWidth={2.5} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  sosButton: {
    position: 'absolute',
    bottom: 90, // Floats safely above the bottom tabs
    right: 20,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#C62828', // Crimson Red
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 9999, // Keep at top of stacking order
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  innerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default FloatingSOS;
