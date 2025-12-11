import { NextResponse } from 'next/server'
import { addCashbackTransaction } from '@/lib/dataService'

// Webhook endpoint to receive transaction updates from Skimlinks
// POST /api/webhooks/skimlinks
export async function POST(request: Request) {
    try {
        // Note: In production, verify the request comes from Skimlinks IPs or check signature if available.
        // For MVP, we'll parse the payload directly.

        // Skimlinks typically sends form-data or JSON. We'll handle JSON for now as it's cleaner,
        // but we might need to adjust based on their actual webhook format (often documentation specific).
        // Assuming JSON payload for this implementation based on modern standards.
        const body = await request.json()

        console.log('Received Skimlinks Webhook:', body)

        // Extract relevant fields
        // Structure depends on Skimlinks documentation. Common fields:
        // transaction_id, date, merchant_id, merchant_name, order_amount, commission_amount, xcust (custom_id)
        const {
            transaction_id: skimlinksId,
            date,
            merchant_id: merchantId,
            merchant_name: merchantName,
            order_amount: orderAmount,
            commission_amount: commissionAmount,
            xcust: userId,
            status // e.g., 'active', 'cancelled'
        } = body

        if (!userId) {
            console.warn('Skimlinks Webhook: Missing xcust (userId)', body)
            return NextResponse.json({ message: 'Ignored: No User ID' }, { status: 200 })
        }

        // Map status to our internal status
        let internalStatus: 'pending' | 'confirmed' | 'paid' | 'declined' = 'pending'
        if (status === 'active' || status === 'approved') internalStatus = 'confirmed'
        if (status === 'paid') internalStatus = 'paid'
        if (status === 'cancelled') internalStatus = 'declined'

        // Save to Firestore
        await addCashbackTransaction({
            skimlinksTransactionId: skimlinksId || `skim_${Date.now()}`,
            userId,
            merchantId: merchantId?.toString() || 'unknown',
            merchantName: merchantName || 'Unknown Merchant',
            orderAmount: parseFloat(orderAmount) || 0,
            commissionAmount: parseFloat(commissionAmount) || 0,
            userCashbackAmount: (parseFloat(commissionAmount) || 0) * 0.8, // 80% split to user
            status: internalStatus,
            clickDate: new Date(), // estimating
            transactionDate: date ? new Date(date) : new Date(),
            lastUpdated: new Date(),
            metadata: body
        })

        console.log(`Processed Cashback for User ${userId}: ${internalStatus}`)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error processing Skimlinks webhook:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
