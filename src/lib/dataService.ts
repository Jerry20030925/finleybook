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
  Timestamp
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
  type: 'income' | 'expense'
  paymentMethod?: string
  createdAt: Date
}

// Simple data fetching functions
export const getUserTransactions = async (userId: string, limitCount: number = 10) => {
  try {
    console.log('[getUserTransactions] Fetching transactions for userId:', userId, 'limit:', limitCount)

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(q)
    console.log('[getUserTransactions] Query executed successfully')
    console.log('[getUserTransactions] Found', snapshot.docs.length, 'documents')

    const transactions = snapshot.docs.map(doc => {
      const data = doc.data()
      console.log('[getUserTransactions] Processing document:', doc.id, data)
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date()
      }
    }) as Transaction[]

    console.log('[getUserTransactions] Returning transactions:', transactions)
    return transactions
  } catch (error: any) {
    console.error('[getUserTransactions] Error fetching transactions:', error)
    console.error('[getUserTransactions] Error code:', error.code)
    console.error('[getUserTransactions] Error message:', error.message)

    // If composite index error, try a simpler query
    if (error.code === 'failed-precondition' && error.message.includes('index')) {
      console.log('[getUserTransactions] Composite index required, trying simpler query...')
      try {
        const simpleQuery = query(
          collection(db, 'transactions'),
          where('userId', '==', userId),
          limit(limitCount)
        )
        const simpleSnapshot = await getDocs(simpleQuery)
        console.log('[getUserTransactions] Simple query found', simpleSnapshot.docs.length, 'transactions')

        const simpleTransactions = simpleSnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            date: data.date?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date()
          }
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
      .reduce((sum, t) => sum + t.amount, 0)

    // Calculate total assets (simplified - sum of all income minus expenses)
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

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

    console.log('Adding transaction:', {
      userId: transaction.userId,
      amount: transaction.amount,
      category: transaction.category,
      type: transaction.type,
      description: transaction.description,
      date: transaction.date
    })

    const transactionData = {
      ...transaction,
      date: Timestamp.fromDate(new Date(transaction.date)),
      createdAt: Timestamp.now()
    }

    console.log('Prepared transaction data for Firestore:', transactionData)

    const docRef = await addDoc(collection(db, 'transactions'), transactionData)

    console.log('Transaction added successfully with ID:', docRef.id)

    // Verify the transaction was actually saved
    setTimeout(async () => {
      try {
        const verifyTransactions = await getUserTransactions(transaction.userId, 5)
        console.log('Verification: Found', verifyTransactions.length, 'transactions after add')
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