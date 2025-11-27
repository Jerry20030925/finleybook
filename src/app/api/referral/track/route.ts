import { NextRequest, NextResponse } from 'next/server';
import { trackReferralSignup } from '@/lib/referralService';

export async function POST(req: NextRequest) {
    try {
        const { userId, referralCode } = await req.json();

        if (!userId || !referralCode) {
            return NextResponse.json(
                { error: 'Missing userId or referralCode' },
                { status: 400 }
            );
        }

        await trackReferralSignup(userId, referralCode);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error tracking referral:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
