import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Merchant } from '@/types/rebate';

export async function POST(request: Request) {
    try {
        // Check if Firebase Admin is available
        if (!adminDb) {
            return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 503 });
        }

        // In a real app, you'd want to protect this route with an admin secret
        // const authHeader = request.headers.get('authorization');
        // if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const merchants: Merchant[] = [
            {
                id: 'the-iconic',
                name: 'The Iconic',
                logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/The_Iconic_logo.svg/2560px-The_Iconic_logo.svg.png',
                description: 'Fashion & Sportswear',
                category: 'Fashion',
                affiliate_network: 'COMMISSION_FACTORY',
                base_commission_rate: 0.10, // 10%
                tracking_link_template: 'https://t.cfjump.com/12345/t/THE_ICONIC_ID?UniqueId=',
                is_featured: true,
            },
            {
                id: 'amazon-au',
                name: 'Amazon AU',
                logo_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
                description: 'Everything Store',
                category: 'Retail',
                affiliate_network: 'COMMISSION_FACTORY',
                base_commission_rate: 0.08, // 8%
                tracking_link_template: 'https://t.cfjump.com/12345/t/AMAZON_ID?UniqueId=',
                is_featured: true,
            },
            {
                id: 'myer',
                name: 'Myer',
                logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Myer_logo_2021.svg/1200px-Myer_logo_2021.svg.png',
                description: 'Department Store',
                category: 'Retail',
                affiliate_network: 'COMMISSION_FACTORY',
                base_commission_rate: 0.05, // 5%
                tracking_link_template: 'https://t.cfjump.com/12345/t/MYER_ID?UniqueId=',
                is_featured: false,
            }
        ];

        const batch = adminDb.batch();

        for (const merchant of merchants) {
            const ref = adminDb.collection('merchants').doc(merchant.id);
            batch.set(ref, merchant, { merge: true });
        }

        await batch.commit();

        return NextResponse.json({ success: true, count: merchants.length });
    } catch (error) {
        console.error('Seeding error:', error);
        return NextResponse.json({ error: 'Failed to seed merchants' }, { status: 500 });
    }
}
