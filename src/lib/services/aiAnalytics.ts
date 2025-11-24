import { Transaction, FinancialGoal, Budget, AIInsight, User } from '@/types';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
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

export interface SpendingPattern {
  category: string;
  averageMonthly: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality?: {
    month: number;
    factor: number;
  }[];
  anomalies: {
    date: Date;
    amount: number;
    reason: string;
  }[];
}

export interface CashFlowPrediction {
  date: Date;
  predictedBalance: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

export interface FinancialHealthScore {
  overall: number;
  categories: {
    savings: number;
    debt: number;
    spending: number;
    budget: number;
    emergency: number;
  };
  insights: string[];
  recommendations: string[];
}

export class AIAnalyticsService {
  private static instance: AIAnalyticsService;
  
  public static getInstance(): AIAnalyticsService {
    if (!AIAnalyticsService.instance) {
      AIAnalyticsService.instance = new AIAnalyticsService();
    }
    return AIAnalyticsService.instance;
  }

  async generatePersonalizedInsights(userId: string): Promise<AIInsight[]> {
    try {
      const [transactions, goals, budgets] = await Promise.all([
        this.getUserTransactions(userId, 90), // Last 90 days
        this.getUserGoals(userId),
        this.getUserBudgets(userId)
      ]);

      const insights: AIInsight[] = [];
      
      // Spending pattern analysis
      const spendingInsights = await this.analyzeSpendingPatterns(userId, transactions);
      insights.push(...spendingInsights);
      
      // Budget performance insights
      const budgetInsights = await this.analyzeBudgetPerformance(budgets, transactions);
      insights.push(...budgetInsights);
      
      // Goal progress insights
      const goalInsights = await this.analyzeGoalProgress(goals, transactions);
      insights.push(...goalInsights);
      
      // Cash flow predictions
      const cashFlowInsights = await this.generateCashFlowInsights(userId, transactions);
      insights.push(...cashFlowInsights);
      
      return insights.sort((a, b) => b.priority === 'high' ? 1 : -1);
    } catch (error) {
      console.error('Error generating insights:', error);
      throw new Error('Failed to generate personalized insights');
    }
  }

  async predictCashFlow(
    userId: string, 
    daysAhead: number = 30
  ): Promise<CashFlowPrediction[]> {
    try {
      const transactions = await this.getUserTransactions(userId, 180);
      const patterns = await this.identifySpendingPatterns(transactions);
      
      const predictions: CashFlowPrediction[] = [];
      let currentBalance = await this.getCurrentBalance(userId);
      
      for (let i = 1; i <= daysAhead; i++) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + i);
        
        const prediction = await this.predictDailyBalance(
          targetDate,
          currentBalance,
          patterns,
          transactions
        );
        
        predictions.push(prediction);
        currentBalance = prediction.predictedBalance;
      }
      
