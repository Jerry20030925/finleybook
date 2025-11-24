import { Transaction, TaxDocument, RiskAlert, User } from '@/types';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore';
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

export interface TaxRiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-100, higher is riskier
  factors: TaxRiskFactor[];
  recommendations: string[];
  deadlines: TaxDeadline[];
}

export interface TaxRiskFactor {
  type: 'audit_trigger' | 'missing_documentation' | 'unusual_deduction' | 'income_discrepancy' | 'duplicate_expense';
  severity: 'low' | 'medium' | 'high';
  description: string;
  relatedTransactionIds?: string[];
  suggestedAction: string;
  deadline?: Date;
}

export interface TaxDeadline {
  type: 'quarterly_payment' | 'annual_filing' | 'extension_deadline' | 'document_submission';
  date: Date;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  amount?: number;
}

export interface TaxOptimization {
  potentialSavings: number;
  strategies: TaxStrategy[];
  requiredActions: string[];
  timeline: string;
}

export interface TaxStrategy {
  name: string;
  description: string;
  estimatedSavings: number;
  effort: 'low' | 'medium' | 'high';
  deadline?: Date;
  category: 'deduction' | 'credit' | 'deferral' | 'retirement' | 'business';
}

export class TaxRiskMonitoringService {
  private static instance: TaxRiskMonitoringService;
  
  public static getInstance(): TaxRiskMonitoringService {
    if (!TaxRiskMonitoringService.instance) {
      TaxRiskMonitoringService.instance = new TaxRiskMonitoringService();
    }
    return TaxRiskMonitoringService.instance;
  }

  async assessTaxRisk(userId: string, year?: number): Promise<TaxRiskAssessment> {
    try {
      const currentYear = year || new Date().getFullYear();
      const [transactions, documents, alerts] = await Promise.all([
        this.getYearTransactions(userId, currentYear),
        this.getTaxDocuments(userId, currentYear),
        this.getActiveRiskAlerts(userId)
      ]);

      const factors: TaxRiskFactor[] = [];
      
      // Check for audit triggers
      const auditTriggers = await this.identifyAuditTriggers(transactions);
      factors.push(...auditTriggers);
      
      // Check for missing documentation
      const missingDocs = await this.identifyMissingDocumentation(transactions, documents);
      factors.push(...missingDocs);
      
      // Check for unusual deductions
      const unusualDeductions = await this.identifyUnusualDeductions(transactions);
      factors.push(...unusualDeductions);
      
      // Check for income discrepancies
      const incomeIssues = await this.identifyIncomeDiscrepancies(transactions);
      factors.push(...incomeIssues);
      
      // Check for duplicate expenses
      const duplicates = await this.identifyDuplicateExpenses(transactions);
      factors.push(...duplicates);
      
      const score = this.calculateRiskScore(factors);
      const overallRisk = this.determineRiskLevel(score);
      const recommendations = await this.generateRecommendations(factors);
      const deadlines = await this.getUpcomingDeadlines(userId, currentYear);
      
      return {
        overallRisk,
        score,
        factors,
        recommendations,
        deadlines
      };
    } catch (error) {
      console.error('Tax risk assessment error:', error);
      throw new Error('Failed to assess tax risk');
    }
  }

  async monitorTaxCompliance(userId: string): Promise<RiskAlert[]> {
    try {
      const currentYear = new Date().getFullYear();
      const [transactions, documents] = await Promise.all([
        this.getYearTransactions(userId, currentYear),
        this.getTaxDocuments(userId, currentYear)
      ]);

      const alerts: RiskAlert[] = [];
      
      // Monitor for real-time compliance issues
      const complianceIssues = await this.checkComplianceIssues(transactions, documents);
      alerts.push(...complianceIssues);
      
      // Monitor deadlines
      const deadlineAlerts = await this.checkUpcomingDeadlines(userId);
      alerts.push(...deadlineAlerts);
      
      // Monitor for policy changes
      const policyAlerts = await this.checkPolicyChanges(userId);
      alerts.push(...policyAlerts);
      
      // Save alerts to database
      for (const alert of alerts) {
        await this.saveRiskAlert(alert);
      }
      
      return alerts;
    } catch (error) {
      console.error('Tax compliance monitoring error:', error);
      throw new Error('Failed to monitor tax compliance');
    }
  }

