import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Button, Switch, List } from 'react-native-paper';
import { useAccessibility } from '../../components/AccessibilityProvider';
import { useApp } from '../../context/AppContext';
import { router } from 'expo-router';
import { 
  ArrowLeft, 
  Settings, 
  Globe, 
  CloudLightning, 
  BellRing, 
  ShieldCheck, 
  HelpCircle,
  Volume2
} from 'lucide-react-native';
import AccessibilityPanel from '../../components/AccessibilityPanel';

export default function SettingsScreen() {
  const { getScaledFontSize, highContrast, speak, triggerHaptic } = useAccessibility();
  const { refreshData } = useApp();

  const [language, setLanguage] = useState('English');
  const [voiceAlarms, setVoiceAlarms] = useState(true);
  const [refillReminders, setRefillReminders] = useState(true);

  const speakSettingsDetails = () => {
    triggerHaptic(40);
    speak("Settings screen. Adjust your preferences like language, backup, and notifications. Or use the Accessibility Panel at the top.");
  };

  const handleLanguageChange = () => {
    triggerHaptic(50);
    Alert.alert(
      "Choose Language",
      "Select your preferred language",
      [
        { text: "English", onPress: () => { setLanguage('English'); speak("Language set to English."); } },
        { text: "Español (Spanish)", onPress: () => { setLanguage('Español'); speak("Language set to Spanish."); } },
        { text: "हिन्दी (Hindi)", onPress: () => { setLanguage('Hindi'); speak("Language set to Hindi."); } },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const handleBackup = () => {
    triggerHaptic(70);
    speak("Backing up your medical schedule to secure cloud storage...");
    Alert.alert(
      "Backup Complete",
      "All your prescription schedules, doctor appointments, and intake logs have been securely backed up in the cloud database.",
      [{ text: "OK" }]
    );
  };

  const handleRestore = () => {
    triggerHaptic(70);
    speak("Restoring your data from cloud storage...");
    Alert.alert(
      "Restore Complete",
      "Your prescription schedules and history profiles have been successfully restored.",
      [{ text: "OK", onPress: () => refreshData() }]
    );
  };

  const primaryColor = highContrast ? '#FFFF00' : '#0D5C75';
  const valColor = highContrast ? '#FFFFFF' : '#0F172A';
  const labelColor = highContrast ? '#FFFF00' : '#475569';
  const cardBg = highContrast ? '#000000' : '#FFFFFF';

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#F8FAFC' }]}
      contentContainerStyle={{ paddingBottom: 140 }}
    >
      
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnWrapper}>
          <ArrowLeft size={28} color={primaryColor} />
          <Text style={{ fontSize: getScaledFontSize(16), color: primaryColor, marginLeft: 8, fontWeight: 'bold' }}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={speakSettingsDetails}
          style={[styles.audioBtn, { borderColor: primaryColor, borderWidth: highContrast ? 2 : 1 }]}
          accessibilityLabel="Read settings options aloud"
        >
          <Volume2 size={24} color={primaryColor} />
          <Text style={{ fontSize: getScaledFontSize(13), color: primaryColor, fontWeight: 'bold', marginLeft: 4 }}>Read Screen</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        
        {/* Title */}
        <View style={styles.header}>
          <Text
            variant="headlineMedium"
            style={{
              fontSize: getScaledFontSize(26),
              fontWeight: 'bold',
              color: valColor,
            }}
          >
            System Settings
          </Text>
          <Text style={{ fontSize: getScaledFontSize(14), color: labelColor, marginTop: 4 }}>
            Tailor alarms, sync records, and modify profiles
          </Text>
        </View>

        {/* Accessibility Panel Embedded */}
        <AccessibilityPanel />

        {/* General Settings */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { fontSize: getScaledFontSize(18), color: valColor, fontWeight: 'bold', marginTop: 24 }]}>
          General Preferences
        </Text>

        <Card style={[styles.settingsCard, { backgroundColor: cardBg, borderColor: highContrast ? '#FFFF00' : '#E2E8F0', borderWidth: highContrast ? 2 : 0 }]}>
          <Card.Content style={styles.cardContent}>
            
            {/* Language Selector */}
            <TouchableOpacity onPress={handleLanguageChange} style={[styles.settingRow, { borderBottomColor: highContrast ? '#888888' : '#F1F5F9' }]}>
              <View style={styles.settingLabelCol}>
                <Globe size={24} color={primaryColor} />
                <Text style={[styles.settingTitle, { fontSize: getScaledFontSize(16), color: valColor }]}>
                  App Language
                </Text>
              </View>
              <Text style={[styles.settingValText, { fontSize: getScaledFontSize(16), color: primaryColor, fontWeight: 'bold' }]}>
                {language}
              </Text>
            </TouchableOpacity>

            {/* Alarms Settings */}
            <View style={[styles.settingRow, { borderBottomColor: highContrast ? '#888888' : '#F1F5F9' }]}>
              <View style={styles.settingLabelCol}>
                <BellRing size={24} color={primaryColor} />
                <View style={styles.settingTextGroup}>
                  <Text style={[styles.settingTitle, { fontSize: getScaledFontSize(16), color: valColor }]}>
                    Voice Announcements
                  </Text>
                  <Text style={{ fontSize: getScaledFontSize(12), color: labelColor }}>
                    Speak medicine instructions during reminders
                  </Text>
                </View>
              </View>
              <Switch
                value={voiceAlarms}
                onValueChange={setVoiceAlarms}
                color={primaryColor}
              />
            </View>

            {/* Low Refill Reminders */}
            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <View style={styles.settingLabelCol}>
                <ShieldCheck size={24} color={primaryColor} />
                <View style={styles.settingTextGroup}>
                  <Text style={[styles.settingTitle, { fontSize: getScaledFontSize(16), color: valColor }]}>
                    Refill Reminders
                  </Text>
                  <Text style={{ fontSize: getScaledFontSize(12), color: labelColor }}>
                    Notify me when pill count falls below threshold
                  </Text>
                </View>
              </View>
              <Switch
                value={refillReminders}
                onValueChange={setRefillReminders}
                color={primaryColor}
              />
            </View>

          </Card.Content>
        </Card>

        {/* Sync & Database Settings */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { fontSize: getScaledFontSize(18), color: valColor, fontWeight: 'bold', marginTop: 24 }]}>
          Backup & Restore
        </Text>

        <Card style={[styles.settingsCard, { backgroundColor: cardBg, borderColor: highContrast ? '#FFFF00' : '#E2E8F0', borderWidth: highContrast ? 2 : 0 }]}>
          <Card.Content style={styles.cardContent}>
            
            <View style={styles.backupHeaderRow}>
              <CloudLightning size={24} color={primaryColor} />
              <Text style={{ fontSize: getScaledFontSize(15), color: valColor, fontWeight: 'bold', marginLeft: 10 }}>
                Cloud Security Sync
              </Text>
            </View>
            <Text style={{ fontSize: getScaledFontSize(13), color: labelColor, marginTop: 8, lineHeight: 18 }}>
              Synchronize your database. Keeps schedules, history and caregiver contacts safe in case you change or lose your phone.
            </Text>

            <View style={styles.backupActions}>
              <Button
                mode="outlined"
                onPress={handleBackup}
                style={[styles.syncBtn, { borderColor: primaryColor, borderWidth: 1.5 }]}
                textColor={primaryColor}
                labelStyle={{ fontSize: getScaledFontSize(14), fontWeight: 'bold' }}
                contentStyle={{ height: 50 }}
              >
                Backup Data
              </Button>
              <Button
                mode="outlined"
                onPress={handleRestore}
                style={[styles.syncBtn, { borderColor: primaryColor, borderWidth: 1.5 }]}
                textColor={primaryColor}
                labelStyle={{ fontSize: getScaledFontSize(14), fontWeight: 'bold' }}
                contentStyle={{ height: 50 }}
              >
                Restore Data
              </Button>
            </View>

          </Card.Content>
        </Card>

        {/* Onboarding walkthrough reset */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { fontSize: getScaledFontSize(18), color: valColor, fontWeight: 'bold', marginTop: 24 }]}>
          Help & Guidance
        </Text>

        <Card style={[styles.settingsCard, { backgroundColor: cardBg, borderColor: highContrast ? '#FFFF00' : '#E2E8F0', borderWidth: highContrast ? 2 : 0 }]}>
          <Card.Content style={styles.cardContent}>
            <TouchableOpacity 
              onPress={() => {
                triggerHaptic(50);
                speak("Restarting app walkthrough tutorial.");
                router.push('/onboarding');
              }} 
              style={[styles.settingRow, { borderBottomWidth: 0, paddingVertical: 8 }]}
            >
              <View style={styles.settingLabelCol}>
                <HelpCircle size={24} color={primaryColor} />
                <View style={styles.settingTextGroup}>
                  <Text style={[styles.settingTitle, { fontSize: getScaledFontSize(16), color: valColor, fontWeight: 'bold' }]}>
                    Review Onboarding Walkthrough
                  </Text>
                  <Text style={{ fontSize: getScaledFontSize(13), color: labelColor, marginTop: 2 }}>
                    Replay slides detailing how to use this app
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Card.Content>
        </Card>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 8,
    alignItems: 'center',
  },
  backBtnWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    elevation: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  settingsCard: {
    borderRadius: 20,
    elevation: 2,
    marginBottom: 12,
  },
  cardContent: {
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingLabelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    marginLeft: 12,
    fontWeight: 'bold',
  },
  settingTextGroup: {
    marginLeft: 12,
    flex: 1,
  },
  settingValText: {
    paddingRight: 4,
  },
  backupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backupActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  syncBtn: {
    flex: 1,
    borderRadius: 12,
  },
});
