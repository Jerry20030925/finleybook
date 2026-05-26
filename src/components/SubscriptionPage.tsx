'use client'

import { useCallback, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
    ArrowRight,
    BrainCircuit,
    ChevronDown,
    Check,
    CheckCircle2,
    Clock,
    FileText,
    Shield,
    SlidersHorizontal,
    Sparkles,
    BarChart3,
    BadgeCheck,
    Headphones,
    TrendingUp,
    Users,
    WalletCards,
    X,
} from 'lucide-react'
import { useAuth } from './AuthProvider'
import { useLanguage } from './LanguageProvider'
import { useCurrency } from './CurrencyProvider'
import { useExperience } from './ExperienceProvider'

interface SubscriptionPageProps {
    onClose?: () => void
}

type BillingCycle = 'monthly' | 'yearly'
type CompareFocus = 'all' | 'limits' | 'workflow' | 'support'
type UsagePreset = 'starter' | 'operator' | 'advisor'

type PageCopy = {
    badge: string
    title: string
    subtitle: string
    freePlanTitle: string
    proPlanTitle: string
    freePlanDesc: string
    proPlanDesc: string
    compareSummaryTitle: string
    compareSummaryText: string
    compareTitle: string
    feature: string
    free: string
    pro: string
    pricingTitle: string
    monthly: string
    yearly: string
    yearlyTag: string
    monthlySuffix: string
    yearlyHint: string
    cta: string
    processing: string
    loginRequired: string
    guarantee1: string
    guarantee2: string
    trustTitle: string
    trustText: string
    idealForTitle: string
    idealForFree: string
    idealForPro: string
    summaryTitle: string
    summaryItemsTitle: string
    summaryBillingTitle: string
    noHiddenFees: string
    annualSavingsLabel: string
}

const COPY: Record<'en' | 'zh', PageCopy> = {
    en: {
        badge: 'Professional Wealth Intelligence',
        title: 'Choose the Right Plan for Serious Financial Growth',
        subtitle: 'Clear limits on Free, unlimited analysis on Pro. Built for users who want reliable reporting and decision-grade insights.',
        freePlanTitle: 'Free',
        proPlanTitle: 'Pro Intelligence',
        freePlanDesc: 'For getting started with core tracking and basic monthly workflows.',
        proPlanDesc: 'For serious users who need scalable reporting, AI diagnostics, and export automation.',
        compareSummaryTitle: 'Professional plan comparison',
        compareSummaryText: 'Designed to make upgrade decisions clear: usage limits, workflow speed, and reporting depth are all visible before checkout.',
        compareTitle: 'Feature Comparison',
        feature: 'Capability',
        free: 'Free',
        pro: 'Pro',
        pricingTitle: 'Start with Pro Intelligence',
        monthly: 'Monthly',
        yearly: 'Yearly',
        yearlyTag: 'Best Value',
        monthlySuffix: '/month',
        yearlyHint: 'Billed yearly. Save 35% versus monthly.',
        cta: 'Upgrade to Pro',
        processing: 'Preparing checkout...',
        loginRequired: 'Please login before upgrading.',
        guarantee1: 'Cancel anytime in billing settings',
        guarantee2: 'Secure checkout with Stripe',
        trustTitle: 'Why teams pick FinleyBook Pro',
        trustText: 'Pro users get deeper report diagnostics, unlimited exports, and faster workflow for monthly decision reviews.',
        idealForTitle: 'Best fit by plan',
        idealForFree: 'Individuals testing the workflow, light bookkeeping, and occasional exports.',
        idealForPro: 'Professionals, households, and operators running regular monthly reviews and decision reporting.',
        summaryTitle: 'Purchase Summary',
        summaryItemsTitle: 'Included immediately',
        summaryBillingTitle: 'Billing notes',
        noHiddenFees: 'No setup fees. Cancel anytime.',
        annualSavingsLabel: 'Annual savings'
    },
    zh: {
        badge: '专业财富智能',
        title: '选择更适合你的专业订阅方案',
        subtitle: '免费版边界清晰，Pro 提供无限分析能力。为重视报表质量与决策效率的用户设计。',
        freePlanTitle: '免费版',
        proPlanTitle: 'Pro 智能版',
        freePlanDesc: '适合体验核心记账、基础追踪与轻量月度工作流。',
        proPlanDesc: '适合需要规模化报表、AI 诊断与自动化导出的专业用户。',
        compareSummaryTitle: '专业级方案对比',
        compareSummaryText: '在支付前清晰展示使用上限、工作流效率和报表深度，帮助用户快速判断是否升级。',
        compareTitle: '功能对比',
        feature: '能力项',
        free: '免费版',
        pro: 'Pro',
        pricingTitle: '开启 Pro 智能分析',
        monthly: '月付',
        yearly: '年付',
        yearlyTag: '最优选择',
        monthlySuffix: '/月',
        yearlyHint: '按年计费，相比月付节省 35%。',
        cta: '升级到 Pro',
        processing: '正在跳转支付...',
        loginRequired: '升级前请先登录。',
        guarantee1: '可在账单设置中随时取消',
        guarantee2: 'Stripe 安全支付',
        trustTitle: '为什么用户选择 FinleyBook Pro',
        trustText: 'Pro 提供更深度的报表诊断、无限导出能力和更高效的月度复盘工作流。',
        idealForTitle: '适用场景',
        idealForFree: '适合个人轻量使用、体验产品流程、偶尔导出报表。',
        idealForPro: '适合家庭与专业用户进行持续复盘、策略调整与正式汇报。',
        summaryTitle: '购买摘要',
        summaryItemsTitle: '升级后立即可用',
        summaryBillingTitle: '计费说明',
        noHiddenFees: '无开通费，可随时取消。',
        annualSavingsLabel: '年度节省'
    }
}

