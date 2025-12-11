import * as admin from 'firebase-admin';

// Use a function to lazily initialize, preventing crash on module import
export function initAdmin() {
    if (!admin.apps.length) {
        const projectId = process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_ADMIN_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_ADMIN_PRIVATE_KEY;

        if (!projectId || !clientEmail || !privateKey) {
            throw new Error(`Missing Firebase Admin Environment Variables. \nUnfound: ${!projectId ? 'Project ID' : ''} ${!clientEmail ? 'Client Email' : ''} ${!privateKey ? 'Private Key' : ''}`);
        }

        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey: privateKey.replace(/\\n/g, '\n'),
                }),
            });
        } catch (error) {
            console.error('Firebase Admin Initialization Error:', error);
            throw error;
        }
    }
    return admin;
}

// Helper to get DB safely
export function getAdminDb() {
    initAdmin();
    return admin.firestore();
}

// Helper to get Auth safely
export function getAdminAuth() {
    initAdmin();
    return admin.auth();
}

// Backward compatibility (but triggers init immediately, use carefully)
// We export these as getters to delay execution until access
export const adminDb = {
    collection: (name: string) => getAdminDb().collection(name),
    batch: () => getAdminDb().batch(),
    // Add other methods as needed or just use getAdminDb() in new code
} as any;

export const adminAuth = {
    getUser: (uid: string) => getAdminAuth().getUser(uid),
    // ...
} as any;

