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

    // Hardcoded configuration to bypass environment variable issues
    const firebaseConfig = {
      apiKey: 'AIzaSyBQkaR0Bq9sIqFaLvlCUpQEVBWKu2AT5zc',
      authDomain: 'finleybook-6120d.firebaseapp.com',
      projectId: 'finleybook-6120d',
      storageBucket: 'finleybook-6120d.firebasestorage.app',
      messagingSenderId: '787309970302',
      appId: '1:787309970302:web:c33272789af8ec7263292f',
      measurementId: 'G-VSB2C4CK1M'
    };

    console.log('Initializing Firebase with config:', {
      ...firebaseConfig,
      apiKey: '***' + firebaseConfig.apiKey.slice(-4) // Mask API key
    });



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