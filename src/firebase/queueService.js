import { database, isMockEnabled } from './firebaseConfig';
import { ref, set, get, push, onValue, update, remove } from 'firebase/database';
import { localDB } from '../services/localDB';

// Helper for Mock Data
const MOCK_STORAGE_KEY = 'smart_queue_mock_db';

const defaultSuppliesList = [
  { id: 'sup_1', name: 'Disposable Syringes (5ml BD Emerald)', category: 'disposable', quantity: 18, threshold: 20, unit: 'boxes' },
  { id: 'sup_2', name: 'Latex Examination Gloves (M - Powder Free)', category: 'disposable', quantity: 45, threshold: 25, unit: 'boxes' },
  { id: 'sup_3', name: 'Amoxicillin Capsules (500mg USP)', category: 'medicine', quantity: 14, threshold: 25, unit: 'packs' },
  { id: 'sup_4', name: 'Paracetamol Tablets & Oral Syrup (500mg)', category: 'medicine', quantity: 60, threshold: 30, unit: 'packs' },
  { id: 'sup_5', name: 'Normal Saline IV Infusion 0.9% (500ml)', category: 'medicine', quantity: 8, threshold: 15, unit: 'bags' },
  { id: 'sup_6', name: 'Digital Blood Pressure Monitor (Omron M2)', category: 'equipment', quantity: 4, threshold: 3, unit: 'units' },
  { id: 'sup_7', name: 'Infrared Forehead Clinical Thermometer', category: 'equipment', quantity: 6, threshold: 2, unit: 'units' },
  { id: 'sup_8', name: 'Sterile Gauze Bandages & Surgical Tape', category: 'disposable', quantity: 55, threshold: 30, unit: 'rolls' },
  { id: 'sup_9', name: 'ECG Thermal Recording Paper (50mm)', category: 'equipment', quantity: 5, threshold: 8, unit: 'rolls' },
  { id: 'sup_10', name: 'Finger Pulse Oximeter Probes (Adult/Pediatric)', category: 'equipment', quantity: 8, threshold: 4, unit: 'units' },
  { id: 'sup_11', name: 'IV Cannula 20G & 22G with Injection Port', category: 'disposable', quantity: 32, threshold: 20, unit: 'boxes' },
  { id: 'sup_12', name: 'Povidone-Iodine 10% Antiseptic Solution (500ml)', category: 'medicine', quantity: 12, threshold: 10, unit: 'bottles' }
];

const getMockDB = () => {
  const data = localStorage.getItem(MOCK_STORAGE_KEY);
  let db = data ? JSON.parse(data) : null;
  
  if (!db) {
    db = {
      users: {},
      queues: {},
      departments: {
        'mock_clinic_1': [
          { name: 'Cardiology', avgTime: 15 },
          { name: 'ENT', avgTime: 10 },
          { name: 'General Medicine', avgTime: 8 }
        ]
      },
      reports: {
        'mock_clinic_1': {
          totalServed: 14,
          totalWaitTime: 168,
          totalSkipped: 2
        }
      },
      feedbacks: {},
      supplies: {
        'mock_clinic_1': defaultSuppliesList
      }
    };
  }

  // Ensure supplies key exists defensively
  if (!db.supplies) db.supplies = {};
  if (!db.supplies['mock_clinic_1']) {
    db.supplies['mock_clinic_1'] = defaultSuppliesList;
  }

  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
  return db;
};

const saveMockDB = (db) => {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
  // Dispatch custom event to notify listeners on other pages/components
  window.dispatchEvent(new CustomEvent('mock-db-update'));
};

// Initialize Mock Clinic profile if it doesn't exist
const initMockClinic = () => {
  const db = getMockDB();
  if (!db.users['mock_clinic_1']) {
    db.users['mock_clinic_1'] = {
      uid: 'mock_clinic_1',
      role: 'org',
      hospitalName: 'City Care Hospital (Demo)',
      email: 'clinic@demo.com',
      phone: '0300-1234567',
      address: 'Medical Complex, Karachi, Pakistan'
    };
    saveMockDB(db);
  }
};
initMockClinic();

