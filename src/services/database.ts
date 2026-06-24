import AsyncStorage from '@react-native-async-storage/async-storage';
import { isFirebaseConnected, db } from './firebase';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { Medicine } from '../models/Medicine';
import { UserProfile } from '../models/UserProfile';
import { Appointment } from '../models/Appointment';
import { AdherenceLog } from '../models/AdherenceLog';

const USER_PROFILE_KEY = 'medicare_profile';
const MEDICINES_KEY = 'medicare_medicines';
const LOGS_KEY = 'medicare_logs';
const APPOINTMENTS_KEY = 'medicare_appointments';

// Helper to check first launch and seed data
export const seedInitialDataIfEmpty = async () => {
  try {
    const profile = await AsyncStorage.getItem(USER_PROFILE_KEY);
    if (!profile) {
      console.log("Seeding initial mock data for first-time use...");
      
      const mockProfile: UserProfile = {
        uid: 'elderly_patient_123',
        email: 'arthur.companion@example.com',
        name: 'Arthur Pendelton',
        age: 78,
        gender: 'Male',
        bloodGroup: 'O Positive',
        medicalConditions: 'Hypertension, Osteoarthritis, Mild Diabetes',
        allergies: 'Penicillin, Sulfa Drugs',
        emergencyContact: {
          name: 'Sarah Pendelton (Daughter)',
          relationship: 'Daughter',
          phone: '+1 (555) 019-9831',
        },
        caregiver: {
          name: 'Emily Smith (Nurse)',
          email: 'emily.smith@caregiver.org',
          phone: '+1 (555) 012-4455',
          receiveMissedAlerts: true,
        },
        dailyStreak: 5,
        lastCompletedDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
      };

      const mockMedicines: Medicine[] = [
        {
          id: 'med_1',
          name: 'Lisinopril (Blood Pressure)',
          dosage: '10 mg (1 Tablet)',
          quantity: 28,
          type: 'Tablet',
          startDate: '2026-06-01',
          endDate: '2026-12-01',
          frequency: 'Once daily',
          reminderTimes: ['08:00'],
          notes: 'Take in the morning with a full glass of water. Do not skip.',
          refillThreshold: 7,
        },
        {
          id: 'med_2',
          name: 'Metformin (Diabetes)',
          dosage: '500 mg (1 Tablet)',
          quantity: 4, // Trigger low stock!
          type: 'Tablet',
          startDate: '2026-06-01',
          endDate: '2026-12-01',
          frequency: 'Twice daily',
          reminderTimes: ['08:00', '20:00'],
          notes: 'Take immediately after breakfast and dinner.',
          refillThreshold: 6,
        },
        {
          id: 'med_3',
          name: 'Calcium + Vitamin D3',
          dosage: '1 Capsule',
          quantity: 60,
          type: 'Capsule',
          startDate: '2026-06-01',
          endDate: '2026-12-01',
          frequency: 'Once daily',
          reminderTimes: ['13:00'],
          notes: 'Take during lunch. Helps support bone density.',
          refillThreshold: 10,
        },
      ];

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const dayBefore = new Date(Date.now() - 172800000).toISOString().split('T')[0];

      const mockLogs: AdherenceLog[] = [
        // Day before yesterday
        {
          id: 'log_db_1',
          medicineId: 'med_1',
          medicineName: 'Lisinopril (Blood Pressure)',
          dosage: '10 mg (1 Tablet)',
          scheduleTime: '08:00',
          date: dayBefore,
          timestamp: new Date(`${dayBefore}T08:05:00`).getTime(),
          status: 'taken',
        },
        {
          id: 'log_db_2',
          medicineId: 'med_2',
          medicineName: 'Metformin (Diabetes)',
          dosage: '500 mg (1 Tablet)',
          scheduleTime: '08:00',
          date: dayBefore,
          timestamp: new Date(`${dayBefore}T08:08:00`).getTime(),
          status: 'taken',
        },
        {
          id: 'log_db_3',
          medicineId: 'med_3',
          medicineName: 'Calcium + Vitamin D3',
          dosage: '1 Capsule',
          scheduleTime: '13:00',
          date: dayBefore,
          timestamp: new Date(`${dayBefore}T13:15:00`).getTime(),
          status: 'taken',
        },
        {
          id: 'log_db_4',
          medicineId: 'med_2',
          medicineName: 'Metformin (Diabetes)',
          dosage: '500 mg (1 Tablet)',
          scheduleTime: '20:00',
          date: dayBefore,
          timestamp: new Date(`${dayBefore}T20:10:00`).getTime(),
          status: 'taken',
        },
        // Yesterday
        {
          id: 'log_yes_1',
          medicineId: 'med_1',
          medicineName: 'Lisinopril (Blood Pressure)',
          dosage: '10 mg (1 Tablet)',
          scheduleTime: '08:00',
          date: yesterday,
          timestamp: new Date(`${yesterday}T08:12:00`).getTime(),
          status: 'taken',
        },
        {
          id: 'log_yes_2',
          medicineId: 'med_2',
          medicineName: 'Metformin (Diabetes)',
          dosage: '500 mg (1 Tablet)',
          scheduleTime: '08:00',
          date: yesterday,
          timestamp: new Date(`${yesterday}T08:15:00`).getTime(),
          status: 'taken',
        },
        {
          id: 'log_yes_3',
          medicineId: 'med_3',
          medicineName: 'Calcium + Vitamin D3',
          dosage: '1 Capsule',
          scheduleTime: '13:00',
          date: yesterday,
          timestamp: new Date(`${yesterday}T13:45:00`).getTime(),
          status: 'skipped', // Skipped this one
        },
        {
          id: 'log_yes_4',
          medicineId: 'med_2',
          medicineName: 'Metformin (Diabetes)',
          dosage: '500 mg (1 Tablet)',
          scheduleTime: '20:00',
          date: yesterday,
          timestamp: new Date(`${yesterday}T20:05:00`).getTime(),
          status: 'taken',
        },
        // Today
        {
          id: 'log_tod_1',
          medicineId: 'med_1',
          medicineName: 'Lisinopril (Blood Pressure)',
          dosage: '10 mg (1 Tablet)',
          scheduleTime: '08:00',
          date: today,
          timestamp: new Date(`${today}T08:02:00`).getTime(),
          status: 'taken',
        },
        {
          id: 'log_tod_2',
          medicineId: 'med_2',
          medicineName: 'Metformin (Diabetes)',
          dosage: '500 mg (1 Tablet)',
          scheduleTime: '08:00',
          date: today,
          timestamp: new Date(`${today}T08:45:00`).getTime(),
          status: 'taken',
        },
      ];

      const mockAppointments: Appointment[] = [
        {
          id: 'apt_1',
          doctorName: 'Dr. Elizabeth Vance',
          specialty: 'Cardiologist',
          date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // In 2 days
          time: '10:30',
          location: 'Mercy Heart Institute, Room 304',
          notes: 'Annual cardiology screening. Remember to bring blood sugar log and current medications.',
          reminderEnabled: true,
        },
        {
          id: 'apt_2',
          doctorName: 'Dr. Samuel Reyes',
          specialty: 'Ophthalmologist',
          date: new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0], // In 12 days
          time: '14:00',
          location: 'Vance Vision Center',
          notes: 'Routine glaucoma scan and vision adjustment.',
          reminderEnabled: true,
        },
      ];

      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(mockProfile));
      await AsyncStorage.setItem(MEDICINES_KEY, JSON.stringify(mockMedicines));
      await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(mockLogs));
      await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(mockAppointments));
      
      console.log("Mock data successfully seeded.");
    }
  } catch (e) {
    console.error("Error seeding mock data", e);
  }
};

