importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyBQkaROBq9sIqFaLvlCUpQEVBWKu2AT5zc',
  authDomain: 'auth.finleybook.com',
  projectId: 'finleybook-6120d',
  storageBucket: 'finleybook-6120d.firebasestorage.app',
  messagingSenderId: '787309970302',
  appId: '1:787309970302:web:c33272789af8ec7263292f',
})

const messaging = firebase.messaging()

// Handle push when app is in background or closed
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? 'Finley'
  const options = {
    body: payload.notification?.body ?? '',
    icon: '/icon.png',
    badge: '/icon.png',
    data: { url: payload.data?.url ?? '/dashboard' },
  }
  self.registration.showNotification(title, options)
})

// Notification click → open the linked page
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/dashboard'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          client.navigate(url)
          return
        }
      }
      return clients.openWindow(url)
    })
  )
})
