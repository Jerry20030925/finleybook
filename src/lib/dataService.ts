import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  getDoc,
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase'
import { useAuth } from '@/components/AuthProvider'

// Transaction interface
export interface Transaction {
  id?: string
  userId: string
  amount: number
  category: string
  description: string
  date: Date
  type: 'income' | 'expense' | 'cashback'
  paymentMethod?: string
  merchantName?: string
  createdAt: Date
  emotionalTag?: 'happy' | 'stress' | 'impulse' | 'sad' | 'neutral'
  savings_link?: string
  projectedCashback?: number
  netCost?: number
  accountId?: string // Link to BankAccount
  status?: 'pending' | 'completed' | 'failed'
}

export interface Account {
  id: string
  userId: string
  name: string
  mask: string
  type: string
  balance: number
}

const shouldLogDataService = process.env.NODE_ENV !== 'production'
const dataServiceLog = (...args: unknown[]) => {
  if (shouldLogDataService) {
    console.log(...args)
  }
}

const normalizeTransaction = (transaction: Transaction): Transaction => {
  const normalizedAmount = Math.abs(Number(transaction.amount) || 0)
  return {
    ...transaction,
    amount: normalizedAmount
  }
}

const normalizeTransactionForWrite = (transaction: Omit<Transaction, 'id' | 'createdAt'>): Omit<Transaction, 'id' | 'createdAt'> => {
  const rawAmount = Number(transaction.amount) || 0
  const amount = Math.abs(rawAmount)
  const normalizedType: Transaction['type'] =
    transaction.type === 'cashback'
      ? 'cashback'
      : transaction.type || (rawAmount < 0 ? 'expense' : 'income')

  return {
    ...transaction,
    amount,
    type: normalizedType
  }
}

// Simple data fetching functions
export const getUserTransactions = async (userId: string, limitCount: number = 10) => {
  try {
    dataServiceLog('[getUserTransactions] Fetching transactions for userId:', userId, 'limit:', limitCount)

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(q)
    dataServiceLog('[getUserTransactions] Query executed successfully')
    dataServiceLog('[getUserTransactions] Found', snapshot.docs.length, 'documents')

    const transactions = snapshot.docs.map(doc => {
      const data = doc.data()
      dataServiceLog('[getUserTransactions] Processing document:', doc.id, data)
      return normalizeTransaction({
        id: doc.id,
        ...data,
        date: data.date?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date()
      } as Transaction)
    }) as Transaction[]

    dataServiceLog('[getUserTransactions] Returning transactions:', transactions)
    return transactions
  } catch (error: any) {
    console.error('[getUserTransactions] Error fetching transactions:', error)
    console.error('[getUserTransactions] Error code:', error.code)
    console.error('[getUserTransactions] Error message:', error.message)

    // If composite index error, try a simpler query
    if (error.code === 'failed-precondition' && error.message.includes('index')) {
      dataServiceLog('[getUserTransactions] Composite index required, trying simpler query...')
      try {
        const simpleQuery = query(
          collection(db, 'transactions'),
          where('userId', '==', userId),
          limit(limitCount)
        )
        const simpleSnapshot = await getDocs(simpleQuery)
        dataServiceLog('[getUserTransactions] Simple query found', simpleSnapshot.docs.length, 'transactions')

        const simpleTransactions = simpleSnapshot.docs.map(doc => {
          const data = doc.data()
          return normalizeTransaction({
            id: doc.id,
            ...data,
            date: data.date?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date()
          } as Transaction)
        }) as Transaction[]

        // Sort manually
        simpleTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        return simpleTransactions.slice(0, limitCount)
      } catch (simpleError) {
        console.error('[getUserTransactions] Simple query also failed:', simpleError)
        return []
      }
    }

    return []
  }
}

export const getUserFinancialSummary = async (userId: string) => {
  try {
    const transactions = await getUserTransactions(userId, 1000) // Get all for calculation

    const currentMonth = new Date()
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    // Calculate current month stats
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate >= startOfMonth && transactionDate <= endOfMonth
    })

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    // Calculate total assets (simplified - sum of all income minus expenses)
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const totalAssets = totalIncome - totalExpenses
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0

    return {
      totalAssets,
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      transactionCount: transactions.length
    }
  } catch (error) {
    console.error('Error calculating financial summary:', error)
    return {
      totalAssets: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      savingsRate: 0,
      transactionCount: 0
    }
  }
}

