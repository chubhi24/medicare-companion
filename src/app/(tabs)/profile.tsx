import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Text, Card, TextInput, Button, Switch } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { useAccessibility } from '../../components/AccessibilityProvider';
import { User, ShieldAlert, Heart, LogOut, Edit3, Save, X, PhoneCall, Volume2 } from 'lucide-react-native';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { profile, logout, updateProfile } = useAuth();
  const { getScaledFontSize, highContrast, speak, triggerHaptic } = useAccessibility();

  const [isEditing, setIsEditing] = useState(false);

  // Edit form states
  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [gender, setGender] = useState(profile?.gender || '');
  const [bloodGroup, setBloodGroup] = useState(profile?.bloodGroup || '');
  const [conditions, setConditions] = useState(profile?.medicalConditions || '');
  const [allergies, setAllergies] = useState(profile?.allergies || '');

  // Emergency contact states
  const [contactName, setContactName] = useState(profile?.emergencyContact?.name || '');
  const [contactRelation, setContactRelation] = useState(profile?.emergencyContact?.relationship || '');
  const [contactPhone, setContactPhone] = useState(profile?.emergencyContact?.phone || '');

  // Caregiver states
  const [caregiverName, setCaregiverName] = useState(profile?.caregiver?.name || '');
  const [caregiverEmail, setCaregiverEmail] = useState(profile?.caregiver?.email || '');
  const [caregiverPhone, setCaregiverPhone] = useState(profile?.caregiver?.phone || '');
  const [receiveMissedAlerts, setReceiveMissedAlerts] = useState(profile?.caregiver?.receiveMissedAlerts || false);

  const speakProfileDetails = () => {
    triggerHaptic(40);
    let speech = `User Profile Screen. `;
    speech += `Name is ${profile?.name || 'Arthur Pendelton'}. Age is ${profile?.age || 78}. `;
    if (profile?.medicalConditions) {
      speech += `Medical conditions listed: ${profile.medicalConditions}. `;
    }
    if (profile?.allergies) {
      speech += `Allergies listed: ${profile.allergies}. `;
    }
    if (profile?.emergencyContact?.name) {
      speech += `Emergency contact is ${profile.emergencyContact.name}, relationship ${profile.emergencyContact.relationship}, phone ${profile.emergencyContact.phone}. `;
    }
    if (profile?.caregiver?.name) {
      speech += `Caregiver is ${profile.caregiver.name}, phone ${profile.caregiver.phone}. `;
    }
    speak(speech);
  };

  const handleSave = async () => {
    triggerHaptic(60);
    if (!name.trim()) {
      alert("Name cannot be empty.");
      return;
    }

    try {
      const updatedProfile = {
        ...profile,
        name,
        age: parseInt(age) || 0,
        gender,
        bloodGroup,
        medicalConditions: conditions,
        allergies,
        emergencyContact: {
          name: contactName,
          relationship: contactRelation,
          phone: contactPhone,
        },
        caregiver: {
          name: caregiverName,
          email: caregiverEmail,
          phone: caregiverPhone,
          receiveMissedAlerts,
        },
      } as any;

      await updateProfile(updatedProfile);
      setIsEditing(false);
      speak("Profile updated successfully.");
    } catch (e: any) {
      alert("Failed to update profile: " + e.message);
    }
  };

  const handleLogout = () => {
    triggerHaptic(80);

    const performLogout = async () => {
      await logout();
      speak("You have been signed out.");
      router.replace('/(auth)/login');
    };

    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm("Are you sure you want to log out of MediCare Companion?");
      if (confirmLogout) {
        performLogout();
      }
    } else {
      Alert.alert(
        "Sign Out?",
        "Are you sure you want to log out of MediCare Companion?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Sign Out", 
            style: "destructive", 
            onPress: performLogout
          }
        ]
      );
    }
  };

  const primaryColor = highContrast ? '#FFFF00' : '#0D5C75';
  const labelColor = highContrast ? '#FFFF00' : '#475569';
  const valColor = highContrast ? '#FFFFFF' : '#0F172A';
  const inputBg = highContrast ? '#000000' : '#FFFFFF';

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#F8FAFC' }]}
      contentContainerStyle={{ paddingBottom: 140 }}
    >
      {/* Header */}
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
            My Profile
          </Text>
          <Text style={{ fontSize: getScaledFontSize(14), color: highContrast ? '#FFFF00' : '#64748B', marginTop: 2 }}>
            Manage health records and contacts
          </Text>
        </View>

        <TouchableOpacity 
          onPress={speakProfileDetails}
          style={[styles.audioBtn, { borderColor: primaryColor, borderWidth: highContrast ? 2 : 1 }]}
          accessibilityLabel="Read profile details aloud"
        >
          <Volume2 size={24} color={primaryColor} />
          <Text style={{ fontSize: getScaledFontSize(13), color: primaryColor, fontWeight: 'bold', marginLeft: 4 }}>Read Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Main Profile View Cards */}
      <View style={styles.profileContent}>
        
        {/* Core details card */}
        <Card style={[styles.profileCard, { backgroundColor: highContrast ? '#000000' : '#FFFFFF', borderColor: highContrast ? '#FFFF00' : '#E2E8F0', borderWidth: highContrast ? 2 : 0 }]}>
          <Card.Content style={styles.cardContent}>
            
            {/* Header: Photo and Toggle edit */}
            <View style={styles.cardHeader}>
              <View style={[styles.avatarCircle, { backgroundColor: highContrast ? '#000000' : '#E0F2FE', borderColor: primaryColor, borderWidth: 2 }]}>
                <User size={48} color={primaryColor} />
              </View>
              <View style={styles.avatarDetails}>
                <Text style={{ fontSize: getScaledFontSize(20), fontWeight: 'bold', color: valColor }}>
                  {profile?.name || 'Arthur Pendelton'}
                </Text>
                <Text style={{ fontSize: getScaledFontSize(15), color: labelColor, marginTop: 4 }}>
                  Age: {profile?.age || 78} • Gender: {profile?.gender || 'Male'}
                </Text>
              </View>
            </View>

            {/* Editing / Viewing Split */}
            {!isEditing ? (
              <View style={styles.detailsList}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { fontSize: getScaledFontSize(14), color: labelColor }]}>Blood Group</Text>
                  <Text style={[styles.detailValue, { fontSize: getScaledFontSize(16), color: valColor, fontWeight: 'bold' }]}>
                    {profile?.bloodGroup || 'O Positive'}
                  </Text>
                </View>

                <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                  <Text style={[styles.detailLabel, { fontSize: getScaledFontSize(14), color: labelColor }]}>Medical Conditions</Text>
                  <Text style={[styles.detailValue, { fontSize: getScaledFontSize(16), color: valColor }]}>
                    {profile?.medicalConditions || 'Hypertension, Osteoarthritis, Mild Diabetes'}
                  </Text>
                </View>

                <View style={[styles.detailRow, { borderBottomWidth: 0, paddingTop: 4 }]}>
                  <Text style={[styles.detailLabel, { fontSize: getScaledFontSize(14), color: labelColor }]}>Allergies</Text>
                  <Text style={[styles.detailValue, { fontSize: getScaledFontSize(16), color: '#C62828', fontWeight: 'bold' }]}>
                    {profile?.allergies || 'Penicillin, Sulfa Drugs'}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.formContainer}>
                <TextInput
                  label="Name"
                  value={name}
                  onChangeText={setName}
                  mode="outlined"
                  style={[styles.input, { backgroundColor: inputBg }]}
                  outlineColor={highContrast ? '#888888' : '#CBD5E1'}
                  activeOutlineColor={primaryColor}
                  textColor={valColor}
                />

                <View style={styles.inlineInputs}>
                  <TextInput
                    label="Age"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                    mode="outlined"
                    style={[styles.input, { flex: 1, marginRight: 8, backgroundColor: inputBg }]}
                    outlineColor={highContrast ? '#888888' : '#CBD5E1'}
                    activeOutlineColor={primaryColor}
                    textColor={valColor}
                  />
                  <TextInput
                    label="Gender"
                    value={gender}
                    onChangeText={setGender}
                    mode="outlined"
                    style={[styles.input, { flex: 1, backgroundColor: inputBg }]}
                    outlineColor={highContrast ? '#888888' : '#CBD5E1'}
                    activeOutlineColor={primaryColor}
                    textColor={valColor}
                  />
                </View>

                <TextInput
                  label="Blood Group"
                  value={bloodGroup}
                  onChangeText={setBloodGroup}
                  mode="outlined"
                  style={[styles.input, { backgroundColor: inputBg }]}
                  outlineColor={highContrast ? '#888888' : '#CBD5E1'}
                  activeOutlineColor={primaryColor}
                  textColor={valColor}
                />

                <TextInput
                  label="Medical Conditions"
                  value={conditions}
                  onChangeText={setConditions}
                  mode="outlined"
                  multiline
                  numberOfLines={2}
                  style={[styles.input, { backgroundColor: inputBg }]}
                  outlineColor={highContrast ? '#888888' : '#CBD5E1'}
                  activeOutlineColor={primaryColor}
                  textColor={valColor}
                />

                <TextInput
                  label="Allergies"
                  value={allergies}
                  onChangeText={setAllergies}
                  mode="outlined"
                  multiline
                  style={[styles.input, { backgroundColor: inputBg }]}
                  outlineColor={highContrast ? '#888888' : '#CBD5E1'}
                  activeOutlineColor={primaryColor}
                  textColor={valColor}
                />
              </View>
            )}

            {/* Save/Edit Actions */}
            <View style={styles.editActionsRow}>
              {!isEditing ? (
                <Button
                  mode="outlined"
                  onPress={() => { triggerHaptic(30); setIsEditing(true); speak("Editing profile fields"); }}
                  style={[styles.cardActionBtn, highContrast && styles.hcBorder]}
                  textColor={highContrast ? '#FFFF00' : '#0D5C75'}
                  contentStyle={{ height: 56 }}
                  labelStyle={{ fontSize: getScaledFontSize(15), fontWeight: 'bold' }}
                  icon={() => <Edit3 size={20} color={primaryColor} />}
                >
                  Edit Profile
                </Button>
              ) : (
                <View style={{ flex: 1, flexDirection: 'row', gap: 12 }}>
                  <Button
                    mode="outlined"
                    onPress={() => { triggerHaptic(30); setIsEditing(false); }}
                    style={[styles.cardActionBtn, { flex: 1 }, highContrast && styles.hcBorder]}
                    textColor={highContrast ? '#FFFFFF' : '#64748B'}
                    contentStyle={{ height: 56 }}
                    labelStyle={{ fontSize: getScaledFontSize(15), fontWeight: 'bold' }}
                    icon={() => <X size={20} color={highContrast ? '#FFFFFF' : '#64748B'} />}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleSave}
                    style={[styles.cardActionBtn, { flex: 1 }]}
                    buttonColor={highContrast ? '#00FF00' : '#2E7D32'}
                    textColor={highContrast ? '#000000' : '#FFFFFF'}
                    contentStyle={{ height: 56 }}
                    labelStyle={{ fontSize: getScaledFontSize(15), fontWeight: 'bold' }}
                    icon={() => <Save size={20} color={highContrast ? '#000000' : '#FFFFFF'} />}
                  >
                    Save
                  </Button>
                </View>
              )}
            </View>

          </Card.Content>
        </Card>

        {/* Emergency Contacts card */}
        <Card style={[styles.profileCard, { backgroundColor: highContrast ? '#000000' : '#FFFFFF', borderColor: highContrast ? '#FFFF00' : '#E2E8F0', borderWidth: highContrast ? 2 : 0 }]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <PhoneCall size={24} color={highContrast ? '#FF3333' : '#C62828'} />
              <Text style={[styles.sectionTitle, { fontSize: getScaledFontSize(18), color: highContrast ? '#FFFFFF' : '#1E293B', fontWeight: 'bold' }]}>
                Emergency SOS Contact
              </Text>
            </View>

            {!isEditing ? (
              <View style={styles.detailsList}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { fontSize: getScaledFontSize(14), color: labelColor }]}>Contact Name</Text>
                  <Text style={[styles.detailValue, { fontSize: getScaledFontSize(16), color: valColor, fontWeight: 'bold' }]}>
                    {profile?.emergencyContact?.name || 'Sarah Pendelton (Daughter)'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { fontSize: getScaledFontSize(14), color: labelColor }]}>Relationship</Text>
                  <Text style={[styles.detailValue, { fontSize: getScaledFontSize(16), color: valColor }]}>
                    {profile?.emergencyContact?.relationship || 'Daughter'}
                  </Text>
                </View>
                <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                  <Text style={[styles.detailLabel, { fontSize: getScaledFontSize(14), color: labelColor }]}>Phone Number</Text>
                  <Text style={[styles.detailValue, { fontSize: getScaledFontSize(18), color: primaryColor, fontWeight: 'bold' }]}>
                    {profile?.emergencyContact?.phone || '+1 (555) 019-9831'}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.formContainer}>
                <TextInput
                  label="Contact Full Name"
                  value={contactName}
                  onChangeText={setContactName}
                  mode="outlined"
                  style={[styles.input, { backgroundColor: inputBg }]}
                  outlineColor={highContrast ? '#888888' : '#CBD5E1'}
                  activeOutlineColor={primaryColor}
                  textColor={valColor}
                />
                <TextInput
                  label="Relationship"
                  value={contactRelation}
                  onChangeText={setContactRelation}
                  mode="outlined"
                  style={[styles.input, { backgroundColor: inputBg }]}
                  outlineColor={highContrast ? '#888888' : '#CBD5E1'}
                  activeOutlineColor={primaryColor}
                  textColor={valColor}
                />
                <TextInput
                  label="Emergency Phone Number"
                  value={contactPhone}
                  onChangeText={setContactPhone}
                  keyboardType="phone-pad"
                  mode="outlined"
                  style={[styles.input, { backgroundColor: inputBg }]}
                  outlineColor={highContrast ? '#888888' : '#CBD5E1'}
                  activeOutlineColor={primaryColor}
                  textColor={valColor}
                />
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Caregiver Settings Card */}
        <Card style={[styles.profileCard, { backgroundColor: highContrast ? '#000000' : '#FFFFFF', borderColor: highContrast ? '#FFFF00' : '#E2E8F0', borderWidth: highContrast ? 2 : 0 }]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Heart size={24} color={primaryColor} />
              <Text style={[styles.sectionTitle, { fontSize: getScaledFontSize(18), color: highContrast ? '#FFFFFF' : '#1E293B', fontWeight: 'bold' }]}>
                Caregiver Configuration
              </Text>
            </View>

            {!isEditing ? (
              <View style={styles.detailsList}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { fontSize: getScaledFontSize(14), color: labelColor }]}>Caregiver Name</Text>
                  <Text style={[styles.detailValue, { fontSize: getScaledFontSize(16), color: valColor, fontWeight: 'bold' }]}>
                    {profile?.caregiver?.name || 'Emily Smith (Nurse)'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { fontSize: getScaledFontSize(14), color: labelColor }]}>Email Address</Text>
                  <Text style={[styles.detailValue, { fontSize: getScaledFontSize(16), color: valColor }]}>
                    {profile?.caregiver?.email || 'emily.smith@caregiver.org'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { fontSize: getScaledFontSize(14), color: labelColor }]}>Phone Number</Text>
                  <Text style={[styles.detailValue, { fontSize: getScaledFontSize(16), color: valColor, fontWeight: 'bold' }]}>
                    {profile?.caregiver?.phone || '+1 (555) 012-4455'}
                  </Text>
                </View>
                <View style={[styles.detailRow, styles.switchDisplayRow, { borderBottomWidth: 0 }]}>
                  <Text style={[styles.detailLabel, { fontSize: getScaledFontSize(15), color: labelColor, flex: 1 }]}>
                    Alert Caregiver on Missed Dose (30 min delay)
                  </Text>
                  <Switch
                    value={receiveMissedAlerts}
                    disabled // Locked in view mode
                    color={primaryColor}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.formContainer}>
                <TextInput
                  label="Caregiver Full Name"
                  value={caregiverName}
                  onChangeText={setCaregiverName}
                  mode="outlined"
                  style={[styles.input, { backgroundColor: inputBg }]}
                  outlineColor={highContrast ? '#888888' : '#CBD5E1'}
                  activeOutlineColor={primaryColor}
                  textColor={valColor}
                />
                <TextInput
                  label="Caregiver Email Address"
                  value={caregiverEmail}
                  onChangeText={setCaregiverEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  mode="outlined"
                  style={[styles.input, { backgroundColor: inputBg }]}
                  outlineColor={highContrast ? '#888888' : '#CBD5E1'}
                  activeOutlineColor={primaryColor}
                  textColor={valColor}
                />
                <TextInput
                  label="Caregiver Phone Number"
                  value={caregiverPhone}
                  onChangeText={setCaregiverPhone}
                  keyboardType="phone-pad"
                  mode="outlined"
                  style={[styles.input, { backgroundColor: inputBg }]}
                  outlineColor={highContrast ? '#888888' : '#CBD5E1'}
                  activeOutlineColor={primaryColor}
                  textColor={valColor}
                />
                <View style={styles.switchEditRow}>
                  <Text style={{ fontSize: getScaledFontSize(15), color: labelColor, flex: 1, fontWeight: 'bold' }}>
                    Alert Caregiver on Missed Dose
                  </Text>
                  <Switch
                    value={receiveMissedAlerts}
                    onValueChange={setReceiveMissedAlerts}
                    color={primaryColor}
                  />
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <View style={styles.logoutBtnContainer}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={[styles.logoutBtn, { borderColor: highContrast ? '#FF3333' : '#EF4444', borderWidth: 2 }]}
            textColor={highContrast ? '#FF3333' : '#EF4444'}
            contentStyle={{ height: 60 }}
            labelStyle={{ fontSize: getScaledFontSize(16), fontWeight: 'bold' }}
            icon={() => <LogOut size={22} color={highContrast ? '#FF3333' : '#EF4444'} />}
          >
            Log Out of My Account
          </Button>
        </View>
      </View>
    </ScrollView>
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
    marginBottom: 20,
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
  profileContent: {
    paddingHorizontal: 20,
    gap: 20,
  },
  profileCard: {
    borderRadius: 24,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarDetails: {
    marginLeft: 16,
    flex: 1,
  },
  detailsList: {
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  detailLabel: {
    fontWeight: 'bold',
  },
  detailValue: {
    textAlign: 'right',
    flex: 1,
    paddingLeft: 16,
  },
  switchDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editActionsRow: {
    marginTop: 20,
  },
  cardActionBtn: {
    borderRadius: 14,
  },
  formContainer: {
    gap: 12,
  },
  input: {
    marginBottom: 4,
  },
  inlineInputs: {
    flexDirection: 'row',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginLeft: 10,
  },
  switchEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  logoutBtnContainer: {
    marginTop: 12,
  },
  logoutBtn: {
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  hcBorder: {
    borderColor: '#FFFF00',
    borderWidth: 2,
    backgroundColor: '#000000',
  },
});
