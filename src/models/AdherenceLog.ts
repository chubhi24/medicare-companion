export type AdherenceStatus = 'taken' | 'skipped' | 'missed' | 'snoozed';

export interface AdherenceLog {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  scheduleTime: string; // HH:MM
  date: string; // YYYY-MM-DD
  timestamp: number; // Date.now() timestamp
  status: AdherenceStatus;
}
