import { adminDb, adminMessaging } from '@/lib/firebase-admin'
import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Runs daily after the 15th. For each user, finds recurring merchants that
// appeared last month but not yet this month, and sends a bill-due push reminder.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  if (!adminDb || !adminMessaging) {
    return new NextResponse('Server not configured', { status: 500 })
  }

  const now = new Date()
  // Only run after the 15th — before that bills typically aren't overdue
  if (now.getDate() < 15) {
    return NextResponse.json({ skipped: true, reason: 'Before the 15th' })
  }

  const todayStr = now.toISOString().slice(0, 10)
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const SUB_KEYWORDS = ['netflix', 'spotify', 'apple', 'google', 'amazon prime',
    'disney', 'hulu', 'youtube', 'subscription', 'membership', 'insurance',
    'internet', 'phone', 'electricity', 'gas', 'water']

  let notified = 0
  let skipped = 0

  try {
    const usersSnap = await adminDb.collection('users').get()

    const docs = usersSnap.docs
    for (let i = 0; i < docs.length; i += 10) {
      const batch = docs.slice(i, i + 10)
      await Promise.allSettled(batch.map(async (doc) => {
        const user = doc.data()
        const userId = doc.id
        const fcmTokens: string[] = user.fcmTokens ?? []

        if (!user.email) return

        // Pull last-month transactions
        const lastMonthSnap = await adminDb!.collection('transactions')
          .where('userId', '==', userId)
          .where('date', '>=', lastMonthStart)
          .where('date', '<=', lastMonthEnd)
          .get()

        // Pull this-month transactions (for dedup check)
        const thisMonthSnap = await adminDb!.collection('transactions')
          .where('userId', '==', userId)
          .where('date', '>=', thisMonthStart)
          .get()

        const thisMonthMerchants = new Set(
          thisMonthSnap.docs.map(d => (d.data().merchantName || d.data().description || '').toLowerCase())
        )

        // Find sub-like merchants from last month that haven't appeared this month
        const lastMonthMerchantMap = new Map<string, { name: string; amount: number; day: number }>()
        for (const txDoc of lastMonthSnap.docs) {
          const tx = txDoc.data()
          const name: string = tx.merchantName || tx.description || ''
          const key = name.toLowerCase()
          const isSubLike = SUB_KEYWORDS.some(k => key.includes(k))
          if (!isSubLike) continue
          if (!lastMonthMerchantMap.has(key)) {
            const txDate = tx.date?.toDate ? tx.date.toDate() : new Date(tx.date)
            lastMonthMerchantMap.set(key, {
              name,
              amount: Math.abs(Number(tx.amount ?? 0)),
              day: txDate.getDate(),
            })
          }
        }

        for (const [key, info] of Array.from(lastMonthMerchantMap.entries())) {
          if (thisMonthMerchants.has(key)) continue

          // Per-merchant dedup: only one reminder per month per merchant
          const dedupeKey = `lastBillReminder_${key.replace(/\s+/g, '_')}`
          if (user[dedupeKey] === todayStr) {
            skipped++
            continue
          }

          const title = 'Expected bill due soon'
          const body = `Your ${info.name} bill ($${info.amount.toFixed(2)}) usually comes around the ${info.day}th — hasn't appeared yet this month.`

          // In-app notification
          await adminDb!.collection('users').doc(userId).collection('notifications').add({
            title,
            body,
            type: 'info',
            link: '/transactions',
            isRead: false,
            priority: 'high',
            createdAt: new Date(),
          })

          // Push notification
          if (fcmTokens.length > 0) {
            const result = await adminMessaging!.sendEachForMulticast({
              tokens: fcmTokens,
              notification: { title, body },
              webpush: {
                fcmOptions: { link: '/transactions' },
                notification: { icon: '/icon.png', badge: '/icon.png' },
              },
              data: { url: '/transactions' },
            })
            const staleTokens = fcmTokens.filter((_, idx) => result.responses[idx]?.error)
            if (staleTokens.length > 0) {
              await doc.ref.update({ fcmTokens: FieldValue.arrayRemove(...staleTokens) })
            }
          }

          await doc.ref.update({ [dedupeKey]: todayStr })
          notified++
        }
      }))
    }

    return NextResponse.json({ success: true, notified, skipped })
  } catch (error: any) {
    console.error('[BillReminder Cron]', error)
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
  }
}
