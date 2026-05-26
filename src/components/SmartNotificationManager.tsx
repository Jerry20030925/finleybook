'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from './AuthProvider'
import { useSubscription } from './SubscriptionProvider'
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore'
import { db, initializeFirebase } from '@/lib/firebase'
import { Transaction } from '@/lib/dataService'
import { isMobileApp } from '@/lib/mobileUtils'
import { createClientNotification } from '@/lib/clientNotificationService'
import { requestPushPermission } from '@/lib/pushNotifications'

const LARGE_EXPENSE_THRESHOLD = 500
const INACTIVITY_DAYS = 7
const MIN_NEGATIVE_CASHFLOW = 200
const STORAGE_PREFIX = 'finley_smart_notified_keys'

const toDateSafe = (input: unknown) => {
    if (input && typeof input === 'object' && 'toDate' in input && typeof (input as { toDate?: () => Date }).toDate === 'function') {
        return (input as { toDate: () => Date }).toDate()
    }
    const parsed = input ? new Date(input as string | number | Date) : new Date()
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

const getMonthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
const getWeekKey = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 1)
    const dayOffset = Math.floor((date.getTime() - start.getTime()) / 86400000)
    const week = Math.ceil((dayOffset + start.getDay() + 1) / 7)
    return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`
}

export default function SmartNotificationManager() {
    const { user } = useAuth()
    const { isProMember } = useSubscription()

    const processedTransactionIds = useRef<Set<string>>(new Set())
    const sentNotificationKeys = useRef<Set<string>>(new Set())
    const isInitialLoad = useRef(true)

    // Register FCM token once per session after the user logs in
    useEffect(() => {
        if (!user?.uid) return
        const registered = sessionStorage.getItem(`fcm_registered_${user.uid}`)
        if (registered) return

        const registerToken = async () => {
            try {
                const token = await requestPushPermission()
                if (!token) return

                const { getAuth } = await import('firebase/auth')
                const { getApps } = await import('firebase/app')
                if (!getApps().length) return
                const idToken = await getAuth().currentUser?.getIdToken()
                if (!idToken) return

                await fetch('/api/notifications/register-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, idToken }),
                })
                sessionStorage.setItem(`fcm_registered_${user.uid}`, '1')
            } catch (err) {
                console.warn('[Push] Token registration failed:', err)
            }
        }

        void registerToken()
    }, [user?.uid])

    useEffect(() => {
        processedTransactionIds.current = new Set()
        isInitialLoad.current = true
    }, [user?.uid])

    useEffect(() => {
        if (!user?.uid || typeof window === 'undefined') {
            sentNotificationKeys.current = new Set()
            return
        }

        try {
            const raw = localStorage.getItem(`${STORAGE_PREFIX}_${user.uid}`)
            const parsed = raw ? JSON.parse(raw) : []
            sentNotificationKeys.current = new Set(Array.isArray(parsed) ? parsed : [])
        } catch (error) {
            console.error('Failed to hydrate smart notification keys:', error)
            sentNotificationKeys.current = new Set()
        }
    }, [user?.uid])

    useEffect(() => {
        if (!user?.uid) return

        const persistNotificationKeys = () => {
            if (typeof window === 'undefined') return
            localStorage.setItem(
                `${STORAGE_PREFIX}_${user.uid}`,
                JSON.stringify(Array.from(sentNotificationKeys.current).slice(-300))
            )
        }

        const markNotificationSent = (key: string) => {
            sentNotificationKeys.current.add(key)
            persistNotificationKeys()
        }

        const unmarkNotificationKey = (key: string) => {
            sentNotificationKeys.current.delete(key)
            persistNotificationKeys()
        }

        const triggerNativeNotification = async (title: string, body: string) => {
            if (!isMobileApp() || !isProMember) return
            try {
                const { LocalNotifications } = await import('@capacitor/local-notifications')
                await LocalNotifications.schedule({
                    notifications: [{
                        title,
                        body,
                        id: Math.floor(Math.random() * 100000),
                        schedule: { at: new Date(Date.now() + 100) },
                        sound: undefined,
                        attachments: undefined,
                        actionTypeId: '',
                        extra: undefined
                    }]
                })
            } catch (error) {
                console.error('Failed to schedule native notification', error)
            }
        }

        const sendSmartNotification = async (payload: {
            dedupeKey: string
            title: string
            body: string
            type: 'success' | 'info' | 'warning' | 'error' | 'promo' | 'ai-alert'
            link?: string
            native?: boolean
        }) => {
            if (sentNotificationKeys.current.has(payload.dedupeKey)) return

            markNotificationSent(payload.dedupeKey)
            try {
                await createClientNotification({
                    userId: user.uid,
                    title: payload.title,
                    body: payload.body,
                    type: payload.type,
                    link: payload.link
                })

                if (payload.native) {
                    await triggerNativeNotification(payload.title, payload.body)
                }
            } catch (error) {
                unmarkNotificationKey(payload.dedupeKey)
                console.error('Failed to write smart notification:', error)
            }
        }

        let unsubscribe: (() => void) | null = null
        let cancelled = false

        const startListener = async () => {
            const firebase = db ? { db } : await initializeFirebase()
            const firestoreDb = firebase.db
            if (!firestoreDb || cancelled) return

            const q = query(
                collection(firestoreDb, 'transactions'),
                where('userId', '==', user.uid),
                limit(1500)
            )

            unsubscribe = onSnapshot(q, (snapshot) => {
                const transactions = snapshot.docs.map((docSnapshot) => {
                    const data = docSnapshot.data() as Partial<Transaction> & {
                        date?: unknown
                        createdAt?: unknown
                    }

                    return {
                        id: docSnapshot.id,
                        userId: data.userId || user.uid,
                        amount: Math.abs(Number(data.amount || 0)),
                        category: data.category || 'Uncategorized',
                        description: data.description || '',
                        date: toDateSafe(data.date),
                        type: (data.type as Transaction['type']) || 'expense',
                        paymentMethod: data.paymentMethod,
                        merchantName: data.merchantName,
                        createdAt: toDateSafe(data.createdAt),
                        emotionalTag: data.emotionalTag,
                        savings_link: data.savings_link,
                        projectedCashback: data.projectedCashback,
                        netCost: data.netCost,
                        accountId: data.accountId,
                        status: data.status
                    } as Transaction
                }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

                const runSmartChecks = async () => {
                    const now = new Date()
                    const monthKey = getMonthKey(now)

                    if (transactions.length === 0) {
                        await sendSmartNotification({
                            dedupeKey: `onboarding-${monthKey}`,
                            title: 'Start with your first transaction',
                            body: 'Add one income or expense item to unlock your personal insights and AI guidance.',
                            type: 'info',
                            link: '/transactions'
                        })
                    }

                    const latestTransaction = transactions[0]
                    if (latestTransaction) {
                        const inactivityThreshold = new Date(now.getTime() - INACTIVITY_DAYS * 24 * 60 * 60 * 1000)
                        if (new Date(latestTransaction.date) < inactivityThreshold) {
                            await sendSmartNotification({
                                dedupeKey: `inactive-${getWeekKey(now)}`,
                                title: 'Keep your data fresh this week',
                                body: `No new transaction in ${INACTIVITY_DAYS} days. Add your latest spending to keep reports accurate.`,
                                type: 'warning',
                                link: '/transactions'
                            })
                        }
                    }

                    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
                    const monthTransactions = transactions.filter((transaction) => new Date(transaction.date) >= monthStart)
                    const monthIncome = monthTransactions
                        .filter((transaction) => transaction.type === 'income' || transaction.type === 'cashback')
                        .reduce((sum, transaction) => sum + transaction.amount, 0)
                    const monthExpense = monthTransactions
                        .filter((transaction) => transaction.type === 'expense')
                        .reduce((sum, transaction) => sum + transaction.amount, 0)

                    if (monthExpense > monthIncome && monthExpense >= MIN_NEGATIVE_CASHFLOW) {
                        await sendSmartNotification({
                            dedupeKey: `cashflow-risk-${monthKey}`,
                            title: 'Monthly cash flow is under pressure',
                            body: 'Your expenses are currently above income this month. Review your reports and adjust one budget cap.',
                            type: 'warning',
                            link: '/reports',
                            native: true
                        })
                    }

                    if (monthIncome > 0) {
                        const savingsRate = ((monthIncome - monthExpense) / monthIncome) * 100
                        if (savingsRate >= 20) {
                            await sendSmartNotification({
                                dedupeKey: `savings-win-${monthKey}`,
                                title: 'Great savings momentum',
                                body: `Your savings rate is ${savingsRate.toFixed(0)}% this month. Keep this pace to hit your goals faster.`,
                                type: 'success',
                                link: '/goals'
                            })
                        }
                    }

                    for (const transaction of transactions) {
                        const transactionId = transaction.id || ''
                        if (!transactionId) continue

                        if (!isInitialLoad.current && !processedTransactionIds.current.has(transactionId)) {
                            if (transaction.type === 'expense' && transaction.amount >= LARGE_EXPENSE_THRESHOLD) {
                                await sendSmartNotification({
                                    dedupeKey: `large-expense-${transactionId}`,
                                    title: 'Large expense detected',
                                    body: `${transaction.category}: ${transaction.description || 'Recent transaction'} at ${transaction.amount.toFixed(2)}. Tap to review details.`,
                                    type: 'ai-alert',
                                    link: `/transactions?q=${encodeURIComponent(transaction.description || transaction.category || '')}`,
                                    native: true
                                })
                            }
                        }

                        processedTransactionIds.current.add(transactionId)
                    }

                    if (isInitialLoad.current) {
                        isInitialLoad.current = false
                    }
                }

                void runSmartChecks()
            })
        }

        void startListener()

        return () => {
            cancelled = true
            if (unsubscribe) unsubscribe()
        }
    }, [user?.uid, isProMember])

    return null
}
