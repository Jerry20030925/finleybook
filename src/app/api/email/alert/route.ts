import { NextResponse } from 'next/server';
import { ResendService } from '@/lib/resendService';

export async function POST(request: Request) {
    try {
        const { email, notification } = await request.json();

        if (!email || !notification) {
            return NextResponse.json({ error: 'Email and notification data are required' }, { status: 400 });
        }

        console.log(`Sending budget alert to: ${email}`);
        await ResendService.sendNotificationEmail(email, notification);
        console.log('Budget alert sent successfully');

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Alert email API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
