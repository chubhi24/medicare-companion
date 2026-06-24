import { Medicine, MedicineFrequency, MedicineType } from '../models/Medicine';

export interface ScannedMedicationData {
  name: string;
  dosage: string;
  type: MedicineType;
  frequency: MedicineFrequency;
  reminderTimes: string[];
  notes: string;
  quantity: number;
}

// Sample prescription text templates for testing the OCR
export const MOCK_PRESCRIPTIONS = [
  {
    label: "Sample 1: Lisinopril 10mg Daily",
    rawText: "ST. JUDE HEALTH CLINIC\nPatient: Arthur Pendelton\nRx: Lisinopril 10 mg\nDispense: 30 Tablets\nTake 1 Tablet daily in the morning at 08:00 AM\nRefills: 3\nDate: 2026-06-15",
    parsed: {
      name: "Lisinopril (Blood Pressure)",
      dosage: "10 mg (1 Tablet)",
      type: "Tablet" as MedicineType,
      frequency: "Once daily" as MedicineFrequency,
      reminderTimes: ["08:00"],
      notes: "Take in the morning with a full glass of water.",
      quantity: 30,
    }
  },
  {
    label: "Sample 2: Metformin 500mg Twice Daily",
    rawText: "VANCE ENDOCRINOLOGY\nRx: Metformin 500mg\nQty: 60 Capsules\nTake 1 Capsule twice a day (morning at 08:00 and evening at 20:00) with meals.\nDr. Elizabeth Vance",
    parsed: {
      name: "Metformin (Diabetes)",
      dosage: "500 mg (1 Capsule)",
      type: "Capsule" as MedicineType,
      frequency: "Twice daily" as MedicineFrequency,
      reminderTimes: ["08:00", "20:00"],
      notes: "Take with food to prevent stomach upset.",
      quantity: 60,
    }
  },
  {
    label: "Sample 3: Amoxicillin Suspension Syrup",
    rawText: "PEDIATRIC CARE ASSOCIATES\nAmoxicillin Oral Suspension Syrup\nTake 10 ml three times daily (at 08:00, 14:00, and 20:00) for 10 days.\nTotal Volume: 150 ml",
    parsed: {
      name: "Amoxicillin (Antibiotic)",
      dosage: "10 ml (Syrup)",
      type: "Syrup" as MedicineType,
      frequency: "Thrice daily" as MedicineFrequency,
      reminderTimes: ["08:00", "14:00", "20:00"],
      notes: "Finish entire course of antibiotics.",
      quantity: 150,
    }
  }
];

export const OCRService = {
  // Simulates processing an image and extracting text via OCR, then parsing it
  async scanPrescriptionImage(prescriptionIndex: number): Promise<ScannedMedicationData> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sample = MOCK_PRESCRIPTIONS[prescriptionIndex];
        resolve(sample.parsed);
      }, 1500); // 1.5 seconds simulation latency
    });
  },

  // Dynamic regex parser if user inputs arbitrary prescription text manually
  parseRawPrescriptionText(text: string): ScannedMedicationData {
    const cleanText = text.toLowerCase();
    
    // Default values
    let name = "Unknown Medication";
    let dosage = "1 pill";
    let type: MedicineType = "Tablet";
    let frequency: MedicineFrequency = "Once daily";
    let reminderTimes: string[] = ["08:00"];
    let notes = "";
    let quantity = 30;

    // Try to extract name
    const rxMatch = text.match(/(?:rx|medicine|name|take):\s*([a-zA-Z\s]+)/i) || text.match(/^([a-zA-Z]+)/m);
    if (rxMatch && rxMatch[1]) {
      name = rxMatch[1].trim();
    }

    // Try to extract dosage (e.g. 10mg, 500mg, 1 tablet, 5ml)
    const doseMatch = text.match(/(\d+\s*(?:mg|g|ml|puffs|tablets|capsules|tablet|capsule|pill))/i);
    if (doseMatch && doseMatch[1]) {
      dosage = doseMatch[1].trim();
    }

    // Type classification
    if (cleanText.includes("syrup") || cleanText.includes("ml") || cleanText.includes("suspension")) {
      type = "Syrup";
    } else if (cleanText.includes("injection") || cleanText.includes("syringe") || cleanText.includes("subcutaneous")) {
      type = "Injection";
    } else if (cleanText.includes("capsule") || cleanText.includes("cap")) {
      type = "Capsule";
    }

    // Frequency classification
    if (cleanText.includes("twice") || cleanText.includes("bid") || cleanText.includes("two times") || cleanText.includes("twice daily")) {
      frequency = "Twice daily";
      reminderTimes = ["08:00", "20:00"];
    } else if (cleanText.includes("three times") || cleanText.includes("tid") || cleanText.includes("thrice daily") || cleanText.includes("thrice")) {
      frequency = "Thrice daily";
      reminderTimes = ["08:00", "14:00", "20:00"];
    } else if (cleanText.includes("weekly")) {
      frequency = "Weekly";
    } else if (cleanText.includes("custom") || cleanText.includes("needed") || cleanText.includes("prn")) {
      frequency = "Custom";
    }

    // Quantity classification
    const qtyMatch = text.match(/(?:qty|dispense|count|quantity|tablets|capsules):\s*(\d+)/i) || text.match(/(\d+)\s*(?:tablets|capsules|pills|tablets|ml)/i);
    if (qtyMatch && qtyMatch[1]) {
      quantity = parseInt(qtyMatch[1]) || 30;
    }

    // Notes extracting
    if (cleanText.includes("with food") || cleanText.includes("after food")) {
      notes = "Take with food.";
    } else if (cleanText.includes("empty stomach")) {
      notes = "Take on an empty stomach.";
    }

    return {
      name,
      dosage,
      type,
      frequency,
      reminderTimes,
      notes,
      quantity,
    };
  }
};
export default OCRService;
