import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { useAdherence } from '../../hooks/useAdherence';
import { useAccessibility } from '../../components/AccessibilityProvider';
import { router } from 'expo-router';
import { ArrowLeft, Users, Phone, Mail, CheckCircle2, ShieldAlert, Sparkles, Send, Volume2 } from 'lucide-react-native';

export default function CaregiverScreen() {
  const { profile } = useAuth();
  const { todaySlots, todayTaken, todayTotal, streak } = useAdherence();
  const { getScaledFontSize, highContrast, speak, triggerHaptic } = useAccessibility();

  // Find missed slots that are past 30 mins to show caregiver notifications
  const missedAlerts = todaySlots.filter(s => s.status === 'missed');

  const speakCaregiverDetails = () => {
    triggerHaptic(40);
    const caregiverName = profile?.caregiver?.name || 'Emily Smith';
    let speech = `Caregiver details screen. My Caregiver is ${caregiverName}. `;
    if (profile?.caregiver?.receiveMissedAlerts) {
      speech += `Caregiver is set to receive notifications if a dose is missed for over 30 minutes. `;
    }
    if (missedAlerts.length > 0) {
      speech += `Warning: You have missed ${missedAlerts.length} doses today! Caregiver has been notified. `;
    } else {
      speech += `All doses are on track today. Caregiver sync is active. `;
    }
    speak(speech);
  };

  const handleCallCaregiver = () => {
    triggerHaptic(60);
    const phone = profile?.caregiver?.phone || '555-012-4455';
    speak(`Calling Caregiver ${profile?.caregiver?.name || 'Emily'}`);
    Linking.openURL(`tel:${phone}`);
  };

  const handleSimulateSync = () => {
    triggerHaptic(50);
    speak("Simulating manual sync with Caregiver dashboard...");
    Alert.alert(
      "Sync Complete",
      `Successfully synced today's adherence data (${todayTaken}/${todayTotal} doses) with ${profile?.caregiver?.name || 'Emily Smith'}'s device.`,
      [{ text: "OK" }]
    );
  };

  const primaryColor = highContrast ? '#FFFF00' : '#0D5C75';
  const valColor = highContrast ? '#FFFFFF' : '#0F172A';
  const labelColor = highContrast ? '#FFFF00' : '#475569';
  const takenColor = highContrast ? '#00FF00' : '#2E7D32';
  const missedColor = highContrast ? '#FF3333' : '#C62828';

  return (
    <ScrollView style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#F8FAFC' }]}>
      
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnWrapper}>
          <ArrowLeft size={28} color={primaryColor} />
          <Text style={{ fontSize: getScaledFontSize(16), color: primaryColor, marginLeft: 8, fontWeight: 'bold' }}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={speakCaregiverDetails}
          style={[styles.audioBtn, { borderColor: primaryColor, borderWidth: highContrast ? 2 : 1 }]}
          accessibilityLabel="Read caregiver info aloud"
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
            My Caregiver Support
          </Text>
          <Text style={{ fontSize: getScaledFontSize(14), color: labelColor, marginTop: 4 }}>
            Sync logs and manage alert configurations
          </Text>
        </View>

        {/* Active Caregiver details card */}
        <Card style={[styles.caregiverCard, { backgroundColor: highContrast ? '#000000' : '#FFFFFF', borderColor: highContrast ? '#FFFF00' : '#E2E8F0', borderWidth: highContrast ? 2 : 0 }]}>
          <Card.Content style={styles.cardContent}>
            
            <View style={styles.cardHeader}>
              <View style={[styles.avatarCircle, { backgroundColor: highContrast ? '#000000' : '#E0F2FE', borderColor: primaryColor, borderWidth: 2 }]}>
                <Users size={36} color={primaryColor} />
              </View>
              <View style={styles.avatarDetails}>
                <Text style={{ fontSize: getScaledFontSize(20), fontWeight: 'bold', color: valColor }}>
                  {profile?.caregiver?.name || 'Emily Smith'}
                </Text>
                <Text style={{ fontSize: getScaledFontSize(14), color: labelColor, marginTop: 2 }}>
                  Primary Healthcare Provider / Nurse
                </Text>
              </View>
            </View>

            {/* Contacts details list */}
            <View style={styles.contactList}>
              {profile?.caregiver?.phone && (
                <View style={styles.contactRow}>
                  <Phone size={20} color={primaryColor} />
                  <Text style={[styles.contactVal, { fontSize: getScaledFontSize(16), color: valColor }]}>
                    {profile.caregiver.phone}
                  </Text>
                </View>
              )}

              {profile?.caregiver?.email && (
                <View style={[styles.contactRow, { borderBottomWidth: 0 }]}>
                  <Mail size={20} color={primaryColor} />
                  <Text style={[styles.contactVal, { fontSize: getScaledFontSize(16), color: valColor }]}>
                    {profile.caregiver.email}
                  </Text>
                </View>
              )}
            </View>

            {/* Actions Grid */}
            <View style={styles.actionsGrid}>
              <Button
                mode="outlined"
                onPress={handleCallCaregiver}
                style={[styles.actionBtn, { borderColor: primaryColor, borderWidth: 2 }]}
                textColor={primaryColor}
                contentStyle={{ height: 56 }}
                labelStyle={{ fontSize: getScaledFontSize(15), fontWeight: 'bold' }}
                icon={() => <Phone size={20} color={primaryColor} />}
              >
                Call Caregiver
              </Button>
              <Button
                mode="contained"
                onPress={handleSimulateSync}
                style={[styles.actionBtn, { marginTop: 12 }]}
                buttonColor={primaryColor}
                textColor={highContrast ? '#000000' : '#FFFFFF'}
                contentStyle={{ height: 56 }}
                labelStyle={{ fontSize: getScaledFontSize(15), fontWeight: 'bold' }}
                icon={() => <Send size={20} color={highContrast ? '#000000' : '#FFFFFF'} />}
              >
                Sync Device Data
              </Button>
            </View>

          </Card.Content>
        </Card>

        {/* Missed Dose 30-min Alerts System Status */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { fontSize: getScaledFontSize(18), color: valColor, fontWeight: 'bold', marginTop: 28 }]}>
          Caregiver Alarms (30-Minute Missed Rules)
        </Text>

        <View style={styles.alertSystemContainer}>
          {missedAlerts.length > 0 ? (
            <Card style={[styles.alertSystemCard, { backgroundColor: highContrast ? '#000000' : '#FEF2F2', borderColor: missedColor, borderWidth: 2 }]}>
              <Card.Content style={styles.alertCardContent}>
                <ShieldAlert size={28} color={missedColor} />
                <View style={styles.alertSystemTexts}>
                  <Text style={{ fontSize: getScaledFontSize(16), fontWeight: 'bold', color: highContrast ? '#FFFFFF' : '#991B1B' }}>
                    Caregiver Alert Active!
                  </Text>
                  <Text style={{ fontSize: getScaledFontSize(14), color: highContrast ? '#FF3333' : '#7F1D1D', marginTop: 4 }}>
                    The following medications have been missed for more than 30 minutes. Notifications were sent to {profile?.caregiver?.name || 'Emily Smith'}:
                  </Text>
                  {missedAlerts.map(slot => (
                    <Text key={slot.id} style={{ fontSize: getScaledFontSize(15), fontWeight: 'bold', color: missedColor, marginTop: 6, paddingLeft: 8 }}>
                      • {slot.medicine.name} (scheduled {slot.scheduleTime})
                    </Text>
                  ))}
                </View>
              </Card.Content>
            </Card>
          ) : (
            <Card style={[styles.alertSystemCard, { backgroundColor: highContrast ? '#000000' : '#F0FDF4', borderColor: takenColor, borderWidth: highContrast ? 2 : 1 }]}>
              <Card.Content style={styles.alertCardContent}>
                <CheckCircle2 size={28} color={takenColor} />
                <View style={styles.alertSystemTexts}>
                  <Text style={{ fontSize: getScaledFontSize(16), fontWeight: 'bold', color: highContrast ? '#FFFFFF' : '#166534' }}>
                    Sync System: All Doses on Track
                  </Text>
                  <Text style={{ fontSize: getScaledFontSize(14), color: highContrast ? '#00FF00' : '#14532D', marginTop: 4 }}>
                    No doses have been missed. Your caregiver {profile?.caregiver?.name || 'Emily Smith'} will receive alerts only if you are 30 minutes late taking a scheduled dose.
                  </Text>
                </View>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Adherence report shared overview */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { fontSize: getScaledFontSize(18), color: valColor, fontWeight: 'bold', marginTop: 28 }]}>
          Caregiver Portal Synchronization
        </Text>

        <Card style={[styles.reportCard, { backgroundColor: highContrast ? '#000000' : '#FFFFFF', borderColor: highContrast ? '#FFFF00' : '#E2E8F0', borderWidth: highContrast ? 2 : 0 }]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.syncRow}>
              <Sparkles size={24} color={primaryColor} />
              <Text style={{ fontSize: getScaledFontSize(15), color: valColor, fontWeight: 'bold', marginLeft: 10, flex: 1 }}>
                Caregiver Adherence Tracker
              </Text>
            </View>
            <Text style={{ fontSize: getScaledFontSize(14), color: labelColor, marginTop: 8, lineHeight: 20 }}>
              Your caregiver has a companion view of your profile. When you check off a dose, check-in history updates in real-time on their device, showing:
            </Text>
            <View style={styles.perkList}>
              <Text style={{ fontSize: getScaledFontSize(14), color: valColor, marginTop: 4 }}>
                • Active medication schedule and inventory count.
              </Text>
              <Text style={{ fontSize: getScaledFontSize(14), color: valColor, marginTop: 4 }}>
                • Daily adherence rate ({todayTaken}/{todayTotal} doses) and {streak} day streak.
              </Text>
              <Text style={{ fontSize: getScaledFontSize(14), color: valColor, marginTop: 4 }}>
                • Glaucoma scans, ECGs, and appointments.
              </Text>
            </View>
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
  caregiverCard: {
    borderRadius: 24,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 16,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarDetails: {
    marginLeft: 12,
    flex: 1,
  },
  contactList: {
    marginBottom: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  contactVal: {
    marginLeft: 12,
    fontWeight: 'bold',
  },
  actionsGrid: {
    width: '100%',
  },
  actionBtn: {
    borderRadius: 14,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  alertSystemContainer: {
    marginBottom: 12,
  },
  alertSystemCard: {
    borderRadius: 20,
    elevation: 2,
  },
  alertCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
  },
  alertSystemTexts: {
    marginLeft: 12,
    flex: 1,
  },
  reportCard: {
    borderRadius: 20,
    elevation: 2,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  perkList: {
    marginTop: 10,
    paddingLeft: 6,
  },
});
