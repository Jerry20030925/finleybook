import { adminDb } from '@/lib/firebase-admin';
import { Merchant } from '@/types/rebate';
import RewardsClient from '@/components/RewardsClient';

export const dynamic = 'force-dynamic'; // Ensure we always get fresh data

async function getMerchants() {
    try {
        // Check if Firebase Admin is available
        if (!adminDb) {
            console.warn('Firebase Admin not configured, returning empty merchants list');
            return [];
        }

        const snapshot = await adminDb.collection('merchants').get();
        const merchants: Merchant[] = [];

        snapshot.forEach((doc) => {
            merchants.push(doc.data() as Merchant);
        });

        return merchants;
    } catch (error) {
        console.error('Error fetching merchants:', error);
        return [];
    }
}



export default async function RewardsPage() {
    const merchants = await getMerchants();

    return (
        <div className="min-h-screen bg-gray-50">

            <RewardsClient initialMerchants={merchants} />
        </div>
    );
}