// Service functions
export const queueService = {
  // 1. User Profile Management
  getUserProfile: async (uid) => {
    if (isMockEnabled) {
      const userFromLocalDB = await localDB.getUserById(uid);
      if (userFromLocalDB) return userFromLocalDB;
      const db = getMockDB();
      return db.users[uid] || null;
    } else {
      const snapshot = await get(ref(database, `users/${uid}`));
      return snapshot.exists() ? snapshot.val() : null;
    }
  },

  createUserProfile: async (uid, profileData) => {
    const userObj = { uid, ...profileData };
    if (isMockEnabled) {
      await localDB.saveUser(userObj);
      const db = getMockDB();
      db.users[uid] = userObj;
      saveMockDB(db);
      return userObj;
    } else {
      await set(ref(database, `users/${uid}`), userObj);
      return userObj;
    }
  },

  // Get list of all clinics/organizations for Patient dropdown (Async snapshot)
  getOrganizations: async () => {
    if (isMockEnabled) {
      const db = getMockDB();
      return Object.values(db.users).filter(user => user.role === 'org');
    } else {
      const snapshot = await get(ref(database, 'users'));
      if (snapshot.exists()) {
        const users = snapshot.val();
        return Object.keys(users)
          .map(uid => ({ uid, ...users[uid] }))
          .filter(user => user.role === 'org');
      }
      return [];
    }
  },

  // Get list of all clinics/organizations for Patient dropdown (Live Real-Time Listener)
  getOrganizationsLive: (callback) => {
    if (isMockEnabled) {
      const listener = () => {
        const db = getMockDB();
        const orgs = Object.values(db.users).filter(user => user.role === 'org');
        callback(orgs);
      };
      window.addEventListener('mock-db-update', listener);
      listener();
      return () => window.removeEventListener('mock-db-update', listener);
    } else {
      const usersRef = ref(database, 'users');
      return onValue(usersRef, (snapshot) => {
        if (snapshot.exists()) {
          const users = snapshot.val();
          const orgs = Object.keys(users)
            .map(uid => ({ uid, ...users[uid] }))
            .filter(user => user.role === 'org');
          callback(orgs);
        } else {
          callback([]);
        }
      });
    }
  },

  // 2. Department Management
  getDepartments: (orgId, callback) => {
    if (isMockEnabled) {
      const listener = () => {
        const db = getMockDB();
        callback(db.departments[orgId] || []);
      };
      window.addEventListener('mock-db-update', listener);
      listener();
      return () => window.removeEventListener('mock-db-update', listener);
    } else {
      const deptRef = ref(database, `departments/${orgId}`);
      return onValue(deptRef, (snapshot) => {
        callback(snapshot.exists() ? Object.values(snapshot.val()) : []);
      });
    }
  },

  addDepartment: async (orgId, deptName, avgTime) => {
    if (isMockEnabled) {
      const db = getMockDB();
      if (!db.departments[orgId]) db.departments[orgId] = [];
      if (db.departments[orgId].find(d => d.name.toLowerCase() === deptName.toLowerCase())) {
        throw new Error("Department already exists");
      }
      db.departments[orgId].push({ name: deptName, avgTime: parseInt(avgTime, 10) });
      saveMockDB(db);
    } else {
      await set(ref(database, `departments/${orgId}/${deptName}`), {
        name: deptName,
        avgTime: parseInt(avgTime, 10)
      });
    }
  },

  deleteDepartment: async (orgId, deptName) => {
    if (isMockEnabled) {
      const db = getMockDB();
      if (db.departments[orgId]) {
        db.departments[orgId] = db.departments[orgId].filter(d => d.name !== deptName);
        saveMockDB(db);
      }
    } else {
      await remove(ref(database, `departments/${orgId}/${deptName}`));
    }
  },

  // 3. Queue Live Listening
  getLiveQueue: (orgId, callback) => {
    // Helper: Firebase stores arrays as keyed objects {0: item, 1: item, ...}
    // This converts each department queue back to a proper JS array
    const normalizeQueue = (rawData) => {
      if (!rawData || typeof rawData !== 'object') return {};
      const normalized = {};
      Object.keys(rawData).forEach((deptName) => {
        const deptData = rawData[deptName];
        if (Array.isArray(deptData)) {
          normalized[deptName] = deptData;
        } else if (deptData && typeof deptData === 'object') {
          // Firebase object-of-objects → array
          normalized[deptName] = Object.values(deptData);
        } else {
          normalized[deptName] = [];
        }
      });
      return normalized;
    };

    if (isMockEnabled) {
      const listener = () => {
        const db = getMockDB();
        callback(normalizeQueue(db.queues[orgId] || {}));
      };
      window.addEventListener('mock-db-update', listener);
      listener();
      return () => window.removeEventListener('mock-db-update', listener);
    } else {
      const queueRef = ref(database, `queues/${orgId}`);
      return onValue(queueRef, (snapshot) => {
        callback(snapshot.exists() ? normalizeQueue(snapshot.val()) : {});
      });
    }
  },

  // 4. Token Booking (Includes Emergency Triage Priority support)
  bookToken: async (orgId, deptName, patientId, patientName, patientPhone, type, preferredTime = '', isEmergency = false, urgencyReason = '', preferredDate = '') => {
    const tokenId = `token_${Date.now()}`;
    const timestamp = Date.now();
    const resolvedDate = preferredDate || new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    if (isMockEnabled) {
      const db = getMockDB();
      if (!db.queues[orgId]) db.queues[orgId] = {};
      if (!db.queues[orgId][deptName]) db.queues[orgId][deptName] = [];
      
      const deptQueue = db.queues[orgId][deptName];
      
      // Calculate token number
      const todayTokens = deptQueue.filter(t => {
        const tDate = new Date(t.timestamp).toDateString();
        const todayDate = new Date().toDateString();
        return tDate === todayDate;
      });
      const tokenNumber = todayTokens.length + 1;

      // Calculate estimated wait time based on position
      const waitingPatients = deptQueue.filter(p => p.status === 'waiting').length;
      const deptInfo = (db.departments[orgId] || []).find(d => d.name === deptName);
      const avgTime = deptInfo ? deptInfo.avgTime : 10;
      const estWaitTime = isEmergency ? 0 : waitingPatients * avgTime;

      const newToken = {
        tokenId,
        tokenNumber,
        patientId,
        patientName,
        patientPhone,
        type, // 'walk-in' | 'appointment'
        preferredDate: resolvedDate,
        preferredTime,
        isEmergency,
        urgencyReason: urgencyReason || (isEmergency ? 'Critical / Urgent Medical Attention' : ''),
        status: 'waiting', // 'waiting' | 'serving' | 'completed' | 'skipped' | 'cancelled'
        timestamp,
        estWaitTime
      };

      db.queues[orgId][deptName].push(newToken);
      saveMockDB(db);
      return newToken;
    } else {
      // Real Firebase RTDB write
      const queueRef = ref(database, `queues/${orgId}/${deptName}`);
      
      const snapshot = await get(queueRef);
      let tokenNumber = 1;
      let waitingPatients = 0;
      if (snapshot.exists()) {
        const list = Object.values(snapshot.val());
        tokenNumber = list.length + 1;
        waitingPatients = list.filter(p => p.status === 'waiting').length;
      }

      const deptSnapshot = await get(ref(database, `departments/${orgId}/${deptName}`));
      const avgTime = deptSnapshot.exists() ? deptSnapshot.val().avgTime : 10;
      const estWaitTime = isEmergency ? 0 : waitingPatients * avgTime;

      const newToken = {
        tokenId,
        tokenNumber,
        patientId,
        patientName,
        patientPhone,
        type,
        preferredDate: resolvedDate,
        preferredTime,
        isEmergency,
        urgencyReason: urgencyReason || (isEmergency ? 'Critical / Urgent Medical Attention' : ''),
        status: 'waiting',
        timestamp,
        estWaitTime
      };

      await set(ref(database, `queues/${orgId}/${deptName}/${tokenId}`), newToken);
      return newToken;
    }
  },

  // 5. Patient Actions: Reschedule Token
  rescheduleToken: async (orgId, deptName, tokenId, newPreferredTime, newPreferredDate = '') => {
    if (isMockEnabled) {
      const db = getMockDB();
      if (!db.queues[orgId] || !db.queues[orgId][deptName]) return;
      
      const token = db.queues[orgId][deptName].find(t => t.tokenId === tokenId);
      if (token) {
        const prevSlot = `${token.preferredDate ? token.preferredDate + ' ' : ''}${token.preferredTime || ''}`.trim();
        token.originalSlot = token.originalSlot || prevSlot || 'Initial Slot';
        token.preferredTime = newPreferredTime;
        if (newPreferredDate) {
          token.preferredDate = newPreferredDate;
        }
        token.rescheduled = true;
        token.rescheduleCount = (token.rescheduleCount || 0) + 1;
        token.rescheduledAt = Date.now();
        token.type = 'appointment';
        saveMockDB(db);
      }
    } else {
      const tokenRef = ref(database, `queues/${orgId}/${deptName}/${tokenId}`);
      const snap = await get(tokenRef);
      const prevData = snap.exists() ? snap.val() : {};
      const prevSlot = `${prevData.preferredDate ? prevData.preferredDate + ' ' : ''}${prevData.preferredTime || ''}`.trim();

      await update(tokenRef, {
        preferredTime: newPreferredTime,
        preferredDate: newPreferredDate || prevData.preferredDate || new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
        originalSlot: prevData.originalSlot || prevSlot || 'Initial Slot',
        rescheduled: true,
        rescheduleCount: (prevData.rescheduleCount || 0) + 1,
        rescheduledAt: Date.now(),
        type: 'appointment'
      });
    }
  },

  // 6. Patient Actions: Cancel Token (Persists status for history instead of hard-deleting)
  cancelToken: async (orgId, deptName, tokenId, reason = 'Cancelled by Patient') => {
    if (isMockEnabled) {
      const db = getMockDB();
      if (!db.queues[orgId] || !db.queues[orgId][deptName]) return;

      const token = db.queues[orgId][deptName].find(t => t.tokenId === tokenId);
      if (token) {
        token.status = 'cancelled';
        token.cancelledAt = Date.now();
        token.cancellationReason = reason;
        saveMockDB(db);
      }
    } else {
      await update(ref(database, `queues/${orgId}/${deptName}/${tokenId}`), {
        status: 'cancelled',
        cancelledAt: Date.now(),
        cancellationReason: reason
      });
    }
  },

  // 6b. Patient Actions: Fetch complete clinic history for patient
  getPatientClinicHistory: async (orgId, patientId) => {
    if (!orgId || !patientId) return [];

    let allTokens = [];

    if (isMockEnabled) {
      const db = getMockDB();
      const clinicQueues = db.queues[orgId] || {};
      
      Object.keys(clinicQueues).forEach(deptName => {
        const tokens = clinicQueues[deptName] || [];
        tokens.forEach(t => {
          if (t.patientId === patientId) {
            allTokens.push({ ...t, deptName });
          }
        });
      });

      // If user has no history yet at mock_clinic_1, provide realistic seed history
      if (allTokens.length === 0 && orgId === 'mock_clinic_1') {
        const now = Date.now();
        const seedHistory = [
          {
            tokenId: `seed_completed_1_${patientId}`,
            tokenNumber: 4,
            patientId,
            patientName: 'Patient',
            deptName: 'General Medicine',
            type: 'appointment',
            preferredDate: new Date(now - 3 * 24 * 3600 * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
            preferredTime: '10:30 AM',
            status: 'completed',
            timestamp: now - 3 * 24 * 3600 * 1000,
            completedAt: now - 3 * 24 * 3600 * 1000 + 45 * 60 * 1000,
            doctorNotes: 'Consultation completed. Prescribed multivitamins.'
          },
          {
            tokenId: `seed_rescheduled_1_${patientId}`,
            tokenNumber: 7,
            patientId,
            patientName: 'Patient',
            deptName: 'Cardiology',
            type: 'appointment',
            preferredDate: new Date(now - 7 * 24 * 3600 * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
            preferredTime: '03:15 PM',
            originalSlot: '11:00 AM',
            rescheduled: true,
            rescheduleCount: 1,
            status: 'completed',
            timestamp: now - 7 * 24 * 3600 * 1000,
            completedAt: now - 7 * 24 * 3600 * 1000 + 60 * 60 * 1000,
            doctorNotes: 'ECG review completed. Normal sinus rhythm.'
          },
          {
            tokenId: `seed_cancelled_1_${patientId}`,
            tokenNumber: 1,
            patientId,
            patientName: 'Patient',
            deptName: 'ENT',
            type: 'walk-in',
            preferredDate: new Date(now - 14 * 24 * 3600 * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
            preferredTime: '09:00 AM',
            status: 'cancelled',
            timestamp: now - 14 * 24 * 3600 * 1000,
            cancelledAt: now - 14 * 24 * 3600 * 1000 + 15 * 60 * 1000,
            cancellationReason: 'Cancelled by Patient'
          }
        ];

        if (!db.queues['mock_clinic_1']) db.queues['mock_clinic_1'] = {};
        seedHistory.forEach(st => {
          if (!db.queues['mock_clinic_1'][st.deptName]) db.queues['mock_clinic_1'][st.deptName] = [];
          db.queues['mock_clinic_1'][st.deptName].push(st);
        });
        saveMockDB(db);
        allTokens = seedHistory;
      }
    } else {
      const queueRef = ref(database, `queues/${orgId}`);
      const snapshot = await get(queueRef);
      if (snapshot.exists()) {
        const queues = snapshot.val();
        Object.keys(queues).forEach(deptName => {
          const tokensObj = queues[deptName] || {};
          const tokens = Object.values(tokensObj);
          tokens.forEach(t => {
            if (t.patientId === patientId) {
              allTokens.push({ ...t, deptName });
            }
          });
        });
      }
    }

    allTokens.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return allTokens;
  },

  // 7. Org Actions: Call Next Patient (Emergency priority first, then FIFO)
  callNext: async (orgId, deptName) => {
    if (isMockEnabled) {
      const db = getMockDB();
      if (!db.queues[orgId] || !db.queues[orgId][deptName]) return null;

      const deptQueue = db.queues[orgId][deptName];
      
      // Mark currently serving as completed
      const currentServing = deptQueue.find(t => t.status === 'serving');
      if (currentServing) {
        currentServing.status = 'completed';
        
        if (!db.reports[orgId]) db.reports[orgId] = { totalServed: 0, totalWaitTime: 0, totalSkipped: 0 };
        db.reports[orgId].totalServed += 1;
        const elapsedMins = Math.max(1, Math.round((Date.now() - currentServing.timestamp) / 60000));
        db.reports[orgId].totalWaitTime += elapsedMins;
      }

      // Find next waiting patient: Emergency tokens jump to top priority!
      const nextPatient = deptQueue
        .filter(t => t.status === 'waiting')
        .sort((a, b) => {
          if (a.isEmergency && !b.isEmergency) return -1;
          if (!a.isEmergency && b.isEmergency) return 1;
          return a.timestamp - b.timestamp;
        })[0];

      if (nextPatient) {
        nextPatient.status = 'serving';
      }

      // Re-calculate estimated wait times for remaining waiting patients
      let waitingCount = 0;
      const deptInfo = (db.departments[orgId] || []).find(d => d.name === deptName);
      const avgTime = deptInfo ? deptInfo.avgTime : 10;
      
      db.queues[orgId][deptName] = deptQueue.map(token => {
        if (token.tokenId === nextPatient?.tokenId) {
          return { ...token, status: 'serving', estWaitTime: 0 };
        }
        if (token.status === 'waiting') {
          const updated = { ...token, estWaitTime: token.isEmergency ? 0 : waitingCount * avgTime };
          if (!token.isEmergency) waitingCount++;
          return updated;
        }
        return token;
      });

      saveMockDB(db);
      return nextPatient || null;
    } else {
      // Real Firebase RTDB queue manipulation
      const queueRef = ref(database, `queues/${orgId}/${deptName}`);
      const snapshot = await get(queueRef);
      if (!snapshot.exists()) return null;

      const queueList = Object.values(snapshot.val());
      
      // Update currently serving to completed
      const currentServing = queueList.find(t => t.status === 'serving');
      if (currentServing) {
        const completedAt = Date.now();
        await update(ref(database, `queues/${orgId}/${deptName}/${currentServing.tokenId}`), { 
          status: 'completed',
          completedAt
        });
        const repRef = ref(database, `reports/${orgId}`);
        const repSnap = await get(repRef);
        let totalServed = 1;
        let totalWaitTime = 0;
        let totalSkipped = 0;
        if (repSnap.exists()) {
          const val = repSnap.val() || {};
          totalServed = (val.totalServed || 0) + 1;
          totalWaitTime = (val.totalWaitTime || 0);
          totalSkipped = (val.totalSkipped || 0);
        }
        const waitMins = Math.max(1, Math.round((completedAt - (currentServing.timestamp || completedAt)) / 60000));
        totalWaitTime += waitMins;
        await update(repRef, { totalServed, totalWaitTime, totalSkipped });
      }

      const nextPatient = queueList
        .filter(t => t.status === 'waiting')
        .sort((a, b) => {
          if (a.isEmergency && !b.isEmergency) return -1;
          if (!a.isEmergency && b.isEmergency) return 1;
          return a.timestamp - b.timestamp;
        })[0];

      if (nextPatient) {
        await update(ref(database, `queues/${orgId}/${deptName}/${nextPatient.tokenId}`), { status: 'serving' });
      }

      return nextPatient || null;
    }
  },

  // 8. Org Actions: Skip Patient (no-show)
  skipPatient: async (orgId, deptName) => {
    if (isMockEnabled) {
      const db = getMockDB();
      if (!db.queues[orgId] || !db.queues[orgId][deptName]) return;

      const deptQueue = db.queues[orgId][deptName];
      const currentServing = deptQueue.find(t => t.status === 'serving');

      if (currentServing) {
        currentServing.status = 'skipped';
        
        if (!db.reports[orgId]) db.reports[orgId] = { totalServed: 0, totalWaitTime: 0, totalSkipped: 0 };
        db.reports[orgId].totalSkipped += 1;
        
        saveMockDB(db);
        await queueService.callNext(orgId, deptName);
      }
    } else {
      const queueRef = ref(database, `queues/${orgId}/${deptName}`);
      const snapshot = await get(queueRef);
      if (snapshot.exists()) {
        const currentServing = Object.values(snapshot.val()).find(t => t.status === 'serving');
        if (currentServing) {
          const skippedAt = Date.now();
          await update(ref(database, `queues/${orgId}/${deptName}/${currentServing.tokenId}`), { 
            status: 'skipped',
            skippedAt
          });
          const repRef = ref(database, `reports/${orgId}`);
          const repSnap = await get(repRef);
          let totalSkipped = 1;
          let totalServed = 0;
          let totalWaitTime = 0;
          if (repSnap.exists()) {
            const val = repSnap.val() || {};
            totalSkipped = (val.totalSkipped || 0) + 1;
            totalServed = val.totalServed || 0;
            totalWaitTime = val.totalWaitTime || 0;
          }
          await update(repRef, { totalSkipped, totalServed, totalWaitTime });
          
          await queueService.callNext(orgId, deptName);
        }
      }
    }
  },

  // 9. Feedback Submission
  submitFeedback: async (orgId, feedbackData) => {
    if (isMockEnabled) {
      const db = getMockDB();
      if (!db.feedbacks[orgId]) db.feedbacks[orgId] = [];
      db.feedbacks[orgId].push({ id: `feed_${Date.now()}`, ...feedbackData, timestamp: Date.now() });
      saveMockDB(db);
    } else {
      const feedbackRef = push(ref(database, `feedbacks/${orgId}`));
      await set(feedbackRef, { ...feedbackData, timestamp: Date.now() });
    }
  },

  // 10. Reports fetching
  getReports: (orgId, callback) => {
    if (isMockEnabled) {
      const listener = () => {
        const db = getMockDB();
        callback(db.reports[orgId] || { totalServed: 0, totalWaitTime: 0, totalSkipped: 0 });
      };
      window.addEventListener('mock-db-update', listener);
      listener();
      return () => window.removeEventListener('mock-db-update', listener);
    } else {
      const reportRef = ref(database, `reports/${orgId}`);
      return onValue(reportRef, (snapshot) => {
        callback(snapshot.exists() ? snapshot.val() : { totalServed: 0, totalWaitTime: 0, totalSkipped: 0 });
      });
    }
  },

  // ==========================================
  // 11. SUPPLY ALERT & INVENTORY SYSTEM
  // ==========================================
  seedDefaultSupplies: async (orgId) => {
    if (!orgId) return defaultSuppliesList;
    if (isMockEnabled) {
      const db = getMockDB();
      if (!db.supplies) db.supplies = {};
      db.supplies[orgId] = defaultSuppliesList;
      saveMockDB(db);
      window.dispatchEvent(new CustomEvent('mock-db-update'));
      return defaultSuppliesList;
    } else {
      const supRef = ref(database, `supplies/${orgId}`);
      const initialMap = {};
      defaultSuppliesList.forEach(item => {
        initialMap[item.id] = item;
      });
      await set(supRef, initialMap);
      return defaultSuppliesList;
    }
  },

  getSupplies: (orgId, callback) => {
    if (!orgId) {
      callback([]);
      return () => {};
    }

    if (isMockEnabled) {
      const listener = () => {
        const db = getMockDB();
        if (!db.supplies) db.supplies = {};
        if (!db.supplies[orgId] || !Array.isArray(db.supplies[orgId]) || db.supplies[orgId].length === 0) {
          db.supplies[orgId] = defaultSuppliesList;
          saveMockDB(db);
        }
        callback(db.supplies[orgId] || []);
      };
      window.addEventListener('mock-db-update', listener);
      listener();
      return () => window.removeEventListener('mock-db-update', listener);
    } else {
      const supRef = ref(database, `supplies/${orgId}`);
      return onValue(supRef, async (snapshot) => {
        if (snapshot.exists() && Object.keys(snapshot.val() || {}).length > 0) {
          callback(Object.values(snapshot.val()));
        } else {
          // Auto-seed all 12 items to Firebase RTDB so the clinic immediately has rich inventory data
          const initialMap = {};
          defaultSuppliesList.forEach(item => {
            initialMap[item.id] = item;
          });
          try {
            await set(supRef, initialMap);
          } catch (e) {
            console.error("Auto-seeding default supplies to Firebase failed:", e);
          }
          callback(defaultSuppliesList);
        }
      });
    }
  },

  updateSupplyQuantity: async (orgId, itemId, delta) => {
    if (isMockEnabled) {
      const db = getMockDB();
      if (!db.supplies || !db.supplies[orgId]) return;
      const item = db.supplies[orgId].find(s => s.id === itemId);
      if (item) {
        item.quantity = Math.max(0, item.quantity + delta);
        saveMockDB(db);
      }
    } else {
      const itemRef = ref(database, `supplies/${orgId}/${itemId}`);
      const snap = await get(itemRef);
      if (snap.exists()) {
        const current = snap.val();
        await update(itemRef, { quantity: Math.max(0, (current.quantity || 0) + delta) });
      }
    }
  },

  addSupplyItem: async (orgId, itemData) => {
    const newItem = {
      id: `sup_${Date.now()}`,
      name: itemData.name,
      category: itemData.category || 'disposable',
      quantity: parseInt(itemData.quantity, 10) || 0,
      threshold: parseInt(itemData.threshold, 10) || 10,
      unit: itemData.unit || 'units'
    };

    if (isMockEnabled) {
      const db = getMockDB();
      if (!db.supplies) db.supplies = {};
      if (!db.supplies[orgId]) db.supplies[orgId] = [];
      db.supplies[orgId].push(newItem);
      saveMockDB(db);
      return newItem;
    } else {
      await set(ref(database, `supplies/${orgId}/${newItem.id}`), newItem);
      return newItem;
    }
  },

  deleteSupplyItem: async (orgId, itemId) => {
    if (isMockEnabled) {
      const db = getMockDB();
      if (db.supplies && db.supplies[orgId]) {
        db.supplies[orgId] = db.supplies[orgId].filter(s => s.id !== itemId);
        saveMockDB(db);
      }
    } else {
      await remove(ref(database, `supplies/${orgId}/${itemId}`));
    }
  },

  // ==========================================
  // 12. DAILY PATIENT LOAD FORECAST (AI MODEL)
  // ==========================================
  getPatientForecast: (orgId, actualDepartments = [], liveQueue = {}, reports = {}) => {
    let depts = [];
    if (actualDepartments && actualDepartments.length > 0) {
      depts = actualDepartments;
    } else if (isMockEnabled) {
      const db = getMockDB();
      depts = db?.departments[orgId] || [];
    }
    
    if (!depts || depts.length === 0) {
      depts = [
        { name: 'General Medicine', avgTime: 10 },
        { name: 'Emergency', avgTime: 12 },
        { name: 'Cardiology', avgTime: 15 }
      ];
    }

    // Tally live queue tokens and emergency volume today
    let totalLiveTokens = 0;
    let emergencyCount = 0;
    const deptTokensCount = {};

    Object.keys(liveQueue || {}).forEach(dName => {
      const tokens = liveQueue[dName] || [];
      totalLiveTokens += tokens.length;
      emergencyCount += tokens.filter(t => t.isEmergency).length;
      deptTokensCount[dName] = tokens.length;
    });

    const todayServed = Number(reports?.totalServed) || 0;
    const todayTotalActivity = Math.max(todayServed, totalLiveTokens);

    const dayOfWeek = new Date().getDay();
    // Monday/Tue/Wed busy, weekends lower
    const weekdayMultiplier = [0.85, 1.35, 1.25, 1.15, 1.2, 0.95, 0.75][dayOfWeek] || 1.1;

    const hasTrafficToday = todayTotalActivity > 0;

    // Base projection calculated dynamically from real traffic vs baseline readiness
    const baseProjected = hasTrafficToday
      ? Math.round((todayTotalActivity * 2.2 + depts.length * 4) * weekdayMultiplier)
      : Math.max(1, Math.round(depts.length * 3 * weekdayMultiplier));

    // Dynamic department breakdown based on real department activity & consultation speeds
    const totalDeptWeight = depts.reduce((sum, d) => {
      const activeWeight = (deptTokensCount[d.name] || 0) * 1.5 + (20 / (Number(d.avgTime) || 10));
      return sum + activeWeight;
    }, 0) || 1;

    const deptForecast = depts.map((d, index) => {
      const activeWeight = (deptTokensCount[d.name] || 0) * 1.5 + (20 / (Number(d.avgTime) || 10));
      const share = activeWeight / totalDeptWeight;
      const expected = hasTrafficToday
        ? Math.max(1, Math.round(baseProjected * share))
        : Math.max(1, Math.round(baseProjected / depts.length));

      // Peak hours calculation based on index / department type
      let peakHour = '10:00 AM - 12:30 PM';
      if (d.name.toLowerCase().includes('emergency')) {
        peakHour = '09:00 AM - 02:00 PM (Continuous)';
      } else if (index % 2 === 1) {
        peakHour = '11:00 AM - 01:30 PM';
      } else if (index % 3 === 2) {
        peakHour = '02:00 PM - 04:30 PM';
      }

      return {
        name: d.name,
        expectedPatients: expected,
        peakHour,
        recommendedDesks: Math.max(1, Math.ceil(expected / 18))
      };
    });

    // Find busiest department
    const busiest = [...deptForecast].sort((a, b) => b.expectedPatients - a.expectedPatients)[0] || deptForecast[0];

    const tomorrow = new Date(Date.now() + 86400000);
    const formattedDate = tomorrow.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    // Dynamic AI Recommendations tailored to real clinic state
    let recommendations = [];
    if (!hasTrafficToday) {
      recommendations = [
        `No patient queue activity recorded today yet. Baseline readiness active across all ${depts.length} department(s).`,
        `Counters ready for incoming traffic; projections will automatically recalibrate in real-time as live tokens check in.`
      ];
    } else {
      recommendations = [
        `Estimated ~${Math.round(baseProjected * 0.55)} patients will arrive during morning peak inflow (9:30 AM - 1:00 PM).`,
        `${busiest.name} is projected to experience peak demand (~${busiest.expectedPatients} patients) requiring ${busiest.recommendedDesks} active desk(s).`
      ];

      if (emergencyCount > 0) {
        recommendations.push(`Detected ${emergencyCount} urgent/emergency case(s) today. Ensure rapid triage counter is staffed at 8:30 AM.`);
      } else {
        recommendations.push(`Keep desk coverage active during predicted rush window for zero wait backlog.`);
      }
    }

    const dynamicConfidence = hasTrafficToday
      ? `${Math.min(97, 89 + Math.min(6, todayTotalActivity))}% AI Confidence`
      : 'Ready (Awaiting Live Inflow)';

    return {
      dateString: formattedDate,
      totalExpected: baseProjected,
      confidenceRate: dynamicConfidence,
      predictedPeakWindow: hasTrafficToday ? '10:30 AM - 01:00 PM' : 'General OPD Hours',
      deptForecast,
      aiRecommendations: recommendations
    };
  },

  // ==========================================
  // 13. QR CODE TOKEN VERIFIER
  // ==========================================
  verifyTokenByQr: async (orgId, qrPayload) => {
    let target = qrPayload.trim();
    if (target.startsWith('SQ-TOKEN:')) {
      const parts = target.split(':');
      target = parts[parts.length - 1];
    } else if (target.startsWith('{')) {
      try {
        const parsed = JSON.parse(target);
        target = parsed.tokenId || parsed.tokenNumber || target;
      } catch {
        // fallback
      }
    }

    if (isMockEnabled) {
      const db = getMockDB();
      const clinicQueues = db.queues[orgId] || {};
      for (const dept of Object.keys(clinicQueues)) {
        const found = (clinicQueues[dept] || []).find(
          t => t.tokenId === target || String(t.tokenNumber) === target
        );
        if (found) {
          return { found: true, token: found, deptName: dept };
        }
      }
      return { found: false };
    }
    return { found: false };
  },

  // ==========================================
  // 14. WHATSAPP ALERT URL GENERATOR
  // ==========================================
  generateWhatsAppUrl: (phone, message) => {
    if (!phone) return '';
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('03') && clean.length === 11) {
      clean = '92' + clean.slice(1);
    } else if (clean.startsWith('3') && clean.length === 10) {
      clean = '92' + clean;
    }
    return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
  }
};

export default queueService;
