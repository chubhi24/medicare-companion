export interface Appointment {
  id: string;
  doctorName: string;
  specialty?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location?: string;
  notes?: string;
  prescriptionPhoto?: string; // base64 URI or image path
  reminderEnabled: boolean;
}
