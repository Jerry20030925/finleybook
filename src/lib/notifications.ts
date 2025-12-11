import { adminDb } from '@/lib/firebase-admin';
import { ResendService } from '@/lib/resendService';
import { Timestamp } from 'firebase-admin/firestore';

export interface AppNotification {
    id?: string;
    title: string;
    body: string;
    type: 'success' | 'info' | 'warning' | 'error' | 'promo';
    link?: string;
    isRead: boolean;
    priority: 'high' | 'normal';
    createdAt: Date | Timestamp;
}

export async function notifyUser(userId: string, data: {
    title: string;
    body: string;
    type: 'success' | 'info' | 'warning' | 'error' | 'promo';
    link?: string;
    priority?: 'high' | 'normal';
}) {
    const priority = data.priority || 'normal';

    if (!adminDb) {
        console.error('Firebase Admin not initialized, cannot send notification');
        return;
    }

    try {
        // 1. Write to Firestore (In-App Notification)
        await adminDb.collection('users').doc(userId).collection('notifications').add({
            ...data,
            isRead: false,
            priority,
            createdAt: new Date(),
        });

        console.log(`[Notification] In-app notification sent to ${userId}`);

        // 2. Send Email if High Priority
        if (priority === 'high') {
            const userSnap = await adminDb.collection('users').doc(userId).get();
            const userData = userSnap.data();
            const email = userData?.email;
            const name = userData?.displayName || 'there';

            if (email) {
                await ResendService.sendNotificationEmail(email, {
                    title: data.title,
                    message: data.body,
                    type: data.type === 'promo' ? 'info' : data.type, // Map promo to info for email template
                });
                console.log(`[Notification] Email sent to ${email}`);
            } else {
                console.warn(`[Notification] No email found for user ${userId}`);
            }
        }
    } catch (error) {
        console.error('[Notification] Error sending notification:', error);
    }
}
