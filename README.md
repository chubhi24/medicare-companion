# MediCare Companion (MediCare Companion App)

A production-quality, modern, and accessible medicine reminder and caregiver support application designed specifically for senior citizens. Built using **React Native**, **Expo (SDK 56)**, **TypeScript**, and **React Native Paper (Material Design 3)**.

---

## 🌟 Key Features

### 1. Senior-First Accessibility Layout
- **Dynamic Text Scaling:** Allows seniors to increase text sizes globally by up to 200%.
- **High Contrast Theme:** Conforming to W3C low-vision guidelines, toggles a pure black interface with high-visibility yellow and green indicators.
- **Voice Guidance Assistant (TTS):** A prominent audio assist button is present on all main screens to read schedule lists, inventory states, and clinical appointments aloud.
- **Large Touch Targets:** Buttons and input fields enforce a minimum height of `56px` to prevent tap misses.
- **Haptic Confirmations:** Provides distinct vibration feedbacks for alarms, selections, and emergency counts.

### 2. Daily Medicine Checklist
- Lists today's morning, afternoon, and evening medication slots based on custom frequencies (Once, Twice, Thrice daily, Weekly, or Custom).
- Mark doses as **Taken**, **Skipped**, or **Snoozed** (snoozes alarm for 10 minutes).
- Automatic inventory depletion tracking.
- Motivational compliance streaks.

### 3. Prescription Scanner (OCR)
- Uses camera scanning and OCR parsing.
- Pre-packaged with simulated scanned templates (representing Lisinopril, Metformin, and Amoxicillin prescriptions) for offline sandbox testing.
- Uses regex parsing to automatically extract medication name, dosage (e.g., "10mg"), frequency ("twice daily"), stock quantity, and special instructions.

### 4. Emergency SOS Panic button
- Persistent floating crimson button available on all main screens.
- **3-Second Countdown visualizer** with quick-cancel abort trigger (prevents accidental alarms).
- Automatically triggers a phone call to emergency contacts and drafts an SMS containing the user's live GPS coordinates (retrieved via `expo-location`).

### 5. Sync Caregiver Portal
- Syncs patient compliance rates and inventory levels with caregiver accounts.
- **30-Minute Missed Dose Alert:** If a dose is left un-taken for 30 minutes, it automatically flags the dose as missed and alerts the caregiver's device.

### 6. Doctor Consults & Prescription Archiver
- Calendar scheduling for cardiology, eye care, and general consultations.
- Interactive camera/file upload attachment targets to archive doctor prescription sheets.

---

## 🛠️ Architecture & Tech Stack

Following **Clean Architecture** and **MVVM Pattern**:

- **Views (`/src/app`)**: Route files powered by **Expo Router**, including a custom onboarding flow, authentication views, bottom tabs navigation, and modals.
- **ViewModels / Hooks (`/src/hooks`)**: Specialized hooks (`useAuth`, `useMedicines`, `useAppointments`, `useAdherence`) that bind view files to state services.
- **State Provider (`/src/context`)**: `AppContext` manages globally synchronized states (user records, schedule slots, Streaks, logs).
- **Services (`/src/services`)**: Data operations (`firebase.ts`, `database.ts` backing up data via Firestore/AsyncStorage), `ocr.ts`, `speech.ts` (TTS voice guidelines), and `notification.ts`.
- **Theme (`/src/constants/theme.ts`)**: Palette layouts (Blue, Green, Contrast) mapping Material Design 3 guidelines.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have **Node.js (v18+)** installed.

### Installation
1. Clone or copy the folder contents into your workspace.
2. In your terminal, run the package installation:
   ```bash
   npm install
   ```

### Running the App
Expo allows you to run this project directly in your web browser (fully simulated) or on a physical iOS/Android device using **Expo Go**!

#### 1. Preview in the Web Browser (Recommended for quick testing)
Run:
```bash
npm run web
```
This launches a development server and opens the application in your default browser. Responsive rendering represents a phone viewport.

#### 2. Run on physical iOS / Android Devices (Expo Go)
1. Download the free **Expo Go** app from the App Store or Google Play Store.
2. Run in terminal:
   ```bash
   npm run start
   ```
3. Scan the generated QR code with your phone camera (iOS) or the Expo Go scanner (Android).

---

## 🔒 Firebase Integration Setup

The app contains a **dual-mode system**. If Firebase credentials are not found, the app automatically boots into **Sandbox Offline Mode** using local AsyncStorage storage pre-seeded with beautiful mock records.

To link the app with your live production Firebase database:

1. Create a Firebase project at the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firebase Authentication**, **Cloud Firestore**, and **Firebase Storage**.
3. Create a `.env` file at the root of the project and populate it with your Web App config keys:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id_here
   ```
4. Start the server. The database service will automatically connect to Firestore.
