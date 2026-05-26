'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthProvider'
import { collection, doc, limit, onSnapshot, query, Timestamp, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/lib/stripe'

export interface SubscriptionData {
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing'
  planKey: SubscriptionPlan
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  cancelAtPeriodEnd?: boolean
  createdAt?: Date
  updatedAt?: Date
}

interface SubscriptionContextType {
  subscription: SubscriptionData | null
  loading: boolean
  isProMember: boolean
  currentPlanKey: SubscriptionPlan
  currentPlanName: string
  usage: {
    transactions: number
    budgets: number
    exports: number
  }
  canUseFeature: (feature: string) => boolean
  getRemainingUsage: (limitType: 'transactions' | 'budgets' | 'exports') => number
  refreshSubscription: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [usage, setUsage] = useState({
    transactions: 0,
    budgets: 0,
    exports: 0
  })

  useEffect(() => {
    if (!user) {
      setSubscription({
        status: 'active',
        planKey: 'FREE'
      })
      setUsage({
        transactions: 0,
        budgets: 0,
        exports: 0
      })
      setLoading(false)
      return
    }

    // Listen to user's subscription data from Firestore
    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (doc) => {
        const data = doc.data()
        if (data?.subscription) {
          setSubscription({
            ...data.subscription,
            currentPeriodStart: data.subscription.currentPeriodStart?.toDate(),
            currentPeriodEnd: data.subscription.currentPeriodEnd?.toDate(),
            createdAt: data.subscription.createdAt?.toDate(),
            updatedAt: data.subscription.updatedAt?.toDate(),
          })
        } else {
          // Default to free plan
          setSubscription({
            status: 'active',
            planKey: 'FREE'
          })
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching subscription:', error)
        setSubscription({
          status: 'active',
          planKey: 'FREE'
        })
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    if (!user?.uid) return

    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const budgetsQuery = query(
      collection(db, 'budgets'),
      where('userId', '==', user.uid)
    )

    const monthKey = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`
    const exportStorageKey = `finley_exports_${user.uid}_${monthKey}`
    const readExportUsage = () => {
      try {
        return Number(localStorage.getItem(exportStorageKey) || 0)
      } catch {
        return 0
      }
    }
    const syncExportUsage = () => {
      setUsage((prev) => ({
        ...prev,
        exports: readExportUsage()
      }))
    }

    const toDateSafe = (value: unknown): Date => {
      if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
        return (value as { toDate: () => Date }).toDate()
      }
      const parsed = new Date(String(value || ''))
      return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed
    }

    let unsubscribeTransactions: () => void = () => { }
    const monthlyTransactionQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      where('date', '>=', Timestamp.fromDate(monthStart))
    )

    const attachFallbackTransactionListener = () => {
      const fallbackQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        limit(3000)
      )

      unsubscribeTransactions = onSnapshot(fallbackQuery, (snapshot) => {
        const monthlyCount = snapshot.docs.reduce((count, docSnapshot) => {
          const txDate = toDateSafe(docSnapshot.data()?.date)
          return txDate >= monthStart ? count + 1 : count
        }, 0)

        setUsage((prev) => ({
          ...prev,
          transactions: monthlyCount
        }))
      }, (fallbackError) => {
        console.error('Fallback transaction usage tracking failed:', fallbackError)
      })
    }

    unsubscribeTransactions = onSnapshot(monthlyTransactionQuery, (snapshot) => {
      setUsage((prev) => ({
        ...prev,
        transactions: snapshot.size
      }))
    }, (error) => {
      console.error('Error tracking transaction usage (indexed query), switching to fallback:', error)
      unsubscribeTransactions()
      attachFallbackTransactionListener()
    })

    const unsubscribeBudgets = onSnapshot(budgetsQuery, (snapshot) => {
      setUsage((prev) => ({
        ...prev,
        budgets: snapshot.size
      }))
    }, (error) => {
      console.error('Error tracking budget usage:', error)
    })

    syncExportUsage()

    const handleStorage = (event: StorageEvent) => {
      if (event.key === exportStorageKey) {
        syncExportUsage()
      }
    }
    const handleExportUsageUpdated = () => syncExportUsage()

    window.addEventListener('storage', handleStorage)
    window.addEventListener('finley:export-usage-updated', handleExportUsageUpdated)
    window.addEventListener('focus', handleExportUsageUpdated)

    return () => {
      unsubscribeTransactions()
      unsubscribeBudgets()
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('finley:export-usage-updated', handleExportUsageUpdated)
      window.removeEventListener('focus', handleExportUsageUpdated)
    }
  }, [user?.uid])

  const isProMember = subscription?.planKey !== 'FREE' && subscription?.status === 'active'
  const currentPlanKey = subscription?.planKey || 'FREE'
  const currentPlan = SUBSCRIPTION_PLANS[currentPlanKey]

  const canUseFeature = (feature: string): boolean => {
    if (!subscription) return false

    // Pro features
    const proFeatures = [
      'unlimited_transactions',
      'advanced_analytics',
      'ai_insights',
      'auto_categorization',
      'priority_support',
      'data_export_advanced'
    ]

    if (proFeatures.includes(feature)) {
      return isProMember
    }

    return true // Basic features are available to all users
  }

  const getRemainingUsage = (limitType: 'transactions' | 'budgets' | 'exports'): number => {
    if (!subscription) return 0
    
    const plan = SUBSCRIPTION_PLANS[subscription.planKey]
    const limit = plan.limits[limitType]
    
    // -1 means unlimited
    if (limit === -1) return -1
    
    return Math.max(0, limit - usage[limitType])
  }

  const refreshSubscription = async (): Promise<void> => {
    if (!user) return

    try {
      // Refresh subscription data from Stripe
      // This would typically involve calling an API endpoint
      // that fetches the latest subscription data from Stripe
      console.log('Refreshing subscription data...')
    } catch (error) {
      console.error('Error refreshing subscription:', error)
    }
  }

  return (
    <SubscriptionContext.Provider 
      value={{
        subscription,
        loading,
        isProMember,
        currentPlanKey,
        currentPlanName: currentPlan.name,
        usage,
        canUseFeature,
        getRemainingUsage,
        refreshSubscription
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}
