import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button, Switch, Card } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppointments } from '../../hooks/useAppointments';
import { useAccessibility } from '../../components/AccessibilityProvider';
import { Appointment } from '../../models/Appointment';
import { ArrowLeft, Check, Calendar, FileImage, Upload } from 'lucide-react-native';

export default function AddEditAppointmentScreen() {
  const params = useLocalSearchParams();
  const appointmentId = params.id as string;

  const { appointments, addAppointment, updateAppointment } = useAppointments();
  const { getScaledFontSize, highContrast, speak, triggerHaptic } = useAccessibility();

  // Form states
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [prescriptionPhoto, setPrescriptionPhoto] = useState<string | null>(null);

  // Load existing details if editing
  useEffect(() => {
    if (appointmentId) {
      const apt = appointments.find(a => a.id === appointmentId);
      if (apt) {
        setDoctorName(apt.doctorName);
        setSpecialty(apt.specialty || '');
        setDate(apt.date);
        setTime(apt.time);
        setLocation(apt.location || '');
        setNotes(apt.notes || '');
        setReminderEnabled(apt.reminderEnabled);
        setPrescriptionPhoto(apt.prescriptionPhoto || null);
      }
    }
  }, [appointmentId, appointments]);

  const handleMockPrescriptionUpload = () => {
    triggerHaptic(50);
    speak("Simulating prescription photo upload from camera roll.");
    Alert.alert(
      "Attach Prescription Document",
      "Would you like to snap a picture of your prescription paper or choose a file from your device photo library?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Snap Photo / Choose File", 
          onPress: () => {
            setPrescriptionPhoto(`prescription_${Date.now()}.png`);
            speak("Prescription document attached successfully.");
          } 
        }
      ]
    );
  };

  const handleSave = async () => {
    triggerHaptic(60);
    if (!doctorName.trim()) {
      const err = "Please enter doctor name.";
      speak(err);
      alert(err);
      return;
    }

    // Time HH:MM validation
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      alert("Please enter time in HH:MM 24-hour format (e.g. 14:30)");
      return;
    }

    const payload = {
      doctorName,
      specialty: specialty.trim() || undefined,
      date,
      time,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      reminderEnabled,
      prescriptionPhoto: prescriptionPhoto || undefined,
    };

    try {
      if (appointmentId) {
        await updateAppointment({ ...payload, id: appointmentId } as Appointment);
        speak(`Appointment with ${doctorName} updated successfully.`);
      } else {
        await addAppointment(payload);
        speak(`Appointment with ${doctorName} scheduled successfully.`);
      }
      router.back();
    } catch (e: any) {
      alert("Failed to save appointment: " + e.message);
    }
  };

  const primaryColor = highContrast ? '#FFFF00' : '#0D5C75';
  const valColor = highContrast ? '#FFFFFF' : '#0F172A';
  const labelColor = highContrast ? '#FFFF00' : '#475569';
  const inputBg = highContrast ? '#000000' : '#FFFFFF';

  return (
    <ScrollView style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#F8FAFC' }]}>
      {/* Header bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnWrapper}>
          <ArrowLeft size={28} color={primaryColor} />
          <Text style={{ fontSize: getScaledFontSize(16), color: primaryColor, marginLeft: 8, fontWeight: 'bold' }}>Back</Text>
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
            {appointmentId ? 'Edit Consult' : 'Schedule Consult'}
          </Text>
          <Text style={{ fontSize: getScaledFontSize(14), color: labelColor, marginTop: 4 }}>
            Set checkup times and sync prescription uploads
          </Text>
        </View>

        {/* Fields */}
        <View style={styles.form}>
          <TextInput
            label="Doctor's Full Name"
            value={doctorName}
            onChangeText={setDoctorName}
            mode="outlined"
            style={[styles.input, { backgroundColor: inputBg }]}
            outlineColor={highContrast ? '#888888' : '#CBD5E1'}
            activeOutlineColor={primaryColor}
            textColor={valColor}
            placeholder="e.g. Dr. Vance"
          />

          <TextInput
            label="Medical Specialty"
            value={specialty}
            onChangeText={setSpecialty}
            mode="outlined"
            style={[styles.input, { backgroundColor: inputBg }]}
            outlineColor={highContrast ? '#888888' : '#CBD5E1'}
            activeOutlineColor={primaryColor}
            textColor={valColor}
            placeholder="e.g. Cardiologist"
          />

          <View style={styles.formRow}>
            <TextInput
              label="Date (YYYY-MM-DD)"
              value={date}
              onChangeText={setDate}
              mode="outlined"
              style={[styles.input, { flex: 1, marginRight: 8, backgroundColor: inputBg }]}
              outlineColor={highContrast ? '#888888' : '#CBD5E1'}
              activeOutlineColor={primaryColor}
              textColor={valColor}
            />
            <TextInput
              label="Time (HH:MM)"
              value={time}
              onChangeText={setTime}
              mode="outlined"
              style={[styles.input, { flex: 1, backgroundColor: inputBg }]}
              outlineColor={highContrast ? '#888888' : '#CBD5E1'}
              activeOutlineColor={primaryColor}
              textColor={valColor}
            />
          </View>

          <TextInput
            label="Location / Office Address"
            value={location}
            onChangeText={setLocation}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={[styles.input, { backgroundColor: inputBg }]}
            outlineColor={highContrast ? '#888888' : '#CBD5E1'}
            activeOutlineColor={primaryColor}
            textColor={valColor}
            placeholder="e.g. St. Jude Clinic, Room 304"
          />

          <TextInput
            label="Special Instructions / Doctor Notes"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={[styles.input, { backgroundColor: inputBg }]}
            outlineColor={highContrast ? '#888888' : '#CBD5E1'}
            activeOutlineColor={primaryColor}
            textColor={valColor}
            placeholder="e.g. Bring current sugar log, do not eat breakfast"
          />

          {/* Upload prescription area */}
          <Text style={[styles.sectionTitle, { fontSize: getScaledFontSize(16), color: labelColor }]}>Upload Doctor Prescriptions</Text>
          
          {prescriptionPhoto ? (
            <Card style={[styles.uploadCard, { borderColor: '#86EFAC', borderWidth: highContrast ? 2 : 1, backgroundColor: highContrast ? '#000000' : '#F0FDF4' }]}>
              <Card.Content style={styles.uploadContent}>
                <FileImage size={32} color="#15803D" />
                <View style={styles.uploadTexts}>
                  <Text style={{ fontSize: getScaledFontSize(15), fontWeight: 'bold', color: highContrast ? '#FFFFFF' : '#166534' }}>
                    Document Attached Successfully
                  </Text>
                  <Text style={{ fontSize: getScaledFontSize(13), color: highContrast ? '#00FF00' : '#16A34A', marginTop: 2 }}>
                    {prescriptionPhoto}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => { triggerHaptic(30); setPrescriptionPhoto(null); }} style={styles.removeAttachedBtn}>
                  <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: getScaledFontSize(14) }}>Remove</Text>
                </TouchableOpacity>
              </Card.Content>
            </Card>
          ) : (
            <TouchableOpacity 
              onPress={handleMockPrescriptionUpload} 
              style={[
                styles.uploadTargetBtn, 
                { 
                  borderColor: primaryColor,
                  borderWidth: highContrast ? 2.5 : 1.5,
                  backgroundColor: highContrast ? '#000000' : '#F8FAFC',
                }
              ]}
            >
              <Upload size={28} color={primaryColor} />
              <Text style={{ fontSize: getScaledFontSize(15), color: primaryColor, fontWeight: 'bold', marginTop: 8 }}>
                Snap / Upload prescription paper image
              </Text>
            </TouchableOpacity>
          )}

          {/* Notification Active Toggle */}
          <View style={styles.toggleRow}>
            <Text style={{ fontSize: getScaledFontSize(16), color: valColor, flex: 1, fontWeight: 'bold' }}>
              Activate Appointment Reminders
            </Text>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              color={primaryColor}
            />
          </View>

          {/* Save Button */}
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveBtn}
            buttonColor={highContrast ? '#00FF00' : '#2E7D32'}
            textColor={highContrast ? '#000000' : '#FFFFFF'}
            contentStyle={{ height: 60 }}
            labelStyle={{ fontSize: getScaledFontSize(18), fontWeight: 'bold' }}
            icon={() => <Check size={24} color={highContrast ? '#000000' : '#FFFFFF'} />}
          >
            Save Appointment
          </Button>

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
  },
  header: {
    marginBottom: 24,
  },
  form: {
    gap: 16,
    paddingBottom: 48,
  },
  input: {
    marginBottom: 0,
  },
  formRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  uploadCard: {
    borderRadius: 16,
  },
  uploadContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  uploadTexts: {
    marginLeft: 12,
    flex: 1,
  },
  removeAttachedBtn: {
    padding: 8,
  },
  uploadTargetBtn: {
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  saveBtn: {
    borderRadius: 16,
    elevation: 3,
    marginTop: 16,
  },
});
