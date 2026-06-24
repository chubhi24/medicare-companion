import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button, Card, SegmentedButtons } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useMedicines } from '../../hooks/useMedicines';
import { useAccessibility } from '../../components/AccessibilityProvider';
import { OCRService, MOCK_PRESCRIPTIONS } from '../../services/ocr';
import { Medicine, MedicineType, MedicineFrequency } from '../../models/Medicine';
import { ArrowLeft, Camera, Sparkles, Check, Trash2, Clock, Plus } from 'lucide-react-native';

export default function AddEditMedicineScreen() {
  const params = useLocalSearchParams();
  const medicineId = params.id as string;
  const initialMode = params.mode as string; // 'add' | 'scan'

  const { medicines, addMedicine, updateMedicine } = useMedicines();
  const { getScaledFontSize, highContrast, speak, triggerHaptic } = useAccessibility();

  // Screen View state: 'form' | 'scan'
  const [screenView, setScreenView] = useState<'form' | 'scan'>(initialMode === 'scan' ? 'scan' : 'form');
  const [selectedScanSample, setSelectedScanSample] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [quantity, setQuantity] = useState('30');
  const [refillThreshold, setRefillThreshold] = useState('5');
  const [type, setType] = useState<MedicineType>('Tablet');
  const [frequency, setFrequency] = useState<MedicineFrequency>('Once daily');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000 * 90).toISOString().split('T')[0]); // 90 days out
  const [reminderTimes, setReminderTimes] = useState<string[]>(['08:00']);
  const [notes, setNotes] = useState('');
  const [newTimeInput, setNewTimeInput] = useState('');

  // Load existing medicine details if editing
  useEffect(() => {
    if (medicineId) {
      const med = medicines.find(m => m.id === medicineId);
      if (med) {
        setName(med.name);
        setDosage(med.dosage);
        setQuantity(med.quantity.toString());
        setRefillThreshold(med.refillThreshold.toString());
        setType(med.type);
        setFrequency(med.frequency);
        setStartDate(med.startDate);
        setEndDate(med.endDate);
        setReminderTimes(med.reminderTimes);
        setNotes(med.notes || '');
      }
    }
  }, [medicineId, medicines]);

  // Handle OCR Scan
  const handlePerformScan = async () => {
    triggerHaptic(60);
    setIsScanning(true);
    speak("Scanning prescription text, please hold still...");

    try {
      const data = await OCRService.scanPrescriptionImage(selectedScanSample);
      setName(data.name);
      setDosage(data.dosage);
      setType(data.type);
      setFrequency(data.frequency);
      setReminderTimes(data.reminderTimes);
      setQuantity(data.quantity.toString());
      setNotes(data.notes);
      
      setScreenView('form');
      speak(`Scan complete! Found ${data.name}. Details have been pre-filled for your review.`);
    } catch (e) {
      alert("Failed to scan prescription.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = async () => {
    triggerHaptic(60);
    if (!name.trim() || !dosage.trim()) {
      const err = "Please enter medication name and dosage.";
      speak(err);
      alert(err);
      return;
    }

    const payload = {
      name,
      dosage,
      quantity: parseInt(quantity) || 30,
      refillThreshold: parseInt(refillThreshold) || 5,
      type,
      frequency,
      startDate,
      endDate,
      reminderTimes,
      notes: notes.trim() || undefined,
    };

    try {
      if (medicineId) {
        await updateMedicine({ ...payload, id: medicineId } as Medicine);
        speak(`Medication ${name} updated successfully.`);
      } else {
        await addMedicine(payload);
        speak(`Medication ${name} added successfully.`);
      }
      router.back();
    } catch (e: any) {
      alert("Failed to save medication: " + e.message);
    }
  };

  const addReminderTime = () => {
    triggerHaptic(30);
    // Simple HH:MM validation
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regex.test(newTimeInput)) {
      alert("Please enter time in 24-hour HH:MM format (e.g. 14:30)");
      return;
    }
    if (reminderTimes.includes(newTimeInput)) {
      alert("This reminder time is already added.");
      return;
    }
    setReminderTimes(prev => [...prev, newTimeInput].sort());
    speak(`Added reminder for ${newTimeInput}`);
    setNewTimeInput('');
  };

  const removeReminderTime = (timeToRemove: string) => {
    triggerHaptic(40);
    if (reminderTimes.length === 1) {
      alert("At least one reminder time is required.");
      return;
    }
    setReminderTimes(prev => prev.filter(t => t !== timeToRemove));
    speak(`Removed reminder for ${timeToRemove}`);
  };

  const primaryColor = highContrast ? '#FFFF00' : '#0D5C75';
  const valColor = highContrast ? '#FFFFFF' : '#0F172A';
  const inputBg = highContrast ? '#000000' : '#FFFFFF';
  const labelColor = highContrast ? '#FFFF00' : '#64748B';

  if (screenView === 'scan') {
    return (
      <View style={[styles.container, { backgroundColor: '#000000' }]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => setScreenView('form')} style={styles.backBtnWrapper}>
            <ArrowLeft size={28} color="#FFFFFF" />
            <Text style={{ fontSize: getScaledFontSize(16), color: '#FFFFFF', marginLeft: 8, fontWeight: 'bold' }}>Cancel Scan</Text>
          </TouchableOpacity>
        </View>

        {/* Viewfinder Mock */}
        <View style={styles.cameraViewport}>
          <View style={[styles.scannerTarget, { borderColor: isScanning ? '#00FF00' : '#FFFF00' }]}>
            {isScanning ? (
              <View style={styles.scanningOverlay}>
                <ActivityIndicator size="large" color="#00FF00" />
                <Text style={{ color: '#00FF00', fontSize: getScaledFontSize(18), fontWeight: 'bold', marginTop: 12, textAlign: 'center' }}>
                  Extracting Text using OCR...
                </Text>
              </View>
            ) : (
              <Text style={{ color: '#FFFF00', fontSize: getScaledFontSize(16), fontWeight: 'bold', textAlign: 'center', padding: 16 }}>
                Align Medication label / prescription within this box.
              </Text>
            )}
          </View>
        </View>

        {/* OCR Sample Selection for Sandbox testing */}
        <View style={styles.sampleScanSelectorContainer}>
          <Text style={{ color: '#FFFFFF', fontSize: getScaledFontSize(14), fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
            Sandbox Tester: Select Prescription Template to Mock Scan
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sampleScroll}>
            {MOCK_PRESCRIPTIONS.map((pres, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => { triggerHaptic(30); setSelectedScanSample(idx); }}
                style={[
                  styles.sampleScanBtn,
                  {
                    backgroundColor: selectedScanSample === idx ? '#3b82f6' : '#1e293b',
                    borderColor: selectedScanSample === idx ? '#FFFF00' : 'transparent',
                    borderWidth: selectedScanSample === idx ? 2 : 0,
                  }
                ]}
              >
                <Text style={{ color: '#FFFFFF', fontSize: getScaledFontSize(13), fontWeight: 'bold' }}>
                  {pres.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Action Button */}
        <View style={styles.scanActionRow}>
          <Button
            mode="contained"
            onPress={handlePerformScan}
            disabled={isScanning}
            style={[styles.captureBtn, { backgroundColor: primaryColor }]}
            contentStyle={{ height: 64 }}
            labelStyle={{ fontSize: getScaledFontSize(18), fontWeight: 'bold' }}
            icon={() => <Camera size={24} color="#000000" />}
          >
            Capture & Extract Text
          </Button>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#F8FAFC' }]}>
      
      {/* Top Bar */}
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
            {medicineId ? 'Edit Medication' : 'Add Medication'}
          </Text>
          <Text style={{ fontSize: getScaledFontSize(14), color: labelColor, marginTop: 4 }}>
            Input details below or click the prescription scanner
          </Text>
        </View>

        {/* Quick scan trigger */}
        {!medicineId && (
          <Card style={[styles.quickScanCard, { backgroundColor: highContrast ? '#000000' : '#EFF6FF', borderColor: primaryColor, borderWidth: highContrast ? 2 : 0 }]}>
            <Card.Content style={styles.quickScanContent}>
              <View style={styles.quickScanTexts}>
                <Text style={{ fontSize: getScaledFontSize(16), fontWeight: 'bold', color: highContrast ? '#FFFFFF' : '#1E40AF' }}>
                  Have a prescription paper?
                </Text>
                <Text style={{ fontSize: getScaledFontSize(14), color: highContrast ? '#FFFF00' : '#2563EB', marginTop: 2 }}>
                  Use OCR scanning to fill out this form automatically!
                </Text>
              </View>
              <Button
                mode="contained"
                onPress={() => { triggerHaptic(50); setScreenView('scan'); }}
                buttonColor={primaryColor}
                textColor={highContrast ? '#000000' : '#FFFFFF'}
                contentStyle={{ height: 50 }}
                labelStyle={{ fontSize: getScaledFontSize(14), fontWeight: 'bold' }}
              >
                Scan Now
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Fields Form */}
        <View style={styles.form}>
          <TextInput
            label="Medicine Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={[styles.input, { backgroundColor: inputBg }]}
            outlineColor={highContrast ? '#888888' : '#CBD5E1'}
            activeOutlineColor={primaryColor}
            textColor={valColor}
            placeholder="e.g. Lisinopril"
          />

          <TextInput
            label="Dosage"
            value={dosage}
            onChangeText={setDosage}
            mode="outlined"
            style={[styles.input, { backgroundColor: inputBg }]}
            outlineColor={highContrast ? '#888888' : '#CBD5E1'}
            activeOutlineColor={primaryColor}
            textColor={valColor}
            placeholder="e.g. 10 mg (1 tablet)"
          />

          <View style={styles.formRow}>
            <TextInput
              label="Remaining Stock Count"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              mode="outlined"
              style={[styles.input, { flex: 1, marginRight: 8, backgroundColor: inputBg }]}
              outlineColor={highContrast ? '#888888' : '#CBD5E1'}
              activeOutlineColor={primaryColor}
              textColor={valColor}
            />

            <TextInput
              label="Low Refill Threshold"
              value={refillThreshold}
              onChangeText={setRefillThreshold}
              keyboardType="numeric"
              mode="outlined"
              style={[styles.input, { flex: 1, backgroundColor: inputBg }]}
              outlineColor={highContrast ? '#888888' : '#CBD5E1'}
              activeOutlineColor={primaryColor}
              textColor={valColor}
            />
          </View>

          {/* Sizing types Selector */}
          <Text style={[styles.sectionTitle, { fontSize: getScaledFontSize(16), color: labelColor }]}>Formulation Type</Text>
          <SegmentedButtons
            value={type}
            onValueChange={v => setType(v as MedicineType)}
            buttons={[
              { value: 'Tablet', label: 'Tablet' },
              { value: 'Capsule', label: 'Capsule' },
              { value: 'Syrup', label: 'Syrup' },
              { value: 'Injection', label: 'Injection' },
            ]}
            style={styles.segmented}
            theme={{ colors: { primary: primaryColor } }}
          />

          {/* Frequencies */}
          <Text style={[styles.sectionTitle, { fontSize: getScaledFontSize(16), color: labelColor }]}>Medication Frequency</Text>
          <SegmentedButtons
            value={frequency}
            onValueChange={v => setFrequency(v as MedicineFrequency)}
            buttons={[
              { value: 'Once daily', label: 'Once' },
              { value: 'Twice daily', label: 'Twice' },
              { value: 'Thrice daily', label: 'Thrice' },
              { value: 'Weekly', label: 'Weekly' },
            ]}
            style={styles.segmented}
            theme={{ colors: { primary: primaryColor } }}
          />

          {/* Start and end dates */}
          <View style={styles.formRow}>
            <TextInput
              label="Start Date (YYYY-MM-DD)"
              value={startDate}
              onChangeText={setStartDate}
              mode="outlined"
              style={[styles.input, { flex: 1, marginRight: 8, backgroundColor: inputBg }]}
              outlineColor={highContrast ? '#888888' : '#CBD5E1'}
              activeOutlineColor={primaryColor}
              textColor={valColor}
            />
            <TextInput
              label="End Date (YYYY-MM-DD)"
              value={endDate}
              onChangeText={setEndDate}
              mode="outlined"
              style={[styles.input, { flex: 1, backgroundColor: inputBg }]}
              outlineColor={highContrast ? '#888888' : '#CBD5E1'}
              activeOutlineColor={primaryColor}
              textColor={valColor}
            />
          </View>

          {/* Reminder Times Matrix */}
          <Text style={[styles.sectionTitle, { fontSize: getScaledFontSize(16), color: labelColor }]}>Reminder Alarms</Text>
          <View style={styles.timesContainer}>
            {reminderTimes.map((time, idx) => (
              <View key={idx} style={[styles.timeRow, { borderColor: highContrast ? '#888888' : '#E2E8F0' }]}>
                <View style={styles.timeLabel}>
                  <Clock size={20} color={primaryColor} />
                  <Text style={{ fontSize: getScaledFontSize(16), color: valColor, fontWeight: 'bold', marginLeft: 8 }}>
                    {time}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeReminderTime(time)} style={styles.removeTimeBtn}>
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Time addition input */}
            <View style={styles.timeInputRow}>
              <TextInput
                placeholder="e.g. 14:30"
                value={newTimeInput}
                onChangeText={setNewTimeInput}
                mode="outlined"
                style={[styles.timeFieldInput, { backgroundColor: inputBg }]}
                outlineColor={highContrast ? '#888888' : '#CBD5E1'}
                activeOutlineColor={primaryColor}
                textColor={valColor}
              />
              <Button
                mode="contained"
                onPress={addReminderTime}
                buttonColor={primaryColor}
                textColor={highContrast ? '#000000' : '#FFFFFF'}
                style={styles.timeAddBtn}
                contentStyle={{ height: 50 }}
              >
                Add Time
              </Button>
            </View>
          </View>

          <TextInput
            label="Special Instructions / Notes"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={[styles.input, { backgroundColor: inputBg }]}
            outlineColor={highContrast ? '#888888' : '#CBD5E1'}
            activeOutlineColor={primaryColor}
            textColor={valColor}
            placeholder="e.g. Take immediately after meals."
          />

          {/* Save Button */}
          <Button
            mode="contained"
            onPress={handleSave}
            style={[styles.saveBtn, { marginTop: 16 }]}
            buttonColor={highContrast ? '#00FF00' : '#2E7D32'}
            textColor={highContrast ? '#000000' : '#FFFFFF'}
            contentStyle={{ height: 60 }}
            labelStyle={{ fontSize: getScaledFontSize(18), fontWeight: 'bold' }}
            icon={() => <Check size={24} color={highContrast ? '#000000' : '#FFFFFF'} />}
          >
            Save Medication
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
    marginBottom: 20,
  },
  quickScanCard: {
    borderRadius: 16,
    marginBottom: 24,
  },
  quickScanContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  quickScanTexts: {
    flex: 1,
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
  segmented: {
    marginBottom: 8,
  },
  timesContainer: {
    gap: 8,
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  timeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeTimeBtn: {
    padding: 8,
  },
  timeInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  timeFieldInput: {
    flex: 1,
    height: 50,
  },
  timeAddBtn: {
    borderRadius: 12,
  },
  saveBtn: {
    borderRadius: 16,
    elevation: 3,
  },
  cameraViewport: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 40,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 280,
  },
  scannerTarget: {
    borderWidth: 3.5,
    borderStyle: 'dashed',
    borderRadius: 20,
    width: '80%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningOverlay: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sampleScanSelectorContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sampleScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  sampleScanBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
  },
  scanActionRow: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  captureBtn: {
    borderRadius: 20,
  },
  hcBorder: {
    borderColor: '#FFFF00',
    borderWidth: 2,
    backgroundColor: '#000000',
  },
});
