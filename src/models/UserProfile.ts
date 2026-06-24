export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface CaregiverDetails {
  name: string;
  email: string;
  phone: string;
  receiveMissedAlerts: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  medicalConditions: string; // e.g. "Hypertension, Diabetes"
  allergies: string; // e.g. "Penicillin"
  emergencyContact: EmergencyContact;
  caregiver: CaregiverDetails;
  profilePhoto?: string; // base64 or URI
  dailyStreak: number;
  lastCompletedDate?: string; // YYYY-MM-DD
}