export const DatabaseService = {
  // --- USER PROFILE ---
  async getProfile(uid: string): Promise<UserProfile | null> {
    if (isFirebaseConnected) {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
    } else {
      const data = await AsyncStorage.getItem(USER_PROFILE_KEY);
      return data ? JSON.parse(data) : null;
    }
  },

  async saveProfile(profile: UserProfile): Promise<void> {
    if (isFirebaseConnected) {
      const docRef = doc(db, 'users', profile.uid);
      await setDoc(docRef, profile, { merge: true });
    } else {
      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    }
  },

  // --- MEDICINES ---
  async getMedicines(uid: string): Promise<Medicine[]> {
    if (isFirebaseConnected) {
      const colRef = collection(db, 'users', uid, 'medicines');
      const querySnap = await getDocs(colRef);
      const list: Medicine[] = [];
      querySnap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Medicine);
      });
      return list;
    } else {
      const data = await AsyncStorage.getItem(MEDICINES_KEY);
      return data ? JSON.parse(data) : [];
    }
  },

  async addMedicine(uid: string, medicine: Omit<Medicine, 'id'>): Promise<Medicine> {
    const id = Date.now().toString();
    const newMedicine: Medicine = { ...medicine, id };

    if (isFirebaseConnected) {
      const docRef = doc(db, 'users', uid, 'medicines', id);
      await setDoc(docRef, newMedicine);
      return newMedicine;
    } else {
      const list = await this.getMedicines(uid);
      list.push(newMedicine);
      await AsyncStorage.setItem(MEDICINES_KEY, JSON.stringify(list));
      return newMedicine;
    }
  },

  async updateMedicine(uid: string, medicine: Medicine): Promise<void> {
    if (isFirebaseConnected) {
      const docRef = doc(db, 'users', uid, 'medicines', medicine.id);
      await setDoc(docRef, medicine, { merge: true });
    } else {
      const list = await this.getMedicines(uid);
      const idx = list.findIndex(m => m.id === medicine.id);
      if (idx !== -1) {
        list[idx] = medicine;
        await AsyncStorage.setItem(MEDICINES_KEY, JSON.stringify(list));
      }
    }
  },

  async deleteMedicine(uid: string, medicineId: string): Promise<void> {
    if (isFirebaseConnected) {
      const docRef = doc(db, 'users', uid, 'medicines', medicineId);
      await deleteDoc(docRef);
    } else {
      const list = await this.getMedicines(uid);
      const filtered = list.filter(m => m.id !== medicineId);
      await AsyncStorage.setItem(MEDICINES_KEY, JSON.stringify(filtered));
    }
  },

  // --- ADHERENCE LOGS ---
  async getAdherenceLogs(uid: string): Promise<AdherenceLog[]> {
    if (isFirebaseConnected) {
      const colRef = collection(db, 'users', uid, 'adherenceLogs');
      const querySnap = await getDocs(colRef);
      const list: AdherenceLog[] = [];
      querySnap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as AdherenceLog);
      });
      return list;
    } else {
      const data = await AsyncStorage.getItem(LOGS_KEY);
      return data ? JSON.parse(data) : [];
    }
  },

  async logAdherence(uid: string, log: Omit<AdherenceLog, 'id'>): Promise<AdherenceLog> {
    const id = 'log_' + Date.now();
    const newLog: AdherenceLog = { ...log, id };

    if (isFirebaseConnected) {
      const docRef = doc(db, 'users', uid, 'adherenceLogs', id);
      await setDoc(docRef, newLog);
      return newLog;
    } else {
      const list = await this.getAdherenceLogs(uid);
      list.push(newLog);
      await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(list));
      return newLog;
    }
  },

  // --- APPOINTMENTS ---
  async getAppointments(uid: string): Promise<Appointment[]> {
    if (isFirebaseConnected) {
      const colRef = collection(db, 'users', uid, 'appointments');
      const querySnap = await getDocs(colRef);
      const list: Appointment[] = [];
      querySnap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Appointment);
      });
      return list;
    } else {
      const data = await AsyncStorage.getItem(APPOINTMENTS_KEY);
      return data ? JSON.parse(data) : [];
    }
  },

  async addAppointment(uid: string, appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    const id = 'apt_' + Date.now();
    const newAppointment: Appointment = { ...appointment, id };

    if (isFirebaseConnected) {
      const docRef = doc(db, 'users', uid, 'appointments', id);
      await setDoc(docRef, newAppointment);
      return newAppointment;
    } else {
      const list = await this.getAppointments(uid);
      list.push(newAppointment);
      await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(list));
      return newAppointment;
    }
  },

  async updateAppointment(uid: string, appointment: Appointment): Promise<void> {
    if (isFirebaseConnected) {
      const docRef = doc(db, 'users', uid, 'appointments', appointment.id);
      await setDoc(docRef, appointment, { merge: true });
    } else {
      const list = await this.getAppointments(uid);
      const idx = list.findIndex(a => a.id === appointment.id);
      if (idx !== -1) {
        list[idx] = appointment;
        await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(list));
      }
    }
  },

  async deleteAppointment(uid: string, appointmentId: string): Promise<void> {
    if (isFirebaseConnected) {
      const docRef = doc(db, 'users', uid, 'appointments', appointmentId);
      await deleteDoc(docRef);
    } else {
      const list = await this.getAppointments(uid);
      const filtered = list.filter(a => a.id !== appointmentId);
      await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(filtered));
    }
  }
};
