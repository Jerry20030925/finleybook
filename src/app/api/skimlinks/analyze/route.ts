import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, limit } from 'firebase/firestore'

// Link Analyzer API
// POST /api/skimlinks/analyze
// Body: { url: "https://amazon.com/..." }
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { url } = body

        if (!url) {
            return NextResponse.json({ error: 'Missing URL' }, { status: 400 })
        }

        console.log('Analyzing URL for cashback:', url)

        // 1. Check Skimlinks Link API (Mocked)
        // In production: Call Skimlinks API to check `monetizable` status
        // const skimlinksData = await fetchSkimlinksLinkApi(url)

        // 2. Parse domain to find matching merchant in our local DB
        // Simple domain extraction
        let domain = ''
        try {
            const urlObj = new URL(url)
            domain = urlObj.hostname.replace('www.', '')
            // Handle simple subdomains or tlds? For now exact match on main domain parts
            // e.g. "amazon.com.au" -> match against ["amazon.com", "amazon.co.uk", "amazon.com.au"]
        } catch (e) {
            return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
        }

        // 3. Lookup in Firestore
        // This allows us to return the specific commission rate we synced earlier
        let merchantInfo = null
        const q = query(
            collection(db, 'affiliate_merchants'),
            where('domains', 'array-contains', domain),
            limit(1)
        )
        const snapshot = await getDocs(q)

        if (!snapshot.empty) {
            const data = snapshot.docs[0].data()
            merchantInfo = {
                name: data.name,
                commissionRate: data.baseCommissionRate,
                averageRate: data.averageCommissionRate || data.baseCommissionRate,
                logo: data.logoUrl
            }
        } else {
            // Fallback Search?
            // For MVP, if not in DB, we rely on the mock/API response
        }

        // Mock Response Logic
        const isMonetizable = !!merchantInfo || domain.includes('amazon') || domain.includes('myer')

        return NextResponse.json({
            monetizable: isMonetizable,
            url: url,
            merchant: merchantInfo || (isMonetizable ? {
                name: 'Partner Merchant', // Fallback if we detected it's monetizable but missed local DB match
                commissionRate: 0.05,
                estimatedCashback: 'Up to 5%'
            } : null)
        })

    } catch (error) {
        console.error('Error analyzing Skimlinks URL:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
