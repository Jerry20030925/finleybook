import Tesseract from 'tesseract.js';
import { Transaction, TransactionSource, TaxDocument, TaxDocumentType } from '@/types';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import OpenAI from 'openai';

let openai: OpenAI | null = null;

const getOpenAIClient = () => {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }
  return openai;
};

export interface ReceiptData {
  merchantName?: string;
  totalAmount?: number;
  date?: Date;
  items?: Array<{
    description: string;
    amount: number;
    quantity?: number;
  }>;
  taxAmount?: number;
  currency?: string;
  receiptNumber?: string;
  address?: string;
  phone?: string;
}

export class OCRService {
  private static instance: OCRService;
  
  public static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  async processReceiptImage(
    userId: string,
    file: File,
    documentType: TaxDocumentType = TaxDocumentType.RECEIPT
  ): Promise<{ transaction: Transaction; document: TaxDocument }> {
    try {
      // Upload image to Firebase Storage
      const imageUrl = await this.uploadImage(userId, file);
      
      // Extract text using Tesseract.js
      const extractedText = await this.extractTextFromImage(file);
      
      // Parse receipt data using AI
      const receiptData = await this.parseReceiptData(extractedText);
      
      // Create transaction from receipt data
      const transaction = await this.createTransactionFromReceipt(userId, receiptData, imageUrl);
      
      // Create tax document record
      const taxDocument = await this.createTaxDocument(
        userId,
        file,
        imageUrl,
        documentType,
        receiptData
      );
      
      return { transaction, document: taxDocument };
    } catch (error) {
      console.error('OCR processing error:', error);
      throw new Error('Failed to process receipt image');
    }
  }

  async processInvoiceImage(userId: string, file: File): Promise<TaxDocument> {
    try {
      const imageUrl = await this.uploadImage(userId, file);
      const extractedText = await this.extractTextFromImage(file);
      const invoiceData = await this.parseInvoiceData(extractedText);
      
      return await this.createTaxDocument(
        userId,
        file,
        imageUrl,
        TaxDocumentType.INVOICE,
        invoiceData
      );
    } catch (error) {
      console.error('Invoice processing error:', error);
      throw new Error('Failed to process invoice image');
    }
  }

  async verifyReceiptAuthenticity(receiptData: ReceiptData): Promise<{
    isValid: boolean;
    confidence: number;
    issues: string[];
  }> {
    const issues: string[] = [];
    let confidence = 1.0;
    
    // Check for required fields
    if (!receiptData.merchantName) {
      issues.push('Missing merchant name');
      confidence -= 0.3;
    }
    
    if (!receiptData.totalAmount || receiptData.totalAmount <= 0) {
      issues.push('Invalid total amount');
      confidence -= 0.4;
    }
    
    if (!receiptData.date) {
      issues.push('Missing date');
      confidence -= 0.2;
    }
    
    // Check for suspicious patterns
    if (receiptData.date && receiptData.date > new Date()) {
      issues.push('Future date detected');
      confidence -= 0.5;
    }
    
    // Validate tax calculation if present
    if (receiptData.taxAmount && receiptData.items) {
      const itemsTotal = receiptData.items.reduce((sum, item) => sum + item.amount, 0);
      const expectedTotal = itemsTotal + receiptData.taxAmount;
      const difference = Math.abs(expectedTotal - (receiptData.totalAmount || 0));
      
      if (difference > 0.1) {
        issues.push('Tax calculation mismatch');
        confidence -= 0.3;
      }
    }
    
    return {
      isValid: confidence > 0.6,
      confidence: Math.max(0, confidence),
      issues
    };
  }

