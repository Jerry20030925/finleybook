'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { PaperAirplaneIcon, XMarkIcon, SparklesIcon, MicrophoneIcon } from '@heroicons/react/24/solid'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from './AuthProvider'
import {
    addBudget,
    addGoal,
    addTransaction,
    getBudgets,
    updateBudget,
    type Goal,
} from '@/lib/dataService'
import toast from 'react-hot-toast'
import ProUpgradeModal from './ProUpgradeModal'
import { useExperience } from '@/components/ExperienceProvider'
import { useWorkflowPreferences } from '@/hooks/useWorkflowPreferences'
import { MOTION_DURATION, MOTION_EASE, MOTION_SPRING } from '@/lib/motionTokens'

interface ParsedTransaction {
    amount: number
    currency: string
    merchant: string
    category: string
    date: string
    description: string
    items: string[]
    emotional_context: 'happy' | 'stress' | 'impulse' | 'sad' | 'neutral'
}

type AISuggestion = {
    icon: string
    text: string
    action: string
    highlight?: boolean
}

type AIActionKind = 'none' | 'add_transaction' | 'set_budget' | 'create_goal'

type PendingAIAction = {
    kind: Exclude<AIActionKind, 'none'>
    summary: string
    requiresConfirmation: boolean
    data: Record<string, unknown>
}

type AIRequestError = {
    status: number
    code?: string
    message: string
}

interface AIChatInputProps {
    isOpen?: boolean
    onClose?: () => void
    onOpenChange?: (open: boolean) => void
    trigger?: React.ReactNode
    prefillText?: string
    prefillKey?: string | number
    suggestions?: AISuggestion[]
    welcomeTitle?: string
    placeholder?: string
}

const DEFAULT_SUGGESTIONS: AISuggestion[] = [
    { icon: '🧾', text: 'Log expense', action: 'I spent $18 on lunch today, record it for me.' },
    { icon: '📘', text: 'New user guide', action: 'I am new. Teach me how to use FinleyBook step by step.', highlight: true },
    { icon: '📊', text: 'Set budget', action: 'Set my food budget to 600 this month.' },
    { icon: '🎯', text: 'Create goal', action: 'Create a goal to save 5000 for emergency fund.' }
]

const looksLikeTransactionInput = (text: string) => {
    const normalized = text.trim().toLowerCase()
    if (!normalized) return false

    const hasAmount = /(?:\$|a\$|usd|aud|\d+[\.,]?\d{0,2})/.test(normalized)
    const actionWords = /(spent|paid|bought|purchase|bill|expense|cost|fee|taxi|uber|coffee|lunch|dinner|rent|groceries|payment|refund|transfer)/.test(normalized)

    return hasAmount && actionWords
}

const isActionKind = (kind: unknown): kind is AIActionKind => {
    return kind === 'none' || kind === 'add_transaction' || kind === 'set_budget' || kind === 'create_goal'
}

const normalizeExpenseCategory = (value: unknown): string => {
    const normalized = String(value || '').toLowerCase()
    if (/(food|dining|restaurant|meal|餐|吃)/.test(normalized)) return 'category.food'
    if (/(transport|taxi|uber|bus|train|fuel|交通)/.test(normalized)) return 'category.transport'
    if (/(shopping|retail|shop|购物|消费)/.test(normalized)) return 'category.shopping'
    if (/(housing|rent|mortgage|utility|房|租)/.test(normalized)) return 'category.housing'
    if (/(health|medical|doctor|pharmacy|医疗|健康)/.test(normalized)) return 'category.health'
    if (/(entertainment|movie|game|music|娱乐)/.test(normalized)) return 'category.entertainment'
    if (/(education|course|study|learn|教育|学习)/.test(normalized)) return 'category.education'
    return 'category.otherExpense'
}

const normalizeIncomeCategory = (value: unknown): string => {
    const normalized = String(value || '').toLowerCase()
    if (/(salary|payroll|工资)/.test(normalized)) return 'category.salary'
    if (/(investment|dividend|interest|投资)/.test(normalized)) return 'category.investment'
    if (/(part[- ]?time|freelance|side hustle|兼职)/.test(normalized)) return 'category.parttime'
    return 'category.otherIncome'
}

const normalizeGoalCategory = (value: unknown): Goal['category'] => {
    const normalized = String(value || '').toLowerCase()
    if (normalized === 'investment') return 'investment'
    if (normalized === 'purchase') return 'purchase'
    if (normalized === 'debt') return 'debt'
    if (normalized === 'emergency') return 'emergency'
    return 'savings'
}

const normalizeAction = (raw: unknown): PendingAIAction | null => {
    if (!raw || typeof raw !== 'object') return null
    const payload = raw as Record<string, unknown>
    const kind = isActionKind(payload.kind) ? payload.kind : 'none'
    if (kind === 'none') return null

    const summary = typeof payload.summary === 'string' && payload.summary.trim()
        ? payload.summary.trim()
        : 'Confirm this change before updating your account data.'

    return {
        kind,
        summary,
        requiresConfirmation: payload.requiresConfirmation !== false,
        data: payload.data && typeof payload.data === 'object' ? (payload.data as Record<string, unknown>) : {},
    }
}

