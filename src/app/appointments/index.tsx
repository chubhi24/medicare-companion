import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useAppointments } from '../../hooks/useAppointments';
import { useAccessibility } from '../../components/AccessibilityProvider';
import { router } from 'expo-router';
import { ArrowLeft, Calendar, Clock, MapPin, ClipboardList, Plus, Bell, Volume2, ShieldAlert } from 'lucide-react-native';

export default function AppointmentsScreen() {
  const { upcomingAppointments, appointments, deleteAppointment } = useAppointments();
  const { getScaledFontSize, highContrast, speak, triggerHaptic } = useAccessibility();

  const speakAppointmentsOverview = () => {
    triggerHaptic(40);
    let speech = `Doctor Appointments screen. `;
    if (upcomingAppointments.length > 0) {
      speech += `You have ${upcomingAppointments.length} upcoming appointments. `;
      upcomingAppointments.forEach(apt => {
        speech += `With ${apt.doctorName}, ${apt.specialty || ''}, scheduled for ${apt.date} at ${apt.time}. `;
      });
    } else {
      speech += `You have no upcoming appointments. `;
    }
    speak(speech);
  };

  const handleDelete = (id: string, docName: string) => {
    triggerHaptic(80);
    Alert.alert(
      "Cancel Appointment?",
      `Are you sure you want to remove appointment with ${docName}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive", 
          onPress: async () => {
            await deleteAppointment(id);
            speak(`Removed appointment with ${docName}`);
          } 
        }
      ]
    );
  };

  const primaryColor = highContrast ? '#FFFF00' : '#0D5C75';
  const valColor = highContrast ? '#FFFFFF' : '#0F172A';
  const labelColor = highContrast ? '#FFFF00' : '#475569';

  return (
    <ScrollView style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#F8FAFC' }]}>
      
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnWrapper}>
          <ArrowLeft size={28} color={primaryColor} />
          <Text style={{ fontSize: getScaledFontSize(16), color: primaryColor, marginLeft: 8, fontWeight: 'bold' }}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={speakAppointmentsOverview}
          style={[styles.audioBtn, { borderColor: primaryColor, borderWidth: highContrast ? 2 : 1 }]}
          accessibilityLabel="Read appointments list aloud"
        >
          <Volume2 size={24} color={primaryColor} />
          <Text style={{ fontSize: getScaledFontSize(13), color: primaryColor, fontWeight: 'bold', marginLeft: 4 }}>Read List</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        
        {/* Title & Action */}
        <View style={styles.headerRow}>
          <View>
            <Text
              variant="headlineMedium"
              style={{
                fontSize: getScaledFontSize(26),
                fontWeight: 'bold',
                color: valColor,
              }}
            >
              Doctor Consults
            </Text>
            <Text style={{ fontSize: getScaledFontSize(14), color: labelColor, marginTop: 2 }}>
              Schedule appointments and upload prescriptions
            </Text>
          </View>
        </View>

        {/* Schedule New Button */}
        <Button
          mode="contained"
          onPress={() => {
            triggerHaptic(50);
            speak("Opening schedule appointment form.");
            router.push('/appointments/add-edit');
          }}
          style={[styles.addAptBtn, highContrast && { borderWidth: 2, borderColor: '#00FF00' }]}
          buttonColor={highContrast ? '#FFFF00' : '#0D5C75'}
          textColor={highContrast ? '#000000' : '#FFFFFF'}
          contentStyle={{ height: 58 }}
          labelStyle={{ fontSize: getScaledFontSize(16), fontWeight: 'bold' }}
          icon={() => <Plus size={22} color={highContrast ? '#000000' : '#FFFFFF'} />}
        >
          Schedule Appointment
        </Button>

        {/* Upcoming appointments section */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { fontSize: getScaledFontSize(18), color: valColor, fontWeight: 'bold' }]}>
          Upcoming Consults ({upcomingAppointments.length})
        </Text>

        <View style={styles.aptList}>
          {upcomingAppointments.length === 0 ? (
            <Card style={[styles.emptyCard, { backgroundColor: highContrast ? '#000000' : '#F1F5F9', borderWidth: highContrast ? 2 : 0, borderColor: '#FFFFFF' }]}>
              <Card.Content style={styles.emptyContent}>
                <Calendar size={40} color={labelColor} />
                <Text style={{ fontSize: getScaledFontSize(15), color: labelColor, marginTop: 8, fontWeight: 'bold' }}>
                  No upcoming consults scheduled.
                </Text>
              </Card.Content>
            </Card>
          ) : (
            upcomingAppointments.map((apt) => (
              <Card 
                key={apt.id} 
                style={[
                  styles.aptCard, 
                  { 
                    backgroundColor: highContrast ? '#000000' : '#FFFFFF',
                    borderColor: highContrast ? '#FFFF00' : '#E0F2FE',
                    borderWidth: highContrast ? 2 : 1,
                  }
                ]}
                onPress={() => {
                  triggerHaptic(40);
                  Alert.alert(
                    apt.doctorName,
                    `Notes: ${apt.notes || 'None'}\nLocation: ${apt.location || 'Not specified'}`,
                    [
                      { text: "Close", style: "cancel" },
                      { 
                        text: "Edit Details", 
                        onPress: () => router.push({ pathname: '/appointments/add-edit', params: { id: apt.id } }) 
                      },
                      { 
                        text: "Cancel Appointment", 
                        style: "destructive", 
                        onPress: () => handleDelete(apt.id, apt.doctorName) 
                      }
                    ]
                  );
                }}
              >
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardMainRow}>
                    <View style={[styles.calendarTag, { backgroundColor: highContrast ? '#000000' : '#E0F2FE', borderColor: primaryColor, borderWidth: highContrast ? 2 : 0 }]}>
                      <Calendar size={28} color={primaryColor} />
                    </View>
                    
                    <View style={styles.cardDetails}>
                      <Text style={{ fontSize: getScaledFontSize(18), fontWeight: 'bold', color: valColor }}>
                        {apt.doctorName}
                      </Text>
                      {apt.specialty && (
                        <Text style={{ fontSize: getScaledFontSize(14), color: labelColor, marginTop: 2 }}>
                          {apt.specialty}
                        </Text>
                      )}

                      <View style={styles.metaInfoRow}>
                        <Clock size={16} color={primaryColor} />
                        <Text style={{ fontSize: getScaledFontSize(14), color: valColor, marginLeft: 6, fontWeight: 'bold' }}>
                          {apt.date} • {apt.time}
                        </Text>
                      </View>

                      {apt.location && (
                        <View style={[styles.metaInfoRow, { marginTop: 4 }]}>
                          <MapPin size={16} color={highContrast ? '#FFFF00' : '#64748B'} />
                          <Text style={{ fontSize: getScaledFontSize(14), color: highContrast ? '#FFFFFF' : '#475569', marginLeft: 6, flex: 1, flexWrap: 'wrap' }}>
                            {apt.location}
                          </Text>
                        </View>
                      )}

                      {apt.notes && (
                        <View style={[styles.metaInfoRow, { marginTop: 6, alignItems: 'flex-start' }]}>
                          <ClipboardList size={16} color={highContrast ? '#FFFF00' : '#64748B'} style={{ marginTop: 2 }} />
                          <Text style={{ fontSize: getScaledFontSize(13), color: highContrast ? '#FFFFFF' : '#64748B', marginLeft: 6, fontStyle: 'italic', flex: 1 }}>
                            Notes: {apt.notes}
                          </Text>
                        </View>
                      )}

                      {apt.reminderEnabled && (
                        <View style={[styles.badge, highContrast && styles.hcBadge]}>
                          <Bell size={12} color="#0D5C75" />
                          <Text style={{ fontSize: getScaledFontSize(12), color: '#0D5C75', fontWeight: 'bold', marginLeft: 4 }}>
                            Reminder Active
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </View>

        {/* All appointments including history */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { fontSize: getScaledFontSize(18), color: valColor, fontWeight: 'bold', marginTop: 32 }]}>
          Past Consults History
        </Text>

        <View style={styles.aptList}>
          {appointments.length === 0 ? (
            <Card style={{ borderRadius: 16, padding: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: getScaledFontSize(14), color: '#64748B' }}>No past consultations recorded.</Text>
            </Card>
          ) : (
            appointments
              .filter(a => new Date(`${a.date}T${a.time}`).getTime() <= Date.now())
              .map((apt) => (
                <View key={apt.id} style={[styles.pastAptCard, { backgroundColor: highContrast ? '#000000' : '#F1F5F9', borderColor: highContrast ? '#888888' : '#E2E8F0' }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: getScaledFontSize(16), fontWeight: 'bold', color: valColor }}>
                      {apt.doctorName}
                    </Text>
                    <Text style={{ fontSize: getScaledFontSize(13), color: labelColor, marginTop: 2 }}>
                      {apt.specialty} • Completed on {apt.date}
                    </Text>
                  </View>
                  <Button 
                    mode="text" 
                    textColor={primaryColor}
                    onPress={() => router.push({ pathname: '/appointments/add-edit', params: { id: apt.id } })}
                  >
                    View
                  </Button>
                </View>
              ))
          )}
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
  headerRow: {
    marginBottom: 20,
  },
  addAptBtn: {
    borderRadius: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  aptList: {
    gap: 12,
  },
  aptCard: {
    borderRadius: 20,
    elevation: 2,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 14,
  },
  cardMainRow: {
    flexDirection: 'row',
  },
  calendarTag: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardDetails: {
    flex: 1,
  },
  metaInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 10,
  },
  hcBadge: {
    backgroundColor: '#000000',
    borderColor: '#FFFF00',
    borderWidth: 1,
  },
  emptyCard: {
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
  },
  pastAptCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
});
