
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    console.error('❌ No OPENAI_API_KEY found in .env.local');
    process.exit(1);
}

console.log(`Found API Key: ${apiKey.slice(0, 8)}...`);

const openai = new OpenAI({
    apiKey: apiKey,
});

async function testConnection() {
    try {
        console.log('Sending test request to OpenAI...');
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: "Say 'Hello World' in JSON format: { message: '...' }" }
            ],
            response_format: { type: "json_object" }
        });

        console.log('✅ Response received:', completion.choices[0].message.content);
        console.log('✅ API Key is valid!');
    } catch (error: any) {
        console.error('❌ OpenAI API Error:', error.message);
        if (error.status === 401) {
            console.error('Reason: Unauthorized - Incorrect API Key');
        }
        process.exit(1);
    }
}

testConnection();