const safeDate = (value: unknown) => {
    if (!value) return new Date()
    const parsed = new Date(String(value))
    if (Number.isNaN(parsed.getTime())) return new Date()
    return parsed
}

const extractFirstAmount = (text: string): number | null => {
    const match = text.replace(/,/g, '').match(/(?:a\$|\$)?\s*(-?\d+(?:\.\d{1,2})?)/i)
    if (!match?.[1]) return null
    const amount = Number(match[1])
    if (!Number.isFinite(amount)) return null
    return Math.abs(amount)
}

const inferExpenseCategory = (text: string): string => {
    const normalized = text.toLowerCase()
    if (/(food|dining|restaurant|lunch|dinner|coffee|meal|餐|吃)/.test(normalized)) return 'category.food'
    if (/(transport|uber|taxi|bus|train|fuel|交通)/.test(normalized)) return 'category.transport'
    if (/(rent|housing|utility|mortgage|房租|租)/.test(normalized)) return 'category.housing'
    if (/(shopping|retail|shop|购物)/.test(normalized)) return 'category.shopping'
    if (/(health|medical|doctor|pharmacy|医疗)/.test(normalized)) return 'category.health'
    if (/(entertainment|movie|game|music|娱乐)/.test(normalized)) return 'category.entertainment'
    return 'category.otherExpense'
}

const inferGoalCategory = (text: string): Goal['category'] => {
    const normalized = text.toLowerCase()
    if (/(invest|investment|portfolio|股票|投资)/.test(normalized)) return 'investment'
    if (/(debt|loan|credit card|还款|债务)/.test(normalized)) return 'debt'
    if (/(emergency|rainy day|应急)/.test(normalized)) return 'emergency'
    if (/(purchase|buy|car|trip|vacation|购物|买)/.test(normalized)) return 'purchase'
    return 'savings'
}

const buildLocalActionFallback = (input: string): PendingAIAction | null => {
    const text = input.trim()
    if (!text) return null

    const normalized = text.toLowerCase()
    const amount = extractFirstAmount(text)

    if (/(budget|spending cap|预算|上限)/.test(normalized) && amount && amount > 0) {
        const category = inferExpenseCategory(normalized)
        return {
            kind: 'set_budget',
            summary: `I can set a monthly budget of ${amount} now. Confirm to apply.`,
            requiresConfirmation: true,
            data: {
                category,
                amount,
                period: 'monthly',
            },
        }
    }

    if (/(goal|save|saving|储蓄|目标)/.test(normalized) && amount && amount > 0) {
        const titleMatch = text.match(/(?:goal|save|saving)\s+(?:for\s+)?(.+?)(?:\s+\d|$)/i)
        const title = titleMatch?.[1]?.trim() || 'Savings Goal'

        return {
            kind: 'create_goal',
            summary: `I can create a goal "${title}" with target ${amount}. Confirm to apply.`,
            requiresConfirmation: true,
            data: {
                title,
                description: 'Created from AI local fallback',
                targetAmount: amount,
                currentAmount: 0,
                deadline: defaultGoalDeadline(),
                category: inferGoalCategory(normalized),
            },
        }
    }

    if (looksLikeTransactionInput(text) && amount && amount > 0) {
        const description = text.length > 80 ? `${text.slice(0, 77)}...` : text
        return {
            kind: 'add_transaction',
            summary: `I can add this expense record (${amount}) now. Confirm to apply.`,
            requiresConfirmation: true,
            data: {
                type: 'expense',
                amount,
                category: inferExpenseCategory(normalized),
                description,
                date: new Date().toISOString(),
            },
        }
    }

    return null
}

const defaultGoalDeadline = () => {
    const now = new Date()
    now.setMonth(now.getMonth() + 3)
    return now.toISOString().slice(0, 10)
}

const isAIRequestError = (error: unknown): error is AIRequestError => {
    if (!error || typeof error !== 'object') return false
    const payload = error as Record<string, unknown>
    return typeof payload.status === 'number' && typeof payload.message === 'string'
}

const isSafeAutoActionKind = (kind: PendingAIAction['kind']) => kind === 'add_transaction' || kind === 'set_budget'

const approvalModeLabel = (mode: 'suggest_only' | 'confirm_write' | 'auto_safe') => {
    if (mode === 'suggest_only') return 'Suggest only'
    if (mode === 'auto_safe') return 'Auto-safe apply'
    return 'Confirm before write'
}

const approvalModeTone = (mode: 'suggest_only' | 'confirm_write' | 'auto_safe') => {
    if (mode === 'suggest_only') return 'border-amber-200 bg-amber-50 text-amber-700'
    if (mode === 'auto_safe') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    return 'border-cyan-200 bg-cyan-50 text-cyan-700'
}

