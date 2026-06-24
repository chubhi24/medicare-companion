import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Checkbox } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { HeartPulse, Eye, EyeOff } from 'lucide-react-native';
import { useAccessibility } from '../../components/AccessibilityProvider';
import AccessibilityPanel from '../../components/AccessibilityPanel';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login } = useAuth();
  const { getScaledFontSize, highContrast, speak, triggerHaptic } = useAccessibility();

  const handleLogin = async () => {
    triggerHaptic(50);
    setErrorMessage(null);
    setIsSubmitting(true);

    if (!email.trim() || !password.trim()) {
      const err = "Please enter both email and password.";
      setErrorMessage(err);
      speak(err);
      setIsSubmitting(false);
      return;
    }

    try {
      await login(email, password);
      speak("Login successful. Welcome back!");
      router.replace('/(tabs)');
    } catch (e: any) {
      const err = e.message || "Failed to log in. Please check your credentials.";
      setErrorMessage(err);
      speak(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const speakScreenInfo = () => {
    speak("Login Screen. Enter your email and password to log in. Tap accessibility options below if you need larger text or voice assistance.");
  };

  const tintColor = highContrast ? '#FFFF00' : '#0D5C75';
  const inputBg = highContrast ? '#000000' : '#FFFFFF';

  return (
    <ScrollView style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#F8FAFC' }]}>
      <View style={styles.content}>
        
        {/* Header Icon & Brand */}
        <View style={styles.header}>
          <TouchableOpacity onPress={speakScreenInfo} style={styles.brandIconWrapper}>
            <HeartPulse size={56} color={tintColor} />
          </TouchableOpacity>
          <Text
            variant="headlineMedium"
            style={[
              styles.title,
              {
                fontSize: getScaledFontSize(28),
                color: highContrast ? '#FFFFFF' : '#0F172A',
                fontWeight: 'bold',
              },
            ]}
          >
            MediCare Companion
          </Text>
          <Text
            variant="bodyMedium"
            style={[
              styles.subtitle,
              {
                fontSize: getScaledFontSize(15),
                color: highContrast ? '#FFFF00' : '#64748B',
              },
            ]}
          >
            Sign in to manage your medication schedule
          </Text>
        </View>

        {/* Error Display */}
        {errorMessage && (
          <View style={[styles.errorCard, { borderColor: highContrast ? '#FF3333' : '#FCA5A5', borderWidth: highContrast ? 2 : 1 }]}>
            <Text style={{ fontSize: getScaledFontSize(15), color: highContrast ? '#FF3333' : '#B91C1C', fontWeight: 'bold' }}>
              {errorMessage}
            </Text>
          </View>
        )}

        {/* Inputs */}
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

          <View style={styles.passwordWrapper}>
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              style={[styles.input, { flex: 1, backgroundColor: inputBg }]}
              outlineColor={highContrast ? '#888888' : '#CBD5E1'}
              activeOutlineColor={tintColor}
              textColor={highContrast ? '#FFFFFF' : '#0F172A'}
              outlineStyle={{ borderRadius: 12 }}
              contentStyle={{ height: 60, fontSize: getScaledFontSize(16) }}
              right={
                <TextInput.Icon
                  icon={() => 
                    showPassword 
                      ? <EyeOff size={24} color={highContrast ? '#FFFF00' : '#64748B'} /> 
                      : <Eye size={24} color={highContrast ? '#FFFF00' : '#64748B'} />
                  }
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
          </View>

          {/* Remember Me & Forgot Password */}
          <View style={styles.formOptions}>
            <View style={styles.rememberMeRow}>
              <Checkbox.Android
                status={rememberMe ? 'checked' : 'unchecked'}
                onPress={() => setRememberMe(!rememberMe)}
                color={tintColor}
                uncheckedColor={highContrast ? '#FFFFFF' : '#64748B'}
              />
              <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={styles.checkboxLabel}>
                <Text style={{ fontSize: getScaledFontSize(15), color: highContrast ? '#FFFFFF' : '#475569', fontWeight: 'bold' }}>
                  Remember Me
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgotBtn}>
              <Text style={{ fontSize: getScaledFontSize(15), color: tintColor, fontWeight: 'bold', textDecorationLine: 'underline' }}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={[styles.loginBtn, highContrast && { borderWidth: 2, borderColor: '#00FF00' }]}
            buttonColor={highContrast ? '#FFFF00' : '#0D5C75'}
            textColor={highContrast ? '#000000' : '#FFFFFF'}
            contentStyle={styles.btnContent}
            labelStyle={{ fontSize: getScaledFontSize(18), fontWeight: 'bold' }}
          >
            Log In
          </Button>

          {/* Register Link */}
          <View style={styles.footerRow}>
            <Text style={{ fontSize: getScaledFontSize(15), color: highContrast ? '#FFFFFF' : '#64748B' }}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.registerLink}>
              <Text style={{ fontSize: getScaledFontSize(15), color: tintColor, fontWeight: 'bold', textDecorationLine: 'underline' }}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Top-level Accessibility controls to assist before registration/login */}
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
  content: {
    padding: 24,
    paddingTop: 64,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandIconWrapper: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: '#E0F2FE',
    marginBottom: 12,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 4,
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
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  formOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 8,
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    marginLeft: 4,
  },
  forgotBtn: {
    paddingVertical: 4,
  },
  loginBtn: {
    borderRadius: 16,
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
  registerLink: {
    padding: 4,
  },
  accessibilitySection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 24,
  },
});
