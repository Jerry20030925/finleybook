import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
import { Timestamp } from 'firebase-admin/firestore';
import { generateAffiliateLink, AffiliateConfig } from '@/lib/affiliate-engine';

// This would ideally come from a DB or config file
const MERCHANTS: Record<string, AffiliateConfig> = {
    'amazon': {
        merchantId: 'amazon',
        name: 'Amazon',
        baseUrl: 'amazon.com',
        // Example template: https://www.amazon.com/dp/{PRODUCT_ID}?tag=finleybook-20&ascsubtag={CLICK_ID}
        // Note: We'll need to handle different domains (com, com.au) dynamically or have separate merchant entries
        affiliateTemplate: 'https://www.amazon.com/dp/{PRODUCT_ID}?tag=finleybook-20&ascsubtag={CLICK_ID}',
        params: { tag: 'finleybook-20' },
        cashbackRate: 0.05
    },
    'ebay': {
        merchantId: 'ebay',
        name: 'eBay',
        baseUrl: 'ebay.com',
        // Example template
        affiliateTemplate: 'https://rover.ebay.com/rover/1/711-53200-19255-0/1?campid=5338273189&customid={CLICK_ID}&mpre={PRODUCT_URL}',
        params: { campid: '5338273189' },
        cashbackRate: 0.01
    }
};

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const merchantId = searchParams.get('merchantId');
        const userId = searchParams.get('userId');
        const productUrl = searchParams.get('url'); // Optional direct product URL

        if (!merchantId || !userId) {
            return NextResponse.json({ error: 'Missing merchantId or userId' }, { status: 400 });
        }

        const merchant = MERCHANTS[merchantId.toLowerCase()];
        if (!merchant) {
            return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
        }

        if (!adminDb) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        }

        // 1. Create Click Record
        const clickRef = adminDb.collection('cashbackClicks').doc();
        const clickId = clickRef.id;

        await clickRef.set({
            userId,
            merchantId: merchant.merchantId,
            merchantName: merchant.name,
            type: 'CASHBACK',
            originalUrl: productUrl || merchant.baseUrl,
            status: 'CLICKED',
            click_time: Timestamp.now(),
            metadata: {
                userAgent: request.headers.get('user-agent'),
                referer: request.headers.get('referer')
            }
        });

        // 2. Generate Affiliate Link
        const affiliateLink = generateAffiliateLink(merchant, userId, clickId, productUrl || undefined);

        // 3. Redirect
        return NextResponse.redirect(affiliateLink);

    } catch (error: any) {
        console.error('Redirect Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
