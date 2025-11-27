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
    const { initializeApp, getApps, getApp, deleteApp } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');
    const { getFirestore } = await import('firebase/firestore');
    const { getStorage } = await import('firebase/storage');

    // Configuration from environment variables
    // Configuration hardcoded from Firebase Console screenshot to ensure stability
    const firebaseConfig = {
      apiKey: "AIzaSyBQkaROBq9sIqFaLvlCUpQEVBWKu2AT5zc",
      authDomain: "finleybook-6120d.firebaseapp.com",
      projectId: "finleybook-6120d",
      storageBucket: "finleybook-6120d.firebasestorage.app",
      messagingSenderId: "787309970302",
      appId: "1:787309970302:web:c33272789af8ec7263292f",
      measurementId: "G-VSB2C4CK1M"
    };

    console.log('Initializing Firebase with config:', {
      ...firebaseConfig,
      apiKey: '***' + firebaseConfig.apiKey.slice(-4) // Mask API key
    });

    if (getApps().length > 0) {
      const currentApp = getApp();
      const currentOptions = currentApp.options;

      // Check if the current app has the correct API key
      if (currentOptions.apiKey !== firebaseConfig.apiKey) {
        console.warn('Firebase initialized with incorrect config. Deleting and re-initializing...', {
          current: currentOptions.apiKey ? '***' + currentOptions.apiKey.slice(-4) : 'undefined',
          expected: '***' + firebaseConfig.apiKey.slice(-4)
        });
        await deleteApp(currentApp);
        firebaseApp = initializeApp(firebaseConfig);
      } else {
        console.log('Existing Firebase app has correct config.');
        firebaseApp = currentApp;
      }
    } else {
      firebaseApp = initializeApp(firebaseConfig);
    }
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