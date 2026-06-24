import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Searchbar, Button, FAB, Card } from 'react-native-paper';
import { useMedicines } from '../../hooks/useMedicines';
import { useAccessibility } from '../../components/AccessibilityProvider';
import MedicineCard from '../../components/MedicineCard';
import { Plus, Camera, Search, Trash2, Edit } from 'lucide-react-native';
import { router } from 'expo-router';

export default function MedicinesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { searchMedicines, deleteMedicine } = useMedicines();
  const { getScaledFontSize, highContrast, speak, triggerHaptic } = useAccessibility();

  const filteredMedicines = searchMedicines(searchQuery);

  const handleDelete = (id: string, name: string) => {
    triggerHaptic(80);
    Alert.alert(
      "Delete Medication?",
      `Are you sure you want to stop tracking and delete ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            await deleteMedicine(id);
            speak(`Deleted ${name} from your list.`);
          } 
        }
      ]
    );
  };

  const speakInventoryOverview = () => {
    triggerHaptic(40);
    let speech = `Medicines inventory screen. You have ${filteredMedicines.length} medicines listed. `;
    if (searchQuery) {
      speech += `Filtered list for search query ${searchQuery}. `;
    }
    filteredMedicines.forEach(m => {
      speech += `${m.name}, ${m.dosage}. Stock is ${m.quantity} pills. `;
    });
    speak(speech);
  };

  const primaryColor = highContrast ? '#FFFF00' : '#0D5C75';

  return (
    <View style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#F8FAFC' }]}>
      
      {/* Header bar */}
      <View style={styles.header}>
        <View>
          <Text
            variant="headlineMedium"
            style={{
              fontSize: getScaledFontSize(26),
              fontWeight: 'bold',
              color: highContrast ? '#FFFFFF' : '#0F172A',
            }}
          >
            My Medications
          </Text>
          <Text style={{ fontSize: getScaledFontSize(14), color: highContrast ? '#FFFF00' : '#64748B', marginTop: 2 }}>
            Manage prescriptions and refill stock
          </Text>
        </View>
        
        <TouchableOpacity 
          onPress={speakInventoryOverview}
          style={[styles.audioBtn, { borderColor: primaryColor, borderWidth: highContrast ? 2 : 1 }]}
          accessibilityLabel="Read medication inventory details aloud"
        >
          <Camera size={20} color={primaryColor} style={{ display: 'none' }} />
          <Text style={{ fontSize: getScaledFontSize(14), color: primaryColor, fontWeight: 'bold' }}>Read List</Text>
        </TouchableOpacity>
      </View>

      {/* Senior-friendly Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search medicines..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[
            styles.searchBar,
            {
              backgroundColor: highContrast ? '#000000' : '#FFFFFF',
              borderColor: highContrast ? '#FFFF00' : '#E2E8F0',
              borderWidth: highContrast ? 2.5 : 1,
            },
          ]}
          inputStyle={{ fontSize: getScaledFontSize(16), height: 56, color: highContrast ? '#FFFFFF' : '#0F172A' }}
          iconColor={primaryColor}
          placeholderTextColor={highContrast ? '#FFFFFF' : '#64748B'}
          accessibilityLabel="Search your medications"
        />
      </View>

      {/* Refill & Manual Add Buttons */}
      <View style={styles.actionRow}>
        {/* Prescription Scanner trigger */}
        <Button
          mode="outlined"
          onPress={() => {
            triggerHaptic(50);
            speak("Opening prescription camera scanner.");
            router.push({ pathname: '/medicine/add-edit', params: { mode: 'scan' } });
          }}
          style={[styles.actionBtn, styles.scanBtn, highContrast && styles.hcBorder]}
          contentStyle={styles.btnContent}
          textColor={highContrast ? '#FFFF00' : '#0D5C75'}
          labelStyle={{ fontSize: getScaledFontSize(15), fontWeight: 'bold' }}
          icon={() => <Camera size={22} color={primaryColor} />}
        >
          Scan Prescription
        </Button>

        {/* Manual Add */}
        <Button
          mode="contained"
          onPress={() => {
            triggerHaptic(50);
            speak("Opening add medication form.");
            router.push({ pathname: '/medicine/add-edit', params: { mode: 'add' } });
          }}
          style={[styles.actionBtn, styles.addBtn]}
          buttonColor={highContrast ? '#FFFF00' : '#0D5C75'}
          textColor={highContrast ? '#000000' : '#FFFFFF'}
          contentStyle={styles.btnContent}
          labelStyle={{ fontSize: getScaledFontSize(15), fontWeight: 'bold' }}
          icon={() => <Plus size={22} color={highContrast ? '#000000' : '#FFFFFF'} />}
        >
          Add Medicine
        </Button>
      </View>

      {/* Main List */}
      <ScrollView 
        style={styles.scrollList}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {filteredMedicines.length === 0 ? (
          <Card style={[styles.emptyCard, { backgroundColor: highContrast ? '#000000' : '#F1F5F9', borderWidth: highContrast ? 2 : 0, borderColor: '#FFFFFF' }]}>
            <Card.Content style={styles.emptyContent}>
              <Search size={48} color={highContrast ? '#FFFF00' : '#64748B'} />
              <Text style={[styles.emptyTitle, { fontSize: getScaledFontSize(18), color: highContrast ? '#FFFFFF' : '#0F172A', fontWeight: 'bold' }]}>
                No Medicines Found
              </Text>
              <Text style={[styles.emptyText, { fontSize: getScaledFontSize(15), color: highContrast ? '#FFFF00' : '#475569' }]}>
                {searchQuery ? "Try searching for a different keyword." : "Tap Add Medicine above to register your first prescription schedule."}
              </Text>
            </Card.Content>
          </Card>
        ) : (
          filteredMedicines.map((med) => (
            <MedicineCard
              key={med.id}
              medicine={med}
              onPressCard={() => {
                triggerHaptic(40);
                Alert.alert(
                  med.name,
                  `Select an action for this medication.`,
                  [
                    { text: "Cancel", style: "cancel" },
                    { 
                      text: "Edit Details", 
                      onPress: () => router.push({ pathname: '/medicine/add-edit', params: { id: med.id } }) 
                    },
                    { 
                      text: "Delete Medication", 
                      style: "destructive", 
                      onPress: () => handleDelete(med.id, med.name) 
                    }
                  ]
                );
              }}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 64,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  audioBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    elevation: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    borderRadius: 16,
    elevation: 0,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
  },
  btnContent: {
    height: 56, // senior compliance target size
  },
  scanBtn: {
    borderColor: '#0D5C75',
    borderWidth: 1.5,
  },
  addBtn: {
    elevation: 2,
  },
  scrollList: {
    paddingHorizontal: 20,
  },
  emptyCard: {
    borderRadius: 20,
    paddingVertical: 32,
    alignItems: 'center',
    marginTop: 20,
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
  hcBorder: {
    borderColor: '#FFFF00',
    borderWidth: 2,
    backgroundColor: '#000000',
  },
});
