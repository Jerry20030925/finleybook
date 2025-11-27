'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from './AuthProvider'
import { useNotification } from './NotificationProvider'
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Transaction } from '@/lib/dataService'

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
            Object.entries(BUDGET_LIMITS).forEach(([category, limit]) => {
                const spent = categorySpending[category] || 0
                const percentage = (spent / limit) * 100

                // Warning at 80%
                if (percentage >= 80 && percentage < 100) {
                    const key = `${category}-80`
                    if (!notifiedBudgets.current.has(key)) {
                        addNotification(
                            '预算预警',
                            `${category} 预算已使用 ${percentage.toFixed(0)}% (¥${spent}/¥${limit})`,
                            'warning'
                        )
                        notifiedBudgets.current.add(key)
                    }
                }

                // Alert at 100%
                if (percentage >= 100) {
                    const key = `${category}-100`
                    if (!notifiedBudgets.current.has(key)) {
                        addNotification(
                            '预算超支',
                            `${category} 预算已超支！当前支出 ¥${spent} (预算 ¥${limit})`,
                            'error'
                        )
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
