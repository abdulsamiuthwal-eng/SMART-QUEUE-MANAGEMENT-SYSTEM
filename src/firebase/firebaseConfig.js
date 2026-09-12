import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if variables are configured
const isFirebaseConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
  firebaseConfig.databaseURL;

let app;
let auth;
let database;
let googleProvider;
let isMockEnabled = false;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    database = getDatabase(app);
    googleProvider = new GoogleAuthProvider();
    console.log("Firebase initialized successfully.");
  } catch (error) {
    console.error("Firebase initialization failed, falling back to mock mode:", error);
    isMockEnabled = true;
  }
} else {
  console.warn("Firebase credentials missing in .env. Falling back to local simulated database mode for preview/evaluation.");
  isMockEnabled = true;
}

export { auth, database, googleProvider, isMockEnabled };
