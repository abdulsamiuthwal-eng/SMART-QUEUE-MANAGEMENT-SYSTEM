/**
 * localDB.js
 * High-performance browser-native transactional database for Smart Queue.
 * Utilizes HTML5 IndexedDB (Browser SQLite equivalent) with dual-sync localStorage fallback.
 */

const DB_NAME = 'SmartQueue_DB';
const DB_VERSION = 1;

let dbPromise = null;

export const getDB = () => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('IndexedDB not supported, falling back purely to localStorage');
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Users table (Patients and Clinics)
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'uid' });
        userStore.createIndex('email', 'email', { unique: false });
        userStore.createIndex('role', 'role', { unique: false });
      }

      // 2. Queues table (Active and Served Tokens)
      if (!db.objectStoreNames.contains('queues')) {
        const queueStore = db.createObjectStore('queues', { keyPath: 'id' });
        queueStore.createIndex('clinicId', 'clinicId', { unique: false });
        queueStore.createIndex('status', 'status', { unique: false });
      }

      // 3. Departments table
      if (!db.objectStoreNames.contains('departments')) {
        const deptStore = db.createObjectStore('departments', { keyPath: 'id', autoIncrement: true });
        deptStore.createIndex('clinicId', 'clinicId', { unique: false });
      }

      // 4. Reports table
      if (!db.objectStoreNames.contains('reports')) {
        db.createObjectStore('reports', { keyPath: 'clinicId' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      resolve(null);
    };
  });

  return dbPromise;
};

// Generic Transaction Helpers
export const localDB = {
  // Save or Update User in IndexedDB & LocalStorage
  saveUser: async (user) => {
    try {
      const db = await getDB();
      if (db) {
        const tx = db.transaction('users', 'readwrite');
        const store = tx.objectStore('users');
        store.put(user);
      }
    } catch (err) {
      console.warn('Error saving user to IndexedDB:', err);
    }

    // Mirror to localStorage
    try {
      const raw = localStorage.getItem('smart_queue_mock_db');
      const data = raw ? JSON.parse(raw) : { users: {}, queues: {}, departments: {}, reports: {} };
      data.users = data.users || {};
      data.users[user.uid] = user;
      localStorage.setItem('smart_queue_mock_db', JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('mock-db-update'));
    } catch (e) {
      console.warn('LocalStorage mirror error:', e);
    }

    return user;
  },

  // Get user by email
  getUserByEmail: async (email) => {
    const cleanEmail = email.trim().toLowerCase();

    // Try IndexedDB first
    try {
      const db = await getDB();
      if (db) {
        const tx = db.transaction('users', 'readonly');
        const store = tx.objectStore('users');
        const index = store.index('email');
        const user = await new Promise((resolve) => {
          const req = index.get(cleanEmail);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
        });
        if (user) return user;
      }
    } catch (err) {
      console.warn('IndexedDB email lookup fallback:', err);
    }

    // Fallback to localStorage
    try {
      const raw = localStorage.getItem('smart_queue_mock_db');
      if (raw) {
        const data = JSON.parse(raw);
        const users = Object.values(data.users || {});
        return users.find((u) => u.email && u.email.toLowerCase() === cleanEmail) || null;
      }
    } catch (e) {
      console.warn('LocalStorage fallback error:', e);
    }

    return null;
  },

  // Get user by UID
  getUserById: async (uid) => {
    try {
      const db = await getDB();
      if (db) {
        const tx = db.transaction('users', 'readonly');
        const store = tx.objectStore('users');
        const user = await new Promise((resolve) => {
          const req = store.get(uid);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
        });
        if (user) return user;
      }
    } catch (err) {
      console.warn('IndexedDB uid lookup fallback:', err);
    }

    try {
      const raw = localStorage.getItem('smart_queue_mock_db');
      if (raw) {
        const data = JSON.parse(raw);
        return (data.users && data.users[uid]) || null;
      }
    } catch (e) {}

    return null;
  },

  // Get all registered organizations
  getOrganizations: async () => {
    try {
      const db = await getDB();
      if (db) {
        const tx = db.transaction('users', 'readonly');
        const store = tx.objectStore('users');
        const index = store.index('role');
        const clinics = await new Promise((resolve) => {
          const req = index.getAll('org');
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        });
        if (clinics && clinics.length > 0) return clinics;
      }
    } catch (err) {}

    try {
      const raw = localStorage.getItem('smart_queue_mock_db');
      if (raw) {
        const data = JSON.parse(raw);
        return Object.values(data.users || {}).filter((u) => u.role === 'org');
      }
    } catch (e) {}

    return [];
  }
};

export default localDB;
