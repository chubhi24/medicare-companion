import React, { createContext, useContext, useState, useEffect } from 'react';
import { DatabaseService, seedInitialDataIfEmpty } from '../services/database';
import { isFirebaseConnected, auth as firebaseAuth } from '../services/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { Medicine } from '../models/Medicine';
import { UserProfile } from '../models/UserProfile';
import { Appointment } from '../models/Appointment';
import { AdherenceLog } from '../models/AdherenceLog';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppContextType {
  currentUser: any;
  userProfile: UserProfile | null;
  medicines: Medicine[];
  logs: AdherenceLog[];
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  addMedicine: (medicine: Omit<Medicine, 'id'>) => Promise<void>;
  updateMedicine: (medicine: Medicine) => Promise<void>;
  deleteMedicine: (medicineId: string) => Promise<void>;
  logAdherence: (log: Omit<AdherenceLog, 'id'>) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (appointment: Appointment) => Promise<void>;
  deleteAppointment: (appointmentId: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [logs, setLogs] = useState<AdherenceLog[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize
  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      await seedInitialDataIfEmpty();

      if (isFirebaseConnected && firebaseAuth) {
        const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
          if (user) {
            setCurrentUser(user);
            await loadUserData(user.uid);
          } else {
            setCurrentUser(null);
            setUserProfile(null);
            setMedicines([]);
            setLogs([]);
            setAppointments([]);
            setIsLoading(false);
          }
        });
        return unsubscribe;
      } else {
        // Offline / Sandbox Mode
        const savedAuth = await AsyncStorage.getItem('sandbox_logged_in');
        if (savedAuth === 'true') {
          setCurrentUser({ uid: 'elderly_patient_123', email: 'arthur.companion@example.com' });
          await loadUserData('elderly_patient_123');
        } else {
          setCurrentUser(null);
          setIsLoading(false);
        }
      }
    };

    initApp();
  }, []);

  const loadUserData = async (uid: string) => {
    try {
      setError(null);
      const profile = await DatabaseService.getProfile(uid);
      setUserProfile(profile);

      if (profile) {
        const medsList = await DatabaseService.getMedicines(uid);
        setMedicines(medsList);

        const logsList = await DatabaseService.getAdherenceLogs(uid);
        setLogs(logsList);

        const aptsList = await DatabaseService.getAppointments(uid);
        setAppointments(aptsList);
      }
    } catch (e: any) {
      setError(e.message || "Failed to load database records");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    if (currentUser) {
      await loadUserData(currentUser.uid);
    }
  };

  const updateProfile = async (profile: UserProfile) => {
    try {
      await DatabaseService.saveProfile(profile);
      setUserProfile(profile);
    } catch (e: any) {
      setError(e.message || "Failed to update profile");
      throw e;
    }
  };

  const addMedicine = async (medicine: Omit<Medicine, 'id'>) => {
    if (!currentUser) return;
    try {
      const added = await DatabaseService.addMedicine(currentUser.uid, medicine);
      setMedicines(prev => [...prev, added]);
    } catch (e: any) {
      setError(e.message || "Failed to add medication");
      throw e;
    }
  };

  const updateMedicine = async (medicine: Medicine) => {
    if (!currentUser) return;
    try {
      await DatabaseService.updateMedicine(currentUser.uid, medicine);
      setMedicines(prev => prev.map(m => m.id === medicine.id ? medicine : m));
    } catch (e: any) {
      setError(e.message || "Failed to update medication");
      throw e;
    }
  };

  const deleteMedicine = async (medicineId: string) => {
    if (!currentUser) return;
    try {
      await DatabaseService.deleteMedicine(currentUser.uid, medicineId);
      setMedicines(prev => prev.filter(m => m.id !== medicineId));
    } catch (e: any) {
      setError(e.message || "Failed to delete medication");
      throw e;
    }
  };

  const logAdherence = async (log: Omit<AdherenceLog, 'id'>) => {
    if (!currentUser) return;
    try {
      const newLog = await DatabaseService.logAdherence(currentUser.uid, log);
      setLogs(prev => [...prev, newLog]);

      // Deduct stock quantity of medicine
      const medicine = medicines.find(m => m.id === log.medicineId);
      if (medicine && log.status === 'taken') {
        const updatedMedicine = {
          ...medicine,
          quantity: Math.max(0, medicine.quantity - 1),
        };
        await updateMedicine(updatedMedicine);
      }

      // Check and update Daily Streak
      if (userProfile && log.status === 'taken') {
        const todayStr = new Date().toISOString().split('T')[0];
        if (userProfile.lastCompletedDate !== todayStr) {
          // If last completed was yesterday, increment streak, else reset to 1
          const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          const newStreak = userProfile.lastCompletedDate === yesterdayStr ? userProfile.dailyStreak + 1 : 1;
          const updatedProfile = {
            ...userProfile,
            dailyStreak: newStreak,
            lastCompletedDate: todayStr,
          };
          await updateProfile(updatedProfile);
        }
      }
    } catch (e: any) {
      setError(e.message || "Failed to record adherence log");
      throw e;
    }
  };

  const addAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    if (!currentUser) return;
    try {
      const added = await DatabaseService.addAppointment(currentUser.uid, appointment);
      setAppointments(prev => [...prev, added]);
    } catch (e: any) {
      setError(e.message || "Failed to add appointment");
      throw e;
    }
  };

  const updateAppointment = async (appointment: Appointment) => {
    if (!currentUser) return;
    try {
      await DatabaseService.updateAppointment(currentUser.uid, appointment);
      setAppointments(prev => prev.map(a => a.id === appointment.id ? appointment : a));
    } catch (e: any) {
      setError(e.message || "Failed to update appointment");
      throw e;
    }
  };

  const deleteAppointment = async (appointmentId: string) => {
    if (!currentUser) return;
    try {
      await DatabaseService.deleteAppointment(currentUser.uid, appointmentId);
      setAppointments(prev => prev.filter(a => a.id !== appointmentId));
    } catch (e: any) {
      setError(e.message || "Failed to delete appointment");
      throw e;
    }
  };

  // Auth Methods
  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isFirebaseConnected && firebaseAuth) {
        const cred = await signInWithEmailAndPassword(firebaseAuth, email, pass);
        setCurrentUser(cred.user);
        await loadUserData(cred.user.uid);
      } else {
        // Offline / Sandbox login validation
        if (email.trim() && pass.length >= 6) {
          await AsyncStorage.setItem('sandbox_logged_in', 'true');
          const mockUser = { uid: 'elderly_patient_123', email };
          setCurrentUser(mockUser);
          await loadUserData('elderly_patient_123');
        } else {
          throw new Error("Invalid credentials. Use any email and a password of >= 6 characters.");
        }
      }
    } catch (e: any) {
      setIsLoading(false);
      setError(e.message || "Login failed");
      throw e;
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isFirebaseConnected && firebaseAuth) {
        const cred = await createUserWithEmailAndPassword(firebaseAuth, email, pass);
        setCurrentUser(cred.user);
        
        // Save initial profile
        const initialProfile: UserProfile = {
          uid: cred.user.uid,
          email,
          name,
          age: 70,
          gender: 'Not specified',
          bloodGroup: 'Not specified',
          medicalConditions: '',
          allergies: '',
          emergencyContact: { name: '', relationship: '', phone: '' },
          caregiver: { name: '', email: '', phone: '', receiveMissedAlerts: false },
          dailyStreak: 0,
        };
        await DatabaseService.saveProfile(initialProfile);
        setUserProfile(initialProfile);
        setIsLoading(false);
      } else {
        // Offline / Sandbox mode register
        await AsyncStorage.setItem('sandbox_logged_in', 'true');
        const mockUser = { uid: 'elderly_patient_123', email };
        setCurrentUser(mockUser);
        
        // Seed default profile
        const initialProfile: UserProfile = {
          uid: 'elderly_patient_123',
          email,
          name,
          age: 70,
          gender: 'Not specified',
          bloodGroup: 'Not specified',
          medicalConditions: '',
          allergies: '',
          emergencyContact: { name: '', relationship: '', phone: '' },
          caregiver: { name: '', email: '', phone: '', receiveMissedAlerts: false },
          dailyStreak: 0,
        };
        await DatabaseService.saveProfile(initialProfile);
        setUserProfile(initialProfile);
        setIsLoading(false);
      }
    } catch (e: any) {
      setIsLoading(false);
      setError(e.message || "Registration failed");
      throw e;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (isFirebaseConnected && firebaseAuth) {
        try {
          await firebaseSignOut(firebaseAuth);
        } catch (authError: any) {
          console.warn("Firebase sign out failed, clearing local state anyway:", authError);
        }
      }
      
      // Always clear local state and storage to guarantee the user is signed out locally
      await AsyncStorage.removeItem('sandbox_logged_in');
      setCurrentUser(null);
      setUserProfile(null);
      setMedicines([]);
      setLogs([]);
      setAppointments([]);
    } catch (e: any) {
      setError(e.message || "Logout failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        userProfile,
        medicines,
        logs,
        appointments,
        isLoading,
        error,
        refreshData,
        updateProfile,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        logAdherence,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
