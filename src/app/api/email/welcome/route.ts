import { NextResponse } from 'next/server';
import { ResendService } from '@/lib/resendService';

export async function POST(request: Request) {
    try {
        const { email, name } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        console.log(`Attempting to send welcome email to: ${email}`);
        const result = await ResendService.sendWelcomeEmail(email, name);
        console.log('Welcome email sent successfully:', result);

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error('Welcome email API error:', error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
