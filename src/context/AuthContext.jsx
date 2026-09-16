import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, googleProvider, isMockEnabled } from '../firebase/firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { queueService } from '../firebase/queueService';
import { localDB } from '../services/localDB';

const AuthContext = createContext();

const MOCK_AUTH_KEY = 'smart_queue_mock_auth';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth State
  useEffect(() => {
    if (isMockEnabled) {
      const storedAuth = localStorage.getItem(MOCK_AUTH_KEY);
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        // Validate user still exists in mock DB
        queueService.getUserProfile(authData.uid).then(profile => {
          if (profile) {
            setCurrentUser({ ...authData, ...profile });
          } else {
            localStorage.removeItem(MOCK_AUTH_KEY);
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }

      // Handle external tab updates in mock mode
      const syncAuth = () => {
        const stored = localStorage.getItem(MOCK_AUTH_KEY);
        if (stored) {
          setCurrentUser(JSON.parse(stored));
        } else {
          setCurrentUser(null);
        }
      };
      window.addEventListener('mock-db-update', syncAuth);
      return () => window.removeEventListener('mock-db-update', syncAuth);
    } else {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const profile = await queueService.getUserProfile(user.uid);
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              ...profile
            });
          } catch (e) {
            console.error("Error fetching user profile:", e);
            setCurrentUser(user);
          }
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    }
  }, []);

  // 1. Patient Registration
  const registerPatient = async (name, email, phone, password) => {
    if (isMockEnabled) {
      // Check if email already exists
      const existingUser = await localDB.getUserByEmail(email);
      if (existingUser) {
        throw new Error('auth/email-already-in-use');
      }

      const uid = `patient_${Date.now()}`;
      const profile = { name, email, phone, role: 'patient', password };
      
      // Save profile to database (both IndexedDB and localStorage)
      await queueService.createUserProfile(uid, profile);
      
      // DO NOT set currentUser or MOCK_AUTH_KEY here!
      // User must be redirected to login page to authenticate explicitly!
      return { uid, email, role: 'patient', ...profile };
    } else {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const profile = { name, email, phone, role: 'patient' };
      await queueService.createUserProfile(userCredential.user.uid, profile);
      return userCredential.user;
    }
  };

  // 2. Organization Registration
  const registerOrganization = async (hospitalName, email, phone, address, password) => {
    if (isMockEnabled) {
      // Check if email already exists
      const existingUser = await localDB.getUserByEmail(email);
      if (existingUser) {
        throw new Error('auth/email-already-in-use');
      }

      const uid = `clinic_${Date.now()}`;
      const profile = { hospitalName, email, phone, address, role: 'org', password };
      
      await queueService.createUserProfile(uid, profile);
      
      // Initialize default departments for the clinic
      const mockStorage = localStorage.getItem('smart_queue_mock_db');
      if (mockStorage) {
        const db = JSON.parse(mockStorage);
        db.departments[uid] = [
          { name: 'General OPD', avgTime: 10 },
          { name: 'Emergency', avgTime: 5 }
        ];
        db.reports[uid] = { totalServed: 0, totalWaitTime: 0, totalSkipped: 0 };
        localStorage.setItem('smart_queue_mock_db', JSON.stringify(db));
      }

      // DO NOT set currentUser or MOCK_AUTH_KEY here!
      return { uid, email, role: 'org', ...profile };
    } else {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const profile = { hospitalName, email, phone, address, role: 'org' };
      await queueService.createUserProfile(userCredential.user.uid, profile);
      
      // Seed default departments on real Firebase
      await queueService.addDepartment(userCredential.user.uid, 'General OPD', 10);
      await queueService.addDepartment(userCredential.user.uid, 'Emergency', 5);
      
      return userCredential.user;
    }
  };

  // 2.1 Unified Registration function
  const register = async (userData) => {
    if (userData.role === 'org') {
      return await registerOrganization(
        userData.hospitalName || userData.name,
        userData.email,
        userData.phone,
        userData.address,
        userData.password
      );
    } else {
      return await registerPatient(
        userData.name,
        userData.email,
        userData.phone,
        userData.password
      );
    }
  };

  // 3. Login
  const login = async (email, password) => {
    if (isMockEnabled) {
      // 1. Check IndexedDB first, then localStorage
      let matchedUser = await localDB.getUserByEmail(email);

      if (!matchedUser) {
        const db = JSON.parse(localStorage.getItem('smart_queue_mock_db') || '{}');
        const users = db.users || {};
        matchedUser = Object.values(users).find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
      }
      
      if (!matchedUser) {
        // Create a quick fallback for default credential demo/testing
        if (email.toLowerCase() === 'clinic@demo.com') {
          const db = JSON.parse(localStorage.getItem('smart_queue_mock_db') || '{}');
          const users = db.users || {};
          const demoClinic = users['mock_clinic_1'] || {
            uid: 'mock_clinic_1',
            role: 'org',
            hospitalName: 'Citi Hospital (Demo)',
            email: 'clinic@demo.com',
            phone: '0300-1234567',
            address: 'Gulshan-e-Iqbal, Karachi, Pakistan'
          };
          localStorage.setItem(MOCK_AUTH_KEY, JSON.stringify(demoClinic));
          setCurrentUser(demoClinic);
          return demoClinic;
        } else if (email.toLowerCase() === 'patient@demo.com') {
          const demoPatient = {
            uid: 'mock_patient_1',
            role: 'patient',
            name: 'Ali Khan (Demo)',
            email: 'patient@demo.com',
            phone: '0312-7654321'
          };
          const db = JSON.parse(localStorage.getItem('smart_queue_mock_db') || '{}');
          db.users = db.users || {};
          db.users['mock_patient_1'] = demoPatient;
          localStorage.setItem('smart_queue_mock_db', JSON.stringify(db));
          localStorage.setItem(MOCK_AUTH_KEY, JSON.stringify(demoPatient));
          setCurrentUser(demoPatient);
          return demoPatient;
        }
        throw new Error('auth/user-not-found');
      }

      // Check password if set on user
      if (matchedUser.password && password && matchedUser.password !== password) {
        throw new Error('auth/wrong-password');
      }
      
      localStorage.setItem(MOCK_AUTH_KEY, JSON.stringify(matchedUser));
      setCurrentUser(matchedUser);
      return matchedUser;
    } else {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        let profile = await queueService.getUserProfile(userCredential.user.uid);
        if (!profile) {
          const isClinic = email.toLowerCase().includes('clinic');
          profile = isClinic
            ? {
                hospitalName: 'City Care Hospital (Demo)',
                email: 'clinic@demo.com',
                phone: '0300-1234567',
                address: 'Medical Complex, Karachi',
                role: 'org'
              }
            : {
                name: 'Ali Khan (Demo)',
                email: 'patient@demo.com',
                phone: '0312-7654321',
                role: 'patient'
              };
          await queueService.createUserProfile(userCredential.user.uid, profile);
        }
        return { ...userCredential.user, ...profile };
      } catch (authErr) {
        // If it's a demo account and doesn't exist yet on this fresh Firebase project, automatically create it!
        const isDemo = (email.toLowerCase() === 'clinic@demo.com' || email.toLowerCase() === 'patient@demo.com') && password === 'demo123';
        if (isDemo) {
          try {
            const isClinic = email.toLowerCase() === 'clinic@demo.com';
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const profile = isClinic
              ? {
                  hospitalName: 'City Care Hospital (Demo)',
                  email: 'clinic@demo.com',
                  phone: '0300-1234567',
                  address: 'Medical Complex, Karachi',
                  role: 'org'
                }
              : {
                  name: 'Ali Khan (Demo)',
                  email: 'patient@demo.com',
                  phone: '0312-7654321',
                  role: 'patient'
                };
            await queueService.createUserProfile(userCredential.user.uid, profile);
            if (isClinic) {
              await queueService.addDepartment(userCredential.user.uid, 'General OPD', 10);
              await queueService.addDepartment(userCredential.user.uid, 'Emergency', 5);
              await queueService.addDepartment(userCredential.user.uid, 'Cardiology', 15);
            }
            return { ...userCredential.user, ...profile };
          } catch (createErr) {
            console.error("Auto-provisioning demo user failed:", createErr);
            throw authErr;
          }
        }
        throw authErr;
      }
    }
  };

  // 4. Google Login
  const loginWithGoogle = async () => {
    if (isMockEnabled) {
      // Create a mock Google user (defaults to patient role)
      const uid = `google_user_${Date.now()}`;
      const profile = { 
        name: 'Google User', 
        email: 'googleuser@gmail.com', 
        phone: '0333-1234567', 
        role: 'patient' 
      };
      await queueService.createUserProfile(uid, profile);
      const sessionUser = { uid, email: profile.email, role: 'patient', ...profile };
      localStorage.setItem(MOCK_AUTH_KEY, JSON.stringify(sessionUser));
      setCurrentUser(sessionUser);
      return sessionUser;
    } else {
      const result = await signInWithPopup(auth, googleProvider);
      // Fetch or initialize profile
      let profile = await queueService.getUserProfile(result.user.uid);
      if (!profile) {
        // Default Google login to Patient role
        profile = {
          name: result.user.displayName || 'Google User',
          email: result.user.email,
          phone: result.user.phoneNumber || 'N/A',
          role: 'patient'
        };
        await queueService.createUserProfile(result.user.uid, profile);
      }
      return { ...result.user, ...profile };
    }
  };

  // 5. Logout
  const logout = async () => {
    if (isMockEnabled) {
      localStorage.removeItem(MOCK_AUTH_KEY);
      setCurrentUser(null);
      window.dispatchEvent(new CustomEvent('mock-db-update'));
    } else {
      await signOut(auth);
      setCurrentUser(null);
    }
  };

  // 6. Reset Password
  const resetPassword = async (email, newPassword) => {
    if (isMockEnabled) {
      const user = await localDB.getUserByEmail(email);
      if (!user) {
        throw new Error('auth/user-not-found');
      }

      // Update password specifically for that exact user in localDB & localStorage
      user.password = newPassword;
      await localDB.saveUser(user);

      // If this user was currently in session, update session as well
      const savedAuth = localStorage.getItem(MOCK_AUTH_KEY);
      if (savedAuth) {
        try {
          const authObj = JSON.parse(savedAuth);
          if (authObj.email && authObj.email.toLowerCase() === email.toLowerCase()) {
            authObj.password = newPassword;
            localStorage.setItem(MOCK_AUTH_KEY, JSON.stringify(authObj));
          }
        } catch (e) {}
      }

      return true;
    } else {
      await sendPasswordResetEmail(auth, email);
      return true;
    }
  };

  const value = {
    currentUser,
    register,
    registerPatient,
    registerOrganization,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    isMockEnabled
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
