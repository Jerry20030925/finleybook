import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

// Helper to parse CSV line
const parseCSVLine = (line: string) => {
    const values = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            values.push(currentValue.trim());
            currentValue = '';
        } else {
            currentValue += char;
        }
    }
    values.push(currentValue.trim());
    return values;
};

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const adminUid = formData.get('uid') as string;

        if (!file || !adminUid) {
            return NextResponse.json({ error: 'File and Admin UID are required' }, { status: 400 });
        }

        if (!adminDb) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        }

        // Verify Admin Status
        const adminUserDoc = await adminDb.collection('users').doc(adminUid).get();
        const adminUserData = adminUserDoc.data();

        if (!adminUserData?.isAdmin) {
            return NextResponse.json({ error: 'Access Denied: Admin privileges required.' }, { status: 403 });
        }

        const text = await file.text();
        const lines = text.split('\n');
        const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, '').trim());

        // Identify columns
        const subtagIndex = headers.findIndex(h => h.includes('Subtag') || h.includes('subtag'));
        const earningsIndex = headers.findIndex(h => h.includes('Earnings') || h.includes('Advertising Fees'));
        const itemsIndex = headers.findIndex(h => h.includes('Items Shipped') || h.includes('Items'));

        if (subtagIndex === -1 || earningsIndex === -1) {
            return NextResponse.json({ error: 'Invalid CSV format. Missing "Subtag" or "Earnings" columns.' }, { status: 400 });
        }

        let processedCount = 0;
        let updatedCount = 0;
        const errors: string[] = [];

        if (!adminDb) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        }

        const batch = adminDb.batch();
        let batchCount = 0;

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            const row = parseCSVLine(lines[i]);
            const clickId = row[subtagIndex]?.replace(/"/g, '');
            const earningsStr = row[earningsIndex]?.replace(/[^0-9.-]/g, ''); // Remove currency symbols
            const earnings = parseFloat(earningsStr);

            if (clickId && !isNaN(earnings) && earnings > 0) {
                processedCount++;

                // Find the Pending Transaction
                const snapshot = await adminDb.collection('walletTransactions')
                    .where('clickId', '==', clickId)
                    .where('status', '==', 'PENDING')
                    .limit(1)
                    .get();

                if (!snapshot.empty) {
                    const doc = snapshot.docs[0];
                    const data = doc.data();
                    const rate = data.metadata?.rate || 0.15; // Default to 15% if missing

                    // Calculate User Share
                    const userShare = earnings * rate;

                    // Update Transaction
                    batch.update(doc.ref, {
                        status: 'CONFIRMED',
                        amount: userShare, // This is what the user gets
                        commissionAmount: earnings, // This is what we got from Amazon
                        updatedAt: Timestamp.now()
                    });

                    // Update User Balance (Atomic increment)
                    const userRef = adminDb.collection('users').doc(data.userId);
                    batch.set(userRef, {
                        wallet_snapshot: {
                            pending_balance: FieldValue.increment(-userShare), // Remove from pending? Or just add to available? 
                            // Usually pending is separate. Let's assume we just add to available for now.
                            // Actually, if it was "Pending" in UI, we might want to move it.
                            // Let's just add to available_balance.
                            available_balance: FieldValue.increment(userShare),
                            lifetime_earnings: FieldValue.increment(userShare)
                        }
                    }, { merge: true });

                    updatedCount++;
                    batchCount++;

                    // Commit batch every 200 ops (limit is 500)
                    if (batchCount >= 200) {
                        await batch.commit();
                        batchCount = 0;
                    }
                } else {
                    // errors.push(`Transaction not found or already processed for Click ID: ${clickId}`);
                }
            }
        }

        if (batchCount > 0) {
            await batch.commit();
        }

        return NextResponse.json({
            success: true,
            processed: processedCount,
            updated: updatedCount,
            errors: errors
        });

    } catch (error: any) {
        console.error('Upload API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
