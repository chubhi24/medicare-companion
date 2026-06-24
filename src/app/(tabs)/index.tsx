import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Banner, Button } from 'react-native-paper';
import { useAdherence } from '../../hooks/useAdherence';
import { useMedicines } from '../../hooks/useMedicines';
import { useAppointments } from '../../hooks/useAppointments';
import { useAuth } from '../../hooks/useAuth';
import { useAccessibility } from '../../components/AccessibilityProvider';
import CircularProgress from '../../components/CircularProgress';
import MedicineCard from '../../components/MedicineCard';
import { Flame, BellRing, Calendar, ShieldAlert, Sparkles, Volume2, UserPlus, FileText } from 'lucide-react-native';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const { profile } = useAuth();
  const {
    todaySlots,
    todayTaken,
    todayTotal,
    completionPercentage,
    streak,
    logAdherence
  } = useAdherence();

  const { lowStockMedicines } = useMedicines();
  const { upcomingAppointments } = useAppointments();
  const { getScaledFontSize, highContrast, speak, triggerHaptic } = useAccessibility();

  const [refillBannerVisible, setRefillBannerVisible] = useState(true);

  // Motivational message
  const getMotivationalMessage = () => {
    if (todayTotal === 0) return "Add your medications to get started!";
    if (completionPercentage === 100) return "Perfect compliance! Keep up the amazing work! ❤️";
    if (completionPercentage >= 50) return "More than halfway done! You are doing great! 👍";
    return "Let's start your day with healthy routines! ☀️";
  };

  // Speaks today's schedule overview
  const speakScheduleOverview = () => {
    triggerHaptic(40);
    const userName = profile?.name || 'Arthur';
    let speechText = `Hello ${userName}. Today, you have taken ${todayTaken} of ${todayTotal} doses. Your completion rate is ${completionPercentage} percent. `;
    
    if (streak > 0) {
      speechText += `You are on a ${streak} day streak! `;
    }

    const pendingSlots = todaySlots.filter(s => s.status === 'pending');
    if (pendingSlots.length > 0) {
      speechText += `You have ${pendingSlots.length} remaining doses. `;
      pendingSlots.forEach(slot => {
        speechText += `${slot.medicine.name} at ${slot.scheduleTime}. `;
      });
    } else {
      speechText += `All scheduled doses have been taken or skipped for today! `;
    }

    speak(speechText);
  };

  const nameColor = highContrast ? '#FFFF00' : '#0D5C75';
  const streakColor = highContrast ? '#FF3333' : '#E65100';

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#F8FAFC' }]}
      contentContainerStyle={{ paddingBottom: 120 }} // Keep spacer for FAB and tabs
    >
      {/* Header section */}
      <View style={styles.header}>
        <View style={styles.welcomeCol}>
          <Text style={[styles.helloText, { fontSize: getScaledFontSize(16), color: highContrast ? '#FFFFFF' : '#64748B' }]}>
            Hello,
          </Text>
          <Text
            variant="headlineMedium"
            style={[
              styles.nameText,
              {
                fontSize: getScaledFontSize(26),
                color: nameColor,
                fontWeight: 'bold',
              },
            ]}
          >
            {profile?.name || 'Arthur Pendelton'}
          </Text>
        </View>

        <TouchableOpacity 
          onPress={speakScheduleOverview}
          style={[styles.speakHeaderBtn, { borderColor: nameColor, borderWidth: highContrast ? 2 : 1 }]}
          accessibilityLabel="Read today's schedule aloud"
        >
          <Volume2 size={24} color={nameColor} />
          <Text style={{ fontSize: getScaledFontSize(13), color: nameColor, fontWeight: 'bold', marginLeft: 4 }}>Read Schedule</Text>
        </TouchableOpacity>
      </View>

      {/* Motivational message banner */}
      <Card style={[styles.mottoCard, { backgroundColor: highContrast ? '#000000' : '#F0FDF4', borderColor: highContrast ? '#00FF00' : '#DCFCE7', borderWidth: highContrast ? 2 : 1 }]}>
        <Card.Content style={styles.mottoContent}>
          <Sparkles size={24} color={highContrast ? '#00FF00' : '#15803D'} />
          <Text style={[styles.mottoText, { fontSize: getScaledFontSize(16), color: highContrast ? '#FFFFFF' : '#14532D', fontWeight: 'bold' }]}>
            {getMotivationalMessage()}
          </Text>
        </Card.Content>
      </Card>

      {/* Analytics Wheel Card */}
      <View style={styles.summaryContainer}>
        <Card style={[styles.summaryCard, { backgroundColor: highContrast ? '#000000' : '#FFFFFF', borderColor: highContrast ? '#FFFF00' : '#E2E8F0', borderWidth: highContrast ? 2 : 0 }]}>
          <Card.Content style={styles.summaryContent}>
            
            {/* Circle Progress */}
            <View style={styles.chartWrapper}>
              <CircularProgress percentage={completionPercentage} size={150} subtitle="Completed" />
            </View>

            {/* Stats list */}
            <View style={styles.statsWrapper}>
              {/* Daily Streak */}
              <View style={styles.statRow}>
                <Flame size={28} color={streakColor} />
                <View style={styles.statTexts}>
                  <Text style={[styles.statVal, { fontSize: getScaledFontSize(18), color: streakColor, fontWeight: 'bold' }]}>
                    {streak} Days
                  </Text>
                  <Text style={{ fontSize: getScaledFontSize(13), color: highContrast ? '#FFFFFF' : '#64748B' }}>
                    Adherence Streak
                  </Text>
                </View>
              </View>

              {/* Doses Progress */}
              <View style={[styles.statRow, { marginTop: 16 }]}>
                <BellRing size={28} color={highContrast ? '#FFFF00' : '#0369A1'} />
                <View style={styles.statTexts}>
                  <Text style={[styles.statVal, { fontSize: getScaledFontSize(18), color: highContrast ? '#FFFF00' : '#0F172A', fontWeight: 'bold' }]}>
                    {todayTaken} / {todayTotal}
                  </Text>
                  <Text style={{ fontSize: getScaledFontSize(13), color: highContrast ? '#FFFFFF' : '#64748B' }}>
                    Doses Taken Today
                  </Text>
                </View>
              </View>
            </View>

          </Card.Content>
        </Card>
      </View>

      {/* Alerts & Warnings Panel */}
      <View style={styles.alertsContainer}>
        {/* Doctor Appointment Alert */}
        {upcomingAppointments.length > 0 && (
          <Card style={[styles.alertCard, styles.appointmentAlert, { borderColor: highContrast ? '#FFFF00' : '#E0F2FE', borderWidth: highContrast ? 2 : 1 }]}>
            <Card.Content style={styles.alertContent}>
              <Calendar size={24} color={highContrast ? '#FFFF00' : '#0284C7'} />
              <View style={styles.alertTexts}>
                <Text style={{ fontSize: getScaledFontSize(15), fontWeight: 'bold', color: highContrast ? '#FFFFFF' : '#0369A1' }}>
                  Upcoming Appointment
                </Text>
                <Text style={{ fontSize: getScaledFontSize(14), color: highContrast ? '#FFFF00' : '#075985', marginTop: 2 }}>
                  {upcomingAppointments[0].doctorName} ({upcomingAppointments[0].specialty}) - {upcomingAppointments[0].date} at {upcomingAppointments[0].time}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Low Stock Refill alerts */}
        {lowStockMedicines.length > 0 && refillBannerVisible && (
          <Card style={[styles.alertCard, styles.stockAlert, { borderColor: highContrast ? '#FF3333' : '#FEE2E2', borderWidth: highContrast ? 2 : 1 }]}>
            <Card.Content style={styles.alertContent}>
              <ShieldAlert size={24} color={highContrast ? '#FF3333' : '#DC2626'} />
              <View style={styles.alertTexts}>
                <Text style={{ fontSize: getScaledFontSize(15), fontWeight: 'bold', color: highContrast ? '#FFFFFF' : '#991B1B' }}>
                  Low Inventory Warning!
                </Text>
                <Text style={{ fontSize: getScaledFontSize(14), color: highContrast ? '#FF3333' : '#7F1D1D', marginTop: 2 }}>
                  You have {lowStockMedicines.length} medicine(s) running low. Tap below to manage refills.
                </Text>
                <Button 
                  mode="text" 
                  onPress={() => router.push('/(tabs)/medicine')}
                  textColor={highContrast ? '#FF3333' : '#DC2626'}
                  labelStyle={{ fontSize: getScaledFontSize(14), fontWeight: 'bold', padding: 0 }}
                  style={{ alignSelf: 'flex-start', marginTop: 4 }}
                >
                  Go to Refill List
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      </View>

      {/* Main Schedule checklist */}
      <View style={styles.scheduleHeaderRow}>
        <Text
          variant="titleLarge"
          style={{
            fontSize: getScaledFontSize(22),
            fontWeight: 'bold',
            color: highContrast ? '#FFFFFF' : '#0F172A',
          }}
        >
          Today's Doses
        </Text>
        <Text style={{ fontSize: getScaledFontSize(14), color: highContrast ? '#FFFF00' : '#64748B', fontWeight: '500' }}>
          Check off when taken
        </Text>
      </View>

      {/* Checklist list */}
      <View style={styles.scheduleList}>
        {todaySlots.length === 0 ? (
          <Card style={[styles.emptyCard, { backgroundColor: highContrast ? '#000000' : '#F1F5F9', borderWidth: highContrast ? 2 : 0, borderColor: '#FFFFFF' }]}>
            <Card.Content style={styles.emptyContent}>
              <Sparkles size={48} color={highContrast ? '#FFFF00' : '#64748B'} />
              <Text style={[styles.emptyTitle, { fontSize: getScaledFontSize(18), color: highContrast ? '#FFFFFF' : '#0F172A', fontWeight: 'bold' }]}>
                No Medicines Scheduled Today
              </Text>
              <Text style={[styles.emptyText, { fontSize: getScaledFontSize(15), color: highContrast ? '#FFFF00' : '#475569' }]}>
                Tap the "Medicines" tab below to add active prescription schedules.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          todaySlots.map((slot) => (
            <MedicineCard
              key={slot.id}
              medicine={slot.medicine}
              scheduleTime={slot.scheduleTime}
              status={slot.status}
              onTaken={() => {
                triggerHaptic(60);
                logAdherence({
                  medicineId: slot.medicine.id,
                  medicineName: slot.medicine.name,
                  dosage: slot.medicine.dosage,
                  scheduleTime: slot.scheduleTime,
                  date: new Date().toISOString().split('T')[0],
                  timestamp: Date.now(),
                  status: 'taken',
                });
                speak(`Marked ${slot.medicine.name} as taken.`);
              }}
              onSkip={() => {
                triggerHaptic(30);
                logAdherence({
                  medicineId: slot.medicine.id,
                  medicineName: slot.medicine.name,
                  dosage: slot.medicine.dosage,
                  scheduleTime: slot.scheduleTime,
                  date: new Date().toISOString().split('T')[0],
                  timestamp: Date.now(),
                  status: 'skipped',
                });
                speak(`Marked ${slot.medicine.name} as skipped.`);
              }}
              onSnooze={() => {
                triggerHaptic(40);
                logAdherence({
                  medicineId: slot.medicine.id,
                  medicineName: slot.medicine.name,
                  dosage: slot.medicine.dosage,
                  scheduleTime: slot.scheduleTime,
                  date: new Date().toISOString().split('T')[0],
                  timestamp: Date.now(),
                  status: 'snoozed',
                });
                speak(`Snoozed ${slot.medicine.name} for 10 minutes.`);
              }}
            />
          ))
        )}
      </View>

      {/* Floating Shortcut Quick Actions panel for seniors */}
      <View style={styles.quickActionsContainer}>
        <Text style={[styles.quickActionsTitle, { fontSize: getScaledFontSize(16), color: highContrast ? '#FFFFFF' : '#475569', fontWeight: 'bold' }]}>
          Quick Assistance Shortcuts
        </Text>
        <View style={styles.quickGrid}>
          <TouchableOpacity 
            style={[styles.quickBtn, { backgroundColor: highContrast ? '#000000' : '#FFFFFF', borderColor: nameColor, borderWidth: highContrast ? 2 : 1 }]}
            onPress={() => router.push('/appointments')}
          >
            <Calendar size={24} color={nameColor} />
            <Text style={{ fontSize: getScaledFontSize(14), color: nameColor, fontWeight: 'bold', marginTop: 4 }}>Appointments</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickBtn, { backgroundColor: highContrast ? '#000000' : '#FFFFFF', borderColor: nameColor, borderWidth: highContrast ? 2 : 1 }]}
            onPress={() => router.push('/caregiver')}
          >
            <UserPlus size={24} color={nameColor} />
            <Text style={{ fontSize: getScaledFontSize(14), color: nameColor, fontWeight: 'bold', marginTop: 4 }}>My Caregiver</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickBtn, { backgroundColor: highContrast ? '#000000' : '#FFFFFF', borderColor: nameColor, borderWidth: highContrast ? 2 : 1 }]}
            onPress={() => router.push('/settings')}
          >
            <FileText size={24} color={nameColor} />
            <Text style={{ fontSize: getScaledFontSize(14), color: nameColor, fontWeight: 'bold', marginTop: 4 }}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 64, // Margin for status bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  welcomeCol: {
    flex: 1,
  },
  helloText: {
    fontWeight: '500',
  },
  nameText: {
    marginTop: 2,
  },
  speakHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    elevation: 1,
  },
  mottoCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 1,
  },
  mottoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  mottoText: {
    marginLeft: 10,
    flex: 1,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    borderRadius: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    flexWrap: 'wrap',
    gap: 16,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1.1,
  },
  statsWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statTexts: {
    marginLeft: 12,
  },
  statVal: {
    lineHeight: 22,
  },
  alertsContainer: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  alertCard: {
    borderRadius: 16,
    elevation: 2,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
  },
  alertTexts: {
    marginLeft: 12,
    flex: 1,
  },
  appointmentAlert: {
    backgroundColor: '#F0F9FF',
  },
  stockAlert: {
    backgroundColor: '#FEF2F2',
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  scheduleList: {
    paddingHorizontal: 20,
  },
  emptyCard: {
    borderRadius: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  quickActionsTitle: {
    marginBottom: 12,
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 2,
    minHeight: 80,
  },
});
