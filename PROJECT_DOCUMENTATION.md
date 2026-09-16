# 🏥 SMART QUEUE MANAGEMENT SYSTEM — A to Z Master Technical & Operational Guide

> **Target Audience:** Future AI Agents, Core Software Engineers, and DevOps Maintainers.  
> **Last Updated:** September 2026  
> **Repository:** `abdulsamiuthwal-eng/SMART-QUEUE-MANAGEMENT-SYSTEM`  
> **Status:** Production-Ready & Feature Complete (with dual Cloud Firebase + Local Offline Mock runtime).

---

## 📑 Table of Contents
1. [Executive Overview & Vision](#1-executive-overview--vision)
2. [High-Level Architecture & Tech Stack](#2-high-level-architecture--tech-stack)
3. [Dual-Database Architecture (Firebase vs LocalDB)](#3-dual-database-architecture-firebase-vs-localdb)
4. [Complete File & Directory Tree](#4-complete-file--directory-tree)
5. [In-Depth File-by-File Breakdown](#5-in-depth-file-by-file-breakdown)
6. [Core Completed Features & Workflows](#6-core-completed-features--workflows)
   - [Continuous 2-Stage Auth Portal & 3D Visuals](#61-continuous-2-stage-auth-portal--3d-visuals)
   - [Patient Dashboard Experience](#62-patient-dashboard-experience)
   - [Hospital / Organization Operations Desk](#63-hospital--organization-operations-desk)
   - [Bilingual (English & Urdu) Localization & Typography](#64-bilingual-english--urdu-localization--typography)
   - [Navigation & Browser Back-Button Interception](#65-navigation--browser-back-button-interception)
7. [Luxury Design System & UI/UX Standards](#7-luxury-design-system--uiux-standards)
8. [Critical Engineering Gotchas & Production Knowledge](#8-critical-engineering-gotchas--production-knowledge)
   - [The Vercel `backdrop-filter` Minification Fix](#81-the-vercel-backdrop-filter-minification-fix)
   - [Vercel Single Page App (SPA) Rewrites](#82-vercel-single-page-app-spa-rewrites)
   - [Navigation Loop & Back-Button Protection](#83-navigation-loop--back-button-protection)
   - [Cross-Tab State Synchronization in Mock Mode](#84-cross-tab-state-synchronization-in-mock-mode)
9. [Local Development, Build & Run Guidelines](#9-local-development-build--run-guidelines)
10. [Roadmap & Pending Enhancements](#10-roadmap--pending-enhancements)

---

## 1. Executive Overview & Vision

**Smart Queue Management System** is a next-generation, real-time healthcare queue automation platform designed to eliminate waiting room congestion in hospitals, medical complexes, and private outpatient clinics.

The platform provides a dual-interface ecosystem:
1. **Patient Portal (`/patient-dashboard`):** Allows patients to view participating hospitals, book walk-in or scheduled appointments, track real-time queue position with live estimated wait times (ETAs), view past medical visit histories, receive WhatsApp alerts, scan QR code passes, and converse with an AI Triage assistant.
2. **Organization / Clinic Desk (`/org-dashboard`):** Empowers receptionists, doctors, and hospital administrators to call tokens, mark patients as served or skipped, manage departmental consultation times, manually issue tokens for walk-in patients without phones, verify patient QR tokens, manage clinical inventory/supplies with low-stock warnings, and forecast peak-hour patient flow.

---

## 2. High-Level Architecture & Tech Stack

| Layer | Technology | Version / Specification | Rationale & Description |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **React** | `v19.2.6` | Modern concurrent rendering, clean component lifecycle, and hook-based state management. |
| **Bundler & Tooling** | **Vite** | `v8.0.12` | Instant HMR development server, optimized Rolldown/esbuild production builds. |
| **Styling & CSS** | **Tailwind CSS** | `v4.3.1` (with PostCSS) | Modern CSS-first design system with hardware-accelerated frosted glass tokens. |
| **Routing** | **React Router DOM** | `v7.17.0` | Declarative client-side routing with `RoleGuard`, `PublicGuard`, and animated transitions. |
| **Realtime Cloud DB** | **Firebase Realtime Database** | `v12.14.0` | Low-latency sub-100ms WebSocket synchronization for token calling, state updates, and queue streams. |
| **Cloud Authentication**| **Firebase Auth** | `v12.14.0` | Email/Password credentials and Google OAuth Single Sign-On. |
| **Offline / Mock DB** | **HTML5 IndexedDB + LocalStorage** | Browser-native | Dual-layer zero-backend fallback allowing full system operation without any API keys or network. |
| **3D Graphics** | **Three.js** | `v0.184.0` | Custom procedural WebGL snake-curve particle tunnel on onboarding stage (`Queue3DCanvas.jsx`). |
| **Animations** | **Framer Motion** | `v12.40.0` | Modal springs, tab switchers, presence animations, and smooth component mounting. |
| **Micro-Motion** | **GSAP** | `v3.15.0` | Complex scripted animation sequences. |
| **Smooth Scrolling** | **Lenis** | `v1.3.26` | Inertia-based kinetic 60-120fps scrolling without stutter or jitter. |
| **Icons** | **Lucide React** | `v1.18.0` | Crisp, scalable vector icons across all interfaces. |
| **QR Code Engine** | **qrcode** | `v1.5.4` | In-browser SVG/Canvas QR generation for digital patient token verification. |

---

## 3. Dual-Database Architecture (Firebase vs LocalDB)

One of the most powerful architectural achievements of this codebase is its **seamless dual-mode persistence layer** implemented in `src/firebase/firebaseConfig.js` and `src/firebase/queueService.js`:

```
                           ┌───────────────────────────────┐
                           │      User / Dashboard Action  │
                           └───────────────┬───────────────┘
                                           │
                                           ▼
                           ┌───────────────────────────────┐
                           │   src/firebase/queueService   │
                           └───────────────┬───────────────┘
                                           │
                       Is Firebase configured in .env?
                                ├── YES ──► Live Firebase Realtime DB (WebSocket listeners)
                                └── NO  ──► LocalDB (HTML5 IndexedDB + LocalStorage Mirror)
```

### Mode A: Production Cloud Mode (Firebase)
- Triggered when `.env` contains valid credentials:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_DATABASE_URL`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
- Data nodes stored in Firebase:
  - `users/{uid}`: Profile data, hospital name, role (`'patient'` | `'org'`).
  - `queues/{clinicId}/{tokenId}`: Real-time tokens (`status: 'active' | 'serving' | 'completed' | 'skipped' | 'cancelled' | 'rescheduled'`).
  - `departments/{clinicId}`: Department definitions and avg consultation minutes.
  - `reports/{clinicId}`: Aggregate metrics (`totalServed`, `totalWaitTime`, `totalSkipped`).
  - `supplies/{clinicId}`: Hospital medical inventory and re-order thresholds.
  - `feedbacks/{clinicId}`: Patient star ratings and feedback reviews.

### Mode B: Zero-Config Local Offline Mock Mode
- Automatically engages if `.env` is absent, incomplete, or if Firebase credentials fail.
- **IndexedDB (`SmartQueue_DB`):** Browser-native transactional database storing users, queues, departments, and reports.
- **LocalStorage Mirror (`smart_queue_mock_db`):** Synchronous mirror allowing multi-tab browser synchronization via `window.dispatchEvent(new CustomEvent('mock-db-update'))` and the `storage` event.
- Default preloaded data:
  - Demo Clinic: `clinic@demo.com` / `demo123` (`City Care Hospital (Demo)`) with Cardiology, ENT, and General Medicine departments.
  - Demo Patient: `patient@demo.com` / `demo123`.
  - 6 Initial Medical Supplies with inventory thresholds.

---

## 4. Complete File & Directory Tree

```text
SMART QUEUE MANAGEMENT SYSTEM/
├── .env.example                     # Reference template for Firebase environment keys
├── .gitignore                       # Git exclusion rules (node_modules, dist, etc.)
├── index.html                       # Application shell with preload tags & global frosted CSS
├── package.json                     # Dependency manifests, scripts & browserslist
├── package-lock.json                # Locked dependency graph
├── postcss.config.js                # Tailwind CSS v4 & Autoprefixer configuration
├── README.md                        # Quickstart documentation
├── StartApp.bat                     # 1-Click Windows Batch launcher (launches server & browser)
├── tailwind.config.js               # Tailwind styling customizations
├── vercel.json                      # Vercel deployment SPA rewrite rules
├── vite.config.js                   # Vite configuration with esnext/chrome100 targets
│
├── dist/                            # Production build output generated by 'npm run build'
│   ├── index.html                   # Minified production HTML
│   └── assets/                      # Bundled JS, CSS, and compressed WebP artwork
│
├── public/                          # Static public assets (Favicons, manifest)
│   └── favicon.svg                  # SVG App Icon
│
└── src/
    ├── App.css                      # Root helper CSS
    ├── App.jsx                      # App root, AnimatedRoutes, and Role/Public route guards
    ├── index.css                    # Master Design System: Glass acrylic tokens, RTL & animations
    ├── main.jsx                     # React 19 root bootstrap
    │
    ├── assets/                      # High-resolution optimized imagery
    │   ├── dashboard_lounge.webp    # 4K Atmospheric clinic lounge background for dashboards
    │   ├── queue_lounge_art.webp    # Premium illustrated clinic artwork for onboarding/auth
    │   └── queue_lounge_art.jpg     # High-resolution fallback JPEG artwork
    │
    ├── components/                  # Reusable UI & Business components
    │   ├── GlassSelect.jsx          # Glassmorphic custom dropdown selector with animations
    │   ├── GlassTimeScheduler.jsx   # Frosted acrylic time-slot and appointment scheduler
    │   ├── Queue3DCanvas.jsx        # Three.js 3D WebGL particle tunnel with camera inertia
    │   ├── SignOutConfirmModal.jsx  # Bilingual frosted glass confirmation popup for logout
    │   ├── SmartQueueLogo.jsx       # Animated vector SVG logo with pulsing crosshair & gradients
    │   ├── SplashScreen.jsx         # Luxury branded hospital routing transition screen
    │   └── TriageChatbot.jsx        # Interactive AI medical symptom evaluator & triage assistant
    │
    ├── context/                     # Global React Context providers
    │   ├── AuthContext.jsx          # User authentication state, login, signup, role tracking
    │   └── LanguageContext.jsx      # Bilingual i18n dictionary (English 'en' & Urdu 'ur')
    │
    ├── firebase/                    # Database & Authentication service layer
    │   ├── firebaseConfig.js        # Firebase SDK initialization & automatic Mock Mode detector
    │   └── queueService.js          # Master data service (CRUD for tokens, clinics, supplies, stats)
    │
    ├── hooks/                       # Custom React Hooks
    │   └── useSmoothScroll.js       # Lenis smooth kinetic scrolling integration hook
    │
    ├── pages/                       # Application Views / Screens
    │   ├── AuthPortal.jsx           # Continuous 2-Stage Stage (Welcome Hero + Login Card)
    │   ├── ForgotPassword.jsx       # Password reset request screen in frosted acrylic glass
    │   ├── Login.jsx                # Standalone Login page with demo credentials
    │   ├── OrgDashboard.jsx         # Clinic / Hospital Operations Desk (Tokens, Supplies, Reports)
    │   ├── PatientDashboard.jsx     # Patient Queue Board, Token Booking, and Clinic Visit History
    │   ├── Register.jsx             # Dual-role account registration (Patient vs Hospital/Clinic)
    │   └── Welcome.jsx              # Standalone landing screen
    │
    └── services/                    # Local storage engines
        └── localDB.js               # HTML5 IndexedDB transactional storage engine
```

---

## 5. In-Depth File-by-File Breakdown

### Root Configuration
- **`index.html`**:
  Contains high-priority preload links for the 4K `.webp` lounge background images to prevent any blank screen flashes during first load. Features a dedicated, un-minified `<style>` block guaranteeing that `backdrop-filter` and `-webkit-backdrop-filter` are preserved on production builds.
- **`vite.config.js`**:
  Configures `@vitejs/plugin-react`. Defines `build.target: 'esnext'` and `build.cssTarget: 'chrome100'` ensuring modern CSS rules are not degraded.
- **`postcss.config.js`**:
  Wires `@tailwindcss/postcss` and `autoprefixer({ remove: false })`. The `remove: false` option forbids Autoprefixer from stripping standard CSS properties.
- **`vercel.json`**:
  Specifies the SPA rewrite rule `{ "source": "/(.*)", "destination": "/" }` ensuring direct routes (e.g. `/patient-dashboard`) resolve properly without 404 errors.
- **`StartApp.bat`**:
  Windows one-click launcher. Kills old port locks, checks for dependencies, launches `npm run dev`, and automatically opens the user's default browser to `http://localhost:5174`.

### State Management & Context (`src/context/`)
- **`AuthContext.jsx`**:
  Exposes `currentUser`, `login()`, `signup()`, `logout()`, and `loginWithGoogle()`. Automatically syncs user profiles from either Firebase Auth + Database or `localDB`. Saves current user sessions to `localStorage` so refreshing the browser retains authentication without flashes.
- **`LanguageContext.jsx`**:
  Manages `locale` (`'en'` or `'ur'`) and provides `t(path)` for translation lookup. Persists language preference in `localStorage('smart_queue_lang')`. Updates document HTML attributes `lang` and `dir` (`'ltr'` vs `'rtl'`) automatically.

### Data Layer (`src/firebase/` & `src/services/`)
- **`firebaseConfig.js`**:
  Initializes Firebase App, Auth, and Database. Inspects environment variables; if missing, falls back to `isMockEnabled = true`.
- **`queueService.js`**:
  The core API service of the entire system. Provides unified methods that work identically in Firebase Cloud mode and Local Offline mode:
  - `bookToken(...)`: Creates a new patient token (calculates sequential token number, status `'active'`, sets emergency flags).
  - `getLiveQueue(...)`: Real-time listener for all active tokens belonging to a clinic.
  - `updateTokenStatus(...)`: Transitions tokens between `'serving'`, `'completed'`, `'skipped'`, `'rescheduled'`, `'cancelled'`.
  - `getPatientHistory(...)`: Fetches clinic-wise past visit history for a specific patient.
  - `getOrganizations(...)`: Returns all registered hospitals/clinics.
  - `getDepartments(...)` & `addDepartment(...)`: Department management.
  - `getSupplies(...)` & `addSupply(...)`: Medical inventory tracking.
  - `submitFeedback(...)`: Patient review and rating recorder.
- **`localDB.js`**:
  Full-featured browser-native database using HTML5 IndexedDB with object stores for `users`, `queues`, `departments`, and `reports`. Includes auto-synchronization with `localStorage` for cross-tab reactivity.

### Visual & Interactive Components (`src/components/`)
- **`Queue3DCanvas.jsx`**:
  A procedural Three.js WebGL canvas featuring a luminous, swirling tube particle track with 3D glowing rings that responds to mouse cursor inertia and slides off to the left when transitioning from Welcome to Login.
- **`SignOutConfirmModal.jsx`**:
  A luxury frosted glass confirmation dialog triggered on logout and on browser Back button clicks. Fully bilingual (Urdu and English) with customizable confirm and cancel actions.
- **`SmartQueueLogo.jsx`**:
  Custom SVG emblem featuring a hospital cross blended with a glowing search magnifying crosshair and pulsing emerald telemetry indicator.
- **`TriageChatbot.jsx`**:
  AI medical triage assistant. Evaluates user symptoms (e.g. chest pain, fever, cough, toothache), categorizes emergency severity level, and automatically recommends the appropriate medical department (Cardiology, ENT, General Medicine).
- **`GlassSelect.jsx` & `GlassTimeScheduler.jsx`**:
  Custom-engineered glassmorphic dropdown and time-slot selection widgets built with frosted acrylic styling, smooth spring hover states, and keyboard accessibility.

---

## 6. Core Completed Features & Workflows

### 6.1 Continuous 2-Stage Auth Portal & 3D Visuals
- Located at `src/pages/AuthPortal.jsx`.
- Houses both the **Welcome Screen** (Stage 1) and the **Login Form** (Stage 2) in a single continuous 200vw horizontal hardware-accelerated stage track.
- Eliminates page reloading and black flashes when moving from landing to login.
- "Get Started" button initiates a smooth GPU slide transition to the login cards.
- Stage 1 features the Three.js 3D WebGL particle tunnel.
- Includes instant demo role buttons (`Patient Demo` and `Hospital / Clinic Demo`) for 1-click evaluation without typing.

### 6.2 Patient Dashboard Experience
- Located at `src/pages/PatientDashboard.jsx`.
- **Clinic Selection:** Automatically loads all available hospitals; lets the patient select their target facility.
- **Department Routing:** Displays available departments (e.g. Cardiology, ENT) with real-time average wait durations.
- **Token Booking (Walk-in vs Scheduled):** Patients can choose between immediate walk-in tokens or schedule an appointment for a specific date and time slot.
- **Priority / Emergency Triage:** An emergency toggle highlights critical patients with high-priority visual flags and elevated queue ranking.
- **Live Board & Real-Time ETA:** Displays the current token being called in the room, remaining wait time, and queue position count.
- **Rescheduling & Cancellation:** Patients can reschedule their active token to a new date/time or cancel it, updating the live queue instantly.
- **Clinic-Wise Past History Panel:** A dedicated filterable history section showing:
  - Total tokens taken at the selected clinic.
  - Status breakdown: Completed, Rescheduled, or Cancelled.
  - Doctor consultation notes and timestamps.
- **Digital QR Code Pass:** Generates a high-contrast QR pass that hospital receptionists can scan at the entrance to verify appointments.
- **Direct WhatsApp Alert Generator:** Lets patients input their WhatsApp number to receive an immediate text notification with their token number, department, and live ETA.

### 6.3 Hospital / Organization Operations Desk
- Located at `src/pages/OrgDashboard.jsx`.
- **Live Queue Operations:** Receptionists and doctors can view active queues organized by department. One-click actions:
  - `Call Next`: Advances the queue and marks the top token as `'serving'`.
  - `Serve / Complete`: Marks patient as `'completed'` and updates hospital statistics.
  - `Skip`: Skips an absent patient, moving them to skipped status.
  - `Recall`: Recalls a skipped patient back to the active queue.
  - `Emergency Insert`: Manually inserts an urgent walk-in patient at the front of the queue.
- **Manual Walk-In Token Desk:** For walk-in patients without smartphones; prints/assigns paper tokens.
- **QR Token Scanner / Verifier:** Built-in modal to scan or input patient QR tokens, verifying their validity and appointment time.
- **Department Management:** Add or delete departments and adjust average consultation times per patient.
- **Medical Inventory & Supply Tracker:** Monitors essential supplies (Syringes, Gloves, IV Fluids, Thermometers). When quantities fall below thresholds, triggers warning badges and generates a one-click WhatsApp restock order message to suppliers.
- **Analytics & Daily Reports:** Real-time counters showing total patients served, aggregate wait time saved, and average wait time per department.

### 6.4 Bilingual (English & Urdu) Localization & Typography
- Fully bilingual with zero English-only hardcoding.
- Language switcher located at the top-right of every screen.
- Switching to Urdu (`'ur'`):
  - Sets `dir="rtl"` on containers.
  - Applies platform Urdu typography (`Noto Sans Arabic`, `IBM Plex Sans Arabic`).
  - Adjusts line heights, letter-spacing, and button spacing for optimal Urdu calligraphy readability.
  - Flips arrow navigation directions and modal actions.

### 6.5 Navigation & Browser Back-Button Interception
- Dashboards implement an active `popstate` listener:
  ```javascript
  useEffect(() => {
    window.history.pushState({ page: 'dashboard' }, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState({ page: 'dashboard' }, '', window.location.href);
      setShowSignOutModal(true);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  ```
- Pressing the browser or mobile Back button intercepts navigation and displays the luxury bilingual `SignOutConfirmModal` instead of abruptly kicking the user back to the login page.
- Prevents accidental token loss and session termination.

---

## 7. Luxury Design System & UI/UX Standards

The application uses an **Oceanic Teal Hospital Glassmorphism** design language:

```css
/* Core Frosted Glass Card Standard */
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
```

### Key Visual Tokens:
1. **Oceanic Teal Base Gradient:** Combines white acrylic surface reflections (`rgba(255,255,255,0.20)`) with oceanic hospital teal tints (`rgba(48,85,98,0.38)`).
2. **Dual-Inset Specular Rim Lighting:** `inset 0 1.5px 1.5px rgba(255,255,255,0.70)` produces a 3D beveled crystal glass edge that catches ambient light.
3. **Hardware-Accelerated Compositing:** `transform: translateZ(0)` and `backface-visibility: hidden` ensure 60fps performance without GPU layout thrashing.
4. **Glass Inputs (`.glass-input`):** Deep oceanic backgrounds (`rgba(22, 52, 65, 0.70)`) with amber focus halos (`#f59e0b`). Overrides default browser autofill styling.

---

## 8. Critical Engineering Gotchas & Production Knowledge

### 8.1 The Vercel `backdrop-filter` Minification Fix
> **Critical Issue Encountered:**  
> In local development (`npm run dev`), Vite serves un-minified CSS via style injection, so `backdrop-filter: blur(16px)` rendered frosted glass properly. However, in production builds (`npm run build`), PostCSS/lightningcss stripped `backdrop-filter`, leaving only `-webkit-backdrop-filter`. In desktop Chromium browsers, this caused cards on Vercel to render completely transparent (like clear cellophane plastic) instead of frosted teal acrylic.

**The Multi-Layer Permanent Fix Applied:**
1. **`index.html` Raw Style Injector:**
   An un-minified `<style>` block was embedded directly into the `<head>` of `index.html`. Vite passes `<style>` tags in HTML directly to `dist/index.html` without running PostCSS minification on them, guaranteeing `backdrop-filter: blur(16px) saturate(145%) !important;` is always served.
2. **Inline JSX Styles:**
   Card components (`AuthPortal.jsx`, `Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `SignOutConfirmModal.jsx`) have explicit inline styles:
   ```jsx
   style={{ backdropFilter: 'blur(16px) saturate(145%)', WebkitBackdropFilter: 'blur(16px) saturate(145%)' }}
   ```
   Inline JSX style objects are compiled as JavaScript and are completely immune to CSS optimizers.
3. **`postcss.config.js`:**
   Configured `autoprefixer: { remove: false }` to forbid the removal of standard CSS properties.
4. **`vite.config.js`:**
   Set `build.cssTarget: 'chrome100'` to prevent legacy downward transpilation of modern CSS.

### 8.2 Vercel Single Page App (SPA) Rewrites
In `vercel.json`:
```json
{
  "name": "smartqueue-healthcare",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```
Without this configuration, hard-refreshing `/patient-dashboard` or `/org-dashboard` on Vercel returns an HTTP 404 error because the static server looks for a physical directory rather than delegating to `index.html`.

### 8.3 Navigation Loop & Back-Button Protection
- When navigating upon login or splash screen completion, use `{ replace: true }`:
  ```javascript
  navigate(destPath, { replace: true });
  ```
  This replaces the auth entry in browser history, preventing users from getting trapped in infinite login/dashboard redirect loops when pressing Back.

### 8.4 Cross-Tab State Synchronization in Mock Mode
When running without Firebase, the system uses custom DOM events and the browser `storage` event to sync data across different tabs:
```javascript
window.dispatchEvent(new CustomEvent('mock-db-update'));
```
If an organization marks a token as served in Tab A, Tab B (Patient Dashboard) receives the event and updates its live board in real-time.

---

## 9. Local Development, Build & Run Guidelines

### Prerequisites
- Node.js `v18.0+` (Node.js `v20+` or `v24+` recommended).
- npm `v9+` or `v10+`.

### Quickstart Commands

```bash
# 1. Clone or navigate to the repository
cd "c:\Users\abdul\Desktop\SMART QUEUE MANAGEMENT SYSTEM"

# 2. Install dependencies
npm install

# 3. Start local development server (or double click StartApp.bat on Windows)
npm run dev

# 4. Build for production
npm run build

# 5. Preview production build locally
npm run preview
```

### Windows 1-Click Launch
Double-click `StartApp.bat` in the root folder. It will:
- Terminate stale node processes on port 5174/5173.
- Verify node_modules.
- Launch the dev server.
- Open the application in Google Chrome or your default browser.

---

## 10. Roadmap & Pending Enhancements

For any incoming software engineer or AI agent looking to extend the system, here are the prioritized next milestones:

1. **SMS Gateway Integration (Twilio / Africa's Talking / Local Telco):**
   Complement the existing WhatsApp alert generator with automated SMS triggers for patients without WhatsApp.
2. **Text-to-Speech (TTS) Voice Announcement:**
   A voice module for the Organization Dashboard that speaks out called tokens over waiting room speakers:  
   *e.g. "Token number A-12, please proceed to Room 3."*
3. **Geospatial Clinic Discovery (Map View):**
   Add a Google Maps / Leaflet interactive map to the Patient Dashboard showing nearby hospitals with live waiting times based on the patient's GPS coordinates.
4. **Digital E-Prescription & Lab Attachment:**
   Allow organizations to attach digital PDF prescriptions or lab test orders to a token upon marking it `'completed'`, enabling patients to download it from their visit history.

---

*End of Project Master Documentation — Prepared for seamless agent handoff.*
