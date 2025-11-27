import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Check if we're in build time vs runtime
const isServer = typeof window === 'undefined';

// Create Firebase config with fallbacks for build time
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''
};

// Validate that all required environment variables are present (only in browser)
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

// Only validate environment variables in the browser, not during build
if (typeof window !== 'undefined') {
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingEnvVars.length > 0) {
    console.error('Missing Firebase environment variables:', missingEnvVars);
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_FIREBASE')));
    throw new Error(`Missing required Firebase environment variables: ${missingEnvVars.join(', ')}`);
  }
}

// Initialize Firebase only on client side
let firebase_app;
if (typeof window !== 'undefined') {
  try {
    console.log('Initializing Firebase with config:', {
      apiKey: firebaseConfig.apiKey ? '***' : 'MISSING',
      authDomain: firebaseConfig.authDomain || 'MISSING',
      projectId: firebaseConfig.projectId || 'MISSING',
      storageBucket: firebaseConfig.storageBucket || 'MISSING',
      messagingSenderId: firebaseConfig.messagingSenderId || 'MISSING',
      appId: firebaseConfig.appId ? '***' : 'MISSING'
    });

    firebase_app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
    console.error('Firebase config at time of error:', firebaseConfig);
    throw error;
  }
} else {
  // Server-side: create a dummy app to prevent build errors
  firebase_app = null as any;
}

// Export Firebase services (only initialize on client side)
export const auth = typeof window !== 'undefined' && firebase_app ? getAuth(firebase_app) : null as any;
export const db = typeof window !== 'undefined' && firebase_app ? getFirestore(firebase_app) : null as any;
export const storage = typeof window !== 'undefined' && firebase_app ? getStorage(firebase_app) : null as any;

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