import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import Papa from 'papaparse';

// Define expected CSV columns (normalized)
interface ReportRow {
    clickId: string; // The Subtag / CustomID
    commission: number;
    status: string; // 'pending', 'approved', 'declined'
    merchant: string;
    orderId?: string;
    saleAmount?: number;
    transactionDate?: string;
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const merchantId = formData.get('merchantId') as string;

        if (!file || !merchantId) {
            return NextResponse.json({ error: 'File and merchantId are required' }, { status: 400 });
        }

        const text = await file.text();

        // Parse CSV
        const { data, errors } = Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.toLowerCase().trim()
        });

        if (errors.length > 0) {
            console.warn('CSV Parse Errors:', errors);
        }

        const rows = data as any[];
        let processedCount = 0;
        let errorCount = 0;

        for (const row of rows) {
            try {
                // Normalize data based on merchant format
                // This is a simplified example. Real-world CSVs vary wildly.
                // We assume the user maps columns or we have specific parsers per merchant.
                // For this MVP, we look for common column names.

                let clickId = row['subtag'] || row['customid'] || row['clickref'] || row['s1'];
                let commission = parseFloat(row['commission'] || row['earnings'] || row['estimated commission'] || '0');
                let status = (row['status'] || 'pending').toLowerCase();
                let orderId = row['order id'] || row['orderid'] || row['transaction id'];

                if (!clickId) {
                    console.log('Skipping row without clickId:', row);
                    continue;
                }

                // Clean clickId (sometimes has prefixes)
                clickId = clickId.trim();

                // Find the original click
                const clickRef = adminDb!.collection('cashbackClicks').doc(clickId);
                const clickDoc = await clickRef.get();

                if (!clickDoc.exists) {
                    console.warn(`Click ID ${clickId} not found`);
                    continue;
                }

                const clickData = clickDoc.data();
                const userId = clickData?.userId;

                if (!userId) continue;

                // Update Click Status
                await clickRef.update({
                    status: status === 'approved' || status === 'confirmed' ? 'CONVERTED' : 'CLICKED',
                    commission: commission,
                    orderId: orderId,
                    lastUpdated: Timestamp.now()
                });

                // Create/Update Wallet Transaction
                // We query for existing transaction for this click to avoid duplicates
                const txQuery = await adminDb!.collection('walletTransactions')
                    .where('clickId', '==', clickId)
                    .limit(1)
                    .get();

                if (!txQuery.empty) {
                    // Update existing
                    const txDoc = txQuery.docs[0];
                    await txDoc.ref.update({
                        amount: commission, // This is the raw commission. We need to calculate user share.
                        // Ideally we calculate user share here or when paying out.
                        // Let's calculate now based on stored rate/tier
                        userAmount: calculateUserShare(commission, clickData?.rate || 0.15),
                        status: mapStatus(status),
                        updatedAt: Timestamp.now()
                    });
                } else {
                    // Create new
                    await adminDb!.collection('walletTransactions').add({
                        userId,
                        clickId,
                        merchantName: merchantId, // or clickData.merchantName
                        type: 'CASHBACK',
                        status: mapStatus(status),
                        amount: commission, // Raw commission
                        userAmount: calculateUserShare(commission, clickData?.rate || 0.15),
                        currency: 'USD', // Default
                        metadata: {
                            orderId,
                            rawStatus: status
                        },
                        createdAt: Timestamp.now(),
                        updatedAt: Timestamp.now()
                    });
                }

                processedCount++;

            } catch (e) {
                console.error('Error processing row:', row, e);
                errorCount++;
            }
        }

        return NextResponse.json({
            success: true,
            processed: processedCount,
            errors: errorCount
        });

    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function calculateUserShare(commission: number, rate: number): number {
    // Rate is e.g. 0.15 (15%) or 0.50 (50%)
    return Number((commission * rate).toFixed(2));
}

function mapStatus(csvStatus: string): string {
    if (['approved', 'confirmed', 'paid', 'complete'].includes(csvStatus)) return 'CONFIRMED';
    if (['declined', 'cancelled', 'rejected'].includes(csvStatus)) return 'DECLINED';
    return 'PENDING';
}
