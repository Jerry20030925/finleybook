import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, writeBatch, doc } from 'firebase/firestore'
import { AffiliateMerchant } from '@/lib/dataService'

// Merchant Sync API
// GET /api/skimlinks/merchants
// This endpoint fetches the latest merchant data from Skimlinks and updates the Firestore `affiliate_merchants` collection.
// It is intended to be called by a Cron job (e.g., daily).

const SKIMLINKS_API_KEY = process.env.SKIMLINKS_API_KEY || 'YOUR_SKIMLINKS_API_KEY'
const PUBLISHER_ID = '295600' // Your Skimlinks Publisher ID (from script 295600X...)

export async function GET(request: Request) {
    try {
        // 1. Verify Authorization (Simple secret for Cron)
        const { searchParams } = new URL(request.url)
        const secret = searchParams.get('secret')
        if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('Starting Skimlinks Merchant Sync...')

        // 2. Fetch from Skimlinks API
        // Documentation: https://developers.skimlinks.com/
        // We mock this for now since we don't have the live API Key.
        // In production:
        // const response = await fetch(`https://api.skimlinks.com/merchants/v4?access_token=${SKIMLINKS_API_KEY}&publisher_id=${PUBLISHER_ID}`)
        // const data = await response.json()

        // MOCK DATA for demonstration
        const mockMerchants: Partial<AffiliateMerchant>[] = [
            {
                id: '12345',
                name: 'Amazon',
                domains: ['amazon.com', 'amazon.co.uk', 'amazon.com.au'],
                baseCommissionRate: 0.045, // 4.5%
                averageCommissionRate: 0.04,
                logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
                categories: ['Retail', 'Electronics'],
                lastSynced: new Date()
            },
            {
                id: '67890',
                name: 'Myer',
                domains: ['myer.com.au'],
                baseCommissionRate: 0.10, // 10%
                averageCommissionRate: 0.12,
                logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Myer_logo.svg/2560px-Myer_logo.svg.png',
                categories: ['Department Store', 'Fashion'],
                lastSynced: new Date()
            },
            {
                id: '11223',
                name: 'The Iconic',
                domains: ['theiconic.com.au'],
                baseCommissionRate: 0.08, // 8%
                averageCommissionRate: 0.08,
                logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/The_Iconic_logo.svg/2560px-The_Iconic_logo.svg.png',
                categories: ['Fashion'],
                lastSynced: new Date()
            }
        ]

        // 3. Save to Firestore (Batch upsert)
        // Firestore batches are limited to 500 ops. If more, need to chunk.
        const batch = writeBatch(db)
        const collectionRef = collection(db, 'affiliate_merchants')

        let updateCount = 0
        for (const merchant of mockMerchants) {
            if (!merchant.id) continue
            const docRef = doc(collectionRef, merchant.id)
            batch.set(docRef, merchant, { merge: true }) // Update if exists
            updateCount++
        }

        await batch.commit()

        return NextResponse.json({
            success: true,
            message: `Synced ${updateCount} merchants`,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('Error syncing Skimlinks merchants:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