  private async uploadImage(userId: string, file: File): Promise<string> {
    const timestamp = new Date().getTime();
    const fileName = `receipts/${userId}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  private async extractTextFromImage(file: File): Promise<string> {
    const { data: { text } } = await Tesseract.recognize(file, 'eng', {
      logger: m => console.log(m)
    });
    
    return text;
  }

  private async parseReceiptData(extractedText: string): Promise<ReceiptData> {
    try {
      const prompt = `
        Parse the following receipt text and extract structured data. Return only valid JSON:
        
        "${extractedText}"
        
        Extract this information in JSON format:
        {
          "merchantName": "string or null",
          "totalAmount": number or null,
          "date": "YYYY-MM-DD format or null",
          "items": [{"description": "string", "amount": number, "quantity": number}] or [],
          "taxAmount": number or null,
          "currency": "USD" or other currency,
          "receiptNumber": "string or null",
          "address": "string or null",
          "phone": "string or null"
        }
        
        Important:
        - Extract monetary amounts as numbers (e.g., 12.99, not "$12.99")
        - Format dates as YYYY-MM-DD
        - If information is not found, use null
        - Return only valid JSON, no additional text
      `;

      const response = await getOpenAIClient().chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No response from AI');
      
      const parsedData = JSON.parse(content);
      
      // Convert date string to Date object
      if (parsedData.date) {
        parsedData.date = new Date(parsedData.date);
      }
      
      return parsedData as ReceiptData;
    } catch (error) {
      console.error('Receipt parsing error:', error);
      throw new Error('Failed to parse receipt data');
    }
  }

  private async parseInvoiceData(extractedText: string): Promise<any> {
    try {
      const prompt = `
        Parse the following invoice text and extract structured data:
        
        "${extractedText}"
        
        Extract this information in JSON format:
        {
          "invoiceNumber": "string or null",
          "issueDate": "YYYY-MM-DD format or null",
          "dueDate": "YYYY-MM-DD format or null",
          "vendorName": "string or null",
          "vendorAddress": "string or null",
          "clientName": "string or null",
          "clientAddress": "string or null",
          "items": [{"description": "string", "amount": number, "quantity": number}],
          "subtotal": number or null,
          "taxAmount": number or null,
          "totalAmount": number or null,
          "currency": "USD" or other currency,
          "paymentTerms": "string or null"
        }
        
        Return only valid JSON.
      `;

      const response = await getOpenAIClient().chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Invoice parsing error:', error);
      throw new Error('Failed to parse invoice data');
    }
  }

  private async createTransactionFromReceipt(
    userId: string,
    receiptData: ReceiptData,
    receiptUrl: string
  ): Promise<Transaction> {
    return {
      id: '', // Will be set by Firestore
      userId,
      amount: -(receiptData.totalAmount || 0), // Negative for expense
      currency: receiptData.currency || 'USD',
      description: `${receiptData.merchantName || 'Receipt'} - ${receiptData.receiptNumber || ''}`.trim(),
      category: { id: '', name: 'Other', color: '#9ca3af', icon: '🧾' }, // Will be categorized later
      type: 'expense',
      date: receiptData.date || new Date(),
      source: TransactionSource.OCR_RECEIPT,
      receiptUrl,
      merchantName: receiptData.merchantName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private async createTaxDocument(
    userId: string,
    file: File,
    url: string,
    type: TaxDocumentType,
    extractedData: any
  ): Promise<TaxDocument> {
    return {
      id: '', // Will be set by Firestore
      userId,
      type,
      year: new Date().getFullYear(),
      url,
      fileName: file.name,
      fileSize: file.size,
      extractedData,
      verificationStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async detectDuplicateReceipts(userId: string, receiptData: ReceiptData): Promise<boolean> {
    // This would check against existing receipts in the database
    // Implementation would involve querying Firestore for similar receipts
    // based on merchant name, amount, and date proximity
    
    try {
      // Query existing receipts with similar characteristics
      const similarReceipts = await this.findSimilarReceipts(userId, receiptData);
      
      return similarReceipts.length > 0;
    } catch (error) {
      console.error('Duplicate detection error:', error);
      return false;
    }
  }

  private async findSimilarReceipts(userId: string, receiptData: ReceiptData): Promise<any[]> {
    // Implementation would query Firestore for receipts with:
    // - Same merchant name
    // - Similar amount (within 5%)
    // - Date within 3 days
    // - Same receipt number (if available)
    
    // For now, returning empty array as placeholder
    return [];
  }

  async enhanceReceiptData(receiptData: ReceiptData): Promise<ReceiptData> {
    try {
      // Use AI to enhance and validate extracted data
      const prompt = `
        Review and enhance this receipt data for accuracy and completeness:
        ${JSON.stringify(receiptData)}
        
        Please:
        1. Standardize the merchant name (e.g., "WALMART #1234" -> "Walmart")
        2. Validate amounts and calculations
        3. Infer missing information where possible
        4. Categorize the purchase type
        
        Return enhanced data in the same JSON structure with an additional "category" field.
      `;

      const response = await getOpenAIClient().chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      });

      const enhancedData = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        ...receiptData,
        ...enhancedData,
        date: receiptData.date, // Preserve original date object
      };
    } catch (error) {
      console.error('Receipt enhancement error:', error);
      return receiptData; // Return original data if enhancement fails
    }
  }
}