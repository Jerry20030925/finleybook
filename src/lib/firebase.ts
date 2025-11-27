// Dynamic imports for Firebase to prevent SSR issues
let firebaseApp: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

// Initialize Firebase only on client side
const initializeFirebase = async () => {
  if (typeof window === 'undefined') {
    return { auth: null, db: null, storage: null };
  }

  if (firebaseApp) {
    return { auth, db, storage };
  }

  try {
    const { initializeApp, getApps, getApp } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');
    const { getFirestore } = await import('firebase/firestore');
    const { getStorage } = await import('firebase/storage');

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''
    };

    // Validate environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID'
    ];

    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingEnvVars.length > 0) {
      console.error('Missing Firebase environment variables:', missingEnvVars);
      throw new Error(`Missing required Firebase environment variables: ${missingEnvVars.join(', ')}`);
    }

    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
    storage = getStorage(firebaseApp);

    console.log('Firebase initialized successfully');
    return { auth, db, storage };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
};

// Export the initialization function
export { initializeFirebase };

// Legacy exports for backward compatibility (will be null until initialized)
export { auth, db, storage };

// Initialize analytics dynamically
let analytics: any = null;
export const initializeAnalytics = async () => {
  if (typeof window === 'undefined' || !firebaseApp) {
    return null;
  }
  
  if (analytics) {
    return analytics;
  }

  try {
    const { getAnalytics } = await import('firebase/analytics');
    analytics = getAnalytics(firebaseApp);
    return analytics;
  } catch (error) {
    console.log('Analytics not available');
    return null;
  }
};

export { analytics };
export default firebaseApp;