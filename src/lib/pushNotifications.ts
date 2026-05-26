'use client'

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBQkaROBq9sIqFaLvlCUpQEVBWKu2AT5zc',
  authDomain: 'auth.finleybook.com',
  projectId: 'finleybook-6120d',
  storageBucket: 'finleybook-6120d.firebasestorage.app',
  messagingSenderId: '787309970302',
  appId: '1:787309970302:web:c33272789af8ec7263292f',
}

// Request notification permission and return the FCM token, or null if denied/unavailable.
export async function requestPushPermission(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return null

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    const { initializeApp, getApps } = await import('firebase/app')
    const { getMessaging, getToken } = await import('firebase/messaging')

    const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG)
    const messaging = getMessaging(app)

    const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js')

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: swReg,
    })

    return token || null
  } catch (err) {
    console.warn('[Push] Failed to get FCM token:', err)
    return null
  }
}
