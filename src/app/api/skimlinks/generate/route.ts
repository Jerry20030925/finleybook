import { NextResponse } from 'next/server'
import { getSkimlinksUrl } from '@/lib/skimlinks'

// This endpoint generates a Skimlinks URL with the user's ID attached for tracking.
// Usage: POST /api/skimlinks/generate
// Body: { targetUrl: "https://merchant.com...", userId: "u123" }
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { targetUrl, userId } = body

        if (!targetUrl || !userId) {
            return NextResponse.json(
                { error: 'Missing targetUrl or userId' },
                { status: 400 }
            )
        }

        // In a real production app, verify the session here to ensure userId matches the logged-in user.
        // For now, we trust the client-side passed ID as we build the MVP.

        // Generate the tracking URL
        const trackingUrl = getSkimlinksUrl(targetUrl, userId)

        return NextResponse.json({ trackingUrl })
    } catch (error) {
        console.error('Error generating Skimlinks URL:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