  async optimizeTaxStrategy(
    userId: string, 
    annualIncome: number,
    deductions: number
  ): Promise<TaxOptimization> {
    try {
      const transactions = await this.getYearTransactions(userId, new Date().getFullYear());
      const businessExpenses = transactions.filter(tx => 
        tx.category.name.includes('Business') || 
        tx.tags?.includes('business')
      );
      
      const strategies: TaxStrategy[] = [];
      
      // Retirement contribution strategies
      const retirementStrategy = this.analyzeRetirementContributions(annualIncome);
      if (retirementStrategy) strategies.push(retirementStrategy);
      
      // Business expense optimization
      const businessStrategy = this.analyzeBusinessExpenses(businessExpenses);
      if (businessStrategy) strategies.push(businessStrategy);
      
      // Charitable giving optimization
      const charityStrategy = this.analyzeCharitableGiving(transactions);
      if (charityStrategy) strategies.push(charityStrategy);
      
      // Tax loss harvesting (for investment accounts)
      const harvestingStrategy = this.analyzeTaxLossHarvesting(transactions);
      if (harvestingStrategy) strategies.push(harvestingStrategy);
      
      // Health Savings Account optimization
      const hsaStrategy = this.analyzeHSAOptimization(annualIncome);
      if (hsaStrategy) strategies.push(hsaStrategy);
      
      const totalSavings = strategies.reduce((sum, strategy) => sum + strategy.estimatedSavings, 0);
      const requiredActions = strategies.map(s => `Implement ${s.name}`);
      
      return {
        potentialSavings: totalSavings,
        strategies,
        requiredActions,
        timeline: 'Complete by end of tax year for maximum benefit'
      };
    } catch (error) {
      console.error('Tax optimization error:', error);
      throw new Error('Failed to optimize tax strategy');
    }
  }

  async validateReceiptAuthenticity(
    receiptData: any,
    businessContext: string
  ): Promise<{
    isValid: boolean;
    confidence: number;
    issues: string[];
    recommendations: string[];
  }> {
    try {
      const prompt = `
        Validate this receipt for tax deduction eligibility:
        
        Receipt Data: ${JSON.stringify(receiptData)}
        Business Context: ${businessContext}
        
        Check for:
        1. Required information (date, amount, merchant, business purpose)
        2. Authenticity indicators
        3. Tax deduction eligibility
        4. Compliance with IRS requirements
        
        Return JSON with:
        {
          "isValid": boolean,
          "confidence": number (0-1),
          "issues": ["string array of problems"],
          "recommendations": ["string array of improvements"]
        }
      `;

      const response = await getOpenAIClient().chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Receipt validation error:', error);
      return {
        isValid: false,
        confidence: 0,
        issues: ['Unable to validate receipt'],
        recommendations: ['Manual review required']
      };
    }
  }

