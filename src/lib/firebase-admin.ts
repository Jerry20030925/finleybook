import * as admin from 'firebase-admin';

let adminDb: FirebaseFirestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;

// Only initialize Firebase Admin if all required environment variables are present
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY;

const hasRequiredCredentials = Boolean(projectId && clientEmail && privateKey);

if (!admin.apps.length && hasRequiredCredentials) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: projectId!,
                clientEmail: clientEmail!,
                // Replace newline characters in private key
                privateKey: privateKey!.replace(/\\n/g, '\n'),
            }),
        });
        console.log('Firebase Admin initialized successfully');
    } catch (error) {
        console.error('Firebase Admin initialization error', error);
    }
} else if (!hasRequiredCredentials) {
    console.warn('Firebase Admin credentials not found. Admin features will be disabled.');
}

if (admin.apps.length > 0) {
    adminDb = admin.firestore();
    adminAuth = admin.auth();
}

export { adminDb, adminAuth };
