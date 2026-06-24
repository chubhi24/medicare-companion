import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { HeartPulse, ArrowLeft } from 'lucide-react-native';
import { useAccessibility } from '../../components/AccessibilityProvider';
import AccessibilityPanel from '../../components/AccessibilityPanel';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const { getScaledFontSize, highContrast, speak, triggerHaptic } = useAccessibility();

  const handleRegister = async () => {
    triggerHaptic(50);
    setErrorMessage(null);
    setIsSubmitting(true);

    if (!name.trim() || !email.trim() || !password.trim()) {
      const err = "Please fill in all details.";
      setErrorMessage(err);
      speak(err);
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      const err = "Password must be at least 6 characters long.";
      setErrorMessage(err);
      speak(err);
      setIsSubmitting(false);
      return;
    }

    try {
      await register(email, password, name);
      speak("Account created successfully. Welcome to MediCare Companion!");
      router.replace('/(tabs)');
    } catch (e: any) {
      const err = e.message || "Failed to create account. Please check your inputs.";
      setErrorMessage(err);
      speak(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tintColor = highContrast ? '#FFFF00' : '#0D5C75';
  const inputBg = highContrast ? '#000000' : '#FFFFFF';

  return (
    <ScrollView style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#F8FAFC' }]}>
      {/* Header back button */}
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
        
        {/* Brand Icon & Heading */}
        <View style={styles.header}>
          <HeartPulse size={48} color={tintColor} style={styles.logo} />
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
            Create Your Account
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
            Start tracking your medications and support your caregivers
          </Text>
        </View>

        {/* Errors */}
        {errorMessage && (
          <View style={[styles.errorCard, { borderColor: highContrast ? '#FF3333' : '#FCA5A5', borderWidth: highContrast ? 2 : 1 }]}>
            <Text style={{ fontSize: getScaledFontSize(15), color: highContrast ? '#FF3333' : '#B91C1C', fontWeight: 'bold' }}>
              {errorMessage}
            </Text>
          </View>
        )}

        {/* Form Fields */}
        <View style={styles.form}>
          <TextInput
            label="Your Full Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            autoCapitalize="words"
            style={[styles.input, { backgroundColor: inputBg }]}
            outlineColor={highContrast ? '#888888' : '#CBD5E1'}
            activeOutlineColor={tintColor}
            textColor={highContrast ? '#FFFFFF' : '#0F172A'}
            placeholder="e.g. Arthur Pendelton"
            outlineStyle={{ borderRadius: 12 }}
            contentStyle={{ height: 60, fontSize: getScaledFontSize(16) }}
          />

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

          <TextInput
            label="Choose Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={[styles.input, { backgroundColor: inputBg }]}
            outlineColor={highContrast ? '#888888' : '#CBD5E1'}
            activeOutlineColor={tintColor}
            textColor={highContrast ? '#FFFFFF' : '#0F172A'}
            outlineStyle={{ borderRadius: 12 }}
            contentStyle={{ height: 60, fontSize: getScaledFontSize(16) }}
            placeholder="Minimum 6 characters"
          />

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={[styles.registerBtn, highContrast && { borderWidth: 2, borderColor: '#00FF00' }]}
            buttonColor={highContrast ? '#FFFF00' : '#0D5C75'}
            textColor={highContrast ? '#000000' : '#FFFFFF'}
            contentStyle={styles.btnContent}
            labelStyle={{ fontSize: getScaledFontSize(18), fontWeight: 'bold' }}
          >
            Create My Account
          </Button>

          {/* Login redirection */}
          <View style={styles.footerRow}>
            <Text style={{ fontSize: getScaledFontSize(15), color: highContrast ? '#FFFFFF' : '#64748B' }}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.loginLink}>
              <Text style={{ fontSize: getScaledFontSize(15), color: tintColor, fontWeight: 'bold', textDecorationLine: 'underline' }}>
                Sign In Instead
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Accessibility panel */}
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
  logo: {
    marginBottom: 12,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontWeight: '500',
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  registerBtn: {
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 24,
    elevation: 3,
  },
  btnContent: {
    height: 58,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 32,
  },
  loginLink: {
    padding: 4,
  },
  accessibilitySection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 24,
  },
});