      return predictions;
    } catch (error) {
      console.error('Cash flow prediction error:', error);
      throw new Error('Failed to predict cash flow');
    }
  }

  async calculateFinancialHealthScore(userId: string): Promise<FinancialHealthScore> {
    try {
      const [transactions, goals, budgets, accounts] = await Promise.all([
        this.getUserTransactions(userId, 90),
        this.getUserGoals(userId),
        this.getUserBudgets(userId),
        this.getUserAccounts(userId)
      ]);

      const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
      const monthlyIncome = this.calculateMonthlyIncome(transactions);
      const monthlyExpenses = this.calculateMonthlyExpenses(transactions);
      const savingsRate = monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome : 0;
      
      // Calculate individual scores
      const savingsScore = Math.min(100, savingsRate * 100 * 5); // 20% savings = 100 points
      const budgetScore = this.calculateBudgetAdherenceScore(budgets, transactions);
      const debtScore = this.calculateDebtScore(accounts);
      const emergencyScore = this.calculateEmergencyFundScore(totalBalance, monthlyExpenses);
      const spendingScore = this.calculateSpendingConsistencyScore(transactions);
      
      const overallScore = Math.round(
        (savingsScore * 0.25) +
        (budgetScore * 0.25) +
        (debtScore * 0.2) +
        (emergencyScore * 0.2) +
        (spendingScore * 0.1)
      );

      const insights = await this.generateHealthInsights(
        overallScore,
        { savings: savingsScore, debt: debtScore, spending: spendingScore, budget: budgetScore, emergency: emergencyScore },
        { savingsRate, monthlyIncome, monthlyExpenses, totalBalance }
      );

      return {
        overall: overallScore,
        categories: {
          savings: Math.round(savingsScore),
          debt: Math.round(debtScore),
          spending: Math.round(spendingScore),
          budget: Math.round(budgetScore),
          emergency: Math.round(emergencyScore),
        },
        insights: insights.insights,
        recommendations: insights.recommendations,
      };
    } catch (error) {
      console.error('Financial health score error:', error);
      throw new Error('Failed to calculate financial health score');
    }
  }

  async optimizeBudgetAllocation(
    userId: string,
    monthlyIncome: number,
    goals: FinancialGoal[]
  ): Promise<{
    recommended: Budget[];
    rationale: string;
    expectedOutcomes: string[];
  }> {
    try {
      const transactions = await this.getUserTransactions(userId, 180);
      const spendingPatterns = await this.identifySpendingPatterns(transactions);
      
      const prompt = `
        Based on the following financial data, suggest an optimal budget allocation:
        
        Monthly Income: $${monthlyIncome}
        
        Historical Spending Patterns:
        ${JSON.stringify(spendingPatterns, null, 2)}
        
        Financial Goals:
        ${JSON.stringify(goals, null, 2)}
        
        Please provide:
        1. Recommended budget categories and amounts
        2. Rationale for the allocation
        3. Expected outcomes and timeline
        
        Follow the 50/30/20 rule as a baseline but adjust based on goals and patterns.
        Return response in JSON format:
        {
          "budgets": [{"category": "string", "amount": number, "percentage": number}],
          "rationale": "string",
          "expectedOutcomes": ["string"]
        }
      `;

      const response = await getOpenAIClient().chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      });

      const optimization = JSON.parse(response.choices[0].message.content || '{}');
      
      const recommendedBudgets: Budget[] = optimization.budgets.map((budget: any, index: number) => ({
        id: `rec_${index}`,
        userId,
        name: `${budget.category} Budget`,
        amount: budget.amount,
        spent: 0,
        categoryIds: [], // Would be mapped from category names
        period: 'monthly' as const,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      return {
        recommended: recommendedBudgets,
        rationale: optimization.rationale,
        expectedOutcomes: optimization.expectedOutcomes,
      };
    } catch (error) {
      console.error('Budget optimization error:', error);
      throw new Error('Failed to optimize budget allocation');
    }
  }

  async detectAnomalies(userId: string): Promise<AIInsight[]> {
    try {
      const transactions = await this.getUserTransactions(userId, 30);
      const historicalTransactions = await this.getUserTransactions(userId, 365);
      
      const anomalies: AIInsight[] = [];
      
      // Detect unusual spending amounts
      const spendingAnomalies = await this.detectSpendingAnomalies(transactions, historicalTransactions);
      anomalies.push(...spendingAnomalies);
      
      // Detect unusual merchant/category combinations
      const patternAnomalies = await this.detectPatternAnomalies(transactions, historicalTransactions);
      anomalies.push(...patternAnomalies);
      
      // Detect timing anomalies
      const timingAnomalies = await this.detectTimingAnomalies(transactions, historicalTransactions);
      anomalies.push(...timingAnomalies);
      
      return anomalies;
    } catch (error) {
      console.error('Anomaly detection error:', error);
      throw new Error('Failed to detect anomalies');
    }
  }

  private async getUserTransactions(userId: string, days: number): Promise<Transaction[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      orderBy('date', 'desc')
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

  private async getUserGoals(userId: string): Promise<FinancialGoal[]> {
    const q = query(
      collection(db, 'goals'),
      where('userId', '==', userId),
      where('isCompleted', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as FinancialGoal[];
  }

  private async getUserBudgets(userId: string): Promise<Budget[]> {
    const q = query(
      collection(db, 'budgets'),
      where('userId', '==', userId),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Budget[];
  }

  private async getUserAccounts(userId: string): Promise<any[]> {
    // This would fetch user's financial accounts
    // For now, returning mock data
    return [
      { id: '1', balance: 5000, type: 'checking' },
      { id: '2', balance: 15000, type: 'savings' },
      { id: '3', balance: -2500, type: 'credit_card' },
    ];
  }

  private async analyzeSpendingPatterns(userId: string, transactions: Transaction[]): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    
    // Group transactions by category
    const categorySpending = transactions.reduce((acc, tx) => {
      const category = tx.category.name;
      if (!acc[category]) acc[category] = [];
      acc[category].push(tx);
      return acc;
    }, {} as Record<string, Transaction[]>);

    for (const [category, txs] of Object.entries(categorySpending)) {
      const totalSpent = txs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      const avgTransaction = totalSpent / txs.length;
      
      if (totalSpent > 1000) { // Only analyze significant spending
        insights.push({
          id: `spending_${category.toLowerCase()}`,
          userId,
          type: 'spending_pattern',
          title: `${category} Spending Analysis`,
          description: `You've spent $${totalSpent.toFixed(2)} on ${category} with an average transaction of $${avgTransaction.toFixed(2)}`,
          actionable: true,
          priority: totalSpent > 2000 ? 'high' : 'medium',
          data: { category, totalSpent, avgTransaction, transactionCount: txs.length },
          isRead: false,
          createdAt: new Date(),
        });
      }
    }
    
    return insights;
  }

  private async analyzeBudgetPerformance(budgets: Budget[], transactions: Transaction[]): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    
    for (const budget of budgets) {
      const utilizationPercent = (budget.spent / budget.amount) * 100;
      
      if (utilizationPercent > 90) {
        insights.push({
          id: `budget_alert_${budget.id}`,
          userId: budget.userId,
          type: 'budget_alert',
          title: `Budget Alert: ${budget.name}`,
          description: `You've used ${utilizationPercent.toFixed(1)}% of your ${budget.name} budget`,
          actionable: true,
          priority: utilizationPercent > 100 ? 'high' : 'medium',
          data: { budgetId: budget.id, utilization: utilizationPercent },
          isRead: false,
          createdAt: new Date(),
        });
      }
    }
    
    return insights;
  }

  private async analyzeGoalProgress(goals: FinancialGoal[], transactions: Transaction[]): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    
    for (const goal of goals) {
      const progressPercent = (goal.currentAmount / goal.targetAmount) * 100;
      const daysLeft = Math.ceil((goal.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      const dailyRequired = (goal.targetAmount - goal.currentAmount) / Math.max(daysLeft, 1);
      
      insights.push({
        id: `goal_progress_${goal.id}`,
        userId: goal.userId,
        type: 'goal_tracking',
        title: `Goal Progress: ${goal.name}`,
        description: `${progressPercent.toFixed(1)}% complete. Save $${dailyRequired.toFixed(2)}/day to reach your goal`,
        actionable: true,
        priority: daysLeft < 30 && progressPercent < 80 ? 'high' : 'medium',
        data: { goalId: goal.id, progress: progressPercent, dailyRequired },
        isRead: false,
        createdAt: new Date(),
      });
    }
    
    return insights;
  }

  private async generateCashFlowInsights(userId: string, transactions: Transaction[]): Promise<AIInsight[]> {
    const monthlyIncome = this.calculateMonthlyIncome(transactions);
    const monthlyExpenses = this.calculateMonthlyExpenses(transactions);
    const netCashFlow = monthlyIncome - monthlyExpenses;
    
    const insights: AIInsight[] = [];
    
    if (netCashFlow < 0) {
      insights.push({
        id: `cashflow_negative_${userId}`,
        userId,
        type: 'risk_warning',
        title: 'Negative Cash Flow Detected',
        description: `Your monthly expenses exceed income by $${Math.abs(netCashFlow).toFixed(2)}`,
        actionable: true,
        priority: 'high',
        data: { monthlyIncome, monthlyExpenses, netCashFlow },
        isRead: false,
        createdAt: new Date(),
      });
    }
    
    return insights;
  }

  private calculateMonthlyIncome(transactions: Transaction[]): number {
    const income = transactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    return (income / 3) * 4; // Approximate monthly from 90-day data
  }

  private calculateMonthlyExpenses(transactions: Transaction[]): number {
    const expenses = transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    return (expenses / 3) * 4; // Approximate monthly from 90-day data
  }

  private async identifySpendingPatterns(transactions: Transaction[]): Promise<SpendingPattern[]> {
    // Group by category and analyze trends
    const patterns: SpendingPattern[] = [];
    
    // Implementation would analyze spending by category over time
    // to identify trends, seasonality, and anomalies
    
    return patterns;
  }

  private async getCurrentBalance(userId: string): Promise<number> {
    const accounts = await this.getUserAccounts(userId);
    return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  }

  private async predictDailyBalance(
    date: Date,
    currentBalance: number,
    patterns: SpendingPattern[],
    transactions: Transaction[]
  ): Promise<CashFlowPrediction> {
    // Simplified prediction logic
    const avgDailySpending = this.calculateAverageDailySpending(transactions);
    const predictedBalance = currentBalance - avgDailySpending;
    
    return {
      date,
      predictedBalance,
      confidence: 0.75,
      factors: ['Historical spending patterns', 'Day of week effects'],
      recommendations: predictedBalance < 0 ? ['Consider reducing discretionary spending'] : [],
    };
  }

  private calculateAverageDailySpending(transactions: Transaction[]): number {
    const expenses = transactions.filter(tx => tx.type === 'expense');
    const totalSpending = expenses.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    return totalSpending / 90; // Average daily spending over 90 days
  }

  private calculateBudgetAdherenceScore(budgets: Budget[], transactions: Transaction[]): number {
    if (budgets.length === 0) return 50; // Neutral score if no budgets
    
    const adherenceScores = budgets.map(budget => {
      const utilization = budget.spent / budget.amount;
      if (utilization <= 0.8) return 100; // Under 80% = perfect
      if (utilization <= 1.0) return 80;  // Under 100% = good
      return Math.max(0, 100 - (utilization - 1) * 100); // Over 100% = poor
    });
    
    return adherenceScores.reduce((sum, score) => sum + score, 0) / adherenceScores.length;
  }

  private calculateDebtScore(accounts: any[]): number {
    const totalDebt = accounts
      .filter(acc => acc.type === 'credit_card' && acc.balance < 0)
      .reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
    
    const totalAssets = accounts
      .filter(acc => acc.balance > 0)
      .reduce((sum, acc) => sum + acc.balance, 0);
    
    if (totalAssets === 0) return totalDebt === 0 ? 100 : 0;
    
    const debtToAssetRatio = totalDebt / totalAssets;
    return Math.max(0, 100 - (debtToAssetRatio * 100));
  }

  private calculateEmergencyFundScore(totalBalance: number, monthlyExpenses: number): number {
    if (monthlyExpenses === 0) return 100;
    
    const monthsOfExpenses = totalBalance / monthlyExpenses;
    if (monthsOfExpenses >= 6) return 100;
    if (monthsOfExpenses >= 3) return 80;
    if (monthsOfExpenses >= 1) return 60;
    return Math.max(0, monthsOfExpenses * 60);
  }

  private calculateSpendingConsistencyScore(transactions: Transaction[]): number {
    // Calculate coefficient of variation for daily spending
    const dailySpending = this.groupTransactionsByDay(transactions);
    const amounts = Object.values(dailySpending);
    
    if (amounts.length === 0) return 100;
    
    const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    
    const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;
    return Math.max(0, 100 - (coefficientOfVariation * 100));
  }

  private groupTransactionsByDay(transactions: Transaction[]): Record<string, number> {
    return transactions.reduce((acc, tx) => {
      const day = tx.date.toISOString().split('T')[0];
      if (!acc[day]) acc[day] = 0;
      acc[day] += Math.abs(tx.amount);
      return acc;
    }, {} as Record<string, number>);
  }

  private async generateHealthInsights(
    overallScore: number,
    categoryScores: { savings: number; debt: number; spending: number; budget: number; emergency: number },
    financialData: { savingsRate: number; monthlyIncome: number; monthlyExpenses: number; totalBalance: number }
  ): Promise<{ insights: string[]; recommendations: string[] }> {
    const insights: string[] = [];
    const recommendations: string[] = [];
    
    // Overall assessment
    if (overallScore >= 80) {
      insights.push('Your financial health is excellent! You\'re managing your money very well.');
    } else if (overallScore >= 60) {
      insights.push('Your financial health is good, with room for improvement in some areas.');
    } else {
      insights.push('Your financial health needs attention. Focus on the key areas highlighted below.');
    }
    
    // Category-specific insights and recommendations
    if (categoryScores.emergency < 60) {
      insights.push(`Your emergency fund covers ${(financialData.totalBalance / financialData.monthlyExpenses).toFixed(1)} months of expenses.`);
      recommendations.push('Build an emergency fund covering 3-6 months of expenses.');
    }
    
    if (categoryScores.savings < 50) {
      insights.push(`Your current savings rate is ${(financialData.savingsRate * 100).toFixed(1)}%.`);
      recommendations.push('Aim to save at least 20% of your income.');
    }
    
    if (categoryScores.budget < 60) {
      recommendations.push('Create and stick to a budget to better track your spending.');
    }
    
    return { insights, recommendations };
  }

  private async detectSpendingAnomalies(
    recentTransactions: Transaction[], 
    historicalTransactions: Transaction[]
  ): Promise<AIInsight[]> {
    // Implementation would detect transactions that are significantly different
    // from historical patterns in terms of amount, frequency, or category
    return [];
  }

  private async detectPatternAnomalies(
    recentTransactions: Transaction[], 
    historicalTransactions: Transaction[]
  ): Promise<AIInsight[]> {
    // Implementation would detect unusual merchant/category combinations
    return [];
  }

  private async detectTimingAnomalies(
    recentTransactions: Transaction[], 
    historicalTransactions: Transaction[]
  ): Promise<AIInsight[]> {
    // Implementation would detect transactions at unusual times or frequencies
    return [];
  }
}