import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(req: NextRequest) {
  if (!adminDb || !adminAuth) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 503 })
  }

  let token: string, idToken: string
  try {
    ;({ token, idToken } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (!token || !idToken) {
    return NextResponse.json({ error: 'token and idToken are required' }, { status: 400 })
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken)
    await adminDb.collection('users').doc(decoded.uid).set(
      { fcmTokens: FieldValue.arrayUnion(token) },
      { merge: true }
    )
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
