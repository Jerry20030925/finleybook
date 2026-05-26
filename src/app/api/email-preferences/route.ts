import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

// GET: Fetch email preferences for a given email
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    try {
        if (!adminDb) {
            return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
        }

        const snapshot = await adminDb.collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return NextResponse.json({
                preferences: {
                    marketing: true,
                    reports: true,
                    streakReminders: true,
                    referral: true,
                },
            });
        }

        const userData = snapshot.docs[0].data();
        return NextResponse.json({
            preferences: userData.emailPreferences || {
                marketing: true,
                reports: true,
                streakReminders: true,
                referral: true,
            },
        });
    } catch (error: any) {
        console.error('Get email preferences error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Update email preferences
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, preferences } = body;

        if (!email || !preferences) {
            return NextResponse.json({ error: 'Email and preferences are required' }, { status: 400 });
        }

        if (!adminDb) {
            return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
        }

        const snapshot = await adminDb.collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        await snapshot.docs[0].ref.update({
            emailPreferences: {
                marketing: Boolean(preferences.marketing),
                reports: Boolean(preferences.reports),
                streakReminders: Boolean(preferences.streakReminders),
                referral: Boolean(preferences.referral),
            },
            emailPreferencesUpdatedAt: new Date(),
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Update email preferences error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
