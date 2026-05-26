import { adminDb, adminMessaging } from '@/lib/firebase-admin';
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

        // 2. Send Email + Push if High Priority
        if (priority === 'high') {
            const userSnap = await adminDb.collection('users').doc(userId).get();
            const userData = userSnap.data();
            const email = userData?.email;
            const fcmTokens: string[] = userData?.fcmTokens ?? [];

            if (email) {
                await ResendService.sendNotificationEmail(email, {
                    title: data.title,
                    message: data.body,
                    type: data.type === 'promo' ? 'info' : data.type,
                });
                console.log(`[Notification] Email sent to ${email}`);
            }

            if (fcmTokens.length > 0 && adminMessaging) {
                const result = await adminMessaging.sendEachForMulticast({
                    tokens: fcmTokens,
                    notification: { title: data.title, body: data.body },
                    webpush: {
                        fcmOptions: { link: data.link ?? '/dashboard' },
                        notification: { icon: '/icon.png', badge: '/icon.png' },
                    },
                    data: data.link ? { url: data.link } : undefined,
                });
                // Remove tokens that are no longer valid
                const staleTokens = fcmTokens.filter((_, i) => result.responses[i]?.error)
                if (staleTokens.length > 0) {
                    const { FieldValue } = await import('firebase-admin/firestore');
                    await adminDb.collection('users').doc(userId).update({
                        fcmTokens: FieldValue.arrayRemove(...staleTokens),
                    });
                }
                console.log(`[Notification] Push sent to ${result.successCount}/${fcmTokens.length} tokens`);
            }
        }
    } catch (error) {
        console.error('[Notification] Error sending notification:', error);
    }
}
