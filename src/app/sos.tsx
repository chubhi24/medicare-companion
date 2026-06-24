import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Alert, Platform } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import { useAccessibility } from '../components/AccessibilityProvider';
import { router } from 'expo-router';
import { PhoneCall, AlertTriangle, AlertOctagon, XCircle } from 'lucide-react-native';
import * as Location from 'expo-location';

export default function SOSScreen() {
  const { profile } = useAuth();
  const { getScaledFontSize, highContrast, speak, stopSpeaking, triggerHaptic } = useAccessibility();

  const [countdown, setCountdown] = useState(3);
  const [isAborted, setIsAborted] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<string>('Retrieving GPS...');
  const [sosExecuted, setSosExecuted] = useState(false);

  // Request location permission & fetch GPS
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setGpsLocation('Location permission denied (Fallback: Lat 37.7749, Lng -122.4194)');
          return;
        }
        
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setGpsLocation(`Lat: ${loc.coords.latitude.toFixed(6)}, Lng: ${loc.coords.longitude.toFixed(6)}`);
      } catch (e) {
        setGpsLocation('Error fetching GPS (Fallback: Lat 37.7749, Lng -122.4194)');
      }
    };
    fetchLocation();
  }, []);

  // Handle countdown timer
  useEffect(() => {
    if (countdown > 0 && !isAborted && !sosExecuted) {
      speak(`Alerting in ${countdown} seconds. Tap large button to cancel.`);
      const interval = setInterval(() => {
        triggerHaptic(50);
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (countdown === 0 && !isAborted && !sosExecuted) {
      executeSOS();
    }
  }, [countdown, isAborted, sosExecuted]);

  const executeSOS = async () => {
    setSosExecuted(true);
    triggerHaptic([100, 50, 100, 50, 150]);
    speak("Emergency S O S initiated! Contacting emergency details.");

    const emergencyNumber = profile?.emergencyContact?.phone || '555-019-9831';
    const patientName = profile?.name || 'Arthur Pendelton';
    const smsMessage = `EMERGENCY ALERT: ${patientName} needs immediate assistance! Current GPS location: ${gpsLocation}`;

    // 1. Open SMS draft with GPS coordinates
    const smsUrl = `sms:${emergencyNumber}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(smsMessage)}`;
    
    // 2. Open Phone dialer
    const telUrl = `tel:${emergencyNumber}`;

    Alert.alert(
      "SOS EMERGENCY TRIGGERED",
      `1. SMS text drafted to emergency contact:\n"${smsMessage}"\n\n2. Dialing emergency number: ${emergencyNumber}`,
      [
        { 
          text: "OK", 
          onPress: () => {
            Linking.openURL(telUrl);
            setTimeout(() => {
              Linking.openURL(smsUrl);
            }, 500);
          } 
        }
      ]
    );
  };

  const handleCancel = () => {
    setIsAborted(true);
    triggerHaptic(80);
    stopSpeaking();
    speak("Emergency alert cancelled.");
    router.back();
  };

  const emergencyColor = highContrast ? '#FF3333' : '#C62828';
  const cancelBg = highContrast ? '#000000' : '#E2E8F0';
  const cancelBorder = highContrast ? '#00FF00' : '#94A3B8';
  const labelColor = highContrast ? '#FFFF00' : '#64748B';
  const valColor = highContrast ? '#FFFFFF' : '#0F172A';

  return (
    <View style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#FFF8F8' }]}>
      
      {/* Visual Alarm Banner */}
      <View style={styles.alertHeader}>
        <AlertOctagon size={80} color={emergencyColor} style={styles.pulseIcon} />
        <Text
          variant="headlineLarge"
          style={[
            styles.title,
            {
              fontSize: getScaledFontSize(32),
              color: emergencyColor,
              fontWeight: 'bold',
            },
          ]}
        >
          EMERGENCY SOS
        </Text>
      </View>

      {/* Main Countdown Screen */}
      <View style={styles.body}>
        {!sosExecuted && !isAborted ? (
          <View style={styles.countdownContainer}>
            <View style={[styles.countdownCircle, { borderColor: emergencyColor, borderWidth: 6 }]}>
              <Text style={{ fontSize: getScaledFontSize(72), fontWeight: 'bold', color: emergencyColor }}>
                {countdown}
              </Text>
            </View>
            <Text style={[styles.statusText, { fontSize: getScaledFontSize(18), color: highContrast ? '#FFFFFF' : '#475569', fontWeight: 'bold', textAlign: 'center' }]}>
              Calling caregiver and sending GPS in {countdown} seconds...
            </Text>
          </View>
        ) : (
          <View style={styles.successContainer}>
            <View style={[styles.countdownCircle, { borderColor: '#16A34A', borderWidth: 6 }]}>
              <PhoneCall size={60} color="#16A34A" />
            </View>
            <Text style={{ fontSize: getScaledFontSize(20), fontWeight: 'bold', color: '#166534', textAlign: 'center', marginTop: 16 }}>
              Emergency Actions Executed!
            </Text>
            <Text style={{ fontSize: getScaledFontSize(15), color: highContrast ? '#FFFFFF' : '#475569', textAlign: 'center', marginTop: 8, paddingHorizontal: 20 }}>
              SMS text drafted to caregiver. Phone call initiated.
            </Text>
          </View>
        )}

        {/* GPS location preview */}
        <View style={styles.gpsContainer}>
          <Text style={{ fontSize: getScaledFontSize(14), color: labelColor, fontWeight: 'bold' }}>
            Current GPS Coordinates:
          </Text>
          <Text style={{ fontSize: getScaledFontSize(15), color: valColor, fontWeight: 'bold', marginTop: 4 }}>
            {gpsLocation}
          </Text>
        </View>
      </View>

      {/* Big senior cancellation button (compliance target: massive size) */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleCancel}
          style={[
            styles.cancelBtn,
            {
              backgroundColor: cancelBg,
              borderColor: cancelBorder,
              borderWidth: 3,
            },
          ]}
          accessibilityLabel="Cancel emergency alert and go back"
        >
          <XCircle size={32} color={highContrast ? '#00FF00' : '#475569'} />
          <Text
            style={{
              fontSize: getScaledFontSize(20),
              color: highContrast ? '#00FF00' : '#475569',
              fontWeight: 'bold',
              marginLeft: 12,
            }}
          >
            Cancel Alert
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 48,
  },
  alertHeader: {
    alignItems: 'center',
    marginTop: 20,
  },
  pulseIcon: {
    marginBottom: 12,
  },
  title: {
    textAlign: 'center',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  countdownContainer: {
    alignItems: 'center',
    gap: 20,
  },
  countdownCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    elevation: 3,
  },
  statusText: {
    lineHeight: 26,
    paddingHorizontal: 16,
  },
  successContainer: {
    alignItems: 'center',
  },
  gpsContainer: {
    marginTop: 32,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    elevation: 1,
    width: '100%',
  },
  footer: {
    paddingHorizontal: 24,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 80, // Massive senior compliance height
    borderRadius: 20,
    elevation: 4,
  },
});
