'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from './AuthProvider'
import { useNotification } from './NotificationProvider'
import { useSubscription } from './SubscriptionProvider'
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Transaction } from '@/lib/dataService'
import { isMobileApp } from '@/lib/mobileUtils'

// Define budget limits (matching BudgetWidget)
const BUDGET_LIMITS: { [key: string]: number } = {
    '餐饮美食': 1000,
    '交通出行': 500,
    '购物消费': 800,
    '文化娱乐': 400
}

export default function SmartNotificationManager() {
    const { user } = useAuth()
    const { addNotification } = useNotification()
    const { isProMember } = useSubscription()

    // Refs to track state without triggering re-renders
    const processedTransactionIds = useRef<Set<string>>(new Set())
    const notifiedBudgets = useRef<Set<string>>(new Set())
    const isInitialLoad = useRef(true)

    useEffect(() => {
        if (!user?.uid) return

        // Query for current month's transactions
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const q = query(
            collection(db, 'transactions'),
            where('userId', '==', user.uid),
            where('date', '>=', Timestamp.fromDate(startOfMonth))
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const transactions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Transaction[]

            // 1. Calculate Category Spending
            const categorySpending: { [key: string]: number } = {}

            transactions.forEach(t => {
                if (t.type === 'expense') {
                    categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount
                }

                // 2. Check for new large transactions (only if not initial load)
                if (!isInitialLoad.current && !processedTransactionIds.current.has(t.id || '')) {
                    if (t.type === 'expense' && t.amount > 500) {
                        addNotification(
                            '大额支出提醒',
                            `您刚刚在 ${t.category} 支出 ¥${t.amount} (${t.description})`,
                            'info'
                        )
                    }
                    if (t.id) processedTransactionIds.current.add(t.id)
                }
            })

            // 3. Check Budget Limits
            Object.entries(BUDGET_LIMITS).forEach(async ([category, limit]) => {
                const spent = categorySpending[category] || 0
                const percentage = (spent / limit) * 100

                // Warning at 80%
                if (percentage >= 80 && percentage < 100) {
                    const key = `${category}-80`
                    if (!notifiedBudgets.current.has(key)) {
                        const title = '预算预警'
                        const body = `${category} 预算已使用 ${percentage.toFixed(0)}% (¥${spent}/¥${limit})`

                        addNotification(title, body, 'warning')

                        // Native Push (Pro Only)
                        if (await isMobileApp() && isProMember) {
                            try {
                                const { LocalNotifications } = await import('@capacitor/local-notifications');
                                await LocalNotifications.schedule({
                                    notifications: [{
                                        title,
                                        body,
                                        id: Math.floor(Math.random() * 100000), // Random ID for now
                                        schedule: { at: new Date(Date.now() + 100) },
                                        sound: undefined,
                                        attachments: undefined,
                                        actionTypeId: "",
                                        extra: undefined
                                    }]
                                });
                            } catch (e) {
                                console.error('Failed to schedule native notification', e);
                            }
                        }

                        notifiedBudgets.current.add(key)
                    }
                }

                // Alert at 100%
                if (percentage >= 100) {
                    const key = `${category}-100`
                    if (!notifiedBudgets.current.has(key)) {
                        const title = '预算超支'
                        const body = `${category} 预算已超支！当前支出 ¥${spent} (预算 ¥${limit})`

                        addNotification(title, body, 'error')

                        // Native Push (Critical) - Pro Only
                        if (await isMobileApp() && isProMember) {
                            try {
                                const { LocalNotifications } = await import('@capacitor/local-notifications');
                                await LocalNotifications.schedule({
                                    notifications: [{
                                        title,
                                        body,
                                        id: Math.floor(Math.random() * 100000),
                                        schedule: { at: new Date(Date.now() + 100) },
                                        sound: undefined, // Default
                                        attachments: undefined,
                                        actionTypeId: "",
                                        extra: undefined
                                    }]
                                });
                            } catch (e) {
                                console.error('Failed to schedule native notification', e);
                            }
                        }

                        notifiedBudgets.current.add(key)
                    }
                }
            })

            // Mark initial load as done after first process
            if (isInitialLoad.current) {
                snapshot.docs.forEach(doc => processedTransactionIds.current.add(doc.id))
                isInitialLoad.current = false
            }
        })

        return () => unsubscribe()
    }, [user?.uid, addNotification])

    return null // This component doesn't render anything
}
