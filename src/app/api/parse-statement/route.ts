import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
})

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    console.log('API Route Hit - Parse Statement')

    try {
        const formData = await req.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // 1. Convert File to Buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // 2. Parse PDF using pdf2json (Node.js native, no browser APIs needed)
        const PDFParser = require("pdf2json");
        const pdfParser = new PDFParser(null, 1); // 1 = text content

        const text = await new Promise<string>((resolve, reject) => {
            pdfParser.on("pdfParser_dataError", (errData: any) => reject(new Error(errData.parserError)));
            pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
                const rawText = pdfParser.getRawTextContent();
                resolve(rawText);
            });
            pdfParser.parseBuffer(buffer);
        });

        // 3. AI Extraction & Cleaning
        if (!text || text.length < 50) {
            return NextResponse.json({
                error: 'Could not extract text. This appears to be a scanned document. Please upload a digital PDF or CSV.'
            }, { status: 400 })
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert financial data analyst. 
                    Extract transactions from the bank statement text.
                    The text may be raw and jumbled due to PDF parsing (columnar data might be mixed).
                    
                    CRITICAL RULES:
                    1. **Clean Merchant Names**: Remove codes, locations, and gibberish. (e.g., "UBER *TRIP 2321 NSW" -> "Uber", "AMZN MKTP USWA" -> "Amazon").
                    2. **Categorize Strictly**: Use ONLY these categories: 'Food', 'Transport', 'Shopping', 'Utilities', 'Housing', 'Entertainment', 'Health', 'Income', 'Transfer', 'Other'.
                    3. **Date Format**: YYYY-MM-DD.
                    4. **Amount**: negative number for expenses (spent money), positive number for income (deposits, salary, transfers in).
                    5. **Ignore**: Balance checks, page headers, legal text, or non-transaction text.
                    6. **Structure**: Look for patterns of Date + Description + Amount.
                    7. **COMPLETENESS**: Extract EVERY SINGLE transaction row found in the text. Do not stop until the end of the document. This is a multi-page document (up to 13 pages), process all of it.

                    Return a JSON object with a 'transactions' array containing objects with: { date, description, amount, category }.`
                },
                {
                    role: "user",
                    content: `Parse this statement text:\n\n${text.substring(0, 100000)}`
                }
            ],
            response_format: { type: "json_object" }
        })

        const result = JSON.parse(completion.choices[0].message.content || '{"transactions": []}')

        return NextResponse.json(result)

    } catch (error: any) {
        console.error('Parse Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