export default function SubscriptionPage({ onClose }: SubscriptionPageProps) {
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly')
    const [isProcessing, setIsProcessing] = useState(false)
    const [compareFocus, setCompareFocus] = useState<CompareFocus>('all')
    const [usagePreset, setUsagePreset] = useState<UsagePreset>('operator')
    const [usageInputs, setUsageInputs] = useState({
        reportsPerMonth: 6,
        aiReviewsPerMonth: 12,
        importBatchesPerMonth: 4,
        collaborators: 2,
    })
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

    const { user } = useAuth()
    const { t, language } = useLanguage()
    const { country } = useCurrency()
    const { allowRichMotion, reduceMotion } = useExperience()
    const prefersReducedMotion = useReducedMotion()
    const motionReduced = prefersReducedMotion || reduceMotion

    const text = COPY[language === 'zh' ? 'zh' : 'en']

    const pricing = useMemo(() => ({
        monthly: {
            price: 4.99,
            monthlyEquivalent: 4.99,
            savings: 0,
        },
        yearly: {
            price: 39.00,
            monthlyEquivalent: 3.25,
            savings: 20.88,
        }
    }), [])

    const current = pricing[billingCycle]
    const isYearly = billingCycle === 'yearly'

    const comparisonRows = [
        {
            icon: BarChart3,
            group: 'limits' as const,
            labelEn: 'Monthly transactions',
            labelZh: '每月交易记录',
            free: 'Up to 50',
            pro: 'Unlimited'
        },
        {
            icon: BrainCircuit,
            group: 'workflow' as const,
            labelEn: 'AI insights and diagnostics',
            labelZh: 'AI 洞察与诊断',
            free: 'Basic',
            pro: 'Advanced + priority processing'
        },
        {
            icon: FileText,
            group: 'limits' as const,
            labelEn: 'Report exports (PDF/CSV)',
            labelZh: '报告导出（PDF/CSV）',
            free: '2 per month',
            pro: 'Unlimited'
        },
        {
            icon: Sparkles,
            group: 'workflow' as const,
            labelEn: 'Smart import workflows',
            labelZh: '智能导入工作流',
            free: 'Manual only',
            pro: 'Receipt scan + CSV import'
        },
        {
            icon: Shield,
            group: 'support' as const,
            labelEn: 'Support SLA',
            labelZh: '支持服务等级',
            free: 'Standard',
            pro: 'Priority'
        },
    ]

    const usagePresets = useMemo(() => ([
        {
            key: 'starter' as const,
            title: language === 'zh' ? '轻量试用' : 'Starter trial',
            desc: language === 'zh' ? '少量报表、偶尔复盘' : 'Light reporting and occasional reviews',
            values: { reportsPerMonth: 1, aiReviewsPerMonth: 4, importBatchesPerMonth: 1, collaborators: 1 },
            cycle: 'monthly' as BillingCycle,
        },
        {
            key: 'operator' as const,
            title: language === 'zh' ? '稳定月度复盘' : 'Monthly operator',
            desc: language === 'zh' ? '持续复盘与导出归档' : 'Consistent reviews with exports and archives',
            values: { reportsPerMonth: 6, aiReviewsPerMonth: 12, importBatchesPerMonth: 4, collaborators: 2 },
            cycle: 'yearly' as BillingCycle,
        },
        {
            key: 'advisor' as const,
            title: language === 'zh' ? '专业汇报场景' : 'Advisor / pro workflow',
            desc: language === 'zh' ? '频繁导出、AI 分析、多人协作' : 'Frequent exports, AI diagnostics, and collaboration',
            values: { reportsPerMonth: 14, aiReviewsPerMonth: 30, importBatchesPerMonth: 10, collaborators: 4 },
            cycle: 'yearly' as BillingCycle,
        },
    ]), [language])

    const proIncludedItems = [
        {
            icon: BrainCircuit,
            title: language === 'zh' ? '高级 AI 诊断' : 'Advanced AI diagnostics',
            text: language === 'zh' ? '更深入的趋势分析与操作建议' : 'Deeper trend analysis and action guidance'
        },
        {
            icon: FileText,
            title: language === 'zh' ? '无限 PDF/CSV 导出' : 'Unlimited PDF / CSV exports',
            text: language === 'zh' ? '适合月度复盘与对外分享' : 'Designed for monthly reviews and stakeholder sharing'
        },
        {
            icon: Sparkles,
            title: language === 'zh' ? '智能导入工作流' : 'Smart import workflows',
            text: language === 'zh' ? '收据扫描与 CSV 导入' : 'Receipt scan and CSV import workflow'
        },
    ]

    const planSnapshots = [
        {
            key: 'free',
            title: text.freePlanTitle,
            subtitle: text.freePlanDesc,
            badge: text.free,
            badgeClass: 'border-slate-200 bg-white text-slate-700',
            cardClass: 'border-slate-200 bg-white',
            accentClass: 'from-slate-100 to-white',
            headline: language === 'zh' ? '适合试用与轻量记账' : 'Best for trial and light bookkeeping',
            bullets: [
                language === 'zh' ? '基础 AI 提示与轻量分析' : 'Basic AI prompts and light analysis',
                language === 'zh' ? '每月有限导出，适合偶尔复盘' : 'Limited monthly exports for occasional reviews',
                language === 'zh' ? '标准支持与手动工作流' : 'Standard support and manual workflows',
            ],
        },
        {
            key: 'pro',
            title: text.proPlanTitle,
            subtitle: text.proPlanDesc,
            badge: language === 'zh' ? '推荐方案' : 'Recommended',
            badgeClass: 'border-indigo-200 bg-indigo-600 text-white',
            cardClass: 'border-indigo-200 bg-gradient-to-b from-indigo-50 to-white shadow-[0_24px_60px_-40px_rgba(79,70,229,0.45)]',
            accentClass: 'from-indigo-100 to-white',
            headline: language === 'zh' ? '适合月度复盘与正式汇报' : 'Best for monthly reviews and decision reporting',
            bullets: [
                language === 'zh' ? '高级 AI 诊断与优先处理' : 'Advanced AI diagnostics with priority processing',
                language === 'zh' ? '无限 PDF / CSV 导出与专业报表' : 'Unlimited PDF / CSV exports and professional reports',
                language === 'zh' ? '收据扫描 + CSV 导入工作流' : 'Receipt scan + CSV import workflow',
            ],
        },
    ] as const

    const upgradeFlowSteps = [
        {
            title: language === 'zh' ? '选择计费周期' : 'Select billing cycle',
            text: language === 'zh' ? '按月或按年选择，年付节省更多。' : 'Choose monthly or yearly billing. Yearly provides the best value.',
        },
        {
            title: language === 'zh' ? 'Stripe 安全结账' : 'Secure Stripe checkout',
            text: language === 'zh' ? '使用 Stripe 托管支付，支持安全支付流程。' : 'Checkout is hosted by Stripe with secure payment processing.',
        },
        {
            title: language === 'zh' ? '即时开通 Pro 功能' : 'Pro access enabled immediately',
            text: language === 'zh' ? '支付完成后立即获得高级分析与无限导出。' : 'Advanced analysis and unlimited exports become available after successful checkout.',
        },
    ]

    const proValuePillars = [
        {
            icon: BrainCircuit,
            title: language === 'zh' ? '决策级 AI 洞察' : 'Decision-grade AI insights',
            text: language === 'zh' ? '聚焦趋势异常、月度复盘和行动建议。' : 'Focus on trend anomalies, monthly reviews, and action guidance.',
        },
        {
            icon: FileText,
            title: language === 'zh' ? '专业报告工作流' : 'Professional reporting workflow',
            text: language === 'zh' ? '稳定输出 PDF / CSV，适合复盘、分享与归档。' : 'Reliable PDF / CSV exports for reviews, sharing, and archiving.',
        },
        {
            icon: Shield,
            title: language === 'zh' ? '安全与可控' : 'Secure and controllable',
            text: language === 'zh' ? '可随时取消，账单与支付由 Stripe 托管。' : 'Cancel anytime, with billing handled securely by Stripe.',
        },
    ]

    const faqItems = useMemo(() => ([
        {
            q: language === 'zh' ? '升级后哪些功能会立即生效？' : 'What becomes available immediately after upgrade?',
            a: language === 'zh'
                ? '支付成功后即可启用 Pro 的高级 AI 诊断、无限 PDF/CSV 导出、专业报表工作流与优先处理能力。'
                : 'After successful checkout, Pro enables advanced AI diagnostics, unlimited PDF/CSV exports, professional reporting workflows, and priority processing.',
        },
        {
            q: language === 'zh' ? '可以随时取消吗？' : 'Can I cancel anytime?',
            a: language === 'zh'
                ? '可以。你可以在账单设置中管理订阅，Stripe 托管支付与账单。'
                : 'Yes. You can manage or cancel billing in your billing settings, with Stripe handling subscription payments securely.',
        },
        {
            q: language === 'zh' ? '免费版和 Pro 最大差别是什么？' : 'What is the biggest difference between Free and Pro?',
            a: language === 'zh'
                ? '核心差别在于报表深度、导出额度和 AI 诊断质量。Pro 更适合持续复盘和正式汇报。'
                : 'The main differences are reporting depth, export limits, and AI diagnostic quality. Pro is designed for ongoing reviews and formal reporting.',
        },
    ]), [language])

    const filteredComparisonRows = useMemo(() => {
        if (compareFocus === 'all') return comparisonRows
        return comparisonRows.filter((row) => row.group === compareFocus)
    }, [compareFocus, comparisonRows])

    const usageAdvisor = useMemo(() => {
        const freeExportLimit = 2
        const exportsOverLimit = Math.max(usageInputs.reportsPerMonth - freeExportLimit, 0)
        const intensityScore =
            usageInputs.reportsPerMonth * 8 +
            usageInputs.aiReviewsPerMonth * 3 +
            usageInputs.importBatchesPerMonth * 6 +
            Math.max(usageInputs.collaborators - 1, 0) * 10

        const proFitScore = Math.max(0, Math.min(100, Math.round(intensityScore / 2.2)))
        const recommendsPro = exportsOverLimit > 0 || proFitScore >= 45 || usageInputs.aiReviewsPerMonth >= 8
        const recommendedCycle: BillingCycle = proFitScore >= 65 || usageInputs.reportsPerMonth >= 6 ? 'yearly' : 'monthly'

        const frictionPoints: string[] = []
        if (exportsOverLimit > 0) {
            frictionPoints.push(
                language === 'zh'
                    ? `预计每月导出超出免费额度 ${exportsOverLimit} 次`
                    : `Expected to exceed free export limit by ${exportsOverLimit}/month`
            )
        }
        if (usageInputs.aiReviewsPerMonth >= 8) {
            frictionPoints.push(
                language === 'zh'
                    ? 'AI 复盘频率较高，基础 AI 容易不够用'
                    : 'High AI review usage suggests basic AI will become limiting'
            )
        }
        if (usageInputs.importBatchesPerMonth >= 3) {
            frictionPoints.push(
                language === 'zh'
                    ? '导入频率较高，智能导入流程可节省时间'
                    : 'Frequent imports benefit from smart import workflows'
            )
        }
        if (usageInputs.collaborators >= 2) {
            frictionPoints.push(
                language === 'zh'
                    ? '多人复盘场景更适合专业报表导出与归档'
                    : 'Multi-person reviews benefit from professional export and archive workflows'
            )
        }

        const monthlyVsYearlyAnnual = pricing.monthly.price * 12
        const yearlySavings = Math.max(monthlyVsYearlyAnnual - pricing.yearly.price, 0)

        return {
            proFitScore,
            recommendsPro,
            recommendedCycle,
            frictionPoints: frictionPoints.slice(0, 3),
            yearlySavings,
        }
    }, [language, pricing.monthly.price, pricing.yearly.price, usageInputs])

    const applyUsagePreset = useCallback((preset: (typeof usagePresets)[number]) => {
        setUsagePreset(preset.key)
        setUsageInputs(preset.values)
        setBillingCycle(preset.cycle)
    }, [usagePresets])

    const handleSubscribe = async () => {
        if (!user) {
            alert(text.loginRequired || t('auth.loginRequired') || 'Please login first')
            return
        }

        setIsProcessing(true)

        try {
            const priceIds = {
                monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY || 'price_1SWsXIDBM183XrjL5aFQQeiJ',
                yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY || 'price_1SWsy2DBM183XrjL9RJ4F95Z'
            }

            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId: priceIds[billingCycle],
                    userId: user.uid,
                }),
            })

            const data = await response.json()

            if (data.error) {
                throw new Error(data.error)
            }

            if (data.url) {
                window.location.href = data.url
            }
        } catch (error: any) {
            console.error('Subscription error:', error)
            alert(`${t('common.error')}: ${error.message}`)
            setIsProcessing(false)
        }
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.10),_transparent_45%),linear-gradient(to_bottom,_#f8fafc,_#ffffff,_#eef2ff)] p-4 md:p-8 overflow-y-auto">
            {onClose && (
                <button
                    onClick={onClose}
                    className="fixed top-4 right-4 p-2 rounded-full bg-white hover:bg-slate-100 transition-colors z-50 shadow-sm border border-slate-200"
                >
                    <X size={20} className="text-slate-600" />
                </button>
            )}

            <div className="max-w-7xl mx-auto pb-32 md:pb-20">
                <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="pt-8 mb-10"
                >
                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 text-indigo-700 px-4 py-1.5 text-xs font-bold tracking-wide uppercase mb-5">
                        <Sparkles size={14} />
                        {text.badge}
                    </div>
                    <div className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr]">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight max-w-4xl">
                                {text.title}
                            </h1>
                            <p className="text-slate-600 text-base md:text-lg mt-4 max-w-3xl leading-relaxed">
                                {text.subtitle}
                            </p>
                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-4">
                                    <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                                        {language === 'zh' ? 'AI 能力' : 'AI Capability'}
                                    </p>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {language === 'zh' ? '高级诊断与复盘建议' : 'Advanced diagnostics + review guidance'}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-4">
                                    <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                                        {language === 'zh' ? '导出能力' : 'Exports'}
                                    </p>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {language === 'zh' ? '专业 PDF / CSV 工作流' : 'Professional PDF / CSV workflow'}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-4">
                                    <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                                        {language === 'zh' ? '支付安全' : 'Billing Security'}
                                    </p>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {language === 'zh' ? 'Stripe 安全托管' : 'Stripe secure checkout'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-3xl border border-slate-200 bg-white/85 backdrop-blur p-6 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">{text.compareSummaryTitle}</p>
                            <p className="text-sm text-slate-700 leading-relaxed">{text.compareSummaryText}</p>
                            <div className="mt-5 space-y-3">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{text.freePlanTitle}</p>
                                            <p className="text-xs text-slate-600 mt-1">{text.freePlanDesc}</p>
                                        </div>
                                        <span className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">{text.free}</span>
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{text.proPlanTitle}</p>
                                            <p className="text-xs text-slate-600 mt-1">{text.proPlanDesc}</p>
                                        </div>
                                        <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white">{text.pro}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.38, ease: 'easeOut', delay: 0.04 }}
                    className="mb-10"
                >
                    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 mb-2">
                                    {language === 'zh' ? '方案架构' : 'Plan architecture'}
                                </p>
                                <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                                    {language === 'zh' ? '清晰区分试用方案与专业方案' : 'Clear separation between trial and professional plans'}
                                </h2>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                                <BadgeCheck size={14} />
                                {language === 'zh' ? '结账前透明展示能力差异' : 'Transparent capabilities before checkout'}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {planSnapshots.map((plan, index) => (
                                <motion.div
                                    key={plan.key}
                                    initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.32, ease: 'easeOut', delay: 0.06 + index * 0.05 }}
                                    whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                                    className={`rounded-2xl border p-5 md:p-6 ${plan.cardClass}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-lg font-bold text-slate-900">{plan.title}</p>
                                            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{plan.subtitle}</p>
                                        </div>
                                        <span className={`rounded-full border px-3 py-1 text-xs font-bold whitespace-nowrap ${plan.badgeClass}`}>
                                            {plan.badge}
                                        </span>
                                    </div>

                                    <div className={`mt-4 rounded-xl border border-white/70 bg-gradient-to-r ${plan.accentClass} p-3`}>
                                        <p className="text-sm font-semibold text-slate-900">{plan.headline}</p>
                                    </div>

                                    <div className="mt-4 space-y-2.5">
                                        {plan.bullets.map((bullet) => (
                                            <div key={bullet} className="flex items-start gap-2 text-sm text-slate-700">
                                                <Check size={15} className={`mt-0.5 ${plan.key === 'pro' ? 'text-indigo-600' : 'text-slate-500'}`} />
                                                <span>{bullet}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={motionReduced ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.38, ease: 'easeOut', delay: 0.06 }}
                    className="mb-10 rounded-3xl border border-slate-200 bg-white shadow-sm p-5 md:p-6"
                >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-5">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 mb-3">
                                <SlidersHorizontal size={14} />
                                {language === 'zh' ? '智能订阅顾问' : 'Smart subscription advisor'}
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                                {language === 'zh' ? '根据你的使用频率推荐更合适方案' : 'Get a recommendation based on your expected usage'}
                            </h2>
                            <p className="text-sm text-slate-600 mt-2 max-w-3xl">
                                {language === 'zh'
                                    ? '选择一个使用场景，或调整使用频率。系统会给出升级建议、计费周期建议和关键原因。'
                                    : 'Pick a workflow preset or adjust monthly usage. FinleyBook will recommend a plan path, billing cycle, and key reasons before checkout.'}
                            </p>
                        </div>
                        <div className={`rounded-2xl border p-4 min-w-[240px] ${usageAdvisor.recommendsPro ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 bg-slate-50'}`}>
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 mb-2">
                                {language === 'zh' ? '推荐结果' : 'Recommendation'}
                            </p>
                            <p className={`text-lg font-bold ${usageAdvisor.recommendsPro ? 'text-indigo-700' : 'text-slate-900'}`}>
                                {usageAdvisor.recommendsPro
                                    ? `${text.proPlanTitle} • ${usageAdvisor.recommendedCycle === 'yearly' ? text.yearly : text.monthly}`
                                    : `${text.freePlanTitle} / ${text.monthly}`}
                            </p>
                            <p className="text-xs text-slate-600 mt-2">
                                {language === 'zh' ? '使用匹配度评分' : 'Usage fit score'}: <span className="font-semibold text-slate-900">{usageAdvisor.proFitScore}/100</span>
                            </p>
                            {usageAdvisor.recommendedCycle === 'yearly' && (
                                <p className="text-xs text-emerald-700 mt-1">
                                    {language === 'zh'
                                        ? `按年订阅预计每年节省 ${country.symbol}${usageAdvisor.yearlySavings.toFixed(2)}`
                                        : `Yearly saves about ${country.symbol}${usageAdvisor.yearlySavings.toFixed(2)} / year`}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                                {usagePresets.map((preset, index) => (
                                    <motion.button
                                        key={preset.key}
                                        type="button"
                                        onClick={() => applyUsagePreset(preset)}
                                        initial={motionReduced ? false : { opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.22, delay: 0.04 + index * 0.04 }}
                                        whileHover={allowRichMotion ? { y: -1 } : undefined}
                                        whileTap={allowRichMotion ? { scale: 0.99 } : undefined}
                                        className={`rounded-xl border p-4 text-left transition-colors ${usagePreset === preset.key ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                                    >
                                        <p className="text-sm font-semibold text-slate-900">{preset.title}</p>
                                        <p className="mt-1 text-xs text-slate-600 leading-relaxed">{preset.desc}</p>
                                    </motion.button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    {
                                        key: 'reportsPerMonth' as const,
                                        icon: FileText,
                                        label: language === 'zh' ? '每月导出报表次数' : 'Reports exported / month',
                                        min: 0,
                                        max: 20,
                                        step: 1,
                                    },
                                    {
                                        key: 'aiReviewsPerMonth' as const,
                                        icon: BrainCircuit,
                                        label: language === 'zh' ? '每月 AI 复盘次数' : 'AI review sessions / month',
                                        min: 0,
                                        max: 40,
                                        step: 1,
                                    },
                                    {
                                        key: 'importBatchesPerMonth' as const,
                                        icon: Sparkles,
                                        label: language === 'zh' ? '每月导入批次' : 'Import batches / month',
                                        min: 0,
                                        max: 20,
                                        step: 1,
                                    },
                                    {
                                        key: 'collaborators' as const,
                                        icon: Users,
                                        label: language === 'zh' ? '参与复盘人数' : 'People involved in reviews',
                                        min: 1,
                                        max: 8,
                                        step: 1,
                                    },
                                ].map((field) => {
                                    const FieldIcon = field.icon
                                    const value = usageInputs[field.key]
                                    return (
                                        <div key={field.key} className="rounded-xl border border-slate-200 bg-white p-4">
                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <FieldIcon size={15} className="text-slate-500" />
                                                    <p className="text-xs font-semibold text-slate-700">{field.label}</p>
                                                </div>
                                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">{value}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min={field.min}
                                                max={field.max}
                                                step={field.step}
                                                value={value}
                                                onChange={(e) => setUsageInputs((prev) => ({ ...prev, [field.key]: Number(e.target.value) }))}
                                                className="w-full accent-indigo-600"
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp size={16} className="text-indigo-600" />
                                <p className="text-sm font-semibold text-slate-900">
                                    {language === 'zh' ? '升级判断依据' : 'Recommendation reasons'}
                                </p>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${usageAdvisor.proFitScore}-${usageAdvisor.recommendedCycle}-${usageAdvisor.recommendsPro}`}
                                    initial={motionReduced ? false : { opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={motionReduced ? undefined : { opacity: 0, y: -6 }}
                                    transition={{ duration: 0.18 }}
                                    className="space-y-3"
                                >
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                                {language === 'zh' ? 'Pro 匹配度' : 'Pro fit'}
                                            </p>
                                            <p className="text-sm font-bold text-slate-900">{usageAdvisor.proFitScore}/100</p>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                                            <motion.div
                                                className={`h-full ${usageAdvisor.proFitScore >= 65 ? 'bg-indigo-600' : usageAdvisor.proFitScore >= 40 ? 'bg-amber-500' : 'bg-slate-500'}`}
                                                initial={motionReduced ? false : { width: 0 }}
                                                animate={{ width: `${usageAdvisor.proFitScore}%` }}
                                                transition={{ duration: 0.45 }}
                                            />
                                        </div>
                                    </div>

                                    <div className={`rounded-xl border p-3 ${usageAdvisor.recommendsPro ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 bg-slate-50'}`}>
                                        <p className="text-sm font-semibold text-slate-900">
                                            {usageAdvisor.recommendsPro
                                                ? (language === 'zh' ? '建议升级 Pro' : 'Pro is recommended')
                                                : (language === 'zh' ? '可先使用免费版' : 'Free can work for now')}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-600">
                                            {usageAdvisor.recommendsPro
                                                ? (usageAdvisor.recommendedCycle === 'yearly'
                                                    ? (language === 'zh' ? '你的使用频率更适合年付，长期成本更优。' : 'Your usage pattern fits yearly billing for better long-term cost efficiency.')
                                                    : (language === 'zh' ? '建议先月付开通，确认流程后再切换年付。' : 'Start with monthly if you want flexibility before committing to yearly.'))
                                                : (language === 'zh' ? '当前使用强度较低，免费版可先满足基础需求。' : 'Your current usage is light enough that Free can cover the basics initially.')}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">
                                            {language === 'zh' ? '关键原因' : 'Top reasons'}
                                        </p>
                                        {usageAdvisor.frictionPoints.length === 0 ? (
                                            <p className="text-xs text-slate-600">
                                                {language === 'zh' ? '当前场景暂无明显瓶颈，可先用免费版验证流程。' : 'No strong workflow bottlenecks detected yet. You can validate the workflow on Free first.'}
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                {usageAdvisor.frictionPoints.map((reason) => (
                                                    <div key={reason} className="flex items-start gap-2 text-xs text-slate-700">
                                                        <Check size={14} className="mt-0.5 text-indigo-600" />
                                                        <span>{reason}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
                    className="mb-10 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                >
                    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900">{text.compareTitle}</h2>
                            <div className="inline-flex flex-wrap items-center gap-2">
                                {[
                                    { key: 'all' as const, label: language === 'zh' ? '全部' : 'All' },
                                    { key: 'limits' as const, label: language === 'zh' ? '额度与上限' : 'Limits' },
                                    { key: 'workflow' as const, label: language === 'zh' ? '工作流效率' : 'Workflow' },
                                    { key: 'support' as const, label: language === 'zh' ? '支持与保障' : 'Support' },
                                ].map((chip) => (
                                    <button
                                        key={chip.key}
                                        type="button"
                                        onClick={() => setCompareFocus(chip.key)}
                                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${compareFocus === chip.key ? 'border-indigo-200 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'}`}
                                    >
                                        {chip.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">{text.feature}</th>
                                    <th className="text-center px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">{text.free}</th>
                                    <th className="text-center px-6 py-4 text-xs font-bold uppercase tracking-wide text-indigo-700 bg-indigo-50">{text.pro}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredComparisonRows.map((row) => {
                                    const RowIcon = row.icon
                                    return (
                                        <tr key={row.labelEn} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <RowIcon size={16} className="text-slate-400" />
                                                    {language === 'zh' ? row.labelZh : row.labelEn}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-center text-slate-600">{row.free}</td>
                                            <td className="px-6 py-4 text-sm text-center font-semibold text-indigo-700 bg-indigo-50/50">{row.pro}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    <motion.div
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.12 }}
                        className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                            <h3 className="text-2xl font-bold text-slate-900">{text.pricingTitle}</h3>
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                <BadgeCheck size={14} />
                                {language === 'zh' ? '专业方案 / 可随时取消' : 'Professional plan / cancel anytime'}
                            </div>
                        </div>

                        <div className="mb-5">
                            <div className="relative inline-flex rounded-full border border-slate-200 p-1 bg-slate-50">
                                <motion.div
                                    aria-hidden
                                    className={`absolute top-1 bottom-1 rounded-full shadow-sm ${billingCycle === 'yearly' ? 'bg-indigo-600' : 'bg-slate-900'}`}
                                    animate={prefersReducedMotion
                                        ? { left: billingCycle === 'monthly' ? 4 : '50%', width: billingCycle === 'monthly' ? 'calc(50% - 4px)' : 'calc(50% - 4px)' }
                                        : { left: billingCycle === 'monthly' ? 4 : '50%', width: 'calc(50% - 4px)' }}
                                    transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setBillingCycle('monthly')}
                                    className={`relative z-10 px-5 py-2 rounded-full text-sm font-bold transition-colors ${billingCycle === 'monthly'
                                        ? 'text-white'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    {text.monthly}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBillingCycle('yearly')}
                                    className={`relative z-10 px-5 py-2 rounded-full text-sm font-bold transition-colors ${billingCycle === 'yearly'
                                        ? 'text-white'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    {text.yearly}
                                </button>
                                <span className="absolute -top-2 right-0 translate-x-1/4 text-[10px] rounded-full bg-amber-400 text-slate-900 px-2 py-0.5 border border-white shadow-sm font-bold">
                                    {text.yearlyTag}
                                </span>
                            </div>
                            <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700">
                                            {language === 'zh' ? '智能建议' : 'Advisor suggestion'}
                                        </p>
                                        <p className="text-sm text-slate-800 mt-1">
                                            {usageAdvisor.recommendsPro
                                                ? (language === 'zh'
                                                    ? `当前使用场景建议选择 ${usageAdvisor.recommendedCycle === 'yearly' ? text.yearly : text.monthly}，Pro 匹配度 ${usageAdvisor.proFitScore}/100`
                                                    : `For your usage pattern, ${usageAdvisor.recommendedCycle === 'yearly' ? text.yearly : text.monthly} is recommended. Pro fit score ${usageAdvisor.proFitScore}/100`)
                                                : (language === 'zh'
                                                    ? '当前可以先用免费版验证流程，也可先月付开通 Pro。'
                                                    : 'You can validate on Free first, or start Pro monthly for flexibility.')}
                                        </p>
                                    </div>
                                    {billingCycle !== usageAdvisor.recommendedCycle && usageAdvisor.recommendsPro && (
                                        <button
                                            type="button"
                                            onClick={() => setBillingCycle(usageAdvisor.recommendedCycle)}
                                            className="shrink-0 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                                        >
                                            {language === 'zh' ? '应用推荐周期' : 'Use recommended cycle'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-900 to-indigo-900 text-white p-6 mb-5 shadow-[0_20px_50px_-24px_rgba(49,46,129,0.55)]">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-end gap-1">
                                        <span className="text-5xl font-black tracking-tight">{country.symbol}{current.price}</span>
                                        <span className="text-sm text-indigo-100 mb-1">{text.monthlySuffix}</span>
                                    </div>
                                    {isYearly && (
                                        <p className="mt-3 text-sm text-indigo-100">
                                            {text.yearlyHint} {country.symbol}{current.monthlyEquivalent}{text.monthlySuffix}
                                        </p>
                                    )}
                                    {!isYearly && (
                                        <p className="mt-3 text-sm text-indigo-100">
                                            {language === 'zh' ? '按月计费，灵活开通' : 'Monthly billing for flexible start'}
                                        </p>
                                    )}
                                </div>
                                <div className="rounded-xl bg-white/10 border border-white/15 px-4 py-3 min-w-[150px]">
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-indigo-100">{text.annualSavingsLabel}</p>
                                    <p className="mt-1 text-xl font-bold text-emerald-200">
                                        {isYearly ? `${country.symbol}${current.savings}` : `${country.symbol}${pricing.yearly.savings}`}
                                    </p>
                                    <p className="mt-1 text-[11px] text-indigo-100">
                                        {isYearly ? (language === 'zh' ? '按年节省' : 'Saved per year') : (language === 'zh' ? '切换年付可节省' : 'Switch yearly to save')}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                    <p className="text-[11px] uppercase tracking-[0.16em] text-indigo-100">
                                        {language === 'zh' ? '今日支付' : 'Charged today'}
                                    </p>
                                    <p className="mt-1 text-sm font-semibold">
                                        {isYearly ? `${country.symbol}${current.price}` : `${country.symbol}${current.price}`}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                    <p className="text-[11px] uppercase tracking-[0.16em] text-indigo-100">
                                        {language === 'zh' ? '折算月费' : 'Effective monthly'}
                                    </p>
                                    <p className="mt-1 text-sm font-semibold">{country.symbol}{current.monthlyEquivalent}{text.monthlySuffix}</p>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                    <p className="text-[11px] uppercase tracking-[0.16em] text-indigo-100">
                                        {language === 'zh' ? '账单策略' : 'Billing policy'}
                                    </p>
                                    <p className="mt-1 text-sm font-semibold">
                                        {language === 'zh' ? '可随时取消' : 'Cancel anytime'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleSubscribe}
                            disabled={isProcessing}
                            className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            {isProcessing ? (
                                <>
                                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                    {text.processing}
                                </>
                            ) : (
                                <>
                                    {text.cta}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>

                        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 mb-3">{text.summaryItemsTitle}</p>
                            <div className="grid sm:grid-cols-3 gap-3">
                                {proIncludedItems.map((item, index) => {
                                    const Icon = item.icon
                                    return (
                                        <motion.div
                                            key={item.title}
                                            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.28, ease: 'easeOut', delay: 0.16 + index * 0.04 }}
                                            whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                                            className="rounded-xl border border-slate-200 bg-white p-3"
                                        >
                                            <div className="inline-flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 p-2 mb-2">
                                                <Icon size={16} />
                                            </div>
                                            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.text}</p>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="mt-4 space-y-2 text-xs text-slate-600">
                            <div className="flex items-center gap-2"><Clock size={14} className="text-slate-400" />{text.guarantee1}</div>
                            <div className="flex items-center gap-2"><Shield size={14} className="text-slate-400" />{text.guarantee2}</div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
                        className="lg:col-span-5 space-y-6 lg:sticky lg:top-24"
                    >
                        <div className="rounded-3xl border border-indigo-100 bg-gradient-to-b from-indigo-50 to-white p-6 md:p-8">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 mb-3">FinleyBook Pro</p>
                            <h4 className="text-2xl font-bold text-slate-900 mb-3">{text.trustTitle}</h4>
                            <p className="text-sm text-slate-700 leading-relaxed mb-5">{text.trustText}</p>

                            <div className="space-y-3 mb-5">
                                {proValuePillars.map((pillar) => {
                                    const Icon = pillar.icon
                                    return (
                                        <div key={pillar.title} className="rounded-2xl border border-white/70 bg-white/70 p-3">
                                            <div className="flex items-start gap-3">
                                                <div className="inline-flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 p-2">
                                                    <Icon size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">{pillar.title}</p>
                                                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{pillar.text}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="rounded-2xl border border-indigo-100 bg-white/80 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 mb-3">
                                    {language === 'zh' ? '开通流程' : 'Upgrade workflow'}
                                </p>
                                <div className="space-y-3">
                                    {upgradeFlowSteps.map((step, index) => (
                                        <div key={step.title} className="flex items-start gap-3">
                                            <div className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 mb-4">
                                {language === 'zh' ? '结账准备状态' : 'Checkout readiness'}
                            </p>
                            <div className="space-y-3">
                                {[
                                    {
                                        label: language === 'zh' ? '登录状态' : 'Signed in',
                                        ok: Boolean(user),
                                        desc: user ? (language === 'zh' ? '已登录，可直接进入 Stripe 结账' : 'Ready for Stripe checkout') : text.loginRequired,
                                    },
                                    {
                                        label: language === 'zh' ? '计费周期' : 'Billing cycle selected',
                                        ok: Boolean(billingCycle),
                                        desc: `${billingCycle === 'yearly' ? text.yearly : text.monthly} • ${country.symbol}${current.price}`,
                                    },
                                    {
                                        label: language === 'zh' ? '方案匹配度' : 'Usage fit reviewed',
                                        ok: usageAdvisor.proFitScore > 0,
                                        desc: usageAdvisor.recommendsPro
                                            ? `${text.proPlanTitle} • ${usageAdvisor.proFitScore}/100`
                                            : `${text.freePlanTitle} / ${text.monthly}`,
                                    },
                                ].map((item) => (
                                    <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full ${item.ok ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                <Check size={14} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 mb-4">{text.summaryTitle}</p>
                            <div className="space-y-4">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <WalletCards size={16} className="text-slate-500" />
                                        <p className="text-sm font-semibold text-slate-900">{text.summaryBillingTitle}</p>
                                    </div>
                                    <p className="text-sm text-slate-700">
                                        {isYearly
                                            ? `${text.yearly} • ${country.symbol}${current.price} • ${text.yearlyHint}`
                                            : `${text.monthly} • ${country.symbol}${current.price}${text.monthlySuffix}`}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-2">{text.noHiddenFees}</p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CheckCircle2 size={16} className="text-emerald-600" />
                                        <p className="text-sm font-semibold text-slate-900">{text.idealForTitle}</p>
                                    </div>
                                    <div className="space-y-3 text-sm text-slate-700">
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                            <p className="font-semibold text-slate-900 mb-1">{text.freePlanTitle}</p>
                                            <p className="text-xs leading-relaxed">{text.idealForFree}</p>
                                        </div>
                                        <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3">
                                            <p className="font-semibold text-slate-900 mb-1">{text.proPlanTitle}</p>
                                            <p className="text-xs leading-relaxed">{text.idealForPro}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                                        <Headphones size={16} className="text-indigo-600 mb-2" />
                                        <p className="text-xs font-semibold text-slate-900">{language === 'zh' ? '优先支持' : 'Priority support'}</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                                        <Shield size={16} className="text-indigo-600 mb-2" />
                                        <p className="text-xs font-semibold text-slate-900">{language === 'zh' ? '安全结账' : 'Secure billing'}</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                                        <BarChart3 size={16} className="text-indigo-600 mb-2" />
                                        <p className="text-xs font-semibold text-slate-900">{language === 'zh' ? '专业报表' : 'Decision reports'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={motionReduced ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut', delay: 0.22 }}
                    className="mt-10 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                >
                    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                            {language === 'zh' ? '订阅常见问题' : 'Subscription FAQ'}
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">
                            {language === 'zh' ? '在支付前确认关键规则，避免不必要的疑问。' : 'Review the key billing and access rules before checkout.'}
                        </p>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {faqItems.map((item, index) => {
                            const open = openFaqIndex === index
                            return (
                                <div key={item.q} className="px-4 md:px-6">
                                    <button
                                        type="button"
                                        onClick={() => setOpenFaqIndex((prev) => prev === index ? null : index)}
                                        className="w-full py-4 text-left flex items-center justify-between gap-4"
                                    >
                                        <span className="text-sm md:text-base font-semibold text-slate-900">{item.q}</span>
                                        <motion.span
                                            animate={motionReduced ? undefined : { rotate: open ? 180 : 0 }}
                                            transition={{ duration: 0.18 }}
                                            className="text-slate-400"
                                        >
                                            <ChevronDown size={18} />
                                        </motion.span>
                                    </button>
                                    <AnimatePresence initial={false}>
                                        {open && (
                                            <motion.div
                                                initial={motionReduced ? false : { height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={motionReduced ? undefined : { height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <p className="pb-4 text-sm text-slate-600 leading-relaxed">{item.a}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )
                        })}
                    </div>
                </motion.div>
            </div>

            <div className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
                <div className="mx-auto max-w-7xl flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                            {usageAdvisor.recommendsPro ? text.proPlanTitle : text.freePlanTitle}
                        </p>
                        <p className="text-sm font-bold text-slate-900 truncate">
                            {billingCycle === 'yearly' ? text.yearly : text.monthly} • {country.symbol}{current.price}{billingCycle === 'monthly' ? text.monthlySuffix : ''}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleSubscribe}
                        disabled={isProcessing}
                        className="h-11 shrink-0 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white disabled:opacity-60"
                    >
                        {isProcessing ? (language === 'zh' ? '处理中...' : 'Processing...') : text.cta}
                    </button>
                </div>
            </div>
        </div>
    )
}
