import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

type CoachActionKind = 'none' | 'add_transaction' | 'set_budget' | 'create_goal'

type CoachAction = {
    kind: CoachActionKind
    summary: string
    requiresConfirmation: boolean
    data: Record<string, unknown>
}

const FALLBACK_EXAMPLES = [
    'Help me log my first expense step by step',
    'Set my food budget to 600 this month',
    'Create a savings goal for an emergency fund',
]

const DEFAULT_ACTION: CoachAction = {
    kind: 'none',
    summary: '',
    requiresConfirmation: true,
    data: {},
}

const asSafeResetDate = (raw: unknown) => {
    if (!raw) return new Date(0)
    if (typeof (raw as { toDate?: () => Date }).toDate === 'function') {
        return (raw as { toDate: () => Date }).toDate()
    }
    const parsed = new Date(String(raw))
    return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed
}

const isActionKind = (value: unknown): value is CoachActionKind => {
    return value === 'none' || value === 'add_transaction' || value === 'set_budget' || value === 'create_goal'
}

const sanitizeAction = (raw: unknown): CoachAction => {
    if (!raw || typeof raw !== 'object') return DEFAULT_ACTION

    const action = raw as Record<string, unknown>
    const kind = isActionKind(action.kind) ? action.kind : 'none'
    const summary = typeof action.summary === 'string' ? action.summary.trim() : ''
    const requiresConfirmation = action.requiresConfirmation !== false
    const data = action.data && typeof action.data === 'object' ? (action.data as Record<string, unknown>) : {}

    if (kind === 'none') return DEFAULT_ACTION

    return {
        kind,
        summary: summary || 'Confirm this change before applying it to your data.',
        requiresConfirmation,
        data,
    }
}

const parseFirstAmount = (text: string) => {
    const match = text.match(/(?:a\\$|\\$|aud|usd|¥|￥)?\\s*([0-9]+(?:\\.[0-9]{1,2})?)/i)
    if (!match) return null
    const value = Number(match[1])
    return Number.isFinite(value) ? value : null
}

const detectBudgetCategory = (text: string) => {
    const normalized = text.toLowerCase()
    if (/(food|dining|meal|餐饮|吃饭)/.test(normalized)) return 'Food'
    if (/(transport|taxi|uber|交通|出行)/.test(normalized)) return 'Transport'
    if (/(shopping|retail|购物|消费)/.test(normalized)) return 'Shopping'
    if (/(housing|rent|mortgage|房租|住房)/.test(normalized)) return 'Housing'
    if (/(health|medical|医疗|健康)/.test(normalized)) return 'Health'
    if (/(entertainment|movie|game|娱乐)/.test(normalized)) return 'Entertainment'
    if (/(education|course|study|教育|学习)/.test(normalized)) return 'Education'
    return 'Other'
}

const detectGoalCategory = (text: string): 'savings' | 'investment' | 'purchase' | 'debt' | 'emergency' => {
    const normalized = text.toLowerCase()
    if (/(emergency|应急)/.test(normalized)) return 'emergency'
    if (/(invest|investment|投资)/.test(normalized)) return 'investment'
    if (/(debt|loan|credit card|债务|还款)/.test(normalized)) return 'debt'
    if (/(buy|purchase|购物|买)/.test(normalized)) return 'purchase'
    return 'savings'
}

const buildRuleBasedResponse = (question: string) => {
    const normalized = question.trim().toLowerCase()
    const amount = parseFirstAmount(question)
    const today = new Date().toISOString().slice(0, 10)
    const suggestedExamples = [
        'Set my food budget to 600 this month',
        'I spent $18 on lunch today, record it for me',
        'Create an emergency goal of 5000 by 2026-12-31',
    ]

    const asksBudgetChange = /(budget|cap|limit|预算)/.test(normalized)
    const asksGoalChange = /(goal|save|saving|target|emergency|储蓄|目标|存钱)/.test(normalized)
    const asksTransaction = /(spent|paid|bought|expense|income|salary|记账|花了|收入)/.test(normalized)

    if (asksBudgetChange && amount && amount > 0) {
        return {
            reply: `I can do that. I prepared a budget update with amount ${amount}. Please confirm below and I will apply it.`,
            suggestedExamples,
            action: {
                kind: 'set_budget' as const,
                summary: 'Set budget from your request',
                requiresConfirmation: true,
                data: {
                    category: detectBudgetCategory(question),
                    amount,
                    period: 'monthly',
                },
            },
        }
    }

    if (asksGoalChange && amount && amount > 0) {
        return {
            reply: `I prepared a savings goal based on your request. Confirm below and I will create it.`,
            suggestedExamples,
            action: {
                kind: 'create_goal' as const,
                summary: 'Create goal from your request',
                requiresConfirmation: true,
                data: {
                    title: 'AI Goal',
                    targetAmount: amount,
                    deadline: '2026-12-31',
                    category: detectGoalCategory(question),
                    description: `Goal created from user request: ${question}`,
                },
            },
        }
    }

    if (asksTransaction && amount && amount > 0) {
        const type = /(income|salary|earned|收入)/.test(normalized) ? 'income' : 'expense'
        return {
            reply: `I prepared a ${type} record from your message. Confirm below and I will save it.`,
            suggestedExamples,
            action: {
                kind: 'add_transaction' as const,
                summary: 'Add transaction from your request',
                requiresConfirmation: true,
                data: {
                    type,
                    amount,
                    category: type === 'income' ? 'Income' : detectBudgetCategory(question),
                    description: question.slice(0, 120),
                    date: today,
                },
            },
        }
    }

    if (/(new|beginner|start|how|不懂|不会|新手)/.test(normalized)) {
        return {
            reply:
                'Start with 3 steps: 1) add one recent expense in Transactions, 2) set one monthly budget in Budget, 3) check Reports weekly. If you want, tell me a specific change and I can prepare it for confirmation.',
            suggestedExamples,
            action: DEFAULT_ACTION,
        }
    }

    return {
        reply:
            'Tell me one specific change and I can prepare it for you. Example: "Set my food budget to 600", "Record lunch 18", or "Create emergency goal 5000".',
        suggestedExamples,
        action: DEFAULT_ACTION,
    }
}

