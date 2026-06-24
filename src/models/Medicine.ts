export type MedicineType = 'Tablet' | 'Syrup' | 'Injection' | 'Capsule';
export type MedicineFrequency = 'Once daily' | 'Twice daily' | 'Thrice daily' | 'Weekly' | 'Custom';

export interface Medicine {
  id: string;
  name: string;
  dosage: string; // e.g. "1 Tablet", "10ml"
  quantity: number; // current stock remaining
  type: MedicineType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  frequency: MedicineFrequency;
  reminderTimes: string[]; // ['08:00', '13:00', '20:00']
  notes?: string; // e.g. "Take after food"
  refillThreshold: number; // stock count at which to trigger notification
  lastRefillDate?: string;
  caregiverNotifiedOfMissed?: boolean;
}
