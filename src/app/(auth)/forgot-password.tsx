import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth as firebaseAuth, isFirebaseConnected } from '../../services/firebase';
import { ArrowLeft, KeyRound } from 'lucide-react-native';
import { useAccessibility } from '../../components/AccessibilityProvider';
import AccessibilityPanel from '../../components/AccessibilityPanel';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { getScaledFontSize, highContrast, speak, triggerHaptic } = useAccessibility();

  const handleReset = async () => {
    triggerHaptic(50);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    if (!email.trim()) {
      const err = "Please enter your email address.";
      setErrorMessage(err);
      speak(err);
      setIsSubmitting(false);
      return;
    }

    try {
      if (isFirebaseConnected && firebaseAuth) {
        await sendPasswordResetEmail(firebaseAuth, email);
        const success = "A password reset email has been sent. Please check your inbox.";
        setSuccessMessage(success);
        speak(success);
      } else {
        // Mock success mode
        setTimeout(() => {
          const success = "Offline Mode: A mock password reset instruction has been sent to your email.";
          setSuccessMessage(success);
          speak(success);
          setIsSubmitting(false);
        }, 800);
        return;
      }
    } catch (e: any) {
      const err = e.message || "Failed to send reset email. Verify your address.";
      setErrorMessage(err);
      speak(err);
    } finally {
      if (isFirebaseConnected) {
        setIsSubmitting(false);
      }
    }
  };

  const tintColor = highContrast ? '#FFFF00' : '#0D5C75';
  const inputBg = highContrast ? '#000000' : '#FFFFFF';

  return (
    <ScrollView style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#F8FAFC' }]}>
      {/* Top back bar */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          onPress={() => { triggerHaptic(30); router.back(); }} 
          style={styles.backBtnWrapper}
          accessibilityLabel="Go back to login screen"
        >
          <ArrowLeft size={28} color={tintColor} />
          <Text style={{ fontSize: getScaledFontSize(16), color: tintColor, marginLeft: 8, fontWeight: 'bold' }}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        
        {/* Brand/Feature Icon */}
        <View style={styles.header}>
          <View style={[styles.iconWrapper, { backgroundColor: highContrast ? '#000000' : '#FEF3C7', borderColor: tintColor, borderWidth: highContrast ? 2 : 0 }]}>
            <KeyRound size={48} color={tintColor} />
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
            Forgot Password?
          </Text>
          <Text
            variant="bodyMedium"
            style={[
              styles.subtitle,
              {
                fontSize: getScaledFontSize(15),
                color: highContrast ? '#FFFF00' : '#64748B',
                textAlign: 'center',
              },
            ]}
          >
            Enter your email and we'll send you instructions to choose a new password
          </Text>
        </View>

        {/* Notifications */}
        {errorMessage && (
          <View style={[styles.cardAlert, styles.cardError, { borderColor: highContrast ? '#FF3333' : '#FCA5A5', borderWidth: highContrast ? 2 : 1 }]}>
            <Text style={{ fontSize: getScaledFontSize(15), color: highContrast ? '#FF3333' : '#B91C1C', fontWeight: 'bold' }}>
              {errorMessage}
            </Text>
          </View>
        )}

        {successMessage && (
          <View style={[styles.cardAlert, styles.cardSuccess, { borderColor: highContrast ? '#00FF00' : '#86EFAC', borderWidth: highContrast ? 2 : 1 }]}>
            <Text style={{ fontSize: getScaledFontSize(15), color: highContrast ? '#00FF00' : '#15803D', fontWeight: 'bold' }}>
              {successMessage}
            </Text>
          </View>
        )}

        {/* Action Form */}
        <View style={styles.form}>
          <TextInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, { backgroundColor: inputBg }]}
            outlineColor={highContrast ? '#888888' : '#CBD5E1'}
            activeOutlineColor={tintColor}
            textColor={highContrast ? '#FFFFFF' : '#0F172A'}
            placeholder="e.g. arthur@example.com"
            outlineStyle={{ borderRadius: 12 }}
            contentStyle={{ height: 60, fontSize: getScaledFontSize(16) }}
          />

          <Button
            mode="contained"
            onPress={handleReset}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={[styles.resetBtn, highContrast && { borderWidth: 2, borderColor: '#00FF00' }]}
            buttonColor={highContrast ? '#FFFF00' : '#0D5C75'}
            textColor={highContrast ? '#000000' : '#FFFFFF'}
            contentStyle={styles.btnContent}
            labelStyle={{ fontSize: getScaledFontSize(18), fontWeight: 'bold' }}
          >
            Send Reset Instructions
          </Button>
        </View>

        {/* Accessibility features */}
        <View style={styles.accessibilitySection}>
          <AccessibilityPanel />
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 8,
  },
  backBtnWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  content: {
    padding: 24,
    paddingTop: 8,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconWrapper: {
    padding: 16,
    borderRadius: 32,
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontWeight: '500',
  },
  cardAlert: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  cardError: {
    backgroundColor: '#FEF2F2',
  },
  cardSuccess: {
    backgroundColor: '#F0FDF4',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 20,
  },
  resetBtn: {
    borderRadius: 16,
    marginBottom: 32,
    elevation: 3,
  },
  btnContent: {
    height: 58,
  },
  accessibilitySection: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 24,
  },
});
