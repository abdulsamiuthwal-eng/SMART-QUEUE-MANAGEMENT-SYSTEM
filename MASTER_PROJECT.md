# 🧠 MASTER PROJECT BIBLE & AGENT HANDOFF MANUAL
## Smart Queue Management System (Healthcare Flow)

> **PRIMARY DIRECTIVE FOR ANY INCOMING AI AGENT OR DEVELOPER:**  
> This single document contains the **complete conceptual, logical, technical, visual, and architectural history** of the Smart Queue Management System. Read this document thoroughly before proposing or making any modifications. It reflects all real conversations, explicit user decisions, resolved bugs, design tokens, and future milestones.

---

## 📑 TABLE OF CONTENTS
1. [Project Overview & Core Purpose](#1-project-overview--core-purpose)
2. [Conversation History & User Design Decisions (Why Things Are Built This Way)](#2-conversation-history--user-design-decisions)
   - [2.1 The Glassy Style vs. Vercel Transparency Bug (The Critical Discovery)](#21-the-glassy-style-vs-vercel-transparency-bug)
   - [2.2 Token History & Visit Tracking (Used vs. Unused vs. Rescheduled)](#22-token-history--visit-tracking)
   - [2.3 Sign-Out Confirmation & Browser Back-Button Interception](#23-sign-out-confirmation--browser-back-button-interception)
   - [2.4 Appointment Scheduling (Date + Time Slots)](#24-appointment-scheduling-date--time-slots)
   - [2.5 Kinetic Smooth Scrolling & Scrollbar Removal](#25-kinetic-smooth-scrolling--scrollbar-removal)
   - [2.6 Bilingual Support (English & Urdu RTL Typography)](#26-bilingual-support-english--urdu-rtl-typography)
3. [System Architecture & Tech Stack](#3-system-architecture--tech-stack)
4. [Dual-Mode Database Engine (Firebase Cloud vs. Offline LocalDB)](#4-dual-mode-database-engine)
5. [Complete Codebase File Tree & Detailed Breakdown](#5-complete-codebase-file-tree--detailed-breakdown)
6. [Data Schema & Flow Models](#6-data-schema--flow-models)
7. [Design System & Glassmorphism Standards](#7-design-system--glassmorphism-standards)
8. [How to Sync & Run This Project on Another Laptop (All Options Compared)](#8-how-to-sync--run-this-project-on-another-laptop)
   - [Option 1: GitHub Central Remote (Recommended Industry Standard)](#option-1-github-central-remote-recommended)
   - [Option 2: Local Wi-Fi Network Access (`--host`)](#option-2-local-wi-fi-network-access---host)
   - [Option 3: VS Code Live Share / Remote Tunnels](#option-3-vs-code-live-share--remote-tunnels)
   - [Option 4: Cloud Storage Sync (OneDrive / Google Drive)](#option-4-cloud-storage-sync)
9. [Operational Commands (Run, Build, Deploy)](#9-operational-commands)
10. [Roadmap & Next Planned Enhancements](#10-roadmap--next-planned-enhancements)

---

## 1. Project Overview & Core Purpose

**Smart Queue Management System** is a real-time web application tailored for outpatient clinics, hospitals, and diagnostic centers. Its primary objective is to replace chaotic, physically exhausting waiting rooms with a calm, digital routing experience.

### The System Operates in Two Core Personas:
1. **Patient Portal (`/patient-dashboard`):**
   - Patients can view clinics, book instantaneous walk-in tokens or schedule appointments for a specific date and time slot.
   - Real-time digital token tracking with live ETA countdowns and visual alerts when their token is called.
   - Complete clinic-wise medical history (tracked tokens, completion status, doctor notes).
   - Digital QR Code passes, WhatsApp automated notifications, and an AI Triage Chatbot for instant symptom evaluation.
2. **Organization / Hospital Desk (`/org-dashboard`):**
   - Receptionists, doctors, and triage officers manage live queues: Call Next, Serve, Skip, Recall, and Emergency Priority Insertion.
   - Manual token generator for walk-in patients without smartphones.
   - QR code scanner modal to verify patient arrival.
   - Multi-department configuration with dynamic average consultation times.
   - Clinical supplies & inventory monitoring with low-stock threshold alerts and WhatsApp restock ordering.
   - Daily patient throughput and wait-time analytics.

---

## 2. Conversation History & User Design Decisions

To understand why this repository is structured the way it is, any new developer or agent must know the exact decisions made during development:

### 2.1 The Glassy Style vs. Vercel Transparency Bug
- **The Issue:** The user noticed that on `localhost`, the cards had a rich, frosted oceanic teal acrylic glass look with glowing ambient reflections. However, when deployed to Vercel production, the cards appeared completely clear/transparent (like thin cellophane plastic), losing the frosted texture.
- **The Root Cause:** In Vite dev mode (`localhost`), raw CSS is injected into the DOM as `<style>` blocks, so modern `backdrop-filter: blur(16px) saturate(145%)` executed perfectly. However, during production build (`npm run build`), PostCSS / lightningcss / Autoprefixer stripped the standard `backdrop-filter` property, leaving only `-webkit-backdrop-filter`. In desktop Chromium (Chrome & Edge on Windows), `-webkit-backdrop-filter` failed to trigger backdrop blur without the un-prefixed standard rule, rendering cards transparent.
- **The Permanent Fix:**
  1. Embedded a global, un-minified `<style>` block in `<head>` of `index.html` with `backdrop-filter: blur(16px) saturate(145%) !important;`. Vite copies HTML `<style>` tags directly to `dist/index.html` without running PostCSS optimizers on them.
  2. Injected explicit inline JSX styles (`style={{ backdropFilter: '...', WebkitBackdropFilter: '...' }}`) into all card components (`AuthPortal.jsx`, `Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `SignOutConfirmModal.jsx`). Inline styles in JSX are compiled as JavaScript objects and are completely immune to CSS optimizers.
  3. Configured `postcss.config.js` with `autoprefixer: { remove: false }`.
  4. Configured `vite.config.js` with `build.cssTarget: 'chrome100'`.

### 2.2 Token History & Visit Tracking
- **User Requirement:** When a patient selects a hospital/clinic, they must be able to view their complete history with that facility: total tokens taken, completed visits, rescheduled appointments, cancellations, and doctor notes.
- **Implementation:** Built the **Clinic-Wise Past History Panel** in `PatientDashboard.jsx` backed by `queueService.getPatientHistory(patientUid, clinicId)`. Added filter tabs: `All`, `Completed`, `Rescheduled`, and `Cancelled`.

### 2.3 Sign-Out Confirmation & Browser Back-Button Interception
- **User Requirement:** Clicking "Sign Out" or hitting the browser Back button should NOT abruptly eject the user to the login screen. Instead, a luxury frosted glass modal must appear asking "Are you sure you want to sign out?" in the user's selected language (English or Urdu).
- **Implementation:**
  1. Created `src/components/SignOutConfirmModal.jsx` with Framer Motion spring physics, frosted glass backdrop blur, and bilingual dictionary strings.
  2. Implemented a `popstate` listener in `PatientDashboard.jsx` and `OrgDashboard.jsx`:
     ```javascript
     window.history.pushState({ page: 'dashboard' }, '', window.location.href);
     const handlePopState = () => {
       window.history.pushState({ page: 'dashboard' }, '', window.location.href);
       setShowSignOutModal(true);
     };
     window.addEventListener('popstate', handlePopState);
     ```
  3. Updated `navigate()` calls upon login/logout to use `{ replace: true }` to eliminate infinite redirect loops.

### 2.4 Appointment Scheduling (Date + Time Slots)
- **User Requirement:** Token generation was previously time-only. The user required both specific Date selection and Time slot scheduling.
- **Implementation:** Integrated `bookingType` (`'walk-in'` vs `'appointment'`), date picker with minimum `today` constraint, and `GlassTimeScheduler.jsx` for selecting morning/afternoon appointment slots.

### 2.5 Kinetic Smooth Scrolling & Scrollbar Removal
- **User Requirement:** Browser scrolling was clunky, and scrollbars looked ugly. Scrolling needed to feel like a high-end luxury application without visible scrollbars.
- **Implementation:**
  1. Integrated **Lenis** smooth scrolling via `src/hooks/useSmoothScroll.js` with `lerp: 0.1`, `wheelMultiplier: 1.2`, and `touchMultiplier: 1.5`.
  2. Applied custom scrollbar-hiding utilities in `src/index.css` (`scrollbar-width: none; -ms-overflow-style: none; ::-webkit-scrollbar { display: none; }`).

### 2.6 Bilingual Support (English & Urdu RTL Typography)
- **User Requirement:** Full bilingual support where Urdu feels native, elegant, and perfectly readable, not broken or awkward.
- **Implementation:**
  1. Built `src/context/LanguageContext.jsx` with a comprehensive key-value translation dictionary.
  2. Added `.lang-ur` and `[dir="rtl"]` typography rules in `src/index.css` using modern platform Arabic fonts (`Noto Sans Arabic`, `IBM Plex Sans Arabic`).
  3. Dynamic layout flipping: input icons, buttons, arrows, and modals invert direction automatically when Urdu is selected.

---

## 3. System Architecture & Tech Stack

| Layer | Library / Engine | Version | Purpose in Project |
| :--- | :--- | :--- | :--- |
| **Framework** | React | `^19.2.6` | Component tree & hooks |
| **Bundler** | Vite | `^8.0.12` | HMR dev server & production bundler |
| **Styling** | Tailwind CSS (PostCSS) | `^4.3.1` | Utility styling & design tokens |
| **Routing** | React Router DOM | `^7.17.0` | Client-side routing & role guards |
| **Cloud DB & Auth** | Firebase SDK | `^12.14.0` | Realtime Database & Authentication |
| **Offline Storage** | HTML5 IndexedDB | Browser API | Local transactional database fallback |
| **3D Engine** | Three.js | `^0.184.0` | Interactive WebGL particle tube on landing stage |
| **UI Motion** | Framer Motion | `^12.40.0` | Modal springs, tab layouts, page transitions |
| **Smooth Scroll**| Lenis | `^1.3.26` | 60-120fps hardware-accelerated scroll |
| **Icons** | Lucide React | `^1.18.0` | Clean vector UI iconography |
| **QR System** | QRCode | `^1.5.4` | In-browser QR code rendering |

---

## 4. Dual-Mode Database Engine

The system contains an intelligent database abstraction layer located in `src/firebase/firebaseConfig.js` and `src/firebase/queueService.js`.

```
                    ┌──────────────────────────────────────┐
                    │       queueService API Call          │
                    └──────────────────┬───────────────────┘
                                       │
                     Does .env have valid Firebase keys?
                                ├── YES ──► Firebase Realtime Database
                                └── NO  ──► LocalDB (IndexedDB + LocalStorage)
```

### Why this matters:
- **Zero-Setup Evaluation:** Any person or AI downloading this repository can run `npm run dev` and immediately use the entire application without registering for Firebase, entering API keys, or connecting to the internet.
- **Instant Demo Accounts:**
  - **Hospital/Clinic Demo:** `clinic@demo.com` / `demo123` (City Care Hospital)
  - **Patient Demo:** `patient@demo.com` / `demo123`
- **Cross-Tab Synchronization:** When running in local mode, changes made in one browser tab (e.g. clinic calling next patient) immediately reflect in other open tabs (e.g. patient dashboard) via custom DOM events:
  ```javascript
  window.dispatchEvent(new CustomEvent('mock-db-update'));
  ```

---

## 5. Complete Codebase File Tree & Detailed Breakdown

```text
SMART QUEUE MANAGEMENT SYSTEM/
├── index.html                       # Base HTML with preload links & un-minified frosted CSS
├── package.json                     # Project manifest, dependencies, scripts, browserslist
├── postcss.config.js                # Tailwind CSS v4 & Autoprefixer (remove: false)
├── vite.config.js                   # Vite config with build.cssTarget: 'chrome100'
├── vercel.json                      # Vercel SPA route rewrite rules
├── StartApp.bat                     # Windows 1-Click launcher script
├── MASTER_PROJECT_BIBLE.md          # THIS MASTER DOCUMENT
├── PROJECT_DOCUMENTATION.md         # Secondary technical documentation guide
│
├── dist/                            # Production build bundle
├── public/
│   └── favicon.svg                  # Vector App Logo
│
└── src/
    ├── App.jsx                      # Router root, PublicGuard, RoleGuard
    ├── main.jsx                     # React 19 createRoot entry
    ├── index.css                    # Design system: .glass-acrylic-card, RTL, fonts
    │
    ├── assets/
    │   ├── dashboard_lounge.webp    # 4K clinic lounge background for dashboards
    │   ├── queue_lounge_art.webp    # Illustrated reception artwork for auth screens
    │   └── queue_lounge_art.jpg     # Fallback artwork format
    │
    ├── components/
    │   ├── GlassSelect.jsx          # Custom frosted acrylic dropdown select
    │   ├── GlassTimeScheduler.jsx   # Frosted acrylic time-slot grid selector
    │   ├── Queue3DCanvas.jsx        # Three.js interactive 3D WebGL particle tunnel
    │   ├── SignOutConfirmModal.jsx  # Bilingual frosted glass signout confirmation modal
    │   ├── SmartQueueLogo.jsx       # SVG logo with pulsing emerald crosshair
    │   ├── SplashScreen.jsx         # Branded transition splash
    │   └── TriageChatbot.jsx        # AI clinical symptom triage assistant
    │
    ├── context/
    │   ├── AuthContext.jsx          # User state, role tracking, login, signup, logout
    │   └── LanguageContext.jsx      # i18n translation dictionary (English & Urdu)
    │
    ├── firebase/
    │   ├── firebaseConfig.js        # Firebase initialization & auto mock detector
    │   └── queueService.js          # Master business API (tokens, history, clinics, supplies)
    │
    ├── hooks/
    │   └── useSmoothScroll.js       # Lenis kinetic smooth scrolling hook
    │
    ├── pages/
    │   ├── AuthPortal.jsx           # 200vw continuous stage (Welcome Hero + Login Card)
    │   ├── ForgotPassword.jsx       # Glassmorphic password recovery screen
    │   ├── Login.jsx                # Standalone Login screen
    │   ├── OrgDashboard.jsx         # Clinic Operations Desk (Queue, Depts, Inventory, Reports)
    │   ├── PatientDashboard.jsx     # Patient Board (Booking, Live ETA, History, QR, WhatsApp)
    │   ├── Register.jsx             # Dual-role signup screen (Patient vs Clinic)
    │   └── Welcome.jsx              # Standalone welcome screen
    │
    └── services/
        └── localDB.js               # HTML5 IndexedDB transactional storage engine
```

---

## 6. Data Schema & Flow Models

### 6.1 Token Object Schema
```typescript
interface Token {
  id: string;               // Unique token key (e.g. "tok_1789201948")
  tokenNumber: string;      // Formatted display number (e.g. "A-01", "B-04")
  patientId: string;        // UID of the patient
  patientName: string;      // Full name
  clinicId: string;         // Target organization UID
  department: string;       // Assigned department (e.g. "Cardiology")
  bookingType: 'walk-in' | 'appointment';
  appointmentDate?: string; // YYYY-MM-DD
  appointmentTime?: string; // e.g. "10:30 AM"
  isEmergency: boolean;     // Priority triage flag
  status: 'active' | 'serving' | 'completed' | 'skipped' | 'cancelled' | 'rescheduled';
  createdAt: number;        // Epoch timestamp
  servedAt?: number;
  completedAt?: number;
  doctorNotes?: string;
}
```

### 6.2 Organization Profile Schema
```typescript
interface OrganizationUser {
  uid: string;
  role: 'org';
  email: string;
  hospitalName: string;
  phone: string;
  address: string;
  createdAt: number;
}
```

---

## 7. Design System & Glassmorphism Standards

The application uses an **Oceanic Teal Hospital Glassmorphism** design palette:

### Key CSS Utilities (`src/index.css`):
```css
/* Master Frosted Glass Card */
.glass-acrylic-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.07) 35%, rgba(48, 85, 98, 0.38) 100%) !important;
  backdrop-filter: blur(16px) saturate(145%) !important;
  -webkit-backdrop-filter: blur(16px) saturate(145%) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.32) !important;
  box-shadow: 
    0 24px 60px -12px rgba(10, 28, 38, 0.50), 
    inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.70), 
    inset 0 -1px 1px 0 rgba(255, 255, 255, 0.15), 
    inset 0 0 45px rgba(48, 85, 98, 0.20) !important;
  transform: translateZ(0);
}

/* Glass Acrylic Pill / Buttons */
.glass-acrylic-pill {
  background: rgba(255, 255, 255, 0.12) !important;
  border: 1px solid rgba(255, 255, 255, 0.26) !important;
  box-shadow: 0 4px 14px rgba(18, 45, 55, 0.20), inset 0 1px 1px rgba(255, 255, 255, 0.40) !important;
}

/* Glass Form Inputs */
.glass-input {
  background: rgba(22, 52, 65, 0.70) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.26) !important;
  color: #ffffff !important;
}
.glass-input:focus {
  border-color: #f59e0b !important;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.25) !important;
}
```

---

## 8. How to Sync & Run This Project on Another Laptop

When you want to work on this project from a second laptop and keep all code changes continuously synchronized, you have **4 distinct options**. Here is the complete technical guide for each:

---

### Option 1: GitHub Central Remote (Recommended Industry Standard)
This is the most reliable, clean, and conflict-free method used by professional software engineering teams. Both laptops share the same GitHub repository.

#### Initial Setup on Laptop 2:
1. Open Git Bash or terminal on Laptop 2 and run:
   ```bash
   git clone https://github.com/abdulsamiuthwal-eng/SMART-QUEUE-MANAGEMENT-SYSTEM.git
   cd SMART-QUEUE-MANAGEMENT-SYSTEM
   npm install
   ```

#### Everyday Workflow (Keeping Both Laptops in Sync):
- **When finishing work on Laptop 1:**
  ```bash
  git add -A
  git commit -m "feat: description of work completed"
  git push origin main
  ```
- **When starting work on Laptop 2:**
  ```bash
  git pull origin main
  ```
- **When finishing work on Laptop 2:**
  ```bash
  git add -A
  git commit -m "feat: updates from second machine"
  git push origin main
  ```
- **Back on Laptop 1:**
  ```bash
  git pull origin main
  ```
*(Never a single file lost, full version control history preserved).*

---

### Option 2: Local Wi-Fi Network Access (`--host`)
If both laptops are in the same room or on the same Wi-Fi network, **you don't even need to copy the files to Laptop 2 to test and view it!**

1. On Laptop 1 (where the code lives), start Vite with host exposure:
   ```bash
   npm run dev -- --host
   ```
2. Vite will output two URLs:
   - `Local:   http://localhost:5174/`
   - `Network: http://192.168.x.x:5174/` (Your Laptop 1 IP)
3. On Laptop 2 (or your phone), open a browser and type that `Network:` URL.
4. Any code edit you make on Laptop 1 will instantly Hot-Reload on Laptop 2's screen in real time over Wi-Fi!

---

### Option 3: VS Code Live Share / Remote Tunnels
If you want to edit code on Laptop 2 while the files remain physically on Laptop 1:

1. In VS Code on Laptop 1, install the official **Live Share** or **VS Code Remote Tunnels** extension.
2. Click **Share** (or **Turn on Remote Tunnel Access**).
3. VS Code generates an encrypted link.
4. Open that link on Laptop 2 in VS Code or in a web browser (`vscode.dev`).
5. You can now edit code, run terminal commands, and debug collaboratively in real-time across both machines simultaneously.

---

### Option 4: Cloud Storage Sync (OneDrive / Google Drive / Syncthing)
If you place the project folder inside a shared cloud drive (e.g. OneDrive or Google Drive synced folder):
- **CRITICAL WARNING:** You **MUST exclude `node_modules` and `.git`** from cloud syncing! If OneDrive tries to sync 40,000 files in `node_modules`, it will lock files and cause build errors.
- **Best Tool for Direct Folder Mirroring:** Use **Syncthing** (free, open-source, peer-to-peer fast synchronization between two laptops) with `.stignore` containing:
  ```text
  node_modules/
  dist/
  .git/
  ```

---

## 9. Operational Commands

### Development Server:
```bash
npm run dev
# Or double click StartApp.bat on Windows
```

### Production Build:
```bash
npm run build
```

### Production Preview:
```bash
npm run preview
```

### Vercel Deployment (When authorized by user):
```bash
git push origin main
npx vercel --prod --yes
```

---

## 10. Roadmap & Next Planned Enhancements

For any incoming developer or AI agent continuing this project, here are the prioritized next features:

1. **SMS Gateway Integration:** Integrate Twilio or a local SMS API alongside the current WhatsApp generator for automated SMS queue status dispatch.
2. **Text-to-Speech (TTS) Voice Token Calling:** A voice announcement module for the hospital dashboard: *"Token A-04, please proceed to Room 2."*
3. **Interactive GPS Clinic Map:** Add a Google Maps / Leaflet view on the patient dashboard showing nearest clinics with real-time wait times.
4. **Digital PDF Prescription Attachments:** Allow doctors to upload lab results or digital prescription summaries when marking a token as completed, accessible in the patient's history.

---

*This concludes the Master Project Bible. Use this knowledge to maintain and elevate the Smart Queue Management System.*