export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
  try {
    // Validate required fields
    if (!transaction.userId) {
      throw new Error('User ID is required')
    }
    if (transaction.amount === undefined || transaction.amount === null || transaction.amount === 0) {
      throw new Error('Valid amount is required')
    }
    if (!transaction.category) {
      throw new Error('Category is required')
    }
    if (!transaction.description) {
      throw new Error('Description is required')
    }
    if (!transaction.type) {
      throw new Error('Transaction type is required')
    }

    const normalizedTransaction = normalizeTransactionForWrite(transaction)

    dataServiceLog('Adding transaction:', {
      userId: transaction.userId,
      amount: normalizedTransaction.amount,
      category: normalizedTransaction.category,
      type: normalizedTransaction.type,
      description: normalizedTransaction.description,
      date: normalizedTransaction.date
    })

    const transactionData = {
      ...normalizedTransaction,
      date: Timestamp.fromDate(new Date(normalizedTransaction.date)),
      createdAt: Timestamp.now()
    }

    dataServiceLog('Prepared transaction data for Firestore:', transactionData)

    const docRef = await addDoc(collection(db, 'transactions'), transactionData)

    dataServiceLog('Transaction added successfully with ID:', docRef.id)

    // Verify the transaction was actually saved
    setTimeout(async () => {
      try {
        const verifyTransactions = await getUserTransactions(transaction.userId, 5)
        dataServiceLog('Verification: Found', verifyTransactions.length, 'transactions after add')
      } catch (error) {
        console.error('Verification failed:', error)
      }
    }, 1000)
    return docRef.id
  } catch (error: any) {
    console.error('Error adding transaction:', error)

    // Provide more specific error messages
    if (error.code === 'permission-denied') {
      throw new Error('没有权限保存交易记录，请重新登录')
    } else if (error.code === 'unavailable') {
      throw new Error('网络连接失败，请检查网络后重试')
    } else if (error.message.includes('User ID')) {
      throw new Error('用户未登录，请重新登录')
    } else {
      throw new Error(`保存失败：${error.message || '未知错误'}`)
    }
  }
}

export const updateTransaction = async (transactionId: string, updates: Partial<Transaction>) => {
  try {
    const docRef = doc(db, 'transactions', transactionId)

    const payload: Record<string, unknown> = { ...updates }
    delete payload.id
    delete payload.createdAt

    if (payload.date instanceof Date) {
      payload.date = Timestamp.fromDate(payload.date)
    }

    if (typeof payload.amount !== 'undefined') {
      payload.amount = Math.abs(Number(payload.amount) || 0)
    }

    if (
      payload.type !== 'income'
      && payload.type !== 'expense'
      && payload.type !== 'cashback'
      && typeof payload.type !== 'undefined'
    ) {
      delete payload.type
    }

    await updateDoc(docRef, payload)
  } catch (error) {
    console.error('Error updating transaction:', error)
    throw error
  }
}

export const deleteTransaction = async (transactionId: string) => {
  try {
    await deleteDoc(doc(db, 'transactions', transactionId))
  } catch (error) {
    console.error('Error deleting transaction:', error)
    throw error
  }
}

export const updateTransactionsCategoryBatch = async (
  transactionIds: string[],
  category: string
) => {
  if (!transactionIds.length) return

  try {
    const batch = writeBatch(db)
    transactionIds.forEach((id) => {
      const docRef = doc(db, 'transactions', id)
      batch.update(docRef, { category: category.trim() })
    })
    await batch.commit()
  } catch (error) {
    console.error('Error batch updating transaction categories:', error)
    throw error
  }
}

export const updateTransactionsBatch = async (
  transactionIds: string[],
  updates: Partial<Transaction>
) => {
  if (!transactionIds.length) return

  try {
    const payload: Record<string, unknown> = { ...updates }
    delete payload.id
    delete payload.createdAt
    delete payload.userId

    if (payload.date instanceof Date) {
      payload.date = Timestamp.fromDate(payload.date)
    }

    if (typeof payload.amount !== 'undefined') {
      payload.amount = Math.abs(Number(payload.amount) || 0)
    }

    if (
      payload.type !== 'income'
      && payload.type !== 'expense'
      && payload.type !== 'cashback'
      && typeof payload.type !== 'undefined'
    ) {
      delete payload.type
    }

    const batch = writeBatch(db)
    transactionIds.forEach((id) => {
      batch.update(doc(db, 'transactions', id), payload)
    })
    await batch.commit()
  } catch (error) {
    console.error('Error batch updating transactions:', error)
    throw error
  }
}

export const updateTransactionsByIdBatch = async (
  items: Array<{ transactionId: string; updates: Partial<Transaction> }>
) => {
  if (!items.length) return

  try {
    const batch = writeBatch(db)

    items.forEach(({ transactionId, updates }) => {
      const payload: Record<string, unknown> = { ...updates }
      delete payload.id
      delete payload.createdAt
      delete payload.userId

      if (payload.date instanceof Date) {
        payload.date = Timestamp.fromDate(payload.date)
      }

      if (typeof payload.amount !== 'undefined') {
        payload.amount = Math.abs(Number(payload.amount) || 0)
      }

      if (
        payload.type !== 'income'
        && payload.type !== 'expense'
        && payload.type !== 'cashback'
        && typeof payload.type !== 'undefined'
      ) {
        delete payload.type
      }

      batch.update(doc(db, 'transactions', transactionId), payload)
    })

    await batch.commit()
  } catch (error) {
    console.error('Error batch updating transactions by id:', error)
    throw error
  }
}

