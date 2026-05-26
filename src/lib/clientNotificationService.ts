import { addDoc, collection, Timestamp } from 'firebase/firestore'

import { db } from '@/lib/firebase'

export type ClientNotificationType = 'success' | 'info' | 'warning' | 'error' | 'promo' | 'ai-alert'

interface CreateClientNotificationInput {
  userId: string
  title: string
  body: string
  type: ClientNotificationType
  link?: string
  priority?: 'high' | 'normal'
}

export async function createClientNotification(input: CreateClientNotificationInput) {
  if (!db) {
    throw new Error('Firestore is not initialized yet')
  }

  await addDoc(collection(db, 'users', input.userId, 'notifications'), {
    title: input.title,
    body: input.body,
    type: input.type,
    link: input.link || '',
    priority: input.priority || 'normal',
    isRead: false,
    createdAt: Timestamp.now(),
    source: 'smart-client'
  })
}
