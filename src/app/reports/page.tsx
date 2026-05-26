'use client'

import { lazy, Suspense, useState, useEffect, useMemo, useRef, useDeferredValue, startTransition } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { DocumentArrowDownIcon, PrinterIcon, ArrowDownTrayIcon, ShareIcon, SparklesIcon, BoltIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns'
import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore'

import { useAuth } from '@/components/AuthProvider'
import { useLanguage } from '@/components/LanguageProvider'
import { useCurrency } from '@/components/CurrencyProvider'
import { useSubscription } from '@/components/SubscriptionProvider'
import { useExperience } from '@/components/ExperienceProvider'
import WalletActionCoach from '@/components/WalletActionCoach'
import { useWorkflowPreferences } from '@/hooks/useWorkflowPreferences'
import { getUserTransactions, Transaction } from '@/lib/dataService'
import { db } from '@/lib/firebase'
import { CHART_MOTION, MOTION_EASE } from '@/lib/motionTokens'

type TimeRange = 'current_month' | 'last_month' | 'current_year' | 'custom'
type Html2CanvasFn = typeof import('html2canvas').default
type JsPDFCtor = typeof import('jspdf').default

let pdfDepsPromise: Promise<{ html2canvas: Html2CanvasFn, jsPDF: JsPDFCtor }> | null = null

const loadPdfDeps = () => {
  if (!pdfDepsPromise) {
    pdfDepsPromise = Promise.all([
      import('html2canvas').then((module) => module.default),
      import('jspdf').then((module) => module.default)
    ]).then(([html2canvas, jsPDF]) => ({ html2canvas, jsPDF }))
  }
  return pdfDepsPromise
}

const toCsvCell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`

const isIOSLikeDevice = () => {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

const isLikelyMobileDevice = () => {
  if (typeof navigator === 'undefined') return false

  const uaDataMobile = (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData?.mobile
  if (typeof uaDataMobile === 'boolean') return uaDataMobile

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

const triggerBlobDownload = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const openFileForManualSave = (url: string) => {
  if (isIOSLikeDevice()) {
    window.location.assign(url)
    return
  }

  const link = document.createElement('a')
  link.href = url
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const tryShareFile = async (blob: Blob, fileName: string, mimeType: string): Promise<boolean> => {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return false

  try {
    const file = new File([blob], fileName, { type: mimeType })
    const canShare = typeof navigator.canShare === 'function' ? navigator.canShare({ files: [file] }) : true
    if (!canShare) return false
    await navigator.share({ files: [file], title: fileName })
    return true
  } catch (error) {
    // User cancellation should not be treated as a hard failure.
    console.warn('Share API unavailable or cancelled:', error)
    return false
  }
}

const WealthAnalytics = lazy(() => import('@/components/WealthAnalytics'))

function ReportChartLoadingSkeleton({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={CHART_MOTION.cardReveal}
      className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm overflow-hidden"
      aria-label="Loading report charts"
    >
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="space-y-2">
          <div className="h-4 w-36 rounded bg-slate-200" />
          <div className="h-3 w-24 rounded bg-slate-100" />
        </div>
        <div className="h-9 w-28 rounded-xl bg-slate-100 border border-slate-200" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="h-3 w-32 rounded bg-slate-200 mb-3" />
          <div className="relative h-[220px] sm:h-[250px] rounded-lg bg-white border border-slate-100 overflow-hidden">
            {!reduceMotion && (
              <motion.div
                className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                animate={{ x: ['0%', '280%'] }}
                transition={{ duration: 1.35, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            <div className="absolute inset-x-3 bottom-4 flex items-end gap-1.5">
              {[28, 44, 32, 68, 36, 58, 48, 76, 38, 64].map((h, idx) => (
                <motion.div
                  key={idx}
                  className="flex-1 rounded-t bg-gradient-to-t from-slate-300 to-slate-200"
                  initial={reduceMotion ? false : { height: 0, opacity: 0.4 }}
                  animate={{ height: `${h}%`, opacity: 1 }}
                  transition={{
                    delay: reduceMotion ? 0 : idx * CHART_MOTION.progressFillStagger,
                    duration: reduceMotion ? 0 : CHART_MOTION.progressFill.duration,
                    ease: MOTION_EASE.standard
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="h-3 w-28 rounded bg-slate-200 mb-3" />
          <div className="h-[220px] sm:h-[250px] rounded-lg bg-white border border-slate-100 p-3 grid grid-cols-2 gap-2">
            {[40, 28, 20, 12, 10, 8].map((size, idx) => (
              <motion.div
                key={idx}
                className="rounded-md bg-slate-200"
                style={{
                  gridColumn: idx === 0 ? 'span 2' : undefined,
                  opacity: idx > 2 ? 0.75 : 1,
                }}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: idx > 2 ? 0.75 : 1, scale: 1 }}
                transition={{
                  delay: reduceMotion ? 0 : idx * CHART_MOTION.rowStagger,
                  duration: reduceMotion ? 0 : CHART_MOTION.rowReveal.duration,
                  ease: MOTION_EASE.standard
                }}
              >
                <div className="h-full w-full" style={{ minHeight: `${size + 16}px` }} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function ReportsPage() {
  const { user, loading: authLoading } = useAuth()
  const { isProMember, getRemainingUsage } = useSubscription()
  const { t } = useLanguage()
  const { formatAmount } = useCurrency()
  const router = useRouter()
  const systemReducedMotion = useReducedMotion()
  const { reduceMotion } = useExperience()
  const prefersReducedMotion = reduceMotion || systemReducedMotion
  const workflowPreferences = useWorkflowPreferences(user?.uid)

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null)
  const [generatedPdfBlob, setGeneratedPdfBlob] = useState<Blob | null>(null)
  const [pdfQuality, setPdfQuality] = useState<'fast' | 'balanced' | 'high'>('balanced')
  const [timeRange, setTimeRange] = useState<TimeRange>('current_month')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)
  const [syncMode, setSyncMode] = useState<'idle' | 'live' | 'fallback'>('idle')
  const [walletCoachExpanded, setWalletCoachExpanded] = useState(false)
  const exportRemaining = getRemainingUsage('exports')
  const hasExportQuota = isProMember || exportRemaining > 0
  const useMobileExportFlow = isMobile || isLikelyMobileDevice()
  const showWalletCoach = workflowPreferences.autoOpenWalletCoach || walletCoachExpanded

  const reportRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<HTMLDivElement | null>(null)
  const chartInView = useInView(chartRef, { once: true, margin: '220px' })
  const [shouldRenderCharts, setShouldRenderCharts] = useState(false)
  const breakdownRef = useRef<HTMLDivElement | null>(null)
  const breakdownInView = useInView(breakdownRef, { once: true, margin: '220px' })
  const [shouldRenderBreakdown, setShouldRenderBreakdown] = useState(false)
  const paymentsRef = useRef<HTMLDivElement | null>(null)
  const paymentsInView = useInView(paymentsRef, { once: true, margin: '220px' })
  const [shouldRenderPayments, setShouldRenderPayments] = useState(false)
  const sectionRevealProps = prefersReducedMotion ? {} : {
    initial: { opacity: 0, y: isMobile ? 10 : 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.16 },
    transition: { duration: 0.35, ease: 'easeOut' }
  }

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (chartInView) {
      setShouldRenderCharts(true)
    }
  }, [chartInView])

  useEffect(() => {
    if (breakdownInView) {
      setShouldRenderBreakdown(true)
    }
  }, [breakdownInView])

  useEffect(() => {
    if (paymentsInView) {
      setShouldRenderPayments(true)
    }
  }, [paymentsInView])

  useEffect(() => {
    setWalletCoachExpanded(workflowPreferences.autoOpenWalletCoach)
  }, [workflowPreferences.autoOpenWalletCoach])

  useEffect(() => {
    if (isMobile && pdfQuality === 'balanced') {
      setPdfQuality('fast')
    }
  }, [isMobile, pdfQuality])

  useEffect(() => {
    return () => {
      if (generatedPdfUrl) URL.revokeObjectURL(generatedPdfUrl)
    }
  }, [generatedPdfUrl])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user?.uid) {
      if (!authLoading) {
        setLoading(false)
      }
      return
    }

    setLoading(true)
    setSyncMode('idle')

    const liveQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(1500)
    )

    const unsubscribe = onSnapshot(
      liveQuery,
      (snapshot) => {
        const mapped = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data() as Partial<Transaction> & {
            date?: { toDate?: () => Date } | Date
            createdAt?: { toDate?: () => Date } | Date
          }

          return {
            id: docSnapshot.id,
            userId: data.userId || user.uid,
            amount: Math.abs(Number(data.amount || 0)),
            category: data.category || 'Uncategorized',
            description: data.description || '',
            date: data.date && 'toDate' in data.date && typeof data.date.toDate === 'function'
              ? data.date.toDate()
              : new Date(data.date || new Date()),
            type: (data.type as Transaction['type']) || 'expense',
            paymentMethod: data.paymentMethod,
            merchantName: data.merchantName,
            createdAt: data.createdAt && 'toDate' in data.createdAt && typeof data.createdAt.toDate === 'function'
              ? data.createdAt.toDate()
              : new Date(data.createdAt || new Date()),
            emotionalTag: data.emotionalTag,
            savings_link: data.savings_link,
            projectedCashback: data.projectedCashback,
            netCost: data.netCost,
            accountId: data.accountId,
            status: data.status,
          } as Transaction
        })

        startTransition(() => {
          setTransactions(mapped)
          setLastSyncedAt(new Date())
          setSyncMode('live')
          setLoading(false)
        })
      },
      async (error) => {
        console.error('Real-time transaction sync failed, fallback to fetch:', error)
        try {
          const fallbackData = await getUserTransactions(user.uid, 1500)
          startTransition(() => {
            setTransactions(fallbackData)
            setLastSyncedAt(new Date())
            setSyncMode('fallback')
          })
        } catch (fallbackError) {
          console.error('Fallback transaction fetch failed:', fallbackError)
          toast.error(t('common.error'))
        } finally {
          startTransition(() => {
            setLoading(false)
          })
        }
      }
    )

    return () => unsubscribe()
  }, [user?.uid, authLoading, t])

  const deferredTransactions = useDeferredValue(transactions)

  const dateRange = useMemo(() => {
    const now = new Date()
    switch (timeRange) {
      case 'current_month': return { start: startOfMonth(now), end: endOfMonth(now) }
      case 'last_month':
        const lastMonth = subMonths(now, 1)
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) }
      case 'current_year': return { start: startOfYear(now), end: endOfYear(now) }
      case 'custom':
        return {
          start: customStartDate ? new Date(customStartDate) : startOfMonth(now),
          end: customEndDate ? new Date(customEndDate) : endOfMonth(now)
        }
      default: return { start: startOfMonth(now), end: endOfMonth(now) }
    }
  }, [timeRange, customStartDate, customEndDate])

  const filteredTransactions = useMemo(() => {
    const { start, end } = dateRange
    return deferredTransactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate >= start && transactionDate <= end
    })
  }, [deferredTransactions, dateRange])

  const deferredFilteredTransactions = useDeferredValue(filteredTransactions)

  const reportData = useMemo(() => {
    const income = deferredFilteredTransactions.filter(t => t.type === 'income')
    const expenses = deferredFilteredTransactions.filter(t => t.type === 'expense')

    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
    const netIncome = totalIncome - totalExpenses

    const incomeByCategory = new Map<string, number>()
    const expensesByCategory = new Map<string, number>()

    income.forEach(t => {
      const current = incomeByCategory.get(t.category) || 0
      incomeByCategory.set(t.category, current + t.amount)
    })
    expenses.forEach(t => {
      const current = expensesByCategory.get(t.category) || 0
      expensesByCategory.set(t.category, current + t.amount)
    })

    const paymentMethods = new Map<string, number>()
    deferredFilteredTransactions.forEach(t => {
      if (t.paymentMethod) {
        const current = paymentMethods.get(t.paymentMethod) || 0
        paymentMethods.set(t.paymentMethod, current + t.amount)
      }
    })

    const { start, end } = dateRange
    const daysDiff = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
    const avgDailyIncome = totalIncome / daysDiff
    const avgDailyExpense = totalExpenses / daysDiff

    let score = 50
    if (totalIncome > 0) {
      const savingsRate = netIncome / totalIncome
      score += Math.min(50, Math.max(0, savingsRate * 100))
    }
    if (netIncome < 0) score -= 10
    const finleyScore = Math.min(100, Math.max(0, Math.round(score)))

    const topExpenseCategory = Array.from(expensesByCategory.entries()).sort((a, b) => b[1] - a[1])[0]
    const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0
    const savingsRatePercent = savingsRate.toFixed(1)
    const currentYear = new Date().getFullYear()
    const topExpenseCategoryName = topExpenseCategory ? topExpenseCategory[0] : 'None'
    const topExpenseCategoryAmount = topExpenseCategory ? topExpenseCategory[1] : 0

    const focusActions = [
      savingsRate < 20
        ? 'Lift savings rate to 20% by setting an automated monthly transfer.'
        : 'Maintain your savings momentum and protect current run-rate.',
      topExpenseCategory
        ? `Reduce ${topExpenseCategoryName} spending by 10% next month.`
        : 'No dominant expense category detected; keep monitoring consistency.',
      avgDailyExpense > avgDailyIncome
        ? 'Your daily burn is above income velocity. Review discretionary spend this week.'
        : 'Daily income velocity is healthy. Consider allocating extra surplus to long-term goals.'
    ]

    const insights = [
      `<b>🏆 Score:</b> ${finleyScore} (${finleyScore >= 80 ? 'Excellent' : 'Good'})`,
      `<b>💰 Savings Rate:</b> ${savingsRatePercent}% (Target: 20%)`,
      `<b>📉 Top Expense:</b> ${topExpenseCategoryName} (${formatAmount(topExpenseCategoryAmount)})`,
      `<b>🚀 Trend:</b> On track for ${currentYear} wealth goals based on current velocity.`
    ]
    const transactionCount = deferredFilteredTransactions.length

    return {
      totalIncome, totalExpenses, netIncome, transactionCount,
      incomeByCategory: Array.from(incomeByCategory.entries()).map(([name, value]) => ({ name, value })),
      expensesByCategory: Array.from(expensesByCategory.entries()).map(([name, value]) => ({ name, value })),
      paymentMethods: Array.from(paymentMethods.entries()).map(([name, value]) => ({ name, value })),
      avgDailyIncome, avgDailyExpense, daysDiff, finleyScore, insights, focusActions, savingsRate, topExpenseCategoryName
    }
  }, [deferredFilteredTransactions, formatAmount, dateRange])

  const reportPeriodLabel = useMemo(
    () => `${format(dateRange.start, 'yyyy-MM-dd')} to ${format(dateRange.end, 'yyyy-MM-dd')}`,
    [dateRange]
  )
  const reportClientName = useMemo(() => user?.displayName || user?.email || 'Client', [user?.displayName, user?.email])
  const syncStatusLabel = useMemo(() => {
    if (loading) return 'Syncing live data...'
    if (!lastSyncedAt) return 'Sync pending'
    const modeLabel = syncMode === 'live' ? 'Live' : syncMode === 'fallback' ? 'Snapshot' : 'Sync'
    return `${modeLabel} • ${format(lastSyncedAt, 'yyyy-MM-dd HH:mm:ss')}`
  }, [lastSyncedAt, syncMode, loading])
  const reportId = useMemo(() => {
    const userFragment = (user?.uid || 'guest').slice(-6).toUpperCase()
    return `FB-${format(new Date(), 'yyMMdd')}-${userFragment}-${reportData.finleyScore}`
  }, [user?.uid, reportData.finleyScore])
  const reportFileBase = useMemo(
    () => `FinleyBook_Intelligence_${format(dateRange.start, 'yyyyMMdd')}_${format(dateRange.end, 'yyyyMMdd')}_S${reportData.finleyScore}`,
    [dateRange, reportData.finleyScore]
  )
  const sortedIncomeCategories = useMemo(
    () => [...reportData.incomeByCategory].sort((a, b) => b.value - a.value),
    [reportData.incomeByCategory]
  )
  const sortedExpenseCategories = useMemo(
    () => [...reportData.expensesByCategory].sort((a, b) => b.value - a.value),
    [reportData.expensesByCategory]
  )
  const sortedPaymentMethods = useMemo(
    () => [...reportData.paymentMethods].sort((a, b) => b.value - a.value),
    [reportData.paymentMethods]
  )
  const reportFocusLabel = useMemo(() => {
    switch (workflowPreferences.reportFocusMode) {
      case 'cashflow':
        return 'Cash Flow'
      case 'savings':
        return 'Savings'
      case 'anomalies':
        return 'Anomalies'
      default:
        return 'Balanced'
    }
  }, [workflowPreferences.reportFocusMode])
  const defaultExportLabel = useMemo(() => {
    switch (workflowPreferences.defaultReportExport) {
      case 'csv':
        return 'CSV'
      case 'both':
        return 'PDF + CSV'
      default:
        return 'PDF'
    }
  }, [workflowPreferences.defaultReportExport])
  const reportSmartGuide = useMemo(() => {
    if (loading) {
      return {
        tone: 'neutral' as const,
        title: 'Syncing your report data',
        detail: 'FinleyBook is loading the latest transactions before generating decision-grade insights.',
      }
    }

    if (filteredTransactions.length === 0) {
      return {
        tone: 'warning' as const,
        title: 'No transactions in this report window',
        detail: 'Switch the date range or add transactions first, then generate a report for better analysis.',
      }
    }

    if (!hasExportQuota) {
      return {
        tone: 'warning' as const,
        title: 'Export quota reached on Free plan',
        detail: 'Upgrade to Pro for unlimited PDF/CSV exports and recurring reporting workflows.',
      }
    }

    if (reportData.netIncome < 0) {
      const focusHint = workflowPreferences.reportFocusMode === 'cashflow'
        ? 'Open cash-flow controls first and tighten your fastest-moving spend categories.'
        : workflowPreferences.reportFocusMode === 'anomalies'
          ? 'Inspect unusual transactions first, then tighten budget caps.'
          : `Focus on ${reportData.topExpenseCategoryName} and set a tighter budget cap before the next cycle.`
      return {
        tone: 'warning' as const,
        title: 'Your report shows negative net income',
        detail: focusHint,
      }
    }

    if (reportData.savingsRate < 20) {
      const savingsFocusHint = workflowPreferences.reportFocusMode === 'savings'
        ? 'Your current focus is savings. Export the report and set one explicit savings goal target for next month.'
        : 'Generate this report, then use Budget and Goals to lock in one improvement for next month.'
      return {
        tone: 'info' as const,
        title: 'Savings rate is below target',
        detail: savingsFocusHint,
      }
    }

    return {
      tone: 'success' as const,
      title: 'Report is ready for review and export',
      detail: generatedPdfUrl
        ? `A fresh ${workflowPreferences.defaultReportExport === 'csv' ? 'data export' : 'PDF'} is available. Use your default ${defaultExportLabel} workflow or share the summary.`
        : `Your metrics look healthy. Default export is ${defaultExportLabel}; keep your monthly review routine consistent.`,
    }
  }, [
    defaultExportLabel,
    filteredTransactions.length,
    generatedPdfUrl,
    hasExportQuota,
    loading,
    reportData.netIncome,
    reportData.savingsRate,
    reportData.topExpenseCategoryName,
    workflowPreferences.defaultReportExport,
    workflowPreferences.reportFocusMode,
  ])

  const getReportWorkflowActions = () => {
    const pdfAction = {
      id: 'reports-pdf',
      label: generatedPdfUrl ? (useMobileExportFlow ? 'Open PDF' : 'Refresh PDF') : 'Generate PDF',
      description: generatedPdfUrl ? 'Open or refresh your latest PDF export' : 'Create a professional PDF report',
      onClick: () => {
        if (generatedPdfUrl && useMobileExportFlow) {
          void handleMobileGeneratedPdfDownload()
          return
        }
        void handleGeneratePDF()
      },
      style: workflowPreferences.defaultReportExport === 'pdf' || workflowPreferences.defaultReportExport === 'both' ? ('primary' as const) : ('secondary' as const),
    }
    const csvAction = {
      id: 'reports-csv',
      label: 'Export CSV',
      description: workflowPreferences.defaultReportExport === 'csv' ? 'Default export workflow for spreadsheet analysis' : 'Download detailed transaction data pack',
      onClick: exportToCSV,
      style: workflowPreferences.defaultReportExport === 'csv' ? ('primary' as const) : ('secondary' as const),
    }
    const prioritizedActions = workflowPreferences.defaultReportExport === 'csv'
      ? [csvAction, pdfAction]
      : [pdfAction, csvAction]

    const nextStepByFocus = workflowPreferences.reportFocusMode === 'anomalies'
      ? {
          label: 'Review Transactions',
          description: 'Inspect unusual entries and clean anomalies',
          path: '/transactions',
        }
      : workflowPreferences.reportFocusMode === 'cashflow'
        ? {
            label: 'Optimize Budget',
            description: 'Open Budget and adjust cash-flow caps',
            path: '/budget',
          }
        : workflowPreferences.reportFocusMode === 'savings'
          ? {
              label: 'Boost Goals',
              description: 'Open Goals and allocate surplus toward savings targets',
              path: '/goals',
            }
          : {
              label: reportData.netIncome < 0 ? 'Fix Budget' : 'Review Goals',
              description: reportData.netIncome < 0 ? 'Open Budget and set category caps' : 'Open Goals and allocate surplus',
              path: reportData.netIncome < 0 ? '/budget' : '/goals',
            }

    return [
      {
        id: 'reports-this-month',
        label: 'This Month',
        description: 'Reset date range to the current month',
        onClick: () => setTimeRange('current_month' as TimeRange),
        style: 'secondary' as const,
      },
      ...prioritizedActions,
      {
        id: 'reports-next-step',
        label: nextStepByFocus.label,
        description: nextStepByFocus.description,
        onClick: () => router.push(nextStepByFocus.path),
        style: 'secondary' as const,
      }
    ]
  }

  const exportToCSV = () => {
    if (loading) {
      toast.error('Report data is still syncing. Please try again in a moment.')
      return
    }
    if (!hasExportQuota) {
      toast.error('Free plan includes 2 exports per month. Upgrade for unlimited exports.')
      router.push('/subscribe')
      return
    }
    if (filteredTransactions.length === 0) {
      toast.error('No transaction data found for the selected period.')
      return
    }

    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Method']
    const metadataRows = [
      ['FinleyBook Intelligence Data Pack'],
      ['Report ID', reportId],
      ['Generated At', format(new Date(), 'yyyy-MM-dd HH:mm:ss')],
      ['Prepared For', reportClientName],
      ['Report Window', reportPeriodLabel],
      ['Finley Score', reportData.finleyScore],
      ['Savings Rate (%)', reportData.savingsRate.toFixed(1)],
      ['Primary Expense Category', reportData.topExpenseCategoryName],
      [],
    ]
    const csvContent = [
      ...metadataRows.map((row) => row.map((cell) => toCsvCell(cell)).join(',')),
      headers.join(','),
      ...filteredTransactions.map((t) => [
        toCsvCell(format(new Date(t.date), 'yyyy-MM-dd')),
        toCsvCell(t.type),
        toCsvCell(t.category),
        toCsvCell(t.description),
        toCsvCell(t.amount),
        toCsvCell(t.paymentMethod || ''),
      ].join(','))
    ].join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const csvFileName = `${reportFileBase}.csv`

    const finalizeUsage = () => {
      if (!isProMember && user?.uid) {
        const now = new Date()
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        const key = `finley_exports_${user.uid}_${monthKey}`
        const current = Number(localStorage.getItem(key) || 0)
        localStorage.setItem(key, String(current + 1))
        window.dispatchEvent(new Event('finley:export-usage-updated'))
      }
    }

    const runExport = async () => {
      if (useMobileExportFlow) {
        const shared = await tryShareFile(blob, csvFileName, 'text/csv')
        if (shared) {
          finalizeUsage()
          toast.success('CSV shared successfully.')
          return
        }

        if (isIOSLikeDevice()) {
          const csvUrl = URL.createObjectURL(blob)
          openFileForManualSave(csvUrl)
          window.setTimeout(() => URL.revokeObjectURL(csvUrl), 60000)
          finalizeUsage()
          toast.success('CSV opened. Use Share to save it.')
          return
        }
      }

      triggerBlobDownload(blob, csvFileName)
      finalizeUsage()
      toast.success('CSV data pack downloaded.')
    }

    void runExport()
  }

  const handlePrint = () => window.print()

  const handleMobileGeneratedPdfDownload = async () => {
    if (!generatedPdfUrl) return

    const fileName = `${reportFileBase}.pdf`
    if (generatedPdfBlob) {
      const shared = await tryShareFile(generatedPdfBlob, fileName, 'application/pdf')
      if (shared) {
        toast.success('PDF shared successfully.')
        return
      }

      if (!isIOSLikeDevice()) {
        triggerBlobDownload(generatedPdfBlob, fileName)
        toast.success('PDF downloaded.')
        return
      }

      const iosUrl = URL.createObjectURL(generatedPdfBlob)
      openFileForManualSave(iosUrl)
      window.setTimeout(() => URL.revokeObjectURL(iosUrl), 60000)
      toast.success('PDF opened. Use Share to save it.')
      return
    }

    openFileForManualSave(generatedPdfUrl)
    toast.success('PDF opened. Use Share to save it.')
  }

  const handleGeneratePDF = async () => {
    if (loading) {
      toast.error('Report data is still syncing. Please wait for the latest snapshot.')
      return
    }
    if (!hasExportQuota) {
      toast.error('Free plan includes 2 exports per month. Upgrade for unlimited exports.')
      router.push('/subscribe')
      return
    }
    if (!reportRef.current) return

    try {
      setIsExporting(true)
      const toastId = toast.loading(t('reports.exporting') || 'Generating PDF...')

      const element = reportRef.current
      const qualitySettings = {
        fast: { scale: isMobile ? 0.9 : 1, jpegQuality: 0.78, forceJpeg: true },
        balanced: { scale: isMobile ? 1 : 1.5, jpegQuality: 0.88, forceJpeg: isMobile },
        high: { scale: isMobile ? 1.2 : 2, jpegQuality: 0.92, forceJpeg: false }
      }[pdfQuality]

      const { html2canvas, jsPDF } = await loadPdfDeps()

      const canvas = await html2canvas(element, {
        scale: qualitySettings.scale,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 15000,
        windowWidth: Math.max(element.scrollWidth, isMobile ? 780 : 1200),
        onclone: (clonedDoc) => {
          const element = clonedDoc.getElementById('report-container')
          if (element) {
            element.querySelectorAll('.pdf-only').forEach((el) => {
              if (el instanceof HTMLElement) el.style.display = 'block'
            })
            element.querySelectorAll('.pdf-exclude').forEach((el) => {
              if (el instanceof HTMLElement) el.style.display = 'none'
            })
            element.querySelectorAll('.print\\:flex, .print\\:block').forEach((el) => {
              if (el instanceof HTMLElement) {
                el.style.display = el.classList.contains('print:flex') ? 'flex' : 'block'
                if (el.classList.contains('justify-between')) el.style.justifyContent = 'space-between'
              }
            })
            element.querySelectorAll('.print\\:hidden').forEach((el) => { if (el instanceof HTMLElement) el.style.display = 'none' })
            element.style.padding = '40px'; element.style.maxWidth = '100%'; element.style.margin = '0'
          }
        }
      })

      const useJpeg = qualitySettings.forceJpeg || canvas.width > 2400
      const imgData = useJpeg
        ? canvas.toDataURL('image/jpeg', qualitySettings.jpegQuality)
        : canvas.toDataURL('image/png')
      const imgFormat = useJpeg ? 'JPEG' : 'PNG'
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true })
      const imgWidth = 297;
      const pageHeight = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, imgFormat, 0, position, imgWidth, imgHeight, undefined, 'FAST')
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position -= pageHeight
        pdf.addPage()
        pdf.addImage(imgData, imgFormat, 0, position, imgWidth, imgHeight, undefined, 'FAST')
        heightLeft -= pageHeight
      }

      const pdfBlob = pdf.output('blob')
      const newPdfUrl = URL.createObjectURL(pdfBlob)
      setGeneratedPdfBlob(pdfBlob)
      setGeneratedPdfUrl((previousUrl) => {
        if (previousUrl) {
          URL.revokeObjectURL(previousUrl)
        }
        return newPdfUrl
      })

      if (useMobileExportFlow) {
        const pdfFileName = `${reportFileBase}.pdf`
        const shared = await tryShareFile(pdfBlob, pdfFileName, 'application/pdf')
        if (shared) {
          toast.dismiss(toastId)
          toast.success('PDF shared successfully.')
        } else if (!isIOSLikeDevice()) {
          triggerBlobDownload(pdfBlob, pdfFileName)
          toast.dismiss(toastId)
          toast.success('PDF downloaded to your device.')
        } else {
          openFileForManualSave(newPdfUrl)
          toast.dismiss(toastId)
          toast.success('PDF opened. Tap Share to save to Files.')
        }
      } else {
        toast.dismiss(toastId)
        toast.success('Executive PDF is ready to download.')
      }

      if (!isProMember && user?.uid) {
        const now = new Date()
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        const key = `finley_exports_${user.uid}_${monthKey}`
        const current = Number(localStorage.getItem(key) || 0)
        localStorage.setItem(key, String(current + 1))
        window.dispatchEvent(new Event('finley:export-usage-updated'))
      }
    } catch (error) {
      console.error('PDF Export Error:', error)
      toast.error('Failed to generate PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleShareImage = async () => {
    const summaryEl = document.querySelector('.finley-report-summary') as HTMLElement
    if (!summaryEl) {
      toast.error('No summary to share')
      return
    }
    try {
      const toastId = toast.loading('Capturing summary...')
      const { html2canvas } = await loadPdfDeps().then(deps => ({ html2canvas: deps.html2canvas }))
      const canvas = await html2canvas(summaryEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png', 1.0)
      )
      toast.dismiss(toastId)

      if (!blob) {
        toast.error('Failed to capture')
        return
      }

      const fileName = `finleybook-summary-${format(new Date(), 'yyyyMMdd')}.png`

      // Try native share (mainly works on mobile)
      if (typeof navigator.share === 'function') {
        try {
          const file = new File([blob], fileName, { type: 'image/png' })
          const canShare = typeof navigator.canShare === 'function' ? navigator.canShare({ files: [file] }) : false
          if (canShare) {
            await navigator.share({ files: [file], title: 'My FinleyBook Report' })
            toast.success('Shared successfully!')
            return
          }
        } catch (shareError: unknown) {
          // User cancelled → do nothing; other errors → fall through to download
          if (shareError instanceof Error && shareError.name === 'AbortError') return
          console.warn('[Share] Native share failed, falling back to download:', shareError)
        }
      }

      // Fallback: download as image
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      toast.success('Summary image saved!')
    } catch (error: unknown) {
      console.error('[Share] Image capture error:', error)
      toast.error('Failed to capture summary. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-[#f3f4f6]" id="report-container" ref={reportRef}>
      <style jsx global>{`
        .pdf-only { display: none; }
        @media print {
          @page { margin: 0; size: landscape; }
          body { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; break-inside: avoid; box-shadow: none !important; }
          .pdf-only { display: block !important; }
          .pdf-exclude { display: none !important; }
          .pdf-page-break { break-before: page; page-break-before: always; }
        }
      `}</style>
      <main className={`max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 print:p-0 print:max-w-none ${workflowPreferences.stickyMobileActionBar ? 'pb-44 md:pb-6' : 'pb-8 md:pb-6'}`}>
        {/* Letterhead */}
        <div className="hidden print:flex bg-slate-900 text-white p-10 mb-10 justify-between items-center print-color-adjust-exact border-b-4 border-slate-700">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white rounded-none flex items-center justify-center text-slate-900 font-serif font-bold text-3xl">F.</div>
            <div>
              <h1 className="text-3xl font-serif font-bold tracking-tight">FinleyBook</h1>
              <p className="text-slate-400 text-[10px] tracking-[0.25em] uppercase font-medium mt-1">Private Wealth Management</p>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block bg-slate-800 rounded-sm px-4 py-1.5 mb-2 border border-slate-600">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Confidential Report</span>
            </div>
            <h2 className="text-2xl font-serif font-medium text-white tracking-wide">Monthly Portfolio Review</h2>
            <p className="text-slate-400 text-xs mt-1.5 font-light">Prepared for: <span className="text-white font-medium">{user?.displayName || 'Client'}</span> | {format(new Date(), 'MMMM dd, yyyy')}</p>
          </div>
        </div>

        <section className="pdf-only mx-10 mb-8">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 bg-slate-50 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Executive Financial Snapshot</p>
                <h2 className="text-2xl font-semibold text-slate-900 mt-1">FinleyBook Monthly Intelligence Brief</h2>
              </div>
              <div className="text-xs text-slate-600 text-right">
                <div>Report ID: <span className="font-semibold text-slate-900">{reportId}</span></div>
                <div>Period: {reportPeriodLabel}</div>
                <div>Last Synced: {lastSyncedAt ? format(lastSyncedAt, 'yyyy-MM-dd HH:mm:ss') : 'Pending'}</div>
              </div>
            </div>
            <div className="p-8 grid grid-cols-4 gap-4 border-b border-slate-100">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Total Income</p>
                <p className="text-2xl font-bold text-slate-900">{formatAmount(reportData.totalIncome)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Total Expense</p>
                <p className="text-2xl font-bold text-slate-900">{formatAmount(reportData.totalExpenses)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Net Income</p>
                <p className={`text-2xl font-bold ${reportData.netIncome >= 0 ? 'text-slate-900' : 'text-red-600'}`}>{formatAmount(reportData.netIncome)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Finley Score</p>
                <p className="text-2xl font-bold text-slate-900">{reportData.finleyScore}</p>
              </div>
            </div>
            <div className="p-8 grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Top Income Categories</h3>
                <div className="space-y-2">
                  {sortedIncomeCategories.slice(0, 4).map((item, index) => (
                    <div key={`${item.name}-${index}`} className="flex items-center justify-between border border-slate-100 rounded-lg px-3 py-2">
                      <span className="text-sm text-slate-700">{item.name}</span>
                      <span className="text-sm font-semibold text-slate-900">{formatAmount(item.value)}</span>
                    </div>
                  ))}
                  {sortedIncomeCategories.length === 0 && <p className="text-sm text-slate-500">No income category data.</p>}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Top Expense Categories</h3>
                <div className="space-y-2">
                  {sortedExpenseCategories.slice(0, 4).map((item, index) => (
                    <div key={`${item.name}-${index}`} className="flex items-center justify-between border border-slate-100 rounded-lg px-3 py-2">
                      <span className="text-sm text-slate-700">{item.name}</span>
                      <span className="text-sm font-semibold text-slate-900">{formatAmount(item.value)}</span>
                    </div>
                  ))}
                  {sortedExpenseCategories.length === 0 && <p className="text-sm text-slate-500">No expense category data.</p>}
                </div>
              </div>
            </div>
            <div className="px-8 pb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Priority Actions</h3>
              <div className="grid grid-cols-3 gap-3">
                {reportData.focusActions.map((action, index) => (
                  <div key={action} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 leading-relaxed">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Action {index + 1}</p>
                    {action}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Header */}
        <motion.div className="mb-8 print:hidden pdf-exclude" initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('reports.title')}</h1>
          <p className="text-gray-600">{t('reports.subtitle')}</p>
          <p className="text-xs text-slate-500 mt-2">Data Sync: {syncStatusLabel}</p>
        </motion.div>

        <motion.section
          className="mb-8 print:hidden pdf-exclude rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
          {...sectionRevealProps}
        >
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl border ${
                reportSmartGuide.tone === 'warning'
                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                  : reportSmartGuide.tone === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-indigo-200 bg-indigo-50 text-indigo-700'
              }`}>
                <SparklesIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Finley Smart Report Assistant</p>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{reportSmartGuide.title}</h2>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{reportSmartGuide.detail}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                <BoltIcon className="h-3.5 w-3.5 mr-1" />
                {reportData.finleyScore} Finley Score
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                {filteredTransactions.length} tx
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                Focus: {reportFocusLabel}
              </span>
              <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                Default Export: {defaultExportLabel}
              </span>
            </div>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {getReportWorkflowActions().map((action, index) => (
              <motion.button
                key={action.id}
                type="button"
                onClick={action.onClick}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut', delay: prefersReducedMotion ? 0 : index * 0.03 }}
                whileHover={prefersReducedMotion ? undefined : { y: -1 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                className={`rounded-xl border p-3 text-left transition ${
                  action.style === 'primary'
                    ? 'border-indigo-200 bg-indigo-50/70 hover:bg-indigo-50'
                    : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                }`}
              >
                <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{action.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {showWalletCoach ? (
          <motion.section
            className="mb-8 print:hidden pdf-exclude"
            {...sectionRevealProps}
          >
            <WalletActionCoach context="reports" />
          </motion.section>
        ) : (
          <motion.section
            className="mb-8 print:hidden pdf-exclude"
            {...sectionRevealProps}
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Wallet Coach Hidden</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">Automation settings disabled auto-open wallet coach on Reports</p>
                  <p className="mt-1 text-xs text-slate-600">You can open it manually here, or re-enable auto-open in Settings → Automation.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setWalletCoachExpanded(true)}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 hover:bg-white"
                >
                  Open Wallet Coach
                </button>
              </div>
            </div>
          </motion.section>
        )}

        {/* Finley Report Identity */}
        <motion.div className="mb-8 print:hidden pdf-exclude rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden finley-report-summary" {...sectionRevealProps}>
          <div className="px-5 py-4 bg-slate-900 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">FinleyBook Intelligence Signature</p>
              <h2 className="text-lg font-semibold">Decision-Grade Wealth Brief</h2>
            </div>
            <div className="text-xs text-slate-200">
              <div>Report ID: <span className="font-semibold text-white">{reportId}</span></div>
              <div>Period: {reportPeriodLabel}</div>
            </div>
          </div>
          <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {reportData.focusActions.map((action, index) => (
              <div key={action} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Priority {index + 1}</p>
                <p className="text-sm text-slate-800 leading-relaxed">{action}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Executive Summary */}
        <div className="hidden print:grid grid-cols-3 gap-8 mx-10 mb-10 p-0">
          <div className="col-span-1 bg-white border border-gray-200 p-8 rounded-none flex flex-col items-center justify-center shadow-none">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Finley Score</h3>
            <div className="relative w-36 h-18 overflow-hidden mb-4">
              <div className="absolute top-0 left-0 w-36 h-36 rounded-full border-[14px] border-gray-100 box-border"></div>
              <div className="absolute top-0 left-0 w-36 h-36 rounded-full border-[14px] border-indigo-900 box-border" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)', transform: `rotate(${(reportData.finleyScore / 100) * 180 - 180}deg)`, transformOrigin: 'center', transition: 'transform 1s ease-out' }}></div>
            </div>
            <div className="text-5xl font-serif font-bold text-slate-900">{reportData.finleyScore}</div>
            <div className="text-[10px] text-green-700 font-bold mt-2 uppercase tracking-wide border-t border-gray-100 pt-2 w-full text-center">Top 10% Percentile</div>
          </div>
          <div className="col-span-2 bg-slate-50 border-l-[6px] border-slate-800 p-8 rounded-r-sm print-color-adjust-exact flex flex-col justify-center">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-5 flex items-center gap-3"><span className="text-lg">⚡️</span> Executive AI Summary</h3>
            <div className="grid grid-cols-2 gap-6">
              {reportData.insights.map((insight, i) => (
                <div key={i} className="text-sm text-slate-800 leading-relaxed font-serif bg-white p-4 rounded-sm border border-slate-200 shadow-sm"><span dangerouslySetInnerHTML={{ __html: insight }} /></div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <motion.div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 mb-8 print:hidden pdf-exclude" {...sectionRevealProps}>
          {!isProMember && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Free plan exports remaining this month: <span className="font-bold">{Math.max(0, exportRemaining)}</span>. Upgrade for unlimited PDF/CSV exports.
            </div>
          )}
          <div className="flex flex-col xl:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-3">
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value as TimeRange)} className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900">
                <option value="current_month">{t('reports.timeRange.currentMonth')}</option>
                <option value="last_month">{t('reports.timeRange.lastMonth')}</option>
                <option value="current_year">{t('reports.timeRange.currentYear')}</option>
                <option value="custom">{t('reports.timeRange.custom')}</option>
              </select>
              {timeRange === 'custom' && (
                <>
                  <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                  <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                </>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
              <select
                value={pdfQuality}
                onChange={(e) => setPdfQuality(e.target.value as 'fast' | 'balanced' | 'high')}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="fast">PDF: Fast (Mobile)</option>
                <option value="balanced">PDF: Balanced</option>
                <option value="high">PDF: High Quality</option>
              </select>
              <motion.button onClick={handlePrint} className="hidden md:flex items-center justify-center h-10 px-4 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all text-sm" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <PrinterIcon className="w-4 h-4 mr-2" />{t('reports.print')}
              </motion.button>
              {generatedPdfUrl ? (
                isMobile ? (
                  <motion.button
                    onClick={handleMobileGeneratedPdfDownload}
                    className="w-full sm:w-auto flex items-center justify-center h-11 sm:h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-all text-sm"
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={prefersReducedMotion ? undefined : { boxShadow: ['0 0 0 rgba(79,70,229,0)', '0 0 0 6px rgba(79,70,229,0.12)', '0 0 0 rgba(79,70,229,0)'] }}
                    transition={prefersReducedMotion ? undefined : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                    Save Executive PDF
                  </motion.button>
                ) : (
                  <motion.a
                    href={generatedPdfUrl}
                    download={`${reportFileBase}.pdf`}
                    className="w-full sm:w-auto flex items-center justify-center h-11 sm:h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-all text-sm cursor-pointer"
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={prefersReducedMotion ? undefined : { boxShadow: ['0 0 0 rgba(79,70,229,0)', '0 0 0 6px rgba(79,70,229,0.12)', '0 0 0 rgba(79,70,229,0)'] }}
                    transition={prefersReducedMotion ? undefined : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                    Download Executive PDF
                  </motion.a>
                )
              ) : (
                <motion.button
                  onClick={handleGeneratePDF}
                  disabled={isExporting || !hasExportQuota || loading}
                  className="w-full sm:w-auto flex items-center justify-center h-11 sm:h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-sm transition-all text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isExporting ? <ArrowDownTrayIcon className="w-4 h-4 mr-2 animate-bounce" /> : <ArrowDownTrayIcon className="w-4 h-4 mr-2" />}
                  {isExporting ? 'Generating...' : t('reports.downloadPDF')}
                </motion.button>
              )}
              <motion.button onClick={exportToCSV} disabled={filteredTransactions.length === 0 || !hasExportQuota || loading} className="w-full sm:w-auto flex items-center justify-center h-11 sm:h-10 px-4 bg-emerald-600 text-white font-medium rounded-lg shadow-sm hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm" whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />{t('reports.exportCSV')}
              </motion.button>
              <motion.button onClick={handleShareImage} className="w-full sm:w-auto flex items-center justify-center h-11 sm:h-10 px-4 bg-purple-600 text-white font-medium rounded-lg shadow-sm hover:bg-purple-700 transition-all text-sm" whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <ShareIcon className="w-4 h-4 mr-2" />Share Summary
              </motion.button>
            </div>
          </div>
        </motion.div>

        {workflowPreferences.stickyMobileActionBar && (
          <div className="fixed left-3 right-3 bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-30 md:hidden print:hidden pointer-events-none">
            <div className="pointer-events-auto rounded-2xl border border-slate-200 bg-white/92 supports-[backdrop-filter]:bg-white/80 backdrop-blur-md shadow-xl p-3">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-500">Report Actions</p>
                  <p className="text-xs text-slate-600">
                    {generatedPdfUrl ? `Ready • Default ${defaultExportLabel}` : (isExporting ? 'Generating report...' : `Default export: ${defaultExportLabel}`)}
                  </p>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                  {reportData.finleyScore} Score
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {workflowPreferences.defaultReportExport === 'csv' ? (
                  <>
                    <button
                      type="button"
                      onClick={exportToCSV}
                      disabled={filteredTransactions.length === 0 || !hasExportQuota || loading}
                      className="h-11 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] transition"
                    >
                      Export CSV
                    </button>
                    {generatedPdfUrl ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (isMobile) {
                            void handleMobileGeneratedPdfDownload()
                            return
                          }
                          window.open(generatedPdfUrl, '_blank', 'noopener,noreferrer')
                        }}
                        className="h-11 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-sm active:scale-[0.99] transition"
                      >
                        {isMobile ? 'Save PDF' : 'Open PDF'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleGeneratePDF}
                        disabled={isExporting || !hasExportQuota || loading}
                        className="h-11 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] transition"
                      >
                        {isExporting ? 'Generating...' : 'Generate PDF'}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {generatedPdfUrl ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (isMobile) {
                            void handleMobileGeneratedPdfDownload()
                            return
                          }
                          window.open(generatedPdfUrl, '_blank', 'noopener,noreferrer')
                        }}
                        className="h-11 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-sm active:scale-[0.99] transition"
                      >
                        {isMobile ? 'Save PDF' : 'Open PDF'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleGeneratePDF}
                        disabled={isExporting || !hasExportQuota || loading}
                        className="h-11 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] transition"
                      >
                        {isExporting ? 'Generating...' : 'Generate PDF'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={exportToCSV}
                      disabled={filteredTransactions.length === 0 || !hasExportQuota || loading}
                      className="h-11 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] transition"
                    >
                      Export CSV
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 print:grid-cols-4 print:gap-6 print:mx-10 pdf-exclude" {...sectionRevealProps}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print-card"><h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('reports.summary.totalIncome')}</h3><p className="text-2xl font-bold text-slate-900">{formatAmount(reportData.totalIncome)}</p><p className="text-[10px] text-green-600 font-bold mt-1 flex items-center">▲ 12% vs last month</p></div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print-card"><h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('reports.summary.totalExpenses')}</h3><p className="text-2xl font-bold text-slate-900">{formatAmount(reportData.totalExpenses)}</p><p className="text-[10px] text-red-500 font-bold mt-1 flex items-center">▲ 5% vs last month</p></div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print-card"><h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('reports.summary.netIncome')}</h3><p className={`text-2xl font-bold ${reportData.netIncome >= 0 ? 'text-slate-900' : 'text-red-600'}`}>{reportData.netIncome >= 0 ? '+' : ''}{formatAmount(reportData.netIncome)}</p><p className="text-[10px] text-slate-500 mt-1">Savings Rate: {reportData.totalIncome > 0 ? ((reportData.netIncome / reportData.totalIncome) * 100).toFixed(1) : 0}%</p></div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print-card"><h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Transactions</h3><p className="text-2xl font-bold text-slate-900">{reportData.transactionCount}</p><p className="text-[10px] text-slate-400 mt-1">Across {reportData.daysDiff} days</p></div>
        </motion.div>

        {/* Charts */}
        <motion.div ref={chartRef} className="print-card print:mx-10 mb-8 pdf-exclude" {...sectionRevealProps}>
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('reports.charts.trend')}</h2>
          <Suspense fallback={<ReportChartLoadingSkeleton reduceMotion={!!prefersReducedMotion} />}>
            {shouldRenderCharts ? (
              <WealthAnalytics transactions={deferredFilteredTransactions} />
            ) : (
              <ReportChartLoadingSkeleton reduceMotion={!!prefersReducedMotion} />
            )}
          </Suspense>
        </motion.div>

        {/* Breakdown */}
        <motion.div ref={breakdownRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 mt-8 print:grid-cols-2 print:gap-8 print:mx-10 pdf-exclude" {...sectionRevealProps}>
          {shouldRenderBreakdown ? (
            <>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print-card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('reports.charts.incomeBreakdown')}</h3>
                {sortedIncomeCategories.length > 0 ? (
                  <div className="space-y-3">{sortedIncomeCategories.map((category, index) => { const percentage = reportData.totalIncome > 0 ? (category.value / reportData.totalIncome) * 100 : 0; return (<div key={category.name} className="flex items-center justify-between"><div className="flex-1"><div className="flex justify-between mb-1"><span className="text-sm font-medium text-gray-700">{category.name}</span><span className="text-sm text-gray-500">{formatAmount(category.value)}</span></div><div className="w-full bg-gray-200 rounded-full h-2 print:border print:border-gray-300"><motion.div className="h-2 rounded-full bg-green-500 print:bg-green-600 print:print-color-adjust-exact" style={{ width: `${percentage}%` }} initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ delay: prefersReducedMotion ? 0 : index * CHART_MOTION.progressFillStagger, duration: prefersReducedMotion ? 0 : CHART_MOTION.progressFill.duration, ease: MOTION_EASE.standard }} /></div><div className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}%</div></div></div>) })}</div>
                ) : <p className="text-gray-500 text-center py-8">{t('reports.empty.income')}</p>}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print-card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('reports.charts.expenseBreakdown')}</h3>
                {sortedExpenseCategories.length > 0 ? (
                  <div className="space-y-3">{sortedExpenseCategories.map((category, index) => { const percentage = reportData.totalExpenses > 0 ? (category.value / reportData.totalExpenses) * 100 : 0; return (<div key={category.name} className="flex items-center justify-between"><div className="flex-1"><div className="flex justify-between mb-1"><span className="text-sm font-medium text-gray-700">{category.name}</span><span className="text-sm text-gray-500">{formatAmount(category.value)}</span></div><div className="w-full bg-gray-200 rounded-full h-2 print:border print:border-gray-300"><motion.div className="h-2 rounded-full bg-red-500 print:bg-red-600 print:print-color-adjust-exact" style={{ width: `${percentage}%` }} initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ delay: prefersReducedMotion ? 0 : index * CHART_MOTION.progressFillStagger, duration: prefersReducedMotion ? 0 : CHART_MOTION.progressFill.duration, ease: MOTION_EASE.standard }} /></div><div className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}%</div></div></div>) })}</div>
                ) : <p className="text-gray-500 text-center py-8">{t('reports.empty.expense')}</p>}
              </div>
            </>
          ) : (
            <>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="h-5 w-40 rounded bg-slate-200 animate-pulse mb-4" />
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-2">
                        <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
                        <div className="h-4 w-16 rounded bg-slate-100 animate-pulse" />
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="h-5 w-44 rounded bg-slate-200 animate-pulse mb-4" />
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-2">
                        <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
                        <div className="h-4 w-16 rounded bg-slate-100 animate-pulse" />
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Payments */}
        <motion.div ref={paymentsRef} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 print-card print:mx-10 pdf-exclude" {...sectionRevealProps}>
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('reports.charts.paymentMethods')}</h3>
          {shouldRenderPayments ? (
            sortedPaymentMethods.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
                {sortedPaymentMethods.map((method) => {
                  const totalAmount = sortedPaymentMethods.reduce((sum, m) => sum + m.value, 0)
                  const percentage = totalAmount > 0 ? (method.value / totalAmount) * 100 : 0
                  return (
                    <div key={method.name} className="text-center">
                      <div className="bg-blue-50 p-4 rounded-lg print:bg-gray-50 print:border print:border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">{method.name}</h4>
                        <p className="text-lg font-bold text-blue-600 print:text-black">{formatAmount(method.value)}</p>
                        <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">{t('reports.empty.payment')}</p>
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <div className="h-4 w-20 rounded bg-slate-200 animate-pulse mx-auto mb-3" />
                  <div className="h-6 w-24 rounded bg-slate-100 animate-pulse mx-auto mb-2" />
                  <div className="h-3 w-12 rounded bg-slate-100 animate-pulse mx-auto" />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <div className="hidden print:flex flex-col gap-4 mt-12 pt-6 border-t border-gray-300 mx-10 pb-8">
          <div className="flex justify-between items-start"><div className="text-[10px] text-gray-400 max-w-2xl leading-relaxed"><strong>DISCLAIMER:</strong> This report is generated by AI based on user-provided data. It does not constitute professional financial, tax, or legal advice. Historical performance is not indicative of future results. FinleyBook is not a registered investment advisor.</div><div className="text-right"><div className="text-sm font-bold text-slate-900">FinleyBook.com</div><div className="text-[10px] text-gray-400">AI Wealth Intelligence Engine</div></div></div>
          <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2"><div className="uppercase tracking-widest font-bold">Confidential & Private</div><div>Page 1 of 1</div></div>
        </div>
        <div className="hidden print:block fixed bottom-0 left-0 right-0 h-1.5 bg-slate-900 print-color-adjust-exact" />
      </main>
    </div>
  )
}