export async function POST(req: Request) {
    try {
        const { question } = await req.json()

        if (!question || typeof question !== 'string' || !question.trim()) {
            return NextResponse.json({ error: 'Question is required', errorCode: 'INVALID_INPUT' }, { status: 400 })
        }

        const authHeader = req.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized', errorCode: 'UNAUTHORIZED' }, { status: 401 })
        }

        const token = authHeader.split('Bearer ')[1]
        const decodedToken = await getAdminAuth().verifyIdToken(token)
        const uid = decodedToken.uid

        const db = getAdminDb()
        const userRef = db.collection('users').doc(uid)
        const userDoc = await userRef.get()
        const userData = userDoc.data()

        if (!userDoc.exists) {
            await userRef.set(
                {
                    uid,
                    email: decodedToken.email || '',
                    aiMonthlyUsage: 0,
                    aiUsageResetDate: FieldValue.serverTimestamp(),
                },
                { merge: true }
            )
        }

        const isProMember = userData?.subscription?.planKey !== 'FREE' && userData?.subscription?.status === 'active'

        if (!isProMember) {
            const now = new Date()
            const lastReset = asSafeResetDate(userData?.aiUsageResetDate)
            let currentUsage = userData?.aiMonthlyUsage || 0

            if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
                currentUsage = 0
                await userRef.set({
                    aiMonthlyUsage: 0,
                    aiUsageResetDate: FieldValue.serverTimestamp(),
                }, { merge: true })
            }

            if (currentUsage >= 3) {
                return NextResponse.json(
                    { error: 'Monthly AI limit reached. Upgrade to Pro for unlimited access.', errorCode: 'AI_LIMIT_REACHED' },
                    { status: 403 }
                )
            }
        }

        const ruleBased = buildRuleBasedResponse(question)
        let reply = ruleBased.reply
        let suggestedExamples = ruleBased.suggestedExamples
        let action: CoachAction = ruleBased.action

        if (process.env.OPENAI_API_KEY) {
            try {
                const completion = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    temperature: 0.3,
                    response_format: { type: 'json_object' },
                    messages: [
                        {
                            role: 'system',
                            content:
                                'You are FinleyBook AI Coach. Help users operate the product and bookkeeping. Return JSON with keys: reply (string), suggestedExamples (string[]), action (object). Action schema: {kind:"none|add_transaction|set_budget|create_goal", summary:string, requiresConfirmation:boolean, data:object}. Only return action.kind != "none" when user explicitly asks to create/update data. Never claim data is already changed. Keep reply under 120 words. For add_transaction data include type, amount, category, description, date(YYYY-MM-DD). For set_budget include category, amount, period(monthly|yearly). For create_goal include title, targetAmount, deadline(YYYY-MM-DD), category(savings|investment|purchase|debt|emergency), description.',
                        },
                        {
                            role: 'user',
                            content: `User question: ${question}\nUser profile hint: name=${userData?.displayName || 'User'}, plan=${userData?.subscription?.planKey || 'FREE'}`,
                        },
                    ],
                })

                const content = completion.choices[0]?.message?.content
                if (content) {
                    try {
                        const parsed = JSON.parse(content)

                        if (typeof parsed?.reply === 'string' && parsed.reply.trim()) {
                            reply = parsed.reply.trim()
                        }

                        if (Array.isArray(parsed?.suggestedExamples)) {
                            const clean = parsed.suggestedExamples
                                .filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0)
                                .slice(0, 3)
                            if (clean.length > 0) {
                                suggestedExamples = clean
                            }
                        }

                        const modelAction = sanitizeAction(parsed?.action)
                        if (modelAction.kind !== 'none' || action.kind === 'none') {
                            action = modelAction
                        }
                    } catch (parseError) {
                        console.error('Failed to parse coach JSON response:', parseError)
                    }
                }
            } catch (openaiError) {
                console.error('AI coach OpenAI call failed, using rules fallback:', openaiError)
            }
        } else {
            suggestedExamples = FALLBACK_EXAMPLES
        }

        try {
            await userRef.set(
                {
                    aiMonthlyUsage: FieldValue.increment(1),
                    lastAIInteraction: FieldValue.serverTimestamp(),
                    aiUsageResetDate: userData?.aiUsageResetDate || FieldValue.serverTimestamp(),
                },
                { merge: true }
            )
        } catch (usageError) {
            console.error('Failed to persist AI usage metadata:', usageError)
        }

        return NextResponse.json({
            reply,
            suggestedExamples,
            action,
        })
    } catch (error: any) {
        console.error('Error in AI coach route:', error)
        if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
            return NextResponse.json({ error: 'Unauthorized', errorCode: 'UNAUTHORIZED' }, { status: 401 })
        }
        return NextResponse.json(
            { error: error.message || 'Failed to get AI coaching response', errorCode: 'AI_BACKEND_ERROR' },
            { status: 500 }
        )
    }
}
