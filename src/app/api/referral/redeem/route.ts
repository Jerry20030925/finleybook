import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'

export async function POST(req: NextRequest) {
    try {
        const { code } = await req.json()
        const authHeader = req.headers.get('Authorization')

        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const token = authHeader.split('Bearer ')[1]

        if (!adminAuth || !adminDb) {
            console.error('Firebase Admin not initialized')
            return NextResponse.json({ error: 'Server Error' }, { status: 500 })
        }

        let decodedToken
        try {
            decodedToken = await adminAuth.verifyIdToken(token)
        } catch (error) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const userId = decodedToken.uid

        // 1. Validate Code
        const codeRef = adminDb.collection('referral_codes').doc(code)
        const codeSnap = await codeRef.get()

        if (!codeSnap.exists) {
            return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 })
        }

        const referrerId = codeSnap.data()?.userId

        if (referrerId === userId) {
            return NextResponse.json({ error: 'You cannot redeem your own code' }, { status: 400 })
        }

        // 2. Check if already redeemed (optional: check referrals collection)
        // For now, we allow it but maybe limit to one gift per user?
        // Let's check if user is already Pro
        const userRef = adminDb.collection('users').doc(userId)
        const userSnap = await userRef.get()
        const userData = userSnap.data()

        if (userData?.subscription?.plan === 'pro' && userData?.subscription?.status === 'active') {
            // If already Pro, maybe extend? For now, just say already Pro.
            // Or better, extend it.
        }

        // 3. Grant 30 Days Pro
        const now = new Date()
        const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // +30 days

        await userRef.set({
            subscription: {
                plan: 'pro',
                status: 'active',
                periodEnd: expiresAt,
                source: 'gift_redemption',
                updatedAt: now
            }
        }, { merge: true })

        // 4. Record Referral
        const referralRef = adminDb.collection('referrals').doc()
        await referralRef.set({
            referrerId,
            refereeId: userId,
            code,
            status: 'completed',
            createdAt: FieldValue.serverTimestamp()
        })

        // 5. Update Referrer Stats
        const statsRef = adminDb.collection('users').doc(referrerId).collection('referral_stats').doc('summary')
        await statsRef.set({
            totalReferrals: FieldValue.increment(1),
            updatedAt: FieldValue.serverTimestamp()
        }, { merge: true })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Redemption error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
