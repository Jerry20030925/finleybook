import { Transaction, TransactionSource, TransactionCategory } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
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

export class DataAggregationService {
  private static instance: DataAggregationService;
  
  public static getInstance(): DataAggregationService {
    if (!DataAggregationService.instance) {
      DataAggregationService.instance = new DataAggregationService();
    }
    return DataAggregationService.instance;
  }

  async syncBankTransactions(userId: string, accountId: string): Promise<Transaction[]> {
    try {
      const existingTransactions = await this.getExistingTransactions(userId, accountId);
      const newTransactions = await this.fetchBankTransactions(accountId);
      
      const processedTransactions: Transaction[] = [];
      
      for (const bankTx of newTransactions) {
        const bankTxDateString = bankTx.date ? bankTx.date.toISOString() : null;
        const isDuplicate = existingTransactions.some(
          tx => tx.amount === bankTx.amount && 
               tx.date?.toISOString() === bankTxDateString &&
               tx.description === bankTx.description
        );
        
        if (!isDuplicate) {
          const completeTransaction: Transaction = {
            id: '',
            userId,
            amount: bankTx.amount || 0,
            currency: 'USD',
            description: bankTx.description || '',
            category: { id: '', name: 'Other', color: '#9ca3af', icon: 'folder' },
            type: (bankTx.amount || 0) > 0 ? 'income' : 'expense',
            date: bankTx.date || new Date(),
            source: bankTx.source || TransactionSource.BANK_SYNC,
            tags: bankTx.tags,
            receiptUrl: bankTx.receiptUrl,
            isRecurring: bankTx.isRecurring,
            merchantName: bankTx.merchantName,
            location: bankTx.location,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          const categorizedTransaction = await this.categorizeTransaction(completeTransaction);
          const transaction = await this.saveTransaction(categorizedTransaction);
          processedTransactions.push(transaction);
        }
      }
      
      return processedTransactions;
    } catch (error) {
      console.error('Bank sync error:', error);
      throw new Error('Failed to sync bank transactions');
    }
  }

  async processManualTransaction(
    userId: string,
    amount: number,
    description: string,
    date: Date,
    accountId?: string
  ): Promise<Transaction> {
    const transaction: Partial<Transaction> = {
      userId,
      amount,
      description,
      date,
      source: TransactionSource.MANUAL,
      type: amount > 0 ? 'income' : 'expense',
      currency: 'USD',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const categorizedTransaction = await this.categorizeTransaction(transaction as Transaction);
    return await this.saveTransaction(categorizedTransaction);
  }

  async processNaturalLanguageEntry(userId: string, input: string): Promise<Transaction> {
    try {
      const prompt = `
        Parse this financial transaction from natural language: "${input}"
        
        Extract the following information and return as JSON:
        {
          "amount": number (positive for income, negative for expenses),
          "description": string,
          "category": string,
          "date": ISO date string (default to today if not specified),
          "type": "income" or "expense",
          "merchantName": string or null
        }
        
        Examples:
        - "spent $35 on lunch at McDonald's" -> {"amount": -35, "description": "Lunch at McDonald's", "category": "Food & Dining", "type": "expense", "merchantName": "McDonald's"}
        - "received $1000 salary" -> {"amount": 1000, "description": "Salary", "category": "Income", "type": "income", "merchantName": null}
      `;

      const response = await getOpenAIClient().chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      });

      const parsedData = JSON.parse(response.choices[0].message.content || '{}');
      
      return await this.processManualTransaction(
        userId,
        parsedData.amount,
        parsedData.description,
        new Date(parsedData.date || new Date())
      );
    } catch (error) {
      console.error('Natural language processing error:', error);
      throw new Error('Failed to process natural language entry');
    }
  }

  private async categorizeTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      const prompt = `
        Categorize this financial transaction:
        Description: ${transaction.description}
        Amount: ${transaction.amount}
        
        Choose from these categories:
        - Food & Dining
        - Transportation
        - Shopping
        - Entertainment
        - Bills & Utilities
        - Healthcare
        - Travel
        - Business
        - Income
        - Transfers
        - Other
        
        Return only the category name.
      `;