export const deleteTransactionsBatch = async (transactionIds: string[]) => {
  if (!transactionIds.length) return

  try {
    const batch = writeBatch(db)
    transactionIds.forEach((id) => {
      batch.delete(doc(db, 'transactions', id))
    })
    await batch.commit()
  } catch (error) {
    console.error('Error batch deleting transactions:', error)
    throw error
  }
}

// Default categories (using translation keys)
export const DEFAULT_CATEGORIES = {
  income: [
    'category.salary',
    'category.investment',
    'category.parttime',
    'category.otherIncome'
  ],
  expense: [
    'category.food',
    'category.transport',
    'category.shopping',
    'category.housing',
    'category.health',
    'category.entertainment',
    'category.education',
    'category.otherExpense'
  ]
}

// Sample data for new users (minimal)
export const createSampleData = async (userId: string) => {
  try {
    // Add a welcome transaction
    await addTransaction({
      userId,
      amount: 0,
      category: '其他收入',
      description: '欢迎使用 FinleyBook！开始记录您的第一笔交易吧',
      date: new Date(),
      type: 'income'
    })
  } catch (error) {
    console.error('Error creating sample data:', error)
  }
}

// Goal interface
export interface Goal {
  id?: string
  userId: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  deadline: string
  category: 'savings' | 'investment' | 'purchase' | 'debt' | 'emergency'
  image_url?: string
  icon?: string
  isCompleted: boolean
  createdAt: Date
  participants?: string[] // Shared: List of User IDs
  ownerId?: string // Shared: Creator ID
}

// Goal CRUD operations
export const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt'>) => {
  try {
    const goalData = {
      ...goal,
      ownerId: goal.userId,
      participants: [goal.userId],
      createdAt: Timestamp.now()
    }
    const docRef = await addDoc(collection(db, 'goals'), goalData)
    return docRef.id
  } catch (error) {
    console.error('Error adding goal:', error)
    throw error
  }
}