export default function AIChatInput({
    isOpen: externalIsOpen,
    onClose: externalOnClose,
    onOpenChange,
    trigger,
    prefillText,
    prefillKey,
    suggestions,
    welcomeTitle,
    placeholder,
}: AIChatInputProps = {}) {
    const { user } = useAuth()
    const { reduceMotion, allowRichMotion } = useExperience()
    const workflowPreferences = useWorkflowPreferences(user?.uid)
    const [internalIsOpen, setInternalIsOpen] = useState(false)
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isApplyingAction, setIsApplyingAction] = useState(false)
    const [parsedTx, setParsedTx] = useState<ParsedTransaction | null>(null)
    const [assistantReply, setAssistantReply] = useState<string | null>(null)
    const [assistantFollowUps, setAssistantFollowUps] = useState<string[]>([])
    const [pendingAction, setPendingAction] = useState<PendingAIAction | null>(null)
    const [showBubble, setShowBubble] = useState(false)
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const [mobileViewportHeight, setMobileViewportHeight] = useState<number | null>(null)
    const [mobileKeyboardInset, setMobileKeyboardInset] = useState(0)
    const [isMobileViewport, setIsMobileViewport] = useState(false)

    const inputRef = useRef<HTMLTextAreaElement>(null)
    const sheetTouchStartY = useRef<number | null>(null)
    const isSheetDragging = useRef(false)
    const isControlled = externalIsOpen !== undefined
    const isOpen = isControlled ? externalIsOpen : internalIsOpen

    const activeSuggestions = useMemo(
        () => (suggestions && suggestions.length > 0 ? suggestions : DEFAULT_SUGGESTIONS),
        [suggestions]
    )

    const isBusy = isLoading || isApplyingAction
    const aiApprovalMode = workflowPreferences.aiActionApproval

    const setIsOpen = (value: boolean) => {
        if (isControlled) {
            onOpenChange?.(value)
            if (!value) externalOnClose?.()
            return
        }

        setInternalIsOpen(value)
        onOpenChange?.(value)
        if (!value) externalOnClose?.()
    }

    const resizeTextarea = () => {
        if (!inputRef.current) return
        inputRef.current.style.height = 'auto'
        inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 128)}px`
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isOpen) setShowBubble(true)
        }, 3000)
        return () => clearTimeout(timer)
    }, [isOpen])

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
            resizeTextarea()
            setShowBubble(false)
        }
    }, [isOpen])

    useEffect(() => {
        resizeTextarea()
    }, [input])

    useEffect(() => {
        if (typeof window === 'undefined') return

        const updateViewportMetrics = () => {
            const mobile = window.innerWidth < 768
            setIsMobileViewport(mobile)

            if (!mobile) {
                setMobileViewportHeight(null)
                setMobileKeyboardInset(0)
                return
            }

            const viewport = window.visualViewport
            if (!viewport) {
                setMobileViewportHeight(window.innerHeight)
                setMobileKeyboardInset(0)
                return
            }

            const keyboardInset = Math.max(0, window.innerHeight - (viewport.height + viewport.offsetTop))
            setMobileViewportHeight(viewport.height)
            setMobileKeyboardInset(keyboardInset)
        }

        updateViewportMetrics()
        window.addEventListener('resize', updateViewportMetrics)
        window.visualViewport?.addEventListener('resize', updateViewportMetrics)
        window.visualViewport?.addEventListener('scroll', updateViewportMetrics)

        return () => {
            window.removeEventListener('resize', updateViewportMetrics)
            window.visualViewport?.removeEventListener('resize', updateViewportMetrics)
            window.visualViewport?.removeEventListener('scroll', updateViewportMetrics)
        }
    }, [])

    useEffect(() => {
        if (!prefillText) return
        setInput(prefillText)
        setAssistantReply(null)
        setAssistantFollowUps([])
        setParsedTx(null)
        setPendingAction(null)
        if (!isOpen) {
            if (isControlled) {
                onOpenChange?.(true)
            } else {
                setInternalIsOpen(true)
                onOpenChange?.(true)
            }
        }
    }, [prefillText, prefillKey, isOpen, isControlled, onOpenChange])

    const handleSheetTouchStart = (event: React.TouchEvent) => {
        if (!isMobileViewport) return
        sheetTouchStartY.current = event.touches[0]?.clientY ?? null
        isSheetDragging.current = true
    }

    const handleSheetTouchMove = (event: React.TouchEvent) => {
        if (!isMobileViewport) return
        if (!isSheetDragging.current || sheetTouchStartY.current === null) return
        const delta = (event.touches[0]?.clientY ?? 0) - sheetTouchStartY.current
        if (delta > 0 && event.cancelable) {
            event.preventDefault()
        }
    }

    const handleSheetTouchEnd = (event: React.TouchEvent) => {
        if (!isMobileViewport) return
        if (!isSheetDragging.current || sheetTouchStartY.current === null) return

        const endY = event.changedTouches[0]?.clientY ?? sheetTouchStartY.current
        const delta = endY - sheetTouchStartY.current
        isSheetDragging.current = false
        sheetTouchStartY.current = null

        if (delta > 72) {
            setIsOpen(false)
        }
    }

    if (!user) return null

    const showAiFallbackGuide = (headline?: string) => {
        setAssistantReply(
            `${headline || 'I could not complete AI processing at this moment.'}\n` +
            'You can continue right now:\n' +
            '1) Open Transactions and add your latest expense.\n' +
            '2) Open Budget and set one spending cap.\n' +
            '3) Open Reports and review your monthly trend.'
        )
        setAssistantFollowUps([
            'Help me add my latest expense manually.',
            'Set a monthly food budget for me.',
            'Create a first savings goal for this month.',
        ])
    }

    const handleAiError = (error: unknown) => {
        console.error('AI request error:', error)

        if (isAIRequestError(error)) {
            if (error.status === 401 || error.code === 'UNAUTHORIZED') {
                toast.error('Session expired. Please sign in again.')
                setAssistantReply('Your session expired. Please sign in again, then ask Finley AI to continue.')
                setAssistantFollowUps([
                    'After login, help me add my latest expense.',
                    'After login, set my monthly food budget to 600.',
                ])
                return
            }

            if (error.status === 403 || error.code === 'AI_LIMIT_REACHED') {
                setShowUpgradeModal(true)
                toast.error('Free AI quota reached. Upgrade for unlimited AI actions.')
                setAssistantReply('You have reached this month\'s Free AI usage limit. Upgrade to Pro to unlock unlimited AI guidance and data updates.')
                setAssistantFollowUps([
                    'Compare Free vs Pro for my usage.',
                    'Show me what I can still do manually right now.',
                ])
                return
            }

            if (error.code === 'INVALID_INPUT') {
                toast.error('Please enter a clearer request.')
                setAssistantReply('I need a clearer instruction. Example: "Set my food budget to 600", "Record lunch 18 today", or "Create emergency goal 5000".')
                setAssistantFollowUps([
                    'Set my food budget to 600 this month.',
                    'Record lunch 18 today as an expense.',
                    'Create an emergency goal for 5000.',
                ])
                return
            }

            if (error.code === 'AI_NOT_CONFIGURED') {
                toast.error('AI is temporarily unavailable. You can still use manual workflows.')
                showAiFallbackGuide('AI is temporarily unavailable on the server right now.')
                return
            }
        }

        toast.error('Temporary AI issue. Showing a quick fallback guide.')
        showAiFallbackGuide()
    }

    const applyPendingActionRecord = async (action: PendingAIAction, options?: { autoApplied?: boolean }) => {
        if (!user) return false

        setIsApplyingAction(true)
        try {
            if (action.kind === 'add_transaction') {
                const amount = Number(action.data.amount)
                if (!Number.isFinite(amount) || amount <= 0) throw new Error('Invalid amount')

                const type = action.data.type === 'income' ? 'income' : 'expense'
                const category = type === 'income'
                    ? normalizeIncomeCategory(action.data.category)
                    : normalizeExpenseCategory(action.data.category)

                const description = typeof action.data.description === 'string' && action.data.description.trim()
                    ? action.data.description.trim()
                    : type === 'income' ? 'AI income record' : 'AI expense record'

                await addTransaction({
                    userId: user.uid,
                    amount,
                    category,
                    description,
                    date: safeDate(action.data.date),
                    type,
                    emotionalTag: 'neutral',
                })

                toast.success(options?.autoApplied ? 'AI auto-applied: transaction updated' : 'AI applied: transaction updated')
            }

            if (action.kind === 'set_budget') {
                const amount = Number(action.data.amount)
                if (!Number.isFinite(amount) || amount <= 0) throw new Error('Invalid budget amount')

                const period = action.data.period === 'yearly' ? 'yearly' : 'monthly'
                const category = normalizeExpenseCategory(action.data.category)
                const budgets = await getBudgets(user.uid)

                const existing = budgets.find((b) => b.category === category && b.period === period)
                    || budgets.find((b) => b.category === category)

                if (existing?.id) {
                    await updateBudget(existing.id, { amount, category, period })
                    toast.success(options?.autoApplied ? 'AI auto-applied: budget updated' : 'AI applied: budget updated')
                } else {
                    await addBudget({
                        userId: user.uid,
                        category,
                        amount,
                        period,
                    })
                    toast.success(options?.autoApplied ? 'AI auto-applied: budget created' : 'AI applied: budget created')
                }
            }

            if (action.kind === 'create_goal') {
                const targetAmount = Number(action.data.targetAmount)
                if (!Number.isFinite(targetAmount) || targetAmount <= 0) throw new Error('Invalid goal amount')

                const title = typeof action.data.title === 'string' && action.data.title.trim()
                    ? action.data.title.trim()
                    : 'AI Savings Goal'

                const description = typeof action.data.description === 'string' && action.data.description.trim()
                    ? action.data.description.trim()
                    : `Goal created by Finley AI for ${title}`

                await addGoal({
                    userId: user.uid,
                    title,
                    description,
                    targetAmount,
                    currentAmount: Number(action.data.currentAmount) > 0 ? Number(action.data.currentAmount) : 0,
                    deadline: typeof action.data.deadline === 'string' ? action.data.deadline : defaultGoalDeadline(),
                    category: normalizeGoalCategory(action.data.category),
                    isCompleted: false,
                })

                toast.success(options?.autoApplied ? 'AI auto-applied: goal created' : 'AI applied: goal created')
            }

            setPendingAction(null)
            setInput('')
            return true
        } catch (error) {
            console.error('Failed to apply AI action:', error)
            toast.error('Could not apply AI change. Please check details and retry.')
            return false
        } finally {
            setIsApplyingAction(false)
        }
    }

    const handleIncomingActionPreview = async (action: PendingAIAction | null) => {
        if (!action) {
            setPendingAction(null)
            return
        }

        if (aiApprovalMode === 'suggest_only') {
            setPendingAction(action)
            setAssistantReply((prev) => `${prev ? `${prev}\n\n` : ''}Automation is set to Suggest only, so I prepared a preview but will not change data automatically.`)
            return
        }

        if (aiApprovalMode === 'auto_safe' && isSafeAutoActionKind(action.kind)) {
            setPendingAction(action)
            setAssistantReply((prev) => `${prev ? `${prev}\n\n` : ''}Auto-safe mode is enabled. I am applying this safe action now.`)
            const success = await applyPendingActionRecord(action, { autoApplied: true })
            if (success) {
                setAssistantReply((prev) => `${prev ? `${prev}\n\n` : ''}Done. The change was applied to your data.`)
                setAssistantFollowUps((prev) => prev.length > 0 ? prev : [
                    'Show me the updated budget summary.',
                    'What should I do next this month?',
                ])
            } else {
                setPendingAction(action)
                setAssistantReply((prev) => `${prev ? `${prev}\n\n` : ''}Auto-apply failed, so I left a confirmation preview below.`)
            }
            return
        }

        setPendingAction(action)
    }

    const fetchCoachResponse = async (question: string, token: string) => {
        const response = await fetch('/api/ai/coach', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ question }),
        })

        let data: any = {}
        try {
            data = await response.json()
        } catch {
            data = {}
        }

        if (!response.ok) {
            const requestError: AIRequestError = {
                status: response.status,
                code: typeof data.errorCode === 'string' ? data.errorCode : undefined,
                message: typeof data.error === 'string' ? data.error : 'Failed to get AI guidance',
            }
            throw requestError
        }

        setAssistantReply(data.reply || 'I can help you with budgeting and bookkeeping. Tell me what you want to change.')
        setAssistantFollowUps(Array.isArray(data.suggestedExamples) ? data.suggestedExamples.slice(0, 3) : [])
        await handleIncomingActionPreview(normalizeAction(data.action))
    }

    const runSubmit = async (forcedInput?: string) => {
        const userInput = (forcedInput ?? input).trim()
        if (!userInput || isBusy) return

        setIsLoading(true)
        setParsedTx(null)
        setAssistantReply(null)
        setAssistantFollowUps([])
        setPendingAction(null)

        try {
            const token = await user.getIdToken()

            if (!looksLikeTransactionInput(userInput)) {
                await fetchCoachResponse(userInput, token)
                return
            }

            const response = await fetch('/api/ai/parse-transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ input: userInput }),
            })

            let data: any = {}
            try {
                data = await response.json()
            } catch {
                data = {}
            }

            if (!response.ok) {
                const requestError: AIRequestError = {
                    status: response.status,
                    code: typeof data.errorCode === 'string' ? data.errorCode : undefined,
                    message: typeof data.error === 'string' ? data.error : 'Failed to process request',
                }
                throw requestError
            }

            if (data.data?.error) {
                await fetchCoachResponse(userInput, token)
            } else {
                setParsedTx(data.data)
            }
        } catch (error) {
            const shouldBypassLocalFallback = isAIRequestError(error)
                && (
                    error.status === 401
                    || error.status === 403
                    || error.code === 'UNAUTHORIZED'
                    || error.code === 'AI_LIMIT_REACHED'
                    || error.code === 'INVALID_INPUT'
                )

            if (shouldBypassLocalFallback) {
                handleAiError(error)
                return
            }

            const localFallbackAction = buildLocalActionFallback(userInput)
            if (localFallbackAction) {
                setAssistantReply(
                    'AI backend is temporarily unavailable, but I understood your request and prepared a safe local action preview. Confirm below to apply.'
                )
                setAssistantFollowUps([
                    'Adjust the amount before applying.',
                    'Use monthly period for this budget.',
                    'Add one more related transaction after this.',
                ])
                await handleIncomingActionPreview(localFallbackAction)
                toast('Using local AI fallback preview.', { icon: '✨' })
            } else {
                handleAiError(error)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()
        await runSubmit()
    }

    const handleQuickAsk = async (text: string) => {
        if (isBusy) return
        setInput(text)
        await runSubmit(text)
    }

    const handleConfirm = async () => {
        if (!parsedTx || !user) return

        try {
            await addTransaction({
                userId: user.uid,
                amount: parsedTx.amount,
                category: parsedTx.category,
                description: parsedTx.description || parsedTx.merchant,
                date: new Date(parsedTx.date),
                type: 'expense',
                emotionalTag: parsedTx.emotional_context
            })

            const confetti = (await import('canvas-confetti')).default
            confetti({
                particleCount: 120,
                spread: 65,
                origin: { y: 0.6 },
                colors: ['#06b6d4', '#3b82f6', '#8b5cf6']
            })

            toast.success('Transaction saved!', { icon: '🎉' })
            setParsedTx(null)
            setInput('')
            setIsOpen(false)
        } catch (error) {
            console.error('Save error:', error)
            toast.error('Failed to save transaction')
        }
    }

    const handleApplyAction = async () => {
        if (!pendingAction || !user || isApplyingAction) return
        await applyPendingActionRecord(pendingAction)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            void handleSubmit()
        }
    }

    const renderActionDetails = () => {
        if (!pendingAction) return null
        const data = pendingAction.data

        if (pendingAction.kind === 'add_transaction') {
            return (
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                    <div>Type: {String(data.type || 'expense')}</div>
                    <div>Amount: {String(data.amount || '-')}</div>
                    <div className="col-span-2">Category: {String(data.category || '-')}</div>
                    <div className="col-span-2">Description: {String(data.description || '-')}</div>
                </div>
            )
        }

        if (pendingAction.kind === 'set_budget') {
            return (
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                    <div>Category: {String(data.category || '-')}</div>
                    <div>Amount: {String(data.amount || '-')}</div>
                    <div>Period: {String(data.period || 'monthly')}</div>
                </div>
            )
        }

        return (
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="col-span-2">Title: {String(data.title || '-')}</div>
                <div>Target: {String(data.targetAmount || '-')}</div>
                <div>Deadline: {String(data.deadline || defaultGoalDeadline())}</div>
            </div>
        )
    }

    return (
        <div className="print:hidden">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={reduceMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: MOTION_DURATION.fast, ease: MOTION_EASE.out }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {!isOpen && showBubble && !isControlled && (
                    <motion.div
                        initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.8, filter: 'blur(8px)' }}
                        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8, filter: 'blur(8px)' }}
                        transition={{ duration: MOTION_DURATION.panel, ease: MOTION_EASE.out }}
                        className="fixed bottom-24 right-8 z-40 bg-white/95 backdrop-blur-md text-gray-800 px-4 py-2 rounded-xl shadow-xl border border-cyan-100 max-w-[240px]"
                    >
                        <div className="text-sm font-medium">New here? Ask Finley AI anything about bookkeeping.</div>
                        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white rotate-45 border-b border-r border-cyan-100"></div>
                        <button
                            onClick={() => setShowBubble(false)}
                            className="absolute -top-2 -right-2 bg-gray-200 rounded-full p-0.5 text-gray-500 hover:bg-gray-300"
                        >
                            <XMarkIcon className="w-3 h-3" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {trigger ? (
                <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
            ) : !isControlled && (
                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl text-white transition-all ${isOpen ? 'bg-gray-800 rotate-90' : 'bg-gradient-to-r from-cyan-500 to-blue-600'}`}
                    whileHover={allowRichMotion ? { scale: 1.1 } : undefined}
                    whileTap={allowRichMotion ? { scale: 0.9 } : undefined}
                    initial={false}
                    animate={allowRichMotion ? (isOpen ? { rotate: 90 } : { rotate: 0 }) : { rotate: 0 }}
                >
                    {isOpen ? <XMarkIcon className="w-6 h-6" /> : <SparklesIcon className="w-6 h-6 animate-pulse" />}
                </motion.button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        layout
                        initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
                        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
                        transition={reduceMotion ? { duration: MOTION_DURATION.micro } : MOTION_SPRING.panel}
                        className="fixed left-4 right-4 md:left-auto md:right-6 z-50 md:w-96 bg-[#0f111a]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col font-sans origin-bottom-right overscroll-contain"
                        style={isMobileViewport ? {
                            bottom: `calc(env(safe-area-inset-bottom) + 0.75rem + ${mobileKeyboardInset}px)`,
                            maxHeight: `min(${Math.max(360, (mobileViewportHeight || window.innerHeight) - 92)}px, 82vh)`,
                            height: `min(${Math.max(360, (mobileViewportHeight || window.innerHeight) - 92)}px, 82vh)`
                        } : { bottom: '6rem', maxHeight: '82vh', height: 'min(82vh, 680px)' }}
                    >
                        <div
                            className="bg-gradient-to-r from-cyan-500/90 to-blue-600/90 p-4 text-white shadow-lg relative overflow-hidden backdrop-blur-md"
                            onTouchStart={handleSheetTouchStart}
                            onTouchMove={handleSheetTouchMove}
                            onTouchEnd={handleSheetTouchEnd}
                            style={isMobileViewport ? { touchAction: 'none' } : undefined}
                        >
                            {isMobileViewport && (
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-white/40" />
                            )}
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <SparklesIcon className="w-5 h-5 text-yellow-300" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Finley AI</h3>
                                        <p className="text-[10px] text-cyan-100 uppercase tracking-wider">Your Financial Copilot</p>
                                    </div>
                                </div>
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.span
                                        key={aiApprovalMode}
                                        initial={reduceMotion ? false : { opacity: 0, scale: 0.92, y: -4, filter: 'blur(4px)' }}
                                        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                                        exit={reduceMotion ? undefined : { opacity: 0, scale: 0.92, y: -4, filter: 'blur(4px)' }}
                                        transition={{ duration: MOTION_DURATION.fast, ease: MOTION_EASE.out }}
                                        className={`hidden sm:inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${approvalModeTone(aiApprovalMode)}`}
                                    >
                                        {approvalModeLabel(aiApprovalMode)}
                                    </motion.span>
                                </AnimatePresence>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors min-h-10 min-w-10 inline-flex items-center justify-center"
                                >
                                    <XMarkIcon className="w-5 h-5 opacity-70" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-5 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent flex flex-col">
                            <AnimatePresence mode="wait" initial={false}>
                            {parsedTx ? (
                                <motion.div
                                    key="parsed-transaction-card"
                                    layout
                                    initial={reduceMotion ? false : { opacity: 0, y: 10, filter: 'blur(6px)' }}
                                    animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
                                    exit={reduceMotion ? undefined : { opacity: 0, y: -8, filter: 'blur(6px)' }}
                                    transition={{ duration: MOTION_DURATION.normal, ease: MOTION_EASE.out }}
                                    className="bg-white/5 border border-white/10 p-5 rounded-2xl"
                                >
                                    <div className="text-sm text-cyan-300 mb-3 font-medium flex items-center gap-2">
                                        <SparklesIcon className="w-4 h-4" />
                                        <span>Use this record?</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-3xl font-bold text-white">${parsedTx.amount}</span>
                                        <span className="text-sm text-gray-400">{parsedTx.currency}</span>
                                    </div>
                                    <div className="text-lg font-medium text-gray-200 mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                                        {parsedTx.merchant}
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <span className="px-2.5 py-1 bg-white/10 rounded-lg text-xs text-cyan-200 border border-white/5">
                                            {parsedTx.category}
                                        </span>
                                        <span className="px-2.5 py-1 bg-white/10 rounded-lg text-xs text-cyan-200 border border-white/5">
                                            {new Date(parsedTx.date).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setParsedTx(null)}
                                            className="flex-1 px-4 py-2.5 text-sm font-medium bg-white/5 text-gray-300 rounded-xl hover:bg-white/10 transition-colors border border-white/5 active:scale-95"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={handleConfirm}
                                            disabled={aiApprovalMode === 'suggest_only'}
                                            className="flex-1 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {aiApprovalMode === 'suggest_only' ? 'Suggest Only Mode' : 'Confirm'}
                                        </button>
                                    </div>
                                    {aiApprovalMode === 'suggest_only' && (
                                        <p className="mt-3 text-xs text-amber-300">
                                            AI write actions are disabled in Automation settings. Use this preview to enter the record manually in Transactions.
                                        </p>
                                    )}
                                </motion.div>
                            ) : pendingAction ? (
                                <motion.div
                                    key="pending-action-card"
                                    initial={reduceMotion ? false : { opacity: 0, y: 10, filter: 'blur(6px)' }}
                                    animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
                                    exit={reduceMotion ? undefined : { opacity: 0, y: -8, filter: 'blur(6px)' }}
                                    transition={{ duration: MOTION_DURATION.normal, ease: MOTION_EASE.out }}
                                    className="space-y-3"
                                >
                                    <div className="bg-white/5 border border-cyan-500/20 rounded-2xl p-4">
                                        <div className="text-sm text-cyan-300 mb-2 font-medium flex items-center gap-2">
                                            <SparklesIcon className="w-4 h-4" />
                                            AI Plan + Data Update Preview
                                        </div>
                                        <div className="mb-3">
                                            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${approvalModeTone(aiApprovalMode)}`}>
                                                {approvalModeLabel(aiApprovalMode)}
                                            </span>
                                        </div>
                                        {assistantReply && (
                                            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line mb-3">{assistantReply}</p>
                                        )}
                                        <p className="text-sm text-white font-medium mb-3">{pendingAction.summary}</p>
                                        {renderActionDetails()}

                                        <div className="mt-4 flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setPendingAction(null)}
                                                className="flex-1 px-4 py-2.5 text-sm font-medium bg-white/5 text-gray-300 rounded-xl hover:bg-white/10 transition-colors border border-white/5"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleApplyAction}
                                                disabled={isApplyingAction || aiApprovalMode === 'suggest_only'}
                                                className="flex-1 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                                            >
                                                {aiApprovalMode === 'suggest_only'
                                                    ? 'Manual Review Only'
                                                    : isApplyingAction
                                                        ? 'Applying...'
                                                        : 'Confirm & Apply'}
                                            </button>
                                        </div>
                                        {aiApprovalMode === 'suggest_only' && (
                                            <p className="mt-3 text-xs text-amber-300">
                                                Automation is set to Suggest only. Finley AI can prepare previews, but data changes require manual action.
                                            </p>
                                        )}
                                    </div>

                                    {assistantFollowUps.length > 0 && (
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                            <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-2">Try this next</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {assistantFollowUps.map((question) => (
                                                    <button
                                                        key={question}
                                                        type="button"
                                                        onClick={() => void handleQuickAsk(question)}
                                                        className="text-left text-xs rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 text-slate-300 transition-colors"
                                                    >
                                                        {question}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ) : assistantReply ? (
                                <motion.div
                                    key="assistant-reply-card"
                                    initial={reduceMotion ? false : { opacity: 0, y: 10, filter: 'blur(6px)' }}
                                    animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
                                    exit={reduceMotion ? undefined : { opacity: 0, y: -8, filter: 'blur(6px)' }}
                                    transition={{ duration: MOTION_DURATION.normal, ease: MOTION_EASE.out }}
                                    className="bg-white/5 border border-cyan-500/20 rounded-2xl p-4"
                                >
                                    <div className="text-sm text-cyan-300 mb-2 font-medium flex items-center gap-2">
                                        <SparklesIcon className="w-4 h-4" />
                                        Finley AI Guidance
                                    </div>
                                    <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">{assistantReply}</p>

                                    {assistantFollowUps.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <p className="text-[11px] uppercase tracking-wider text-slate-400">Try this next</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {assistantFollowUps.map((question) => (
                                                    <button
                                                        key={question}
                                                        type="button"
                                                        onClick={() => void handleQuickAsk(question)}
                                                        className="text-left text-xs rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 text-slate-300 transition-colors"
                                                    >
                                                        {question}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ) : isLoading ? (
                                <motion.div
                                    key="ai-loading-state"
                                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                                    transition={{ duration: MOTION_DURATION.fast }}
                                    className="h-full flex flex-col justify-center items-center text-center"
                                >
                                    <div className="flex space-x-2 mb-4">
                                        {[0, 1, 2].map((i) => (
                                            <motion.div
                                                key={i}
                                                className="w-3 h-3 bg-cyan-500 rounded-full"
                                                animate={allowRichMotion ? { y: [0, -10, 0], opacity: [0.5, 1, 0.5] } : { opacity: 0.85 }}
                                                transition={{ duration: 1, repeat: allowRichMotion ? Infinity : 0, delay: i * 0.2 }}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-cyan-300 font-medium">Finley is thinking...</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="ai-idle-state"
                                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                                    transition={{ duration: MOTION_DURATION.normal, ease: MOTION_EASE.out }}
                                    className="h-full flex flex-col justify-center items-center"
                                >
                                    <motion.div
                                        className="mb-8 relative"
                                        animate={allowRichMotion ? { y: [0, -10, 0] } : { y: 0 }}
                                        transition={{ repeat: allowRichMotion ? Infinity : 0, duration: 4, ease: 'easeInOut' }}
                                    >
                                        <div className="w-32 h-32 relative rounded-full flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] overflow-hidden border-2 border-cyan-500/30">
                                            <motion.img
                                                src="/finley_ai_avatar.png"
                                                alt="Finley AI"
                                                className="w-full h-full object-cover"
                                                animate={allowRichMotion ? {
                                                    scale: [1, 1.05, 1],
                                                    filter: ['brightness(1) contrast(1)', 'brightness(1.2) contrast(1.1)', 'brightness(1) contrast(1)']
                                                } : { scale: 1, filter: 'brightness(1) contrast(1)' }}
                                                transition={{ repeat: allowRichMotion ? Infinity : 0, duration: 3, ease: 'easeInOut' }}
                                            />
                                            <div className="absolute inset-0 bg-cyan-400/10 rounded-full animate-pulse blur-md"></div>
                                        </div>
                                    </motion.div>

                                    <h3 className="text-white text-lg font-medium mb-6 text-center">{welcomeTitle || 'How can I help you manage money today?'}</h3>

                                    <div className="grid grid-cols-2 gap-3 w-full">
                                        {activeSuggestions.map((item, idx) => (
                                            <motion.button
                                                key={`${item.text}-${idx}`}
                                                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: MOTION_DURATION.normal, ease: MOTION_EASE.out, delay: reduceMotion ? 0 : idx * 0.035 }}
                                                whileHover={allowRichMotion ? { y: -2, scale: 1.01 } : undefined}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => void handleQuickAsk(item.action)}
                                                className={`${item.highlight
                                                    ? 'bg-gradient-to-r from-cyan-900/30 to-blue-900/30 hover:from-cyan-900/50 text-cyan-200 border-cyan-500/20'
                                                    : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/5'} text-xs py-3 px-3 rounded-xl text-left transition border flex items-center gap-2 group`}
                                            >
                                                <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
                                                <span>{item.text}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                            </AnimatePresence>
                        </div>

                        <motion.div
                            layout
                            transition={reduceMotion ? undefined : MOTION_SPRING.footer}
                            className="p-4 bg-[#0f111a] border-t border-white/5 pb-[max(0.875rem,env(safe-area-inset-bottom))]"
                        >
                            <form onSubmit={handleSubmit} className="relative group/input">
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 blur-[1px] -m-[1px]" />
                                <div className="relative bg-[#1a1d2d] rounded-2xl flex items-center p-2 gap-2">
                                    <div className="pl-2">
                                        <SparklesIcon className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <textarea
                                        ref={inputRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={placeholder || 'Ask anything, e.g. set my food budget to 600'}
                                        className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-base md:text-sm max-h-32"
                                        rows={1}
                                        disabled={isBusy}
                                        style={{ minHeight: '44px', paddingTop: '10px' }}
                                    />
                                    <div className="flex items-center gap-1 pr-1">
                                        <button
                                            type="button"
                                            onClick={() => toast('Voice input is coming soon')}
                                            className="p-2.5 text-gray-500 hover:text-white transition-colors min-h-10 min-w-10"
                                        >
                                            <MicrophoneIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!input.trim() || isBusy}
                                            className="p-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 min-h-10 min-w-10"
                                            onMouseDown={(e) => e.currentTarget.blur()}
                                        >
                                            {isBusy ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <PaperAirplaneIcon className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ProUpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                featureName="AI Assistant"
            />
        </div>
    )
}
