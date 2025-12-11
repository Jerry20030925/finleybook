import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import ResendService from '@/lib/resendService';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // 1. Generate Password Reset Link via Firebase Admin
        console.log(`Generating password reset link for: ${email}`);
        if (!adminAuth) {
            throw new Error('Firebase Admin Auth not initialized');
        }
        const link = await adminAuth.generatePasswordResetLink(email, {
            url: (process.env.NEXT_PUBLIC_APP_URL || 'https://www.finleybook.com') + '/login' // Redirect to login after reset
        });

        // Replace Firebase domain with our custom domain if needed
        // This is a workaround because Firebase Admin SDK generates links with the default domain
        // unless fully configured with a custom domain in the console AND using the correct API.
        // A safer way for "magic links" is to just replace the host.
        const customDomainLink = link.replace(/https:\/\/[^/]+/, 'https://www.finleybook.com');

        // 2. Send Custom Email via Resend
        console.log(`Sending password reset email to: ${email}`);
        await ResendService.sendPasswordResetEmail(email, customDomainLink);
        console.log('Password reset email sent successfully');

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Password reset API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
