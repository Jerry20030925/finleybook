import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBQkaROBq9sIqFaLvlCUpQEVBWKu2AT5zc",
  authDomain: "finleybook-6120d.firebaseapp.com",
  projectId: "finleybook-6120d",
  storageBucket: "finleybook-6120d.firebasestorage.app",
  messagingSenderId: "787309970302",
  appId: "1:787309970302:web:c33272789af8ec7263292f",
  measurementId: "G-VSB2C4CK1M"
};

// Initialize Firebase only on client side
let firebase_app;
try {
  firebase_app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.error('Firebase initialization error:', error);
  firebase_app = initializeApp(firebaseConfig);
}

export const auth = getAuth(firebase_app);
export const db = getFirestore(firebase_app);
export const storage = getStorage(firebase_app);

// Analytics - only initialize on client side
let analytics: any = null;
if (typeof window !== 'undefined') {
  try {
    const { getAnalytics } = require('firebase/analytics');
    analytics = getAnalytics(firebase_app);
  } catch (error) {
    console.log('Analytics not available');
  }
}

export { analytics };
export default firebase_app;