  private async getYearTransactions(userId: string, year: number): Promise<Transaction[]> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
    })) as Transaction[];
  }

  private async getTaxDocuments(userId: string, year: number): Promise<TaxDocument[]> {
    const q = query(
      collection(db, 'taxDocuments'),
      where('userId', '==', userId),
      where('year', '==', year)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as TaxDocument[];
  }

  private async getActiveRiskAlerts(userId: string): Promise<RiskAlert[]> {
    const q = query(
      collection(db, 'riskAlerts'),
      where('userId', '==', userId),
      where('isResolved', '==', false),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as RiskAlert[];
  }

  private async identifyAuditTriggers(transactions: Transaction[]): Promise<TaxRiskFactor[]> {
    const factors: TaxRiskFactor[] = [];
    
    // High cash transactions
    const largeCashTransactions = transactions.filter(tx => 
      Math.abs(tx.amount) > 10000 && tx.description.toLowerCase().includes('cash')
    );
    
    if (largeCashTransactions.length > 0) {
      factors.push({
        type: 'audit_trigger',
        severity: 'high',
        description: `${largeCashTransactions.length} large cash transactions detected`,
        relatedTransactionIds: largeCashTransactions.map(tx => tx.id),
        suggestedAction: 'Ensure proper documentation for all cash transactions over $10,000'
      });
    }
    
    // Unusual business expense patterns
    const businessExpenses = transactions.filter(tx => 
      tx.category.name.includes('Business') && Math.abs(tx.amount) > 1000
    );
    
    if (businessExpenses.length > 50) {
      factors.push({
        type: 'audit_trigger',
        severity: 'medium',
        description: 'High volume of business expense deductions',
        suggestedAction: 'Maintain detailed records and receipts for all business expenses'
      });
    }
    
    return factors;
  }

  private async identifyMissingDocumentation(
    transactions: Transaction[], 
    documents: TaxDocument[]
  ): Promise<TaxRiskFactor[]> {
    const factors: TaxRiskFactor[] = [];
    
    // Check for business expenses without receipts
    const businessExpenses = transactions.filter(tx => 
      tx.category.name.includes('Business') && !tx.receiptUrl
    );
    
    if (businessExpenses.length > 0) {
      factors.push({
        type: 'missing_documentation',
        severity: 'medium',
        description: `${businessExpenses.length} business expenses without receipt documentation`,
        relatedTransactionIds: businessExpenses.map(tx => tx.id),
        suggestedAction: 'Upload receipts for all business expense claims'
      });
    }
    
    return factors;
  }

  private async identifyUnusualDeductions(transactions: Transaction[]): Promise<TaxRiskFactor[]> {
    const factors: TaxRiskFactor[] = [];
    
    // Calculate total deductions by category
    const deductionsByCategory = transactions
      .filter(tx => tx.type === 'expense')
      .reduce((acc, tx) => {
        const category = tx.category.name;
        if (!acc[category]) acc[category] = 0;
        acc[category] += Math.abs(tx.amount);
        return acc;
      }, {} as Record<string, number>);
    
    // Check for unusually high deductions (using IRS benchmarks)
    const benchmarks = {
      'Business': 25000,
      'Charitable': 5000,
      'Medical': 10000,
      'Education': 4000
    };
    
    Object.entries(deductionsByCategory).forEach(([category, amount]) => {
      const benchmark = benchmarks[category as keyof typeof benchmarks];
      if (benchmark && amount > benchmark * 2) {
        factors.push({
          type: 'unusual_deduction',
          severity: 'medium',
          description: `${category} deductions (${amount.toFixed(2)}) significantly exceed typical ranges`,
          suggestedAction: 'Review and document justification for high deduction amounts'
        });
      }
    });
    
    return factors;
  }

  private async identifyIncomeDiscrepancies(transactions: Transaction[]): Promise<TaxRiskFactor[]> {
    const factors: TaxRiskFactor[] = [];
    
    // Check for large unreported income indicators
    const largeDeposits = transactions.filter(tx => 
      tx.type === 'income' && 
      tx.amount > 5000 && 
      !tx.category.name.includes('Salary')
    );
    
    if (largeDeposits.length > 0) {
      factors.push({
        type: 'income_discrepancy',
        severity: 'medium',
        description: `${largeDeposits.length} large deposits that may require income reporting`,
        relatedTransactionIds: largeDeposits.map(tx => tx.id),
        suggestedAction: 'Verify all income sources are properly reported'
      });
    }
    
    return factors;
  }

  private async identifyDuplicateExpenses(transactions: Transaction[]): Promise<TaxRiskFactor[]> {
    const factors: TaxRiskFactor[] = [];
    
    // Find potential duplicate transactions
    const duplicates: Transaction[][] = [];
    
    for (let i = 0; i < transactions.length; i++) {
      for (let j = i + 1; j < transactions.length; j++) {
        const tx1 = transactions[i];
        const tx2 = transactions[j];
        
        if (
          Math.abs(tx1.amount - tx2.amount) < 0.01 &&
          tx1.merchantName === tx2.merchantName &&
          Math.abs(tx1.date.getTime() - tx2.date.getTime()) < 24 * 60 * 60 * 1000
        ) {
          duplicates.push([tx1, tx2]);
        }
      }
    }
    
    if (duplicates.length > 0) {
      factors.push({
        type: 'duplicate_expense',
        severity: 'high',
        description: `${duplicates.length} potential duplicate expenses detected`,
        suggestedAction: 'Review and remove duplicate expense claims'
      });
    }
    
    return factors;
  }

  private calculateRiskScore(factors: TaxRiskFactor[]): number {
    const severityWeights = { low: 10, medium: 25, high: 50 };
    const totalScore = factors.reduce(
      (sum, factor) => sum + severityWeights[factor.severity], 
      0
    );
    
    return Math.min(100, totalScore);
  }

  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
  }

  private async generateRecommendations(factors: TaxRiskFactor[]): Promise<string[]> {
    const recommendations = new Set<string>();
    
    factors.forEach(factor => {
      recommendations.add(factor.suggestedAction);
    });
    
    // Add general recommendations
    recommendations.add('Maintain organized records for all tax-related transactions');
    recommendations.add('Consult with a tax professional for complex situations');
    recommendations.add('Review tax strategy quarterly to optimize deductions');
    
    return Array.from(recommendations);
  }

  private async getUpcomingDeadlines(userId: string, year: number): Promise<TaxDeadline[]> {
    const deadlines: TaxDeadline[] = [
      {
        type: 'quarterly_payment',
        date: new Date(year, 3, 15), // April 15
        description: 'Q1 Estimated Tax Payment',
        priority: 'high',
        completed: false
      },
      {
        type: 'quarterly_payment',
        date: new Date(year, 5, 15), // June 15
        description: 'Q2 Estimated Tax Payment',
        priority: 'high',
        completed: false
      },
      {
        type: 'quarterly_payment',
        date: new Date(year, 8, 15), // September 15
        description: 'Q3 Estimated Tax Payment',
        priority: 'high',
        completed: false
      },
      {
        type: 'quarterly_payment',
        date: new Date(year + 1, 0, 15), // January 15 (next year)
        description: 'Q4 Estimated Tax Payment',
        priority: 'high',
        completed: false
      },
      {
        type: 'annual_filing',
        date: new Date(year + 1, 3, 15), // April 15 (next year)
        description: 'Annual Tax Return Filing',
        priority: 'high',
        completed: false
      }
    ];
    
    // Filter to upcoming deadlines only
    const now = new Date();
    return deadlines.filter(deadline => deadline.date > now);
  }

  private async checkComplianceIssues(
    transactions: Transaction[], 
    documents: TaxDocument[]
  ): Promise<RiskAlert[]> {
    const alerts: RiskAlert[] = [];
    
    // Check for expenses without proper documentation
    const undocumentedExpenses = transactions.filter(tx => 
      tx.type === 'expense' && 
      Math.abs(tx.amount) > 75 && 
      !tx.receiptUrl
    );
    
    if (undocumentedExpenses.length > 0) {
      alerts.push({
        id: '',
        userId: transactions[0]?.userId || '',
        type: 'tax_deadline',
        severity: 'medium',
        title: 'Missing Receipt Documentation',
        description: `${undocumentedExpenses.length} expenses over $75 lack proper documentation`,
        isResolved: false,
        createdAt: new Date()
      });
    }
    
    return alerts;
  }

  private async checkUpcomingDeadlines(userId: string): Promise<RiskAlert[]> {
    const alerts: RiskAlert[] = [];
    const deadlines = await this.getUpcomingDeadlines(userId, new Date().getFullYear());
    
    deadlines.forEach(deadline => {
      const daysUntil = Math.ceil((deadline.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil <= 30 && !deadline.completed) {
        alerts.push({
          id: '',
          userId,
          type: 'tax_deadline',
          severity: daysUntil <= 7 ? 'high' : 'medium',
          title: `Upcoming Tax Deadline: ${deadline.description}`,
          description: `Due in ${daysUntil} days`,
          isResolved: false,
          createdAt: new Date()
        });
      }
    });
    
    return alerts;
  }

  private async checkPolicyChanges(userId: string): Promise<RiskAlert[]> {
    // This would check for recent tax law changes and their impact
    // For now, returning empty array
    return [];
  }

  private async saveRiskAlert(alert: RiskAlert): Promise<void> {
    await addDoc(collection(db, 'riskAlerts'), {
      ...alert,
      createdAt: new Date()
    });
  }

  // Tax optimization strategy methods
  private analyzeRetirementContributions(annualIncome: number): TaxStrategy | null {
    const maxContribution = annualIncome < 100000 ? 22500 : 19500; // Simplified 401k limits
    const recommendedContribution = Math.min(annualIncome * 0.15, maxContribution);
    
    if (recommendedContribution > 0) {
      return {
        name: 'Maximize Retirement Contributions',
        description: '401(k) and IRA contributions reduce taxable income',
        estimatedSavings: recommendedContribution * 0.22, // Assume 22% tax bracket
        effort: 'low',
        deadline: new Date(new Date().getFullYear(), 11, 31),
        category: 'retirement'
      };
    }
    
    return null;
  }

  private analyzeBusinessExpenses(businessExpenses: Transaction[]): TaxStrategy | null {
    const totalBusinessExpenses = businessExpenses.reduce(
      (sum, tx) => sum + Math.abs(tx.amount), 
      0
    );
    
    if (totalBusinessExpenses > 1000) {
      return {
        name: 'Business Expense Optimization',
        description: 'Ensure all legitimate business expenses are properly categorized',
        estimatedSavings: totalBusinessExpenses * 0.25,
        effort: 'medium',
        category: 'deduction'
      };
    }
    
    return null;
  }

  private analyzeCharitableGiving(transactions: Transaction[]): TaxStrategy | null {
    const charityExpenses = transactions.filter(tx => 
      tx.category.name.toLowerCase().includes('charity') ||
      tx.description.toLowerCase().includes('donation')
    );
    
    if (charityExpenses.length > 0) {
      const totalCharity = charityExpenses.reduce(
        (sum, tx) => sum + Math.abs(tx.amount), 
        0
      );
      
      return {
        name: 'Charitable Deduction Optimization',
        description: 'Maximize charitable giving deductions with proper documentation',
        estimatedSavings: totalCharity * 0.22,
        effort: 'low',
        category: 'deduction'
      };
    }
    
    return null;
  }

  private analyzeTaxLossHarvesting(transactions: Transaction[]): TaxStrategy | null {
    // This would analyze investment transactions for tax loss harvesting opportunities
    // Simplified implementation
    return {
      name: 'Tax Loss Harvesting',
      description: 'Realize investment losses to offset gains',
      estimatedSavings: 500,
      effort: 'high',
      deadline: new Date(new Date().getFullYear(), 11, 31),
      category: 'deferral'
    };
  }

  private analyzeHSAOptimization(annualIncome: number): TaxStrategy | null {
    if (annualIncome < 150000) {
      return {
        name: 'Health Savings Account Maximization',
        description: 'Triple tax advantage: deductible, tax-free growth, tax-free withdrawals',
        estimatedSavings: 3850 * 0.22, // Max HSA contribution * tax rate
        effort: 'low',
        deadline: new Date(new Date().getFullYear(), 11, 31),
        category: 'deduction'
      };
    }
    
    return null;
  }
}