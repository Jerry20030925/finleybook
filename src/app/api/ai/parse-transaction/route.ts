import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { input, currency = 'AUD' } = await req.json();

        // 1. Authentication
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await getAdminAuth().verifyIdToken(token);
        const uid = decodedToken.uid;

        // 2. Check Usage Limits
        const db = getAdminDb();
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();
        const userData = userDoc.data();

        // Determine Pro Status (Mirroring SubscriptionProvider logic)
        const isProMember = userData?.subscription?.planKey !== 'FREE' && userData?.subscription?.status === 'active';

        // Check limits for Free users
        if (!isProMember) {
            const now = new Date();
            const lastReset = userData?.aiUsageResetDate ? userData.aiUsageResetDate.toDate() : new Date(0);
            let currentUsage = userData?.aiMonthlyUsage || 0;

            // Check if we need to reset (new month)
            if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
                currentUsage = 0;
                await userRef.update({
                    aiMonthlyUsage: 0,
                    aiUsageResetDate: FieldValue.serverTimestamp()
                });
            }

            if (currentUsage >= 3) {
                return NextResponse.json(
                    { error: 'Monthly AI limit reached. Upgrade to Pro for unlimited access.' },
                    { status: 403 }
                );
            }
        }

        if (!input) {
            return NextResponse.json(
                { error: 'Input text is required' },
                { status: 400 }
            );
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 500 }
            );
        }

        const prompt = `
      Extract transaction details from the following text: "${input}"
      
      Return a JSON object with the following fields:
      - amount: number (numeric value only)
      - currency: string (3-letter code, default to ${currency} if not specified)
      - merchant: string (name of the place/person)
      - category: string (best fit from: Food, Transport, Shopping, Housing, Health, Entertainment, Education, Income, Other)
      - date: string (ISO 8601 format YYYY-MM-DD, assume current year if not specified, today is ${new Date().toISOString().split('T')[0]})
      - description: string (brief summary)
      - items: array of strings (specific items mentioned)
      - emotional_context: string (infer from text: 'happy', 'stress', 'impulse', 'sad', 'neutral')
      
      If the text is not a transaction, return { error: "Not a transaction" }.
      Do not include markdown formatting, just raw JSON.
    `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a helpful financial assistant that parses transaction data." },
                { role: "user", content: prompt }
            ],
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;

        if (!content) {
            throw new Error('No content returned from OpenAI');
        }

        const parsedData = JSON.parse(content);

        // 3. Increment Usage if successful
        // We track usage for everyone, but only enforce for free
        await userRef.update({
            aiMonthlyUsage: FieldValue.increment(1),
            lastAIInteraction: FieldValue.serverTimestamp()
        });

        return NextResponse.json({ data: parsedData });

    } catch (error: any) {
        console.error('Error parsing transaction with AI:', error);
        // Handle Token Expired or Invalid
        if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json(
            { error: error.message || 'Failed to parse transaction' },
            { status: 500 }
        );
    }
}
