import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import axios from 'axios';
import * as cheerio from 'cheerio';

async function fetchProductMetadata(url: string) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            },
            timeout: 5000
        });

        const $ = cheerio.load(data);

        const getMeta = (prop: string) => $(`meta[property="${prop}"]`).attr('content') || $(`meta[name="${prop}"]`).attr('content');

        const title = getMeta('og:title') || $('title').text() || 'Product';
        const image = getMeta('og:image') || '';
        const priceStr = getMeta('product:price:amount') || getMeta('og:price:amount') || $('.price').first().text() || '';

        // Clean price string (remove $, currency codes)
        const price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;

        return { title, image, price };
    } catch (e) {
        console.warn('Scraping failed:', e);
        return { title: 'Unknown Product', image: '', price: 0 };
    }
}

export async function POST(request: Request) {
    try {
        const { url, estimatedAmount, uid, goalId } = await request.json();

        if (!url || !uid) {
            return NextResponse.json({ error: 'URL and User ID are required' }, { status: 400 });
        }

        // 1. Resolve Short Links & Scrape Metadata
        let targetUrl = url;
        let metadata = { title: '', image: '', price: 0 };

        // Simple check for if we need to resolve (simplified for speed)
        // In full prod, we'd do a HEAD request. Here we let axios handle follows if possible, 
        // but for specific shorteners we might need specific logic.
        // We'll scrape the *provided* URL first or letting axios follow redirects.

        metadata = await fetchProductMetadata(url);

        // If the URL was a short link, the 'data.responseUrl' from axios would be better, 
        // but 'fetchProductMetadata' abstraction hides it. 
        // For MVP, we trust the OG tags from the redirect.

        // 2. Extract ASIN (Amazon Specific)
        const asinMatch = url.match(/(?:dp|gp\/product|\/d)\/([A-Z0-9]{10})/);
        const asin = asinMatch ? asinMatch[1] : null;

        if (!adminDb) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        }

        // 3. Get User Tier
        const userDoc = await adminDb.collection('users').doc(uid).get();
        const userData = userDoc.data();
        const isPro = userData?.subscription?.plan === 'pro';

        // 4. Calculate Rate
        const rate = isPro ? 0.50 : 0.15; // 50% for Pro, 15% for Free

        // 5. Create Click Record
        const clickRef = adminDb.collection('cashbackClicks').doc();
        const clickId = clickRef.id;

        const finalEstimatedAmount = metadata.price || estimatedAmount || 0;

        await clickRef.set({
            userId: uid,
            merchantName: 'Amazon', // Simplified for MVP. In prod, use: new URL(url).hostname.replace('www.', '').split('.')[0]
            type: 'CASHBACK',
            asin: asin,
            originalUrl: url,
            rate: rate,
            status: 'CREATED',
            click_time: Timestamp.now(),
            estimatedAmount: finalEstimatedAmount,
            goalId: goalId || null,
            metadata: {
                title: metadata.title,
                image: metadata.image,
                scrapedPrice: metadata.price
            }
        });


        // 6. Create Pending Wallet Transaction
        const transactionRef = adminDb.collection('walletTransactions').doc();
        await transactionRef.set({
            userId: uid,
            clickId: clickId,
            merchantName: 'Amazon',
            type: 'CASHBACK',
            status: 'PENDING',
            amount: 0,
            currency: 'USD',
            metadata: {
                rate: rate,
                asin: asin,
                userTier: isPro ? 'pro' : 'free',
                goalId: goalId || null,
                productTitle: metadata.title,
                productImage: metadata.image
            },
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });

        // 7. Generate Affiliate Link
        // Tag: finleybook-22
        // Subtag: clickId (for tracking)
        const affiliateLink = asin
            ? `https://www.amazon.com.au/dp/${asin}?tag=finleybook-22&ascsubtag=${clickId}`
            : url; // Fallback if no ASIN (e.g. non-Amazon)

        return NextResponse.json({
            url: affiliateLink,
            metadata: metadata // Return scraping result to frontend
        });

    } catch (error: any) {
        console.error('Cashback API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
