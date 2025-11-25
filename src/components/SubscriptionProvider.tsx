'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthProvider'
import { doc, onSnapshot } from 'firebase/firestore'
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
  canUseFeature: (feature: string) => boolean
  getRemainingUsage: (limitType: 'transactions' | 'budgets' | 'exports') => number
  refreshSubscription: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setSubscription({
        status: 'active',
        planKey: 'FREE'
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

  const isProMember = subscription?.planKey !== 'FREE' && subscription?.status === 'active'

  const canUseFeature = (feature: string): boolean => {
    if (!subscription) return false
    
    const plan = SUBSCRIPTION_PLANS[subscription.planKey]
    
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
    
    // For demo purposes, return some usage data
    // In a real app, you'd fetch this from your database
    const currentUsage = {
      transactions: 23,
      budgets: 3,
      exports: 1
    }

    return Math.max(0, limit - currentUsage[limitType])
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