export const getGoals = async (userId: string) => {
  try {
    // 1. Fetch by participants (New Schema)
    let snap1 = { docs: [] } as any;
    try {
      const q1 = query(
        collection(db, 'goals'),
        where('participants', 'array-contains', userId),
        orderBy('createdAt', 'desc')
      );
      snap1 = await getDocs(q1);
    } catch (e: any) {
      console.warn('Complex participants query failed (likely index), falling back to simple query', e);
      // Fallback: Fetch all by participants and sort in memory
      const q1Simple = query(
        collection(db, 'goals'),
        where('participants', 'array-contains', userId)
      );
      snap1 = await getDocs(q1Simple);
    }

    // 2. Fetch by ownerId/userId (Legacy Schema & Backup)
    let snap2 = { docs: [] } as any;
    try {
      const q2 = query(
        collection(db, 'goals'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      snap2 = await getDocs(q2);
    } catch (e: any) {
      console.warn('Complex legacy query failed (likely index), falling back to simple query', e);
      // Fallback: Fetch all by userId and sort in memory
      const q2Simple = query(
        collection(db, 'goals'),
        where('userId', '==', userId)
      );
      snap2 = await getDocs(q2Simple);
    }

    const goalsMap = new Map<string, Goal>()

    const processDoc = (doc: any) => {
      goalsMap.set(doc.id, {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as Goal)
    }

    snap1.docs.forEach(processDoc)
    snap2.docs.forEach(processDoc)

    return Array.from(goalsMap.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  } catch (error) {
    console.error('Error fetching goals:', error)
    return []
  }
}

export const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
  try {
    const docRef = doc(db, 'goals', goalId)
    await updateDoc(docRef, updates)
  } catch (error) {
    console.error('Error updating goal:', error)
    throw error
  }
}

export const deleteGoal = async (goalId: string) => {
  try {
    await deleteDoc(doc(db, 'goals', goalId))
  } catch (error) {
    console.error('Error deleting goal:', error)
    throw error
  }
}

export const getUserWalletBalance = async (userId: string) => {
  try {
    const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', userId)))
    if (!userDoc.empty) {
      const userData = userDoc.docs[0].data()
      return userData.wallet_snapshot || userData.wallet || { available: 0, pending: 0, lifetime: 0 }
    }
    // Fallback if querying by document ID directly
    const docRef = doc(db, 'users', userId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const userData = docSnap.data()
      return userData.wallet_snapshot || userData.wallet || { available: 0, pending: 0, lifetime: 0 }
    }
    return { available: 0, pending: 0, lifetime: 0 }
  } catch (error) {
    console.error('Error fetching wallet balance:', error)
    return { available: 0, pending: 0, lifetime: 0 }
  }
}
export const addTransactionsBatch = async (transactions: Omit<Transaction, 'id' | 'createdAt'>[]) => {
  try {
    const batch = writeBatch(db)
    const collectionRef = collection(db, 'transactions')
    const addedIds: string[] = []

    transactions.forEach(transaction => {
      const normalizedTransaction = normalizeTransactionForWrite(transaction)
      const docRef = doc(collectionRef)
      batch.set(docRef, {
        ...normalizedTransaction,
        date: Timestamp.fromDate(new Date(normalizedTransaction.date)),
        createdAt: Timestamp.now()
      })
      addedIds.push(docRef.id)
    })

    await batch.commit()
    dataServiceLog(`Successfully batch added ${transactions.length} transactions`)
    return addedIds
  } catch (error) {
    console.error('Error batch adding transactions:', error)
    throw error
  }
}

// --- Cashback & Affiliate Schemas ---

export interface CashbackTransaction {
  id?: string
  skimlinksTransactionId: string // from webhook
  userId: string // from xcust
  merchantId: string
  merchantName: string
  orderAmount: number // The user's purchase amount
  commissionAmount: number // The breakdown of what we earn vs user
  userCashbackAmount: number // Calculated amount for the user
  status: 'pending' | 'confirmed' | 'paid' | 'declined'
  clickDate: Date
  transactionDate: Date
  lastUpdated: Date
  metadata?: any // Raw webhook data for debugging
}

export interface AffiliateMerchant {
  id: string // Skimlinks Merchant ID
  name: string
  domains: string[] // e.g., ["amazon.com", "amazon.co.uk"]
  baseCommissionRate: number // e.g., 0.05 (5%)
  averageCommissionRate?: number
  logoUrl?: string
  categories?: string[]
  lastSynced: Date
}

export const getCashbackTransactions = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'cashback_transactions'),
      where('userId', '==', userId),
      orderBy('transactionDate', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      clickDate: doc.data().clickDate?.toDate(),
      transactionDate: doc.data().transactionDate?.toDate(),
      lastUpdated: doc.data().lastUpdated?.toDate()
    })) as CashbackTransaction[]
  } catch (error) {
    console.error('Error fetching cashback transactions:', error)
    return []
  }
}

export const addCashbackTransaction = async (transaction: Omit<CashbackTransaction, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'cashback_transactions'), {
      ...transaction,
      clickDate: Timestamp.fromDate(transaction.clickDate),
      transactionDate: Timestamp.fromDate(transaction.transactionDate),
      lastUpdated: Timestamp.now()
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding cashback transaction:', error)
    throw error
  }
}


// --- Budget Operations ---

export interface Budget {
  id?: string
  userId: string
  category: string
  amount: number
  period: 'monthly' | 'yearly'
  spent: number // Calculated field, not necessarily stored, but good to have in type
  createdAt: Date
}

export const getBudgets = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'budgets'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as Budget[]
  } catch (error: any) {
    console.error('Error fetching budgets:', error)

    // If composite index is missing, fallback to simple query
    if (error.code === 'failed-precondition' && error.message?.includes('index')) {
      console.warn('[getBudgets] Composite index missing, falling back to simple query...')
      try {
        const simpleQuery = query(
          collection(db, 'budgets'),
          where('userId', '==', userId)
        )
        const simpleSnapshot = await getDocs(simpleQuery)
        const budgets = simpleSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Budget[]

        // Sort manually by createdAt desc
        budgets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        return budgets
      } catch (simpleError) {
        console.error('[getBudgets] Simple query also failed:', simpleError)
        return []
      }
    }

    return []
  }
}

export const addBudget = async (budget: Omit<Budget, 'id' | 'createdAt' | 'spent'>) => {
  try {
    const budgetData = {
      ...budget,
      userId: budget.userId,
      createdAt: Timestamp.now()
    }
    const docRef = await addDoc(collection(db, 'budgets'), budgetData)
    return docRef.id
  } catch (error) {
    console.error('Error adding budget:', error)
    throw error
  }
}

export const updateBudget = async (budgetId: string, updates: Partial<Budget>) => {
  try {
    const docRef = doc(db, 'budgets', budgetId)
    await updateDoc(docRef, updates)
  } catch (error) {
    console.error('Error updating budget:', error)
    throw error
  }
}

export const deleteBudget = async (budgetId: string) => {
  try {
    await deleteDoc(doc(db, 'budgets', budgetId))
  } catch (error) {
    console.error('Error deleting budget:', error)
    throw error
  }
}
