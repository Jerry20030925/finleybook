export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  description: string;
  category: TransactionCategory;
  type: 'income' | 'expense';
  date: Date;
  source: TransactionSource;
  tags?: string[];
  receiptUrl?: string;
  isRecurring?: boolean;
  merchantName?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  parentId?: string;
}

export enum TransactionSource {
  MANUAL = 'manual',
  BANK_SYNC = 'bank_sync',
  OCR_RECEIPT = 'ocr_receipt',
  API_IMPORT = 'api_import'
}

export interface FinancialAccount {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  bankName?: string;
  accountNumber?: string;
  isActive: boolean;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  CREDIT_CARD = 'credit_card',
  INVESTMENT = 'investment',
  CASH = 'cash'
}

export interface Budget {
  id: string;
  userId: string;
  name: string;
  amount: number;
  spent: number;
  categoryIds: string[];
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaxDocument {
  id: string;
  userId: string;
  type: TaxDocumentType;
  year: number;
  url: string;
  fileName: string;
  fileSize: number;
  extractedData?: any;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export enum TaxDocumentType {
  W2 = 'w2',
  FORM_1099 = '1099',
  RECEIPT = 'receipt',
  INVOICE = 'invoice',
  BANK_STATEMENT = 'bank_statement'
}

export interface FinancialGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  category: 'emergency_fund' | 'vacation' | 'home_purchase' | 'retirement' | 'education' | 'other';
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIInsight {
  id: string;
  userId: string;
  type: 'spending_pattern' | 'budget_alert' | 'tax_optimization' | 'goal_tracking' | 'risk_warning';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  data?: any;
  isRead: boolean;
  expiresAt?: Date;
  createdAt: Date;
}

export interface RiskAlert {
  id: string;
  userId: string;
  type: 'duplicate_invoice' | 'unusual_spending' | 'tax_deadline' | 'budget_exceeded' | 'account_sync_failed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  isResolved: boolean;
  resolvedAt?: Date;
  createdAt: Date;
}

export interface FinancialReport {
  id: string;
  userId: string;
  type: 'monthly_summary' | 'tax_preparation' | 'budget_analysis' | 'cash_flow' | 'net_worth';
  title: string;
  period: {
    start: Date;
    end: Date;
  };
  data: any;
  fileUrl?: string;
  generatedAt: Date;
}