      const response = await getOpenAIClient().chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      });

      const categoryName = response.choices[0].message.content?.trim() || 'Other';
      const category = await this.getOrCreateCategory(categoryName);
      
      return {
        ...transaction,
        category,
      };
    } catch (error) {
      console.error('Transaction categorization error:', error);
      const defaultCategory = await this.getOrCreateCategory('Other');
      return {
        ...transaction,
        category: defaultCategory,
      };
    }
  }

  private async getOrCreateCategory(name: string): Promise<TransactionCategory> {
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, where('name', '==', name));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as TransactionCategory;
    }
    
    const categoryColors: Record<string, string> = {
      'Food & Dining': '#f59e0b',
      'Transportation': '#3b82f6',
      'Shopping': '#ec4899',
      'Entertainment': '#8b5cf6',
      'Bills & Utilities': '#ef4444',
      'Healthcare': '#10b981',
      'Travel': '#06b6d4',
      'Business': '#6366f1',
      'Income': '#22c55e',
      'Transfers': '#6b7280',
      'Other': '#9ca3af'
    };
    
    const newCategory: Omit<TransactionCategory, 'id'> = {
      name,
      color: categoryColors[name] || '#9ca3af',
      icon: '📊',
    };
    
    const docRef = await addDoc(categoriesRef, newCategory);
    return { id: docRef.id, ...newCategory };
  }

  private async getExistingTransactions(userId: string, accountId: string): Promise<Transaction[]> {
    const transactionsRef = collection(db, 'transactions');
    const q = query(
      transactionsRef,
      where('userId', '==', userId),
      where('accountId', '==', accountId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Transaction[];
  }

  private async fetchBankTransactions(accountId: string): Promise<Partial<Transaction>[]> {
    // This would integrate with actual bank APIs like Plaid, Yodlee, or Open Banking
    // For demo purposes, returning mock data
    return [
      {
        amount: -45.67,
        description: 'STARBUCKS #1234',
        date: new Date(),
        source: TransactionSource.BANK_SYNC,
        merchantName: 'Starbucks',
      },
      {
        amount: -12.50,
        description: 'UBER RIDE',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        source: TransactionSource.BANK_SYNC,
        merchantName: 'Uber',
      }
    ];
  }

  private async saveTransaction(transaction: Transaction): Promise<Transaction> {
    const transactionsRef = collection(db, 'transactions');
    const docRef = await addDoc(transactionsRef, {
      ...transaction,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return { ...transaction, id: docRef.id };
  }

  async detectDuplicateTransactions(userId: string): Promise<Transaction[][]> {
    const transactionsRef = collection(db, 'transactions');
    const q = query(transactionsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const transactions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
    })) as Transaction[];
    
    const duplicateGroups: Transaction[][] = [];
    const processed = new Set<string>();
    
    for (let i = 0; i < transactions.length; i++) {
      if (processed.has(transactions[i].id)) continue;
      
      const similar: Transaction[] = [transactions[i]];
      processed.add(transactions[i].id);
      
      for (let j = i + 1; j < transactions.length; j++) {
        if (processed.has(transactions[j].id)) continue;
        
        if (this.areSimilarTransactions(transactions[i], transactions[j])) {
          similar.push(transactions[j]);
          processed.add(transactions[j].id);
        }
      }
      
      if (similar.length > 1) {
        duplicateGroups.push(similar);
      }
    }
    
    return duplicateGroups;
  }

  private areSimilarTransactions(tx1: Transaction, tx2: Transaction): boolean {
    const amountMatch = Math.abs(tx1.amount - tx2.amount) < 0.01;
    const dateMatch = Math.abs(tx1.date.getTime() - tx2.date.getTime()) < 24 * 60 * 60 * 1000; // 1 day
    const descriptionSimilarity = this.calculateStringSimilarity(tx1.description, tx2.description);
    
    return amountMatch && dateMatch && descriptionSimilarity > 0.8;
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    return (longer.length - this.levenshteinDistance(longer, shorter)) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + substitutionCost
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}