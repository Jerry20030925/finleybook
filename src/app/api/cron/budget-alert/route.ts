import { adminDb, adminMessaging } from '@/lib/firebase-admin'
import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Runs daily. Finds users who have exceeded their monthly budget and haven't
// been notified yet this calendar month, then sends a push + in-app alert.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  if (!adminDb || !adminMessaging) {
    return new NextResponse('Server not configured', { status: 500 })
  }

  const now = new Date()
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  let notified = 0
  let skipped = 0

  try {
    // Only users who have a monthly budget set
    const usersSnap = await adminDb.collection('users')
      .where('monthlyBudget', '>', 0)
      .get()

    const docs = usersSnap.docs
    for (let i = 0; i < docs.length; i += 10) {
      const batch = docs.slice(i, i + 10)
      await Promise.allSettled(batch.map(async (doc) => {
        const user = doc.data()
        const userId = doc.id

        // Skip if already notified this month
        if (user.lastBudgetAlertMonth === monthKey) {
          skipped++
          return
        }

        // Skip if user opted out of budget warnings
        if (user.notificationPreferences?.budgetWarning === false) {
          skipped++
          return
        }

        // Tally this month's expenses from transactions collection
        const txSnap = await adminDb!.collection('transactions')
          .where('userId', '==', userId)
          .where('type', '==', 'expense')
          .where('date', '>=', monthStart)
          .get()

        const totalSpent = txSnap.docs.reduce(
          (sum, d) => sum + Math.abs(Number(d.data().amount ?? 0)), 0
        )

        const budget: number = user.monthlyBudget
        if (totalSpent <= budget) {
          skipped++
          return
        }

        const overage = (totalSpent - budget).toFixed(2)
        const title = 'Budget limit reached'
        const body = `You've spent $${overage} over your $${budget.toFixed(2)} monthly budget. Time to pause non-essentials.`

        // In-app notification
        await adminDb!.collection('users').doc(userId).collection('notifications').add({
          title,
          body,
          type: 'warning',
          link: '/budget',
          isRead: false,
          priority: 'high',
          createdAt: new Date(),
        })

        // Push notification
        const fcmTokens: string[] = user.fcmTokens ?? []
        if (fcmTokens.length > 0) {
          const result = await adminMessaging!.sendEachForMulticast({
            tokens: fcmTokens,
            notification: { title, body },
            webpush: {
              fcmOptions: { link: '/budget' },
              notification: { icon: '/icon.png', badge: '/icon.png' },
            },
            data: { url: '/budget' },
          })
          // Clean up stale tokens
          const staleTokens = fcmTokens.filter((_, idx) => result.responses[idx]?.error)
          if (staleTokens.length > 0) {
            await doc.ref.update({ fcmTokens: FieldValue.arrayRemove(...staleTokens) })
          }
        }

        // Mark as notified for this month
        await doc.ref.update({ lastBudgetAlertMonth: monthKey })
        notified++
      }))
    }

    return NextResponse.json({ success: true, notified, skipped })
  } catch (error: any) {
    console.error('[BudgetAlert Cron]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}
