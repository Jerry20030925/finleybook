'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useAuth } from '@/components/AuthProvider'
import { useLanguage } from '@/components/LanguageProvider'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Banknote,
  Clock3,
  ExternalLink,
  Filter,
  Link2,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  X,
  Zap,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { db } from '@/lib/firebase'
import { collection, query, where, onSnapshot, orderBy, limit, doc } from 'firebase/firestore'
import Skeleton from '@/components/Skeleton'
import { useExperience } from '@/components/ExperienceProvider'
import { useWorkflowPreferences } from '@/hooks/useWorkflowPreferences'

type WalletBalance = { available: number; pending: number; lifetime: number }
type HistoryTypeFilter = 'all' | 'earnings' | 'withdrawals'
type HistoryStatusFilter = 'all' | 'pending' | 'completed'
type WalletTransaction = {
  id: string
  merchantName?: string
  description?: string
  amount?: number | string
  date?: any
  status?: string
  type?: string
  [key: string]: any
}

type NormalizedWalletTransaction = {
  id: string
  title: string
  date: Date
  amount: number
  status: string
  type: string
  isPending: boolean
  isWithdrawal: boolean
  icon: string
  raw: WalletTransaction
}

function parseWalletTxDate(dateLike: any) {
  if (dateLike?.seconds) return new Date(dateLike.seconds * 1000)
  if (typeof dateLike?.toDate === 'function') return dateLike.toDate()
  if (dateLike) {
    const parsed = new Date(dateLike)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }
  return new Date()
}

function parseWalletTxAmount(amountLike: number | string | undefined) {
  if (typeof amountLike === 'number') {
    return amountLike > 1000 ? amountLike / 100 : amountLike
  }
  const parsed = parseFloat(String(amountLike ?? '0'))
  return Number.isFinite(parsed) ? parsed : 0
}

function formatUsd(amount: number) {
  return `$${amount.toFixed(2)}`
}

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth()
  const { t, language } = useLanguage()
  const { allowRichMotion, reduceMotion } = useExperience()
  const prefersReducedMotion = useReducedMotion()
  const motionReduced = reduceMotion || prefersReducedMotion
  const isZh = language === 'zh'
  const router = useRouter()
  const workflowPreferences = useWorkflowPreferences(user?.uid)

  const [balance, setBalance] = useState<WalletBalance>({ available: 0, pending: 0, lifetime: 0 })
  const [stripeStatus, setStripeStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [isConnecting, setIsConnecting] = useState(false)

  const [historyQuery, setHistoryQuery] = useState('')
  const [historyTypeFilter, setHistoryTypeFilter] = useState<HistoryTypeFilter>('all')
  const [historyStatusFilter, setHistoryStatusFilter] = useState<HistoryStatusFilter>('all')
  const [showHistoryFilters, setShowHistoryFilters] = useState(false)
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null)

  const historySearchRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user) {
      if (!authLoading) setLoading(false)
      return
    }

    const userUnsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        const walletData = data.wallet_snapshot ? {
          available: data.wallet_snapshot.available_balance || 0,
          pending: data.wallet_snapshot.pending_balance || 0,
          lifetime: data.wallet_snapshot.lifetime_earnings || 0,
        } : (data.wallet || { available: 0, pending: 0, lifetime: 0 })

        setBalance(walletData)
        setStripeStatus(data.stripeAccountStatus || null)
      } else {
        setBalance({ available: 0, pending: 0, lifetime: 0 })
      }
    })

    let txUnsub: () => void = () => {}
    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc'),
        limit(20)
      )

      txUnsub = onSnapshot(q, (snapshot) => {
        const txs = snapshot.docs
          .map((d) => ({ ...(d.data() as WalletTransaction), id: d.id }))
          .filter((tx) => tx.merchantName && !String(tx.merchantName).includes('Test') && !String(tx.merchantName).includes('Mock') && tx.amount !== undefined)
        setTransactions(txs)
        setLoading(false)
      }, (error: any) => {
        console.error('[Wallet] onSnapshot error for transactions:', error)
        if (error.code === 'failed-precondition') {
          const simpleQ = query(
            collection(db, 'transactions'),
            where('userId', '==', user.uid),
            limit(20)
          )
          txUnsub = onSnapshot(simpleQ, (snapshot) => {
            const txs = snapshot.docs
              .map((d) => ({ ...(d.data() as WalletTransaction), id: d.id }))
              .filter((tx) => tx.merchantName && !String(tx.merchantName).includes('Test') && !String(tx.merchantName).includes('Mock') && tx.amount !== undefined)
            setTransactions(txs)
            setLoading(false)
          })
        } else {
          setLoading(false)
        }
      })
    } catch (error) {
      console.error('[Wallet] Error setting up transaction listener:', error)
      setLoading(false)
    }

    return () => {
      userUnsub()
      txUnsub()
    }
  }, [authLoading, user])

  const handleConnectStripe = async () => {
    try {
      if (!user) {
        toast.error(t('auth.loginRequired'))
        return
      }

      setIsConnecting(true)
      const toastId = toast.loading(t('wallet.stripe.connecting'))
      const token = await user.getIdToken()

      const response = await fetch('/api/stripe/onboarding', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.url) {
        toast.success(t('wallet.stripe.redirecting'), { id: toastId })
        window.location.href = data.url
      } else {
        console.error('Stripe Connect error:', data.error)
        toast.error(data.error || t('wallet.stripe.error'), { id: toastId })
        setIsConnecting(false)
      }
    } catch (error: any) {
      console.error('Error connecting Stripe:', error)
      toast.error(error.message || t('wallet.stripe.error'))
      setIsConnecting(false)
    }
  }

  const handleWithdraw = async () => {
    if (!user) {
      toast.error(t('auth.loginRequired'))
      return
    }

    if (!stripeStatus?.payoutsEnabled) {
      toast.error(isZh ? '请先完成 Stripe 提现账户设置。' : 'Complete Stripe payout setup before withdrawing.')
      return
    }

    if (balance.available < 1) {
      toast.error(t('wallet.withdraw.minAmount'))
      return
    }

    const toastId = toast.loading(isZh ? '正在处理提现...' : 'Processing withdrawal...')
    try {
      const token = await user.getIdToken()
      const response = await fetch('/api/payout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(t('wallet.withdraw.success'), { id: toastId })
      } else {
        toast.error(data.error || (isZh ? '提现失败' : 'Withdrawal failed'), { id: toastId })
      }
    } catch {
      toast.error(isZh ? '网络错误' : 'Network error', { id: toastId })
    }
  }

  const normalizedTransactions = useMemo<NormalizedWalletTransaction[]>(() => {
    return transactions.map((tx) => {
      const status = String(tx.status || 'COMPLETED').toUpperCase()
      const type = String(tx.type || 'transaction').toLowerCase()
      const amount = parseWalletTxAmount(tx.amount)
      const isWithdrawal = type === 'withdrawal' || amount < 0
      const isPending = status === 'PENDING' || status === 'PROCESSING' || status === 'APPROVED'
      return {
        id: tx.id,
        title: String(tx.merchantName || tx.description || (isZh ? '交易' : 'Transaction')),
        date: parseWalletTxDate(tx.date),
        amount,
        status,
        type,
        isPending,
        isWithdrawal,
        icon: isWithdrawal ? '💸' : '🛍️',
        raw: tx,
      }
    })
  }, [isZh, transactions])

  const filteredTransactions = useMemo(() => {
    const q = historyQuery.trim().toLowerCase()
    return normalizedTransactions.filter((tx) => {
      if (historyTypeFilter === 'earnings' && tx.isWithdrawal) return false
      if (historyTypeFilter === 'withdrawals' && !tx.isWithdrawal) return false
      if (historyStatusFilter === 'pending' && !tx.isPending) return false
      if (historyStatusFilter === 'completed' && tx.isPending) return false
      if (!q) return true
      return `${tx.title} ${tx.status} ${tx.type}`.toLowerCase().includes(q)
    })
  }, [historyQuery, historyStatusFilter, historyTypeFilter, normalizedTransactions])

  const walletAnalytics = useMemo(() => {
    const earnings = normalizedTransactions.filter((tx) => !tx.isWithdrawal)
    const withdrawals = normalizedTransactions.filter((tx) => tx.isWithdrawal)
    const pendingCount = normalizedTransactions.filter((tx) => tx.isPending).length
    const incomingTotal = earnings.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
    const outgoingTotal = withdrawals.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
    const avgEarning = earnings.length ? incomingTotal / earnings.length : 0
    const latestTx = normalizedTransactions[0] ?? null
    return {
      incomingTotal,
      outgoingTotal,
      pendingCount,
      avgEarning,
      latestTx,
      earningCount: earnings.length,
      withdrawalCount: withdrawals.length,
    }
  }, [normalizedTransactions])

  const payoutReadiness = useMemo(() => {
    const hasStripeAccount = Boolean(stripeStatus)
    const payoutsEnabled = Boolean(stripeStatus?.payoutsEnabled)
    const hasWithdrawableFunds = balance.available >= 1
    const canWithdrawNow = payoutsEnabled && hasWithdrawableFunds
    return {
      hasStripeAccount,
      payoutsEnabled,
      hasWithdrawableFunds,
      canWithdrawNow,
    }
  }, [balance.available, stripeStatus])

  const walletCopilot = useMemo(() => {
    if (!stripeStatus) {
      return {
        title: isZh ? '先连接 Stripe，完成钱包设置' : 'Connect Stripe to complete wallet setup',
        body: isZh
          ? '连接后可直接管理提现账户，后续余额达到可提现金额时可一键发起。'
          : 'Connect Stripe to manage your payout account so withdrawals are ready when funds become available.',
        actionLabel: isZh ? '连接 Stripe' : 'Connect Stripe',
        action: handleConnectStripe,
        tone: 'indigo' as const,
      }
    }

    if (stripeStatus && !stripeStatus.payoutsEnabled) {
      return {
        title: isZh ? '完成 Stripe 设置以启用提现' : 'Finish Stripe setup to enable payouts',
        body: isZh
          ? '你的账户已创建，但仍有步骤未完成。完成后即可正常提现。'
          : 'Your Stripe account exists, but payouts are still restricted until setup is completed.',
        actionLabel: isZh ? '完成设置' : 'Complete setup',
        action: handleConnectStripe,
        tone: 'amber' as const,
      }
    }

    if (balance.available >= 1) {
      return {
        title: isZh ? '你现在可以提现了' : 'You can withdraw now',
        body: isZh
          ? `当前可提现余额 ${formatUsd(balance.available / 100)}，建议在月度复盘后统一提现与归档。`
          : `You have ${formatUsd(balance.available / 100)} available. Consider withdrawing after your monthly review for cleaner records.`,
        actionLabel: isZh ? '立即提现' : 'Withdraw now',
        action: handleWithdraw,
        tone: 'emerald' as const,
      }
    }

    if (balance.pending > 0) {
      return {
        title: isZh ? '有资金正在入账中' : 'Funds are currently processing',
        body: isZh
          ? `待到账金额 ${formatUsd(balance.pending / 100)}。你可以先查看交易记录状态，等转为可提现后再操作。`
          : `${formatUsd(balance.pending / 100)} is pending. Review transaction status now, then withdraw once it becomes available.`,
        actionLabel: isZh ? '查看记录' : 'Review history',
        action: () => {
          setHistoryStatusFilter('pending')
          setShowHistoryFilters(true)
        },
        tone: 'blue' as const,
      }
    }

    return {
      title: isZh ? '钱包已就绪，继续积累第一笔可提现余额' : 'Wallet is ready. Build your first withdrawable balance',
      body: isZh
        ? '从交易和财富页继续记录与复盘，钱包记录会自动同步到这里。'
        : 'Continue logging and reviewing activity in Transactions and Wealth. Wallet activity will sync here automatically.',
      actionLabel: isZh ? '前往财富页' : 'Go to Wealth',
      action: () => router.push('/wealth'),
      tone: 'slate' as const,
    }
  }, [balance.available, balance.pending, handleConnectStripe, isZh, router, stripeStatus])

  const quickActions = useMemo(() => ([
    {
      id: 'stripe',
      label: stripeStatus?.payoutsEnabled ? (isZh ? '管理提现账户' : 'Manage payouts') : (isZh ? '连接 Stripe' : 'Connect Stripe'),
      desc: stripeStatus?.payoutsEnabled ? (isZh ? '账户已激活' : 'Account active') : (isZh ? '启用提现' : 'Enable withdrawals'),
      icon: Link2,
      onClick: handleConnectStripe,
      primary: !stripeStatus?.payoutsEnabled,
      disabled: isConnecting,
    },
    {
      id: 'withdraw',
      label: isZh ? '发起提现' : 'Withdraw funds',
      desc: payoutReadiness.canWithdrawNow ? formatUsd(balance.available / 100) : (isZh ? '余额或设置未满足' : 'Requires funds + Stripe setup'),
      icon: Banknote,
      onClick: handleWithdraw,
      primary: payoutReadiness.canWithdrawNow,
      disabled: !payoutReadiness.canWithdrawNow,
    },
    {
      id: 'history',
      label: isZh ? '筛选待处理' : 'Filter pending',
      desc: isZh ? '查看处理中状态' : 'Review processing items',
      icon: Clock3,
      onClick: () => {
        setHistoryStatusFilter('pending')
        setShowHistoryFilters(true)
      },
      primary: false,
      disabled: false,
    },
    {
      id: 'wealth',
      label: isZh ? '前往财富页' : 'Go to Wealth',
      desc: isZh ? '继续积累收益' : 'Continue earning',
      icon: TrendingUp,
      onClick: () => router.push('/wealth'),
      primary: false,
      disabled: false,
    },
  ]), [balance.available, handleConnectStripe, handleWithdraw, isConnecting, isZh, payoutReadiness.canWithdrawNow, router, stripeStatus?.payoutsEnabled])

  const availableDollars = balance.available / 100
  const pendingDollars = balance.pending / 100
  const lifetimeDollars = balance.lifetime / 100
  const nextPayoutThresholdDollars = Math.max(0.01 - availableDollars, 0)
  const estArrival = useMemo(
    () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    []
  )

  const resetHistoryFilters = useCallback(() => {
    setHistoryQuery('')
    setHistoryTypeFilter('all')
    setHistoryStatusFilter('all')
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase()
      const isTypingField = Boolean(target?.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select')
      if (!isTypingField && event.key === '/') {
        event.preventDefault()
        historySearchRef.current?.focus()
        historySearchRef.current?.select()
        return
      }
      if (!isTypingField && event.key.toLowerCase() === 'f') {
        event.preventDefault()
        setShowHistoryFilters((prev) => !prev)
        return
      }
      if (!isTypingField && event.key.toLowerCase() === 'c') {
        event.preventDefault()
        handleConnectStripe()
        return
      }
      if (!isTypingField && event.key.toLowerCase() === 'w' && payoutReadiness.canWithdrawNow) {
        event.preventDefault()
        handleWithdraw()
        return
      }
      if (event.key === 'Escape') {
        setShowHistoryFilters(false)
        setExpandedTxId(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleConnectStripe, handleWithdraw, payoutReadiness.canWithdrawNow])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 pb-32 space-y-8">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className={`max-w-5xl mx-auto px-4 py-8 ${workflowPreferences.stickyMobileActionBar ? 'pb-36 md:pb-24' : 'pb-16 md:pb-24'}`}>
      <motion.div
        initial={motionReduced ? false : { opacity: 0, y: 10 }}
        animate={motionReduced ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="mb-6"
      >
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-5 md:p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-[0.14em] uppercase text-cyan-200 mb-3">
                <Sparkles size={14} />
                {isZh ? 'Wallet Copilot' : 'Wallet Copilot'}
              </div>
              <h2 className="text-lg md:text-xl font-semibold">{walletCopilot.title}</h2>
              <p className="mt-2 text-sm text-slate-200 leading-relaxed">{walletCopilot.body}</p>
              {workflowPreferences.showShortcutHints && (
                <p className="mt-3 text-xs text-slate-300">{isZh ? '快捷键：/ 搜索记录，F 切换筛选，C 连接 Stripe，W 提现（满足条件时）' : 'Shortcuts: / search history, F filters, C connect Stripe, W withdraw (when ready)'}</p>
              )}
            </div>
            <button
              type="button"
              onClick={walletCopilot.action}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors ${walletCopilot.tone === 'emerald'
                ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                : walletCopilot.tone === 'amber'
                  ? 'bg-amber-500 text-slate-900 hover:bg-amber-400'
                  : walletCopilot.tone === 'indigo'
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                    : 'bg-white text-slate-900 hover:bg-slate-100'
                }`}
            >
              {walletCopilot.actionLabel}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={motionReduced ? false : { opacity: 0, y: 10 }}
        animate={motionReduced ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.03 }}
        className="mb-8"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.button
                key={action.id}
                type="button"
                onClick={action.onClick}
                disabled={action.disabled}
                initial={motionReduced ? false : { opacity: 0, y: 8 }}
                animate={motionReduced ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.05 + index * 0.03 }}
                whileHover={allowRichMotion && !action.disabled ? { y: -1 } : undefined}
                whileTap={allowRichMotion && !action.disabled ? { scale: 0.99 } : undefined}
                className={`rounded-2xl border p-4 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${action.primary ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
              >
                <div className={`inline-flex items-center justify-center rounded-lg p-2 ${action.primary ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                  <Icon size={16} />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">{action.label}</p>
                <p className="mt-1 text-xs text-slate-600">{action.desc}</p>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      <div className="mb-8 grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-6 items-start">
        <motion.div
          initial={motionReduced ? false : { opacity: 0, y: 10 }}
          animate={motionReduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.06 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
            <div>
              <h1 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">{t('wallet.earned.title')}</h1>
              <div className="flex items-center gap-3">
                <span className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">{formatUsd(lifetimeDollars)}</span>
                <span className="text-3xl md:text-4xl">🚀</span>
              </div>
              <p className="mt-2 text-gray-600 text-sm md:text-base">
                {availableDollars < 0.01
                  ? (isZh
                    ? `再累计 ${formatUsd(nextPayoutThresholdDollars)} 即可达到首次提现门槛。`
                    : `You are only ${formatUsd(nextPayoutThresholdDollars)} away from your first withdrawal.`)
                  : (isZh
                    ? `当前可提现 ${formatUsd(availableDollars)}，建议在完成月度复盘后统一提现与归档。`
                    : `You have ${formatUsd(availableDollars)} withdrawable now. Consider cashing out after your monthly review for cleaner records.`)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/subscribe')}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              <Zap size={16} />
              {t('wallet.proBanner.cta')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div whileHover={allowRichMotion ? { y: -2 } : undefined} className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{t('wallet.cashOut.title')}</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{formatUsd(availableDollars)}</p>
              <button
                onClick={handleWithdraw}
                disabled={!payoutReadiness.canWithdrawNow}
                className={`mt-4 w-full py-2.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${payoutReadiness.canWithdrawNow ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_18px_rgba(16,185,129,0.25)]' : 'bg-white border border-slate-200 text-slate-400'}`}
              >
                {t('wallet.withdraw')}
              </button>
              <p className="mt-2 text-xs text-slate-500">{t('wallet.withdraw.info')}</p>
            </motion.div>

            <motion.div whileHover={allowRichMotion ? { y: -2 } : undefined} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{t('wallet.pending.title')}</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{formatUsd(pendingDollars)}</p>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>{t('wallet.pending.est')}</span>
                  <span className="font-bold text-emerald-600">{estArrival}</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="h-1.5 flex-1 bg-green-500 rounded-full" />
                  <div className="h-1.5 flex-1 bg-green-300 rounded-full" />
                  <div className="h-1.5 flex-1 bg-gray-200 rounded-full" />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1.5 font-medium">
                  <span>{t('wallet.pending.status.pending')}</span>
                  <span>{t('wallet.pending.status.approved')}</span>
                  <span>{t('wallet.pending.status.ready')}</span>
                </div>
              </div>
            </motion.div>

            <motion.div whileHover={allowRichMotion ? { y: -2 } : undefined} className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-600 to-violet-700 p-4 text-white">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-100">{t('wallet.totalEarned.title')}</p>
              <p className="mt-2 text-3xl font-black">{formatUsd(lifetimeDollars)}</p>
              <div className="mt-4 rounded-lg bg-white/10 border border-white/10 p-2.5 flex items-center gap-2">
                <div className="text-xl">{balance.lifetime > 100000 ? '🥇' : balance.lifetime > 10000 ? '🥈' : '🥉'}</div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {balance.lifetime > 100000 ? t('wallet.status.level.gold') : balance.lifetime > 10000 ? t('wallet.status.level.silver') : t('wallet.status.level.bronze')}
                  </p>
                  <p className="text-xs text-indigo-100">{t('wallet.status.keepEarning')}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={motionReduced ? false : { opacity: 0, y: 10 }}
          animate={motionReduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.08 }}
          className="space-y-6"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={16} className="text-indigo-600" />
              <h2 className="text-sm font-semibold text-slate-900">{isZh ? '提现准备状态' : 'Payout readiness'}</h2>
            </div>
            <div className="space-y-3">
              {[
                {
                  label: isZh ? 'Stripe 账户已连接' : 'Stripe account connected',
                  ok: payoutReadiness.hasStripeAccount,
                  desc: payoutReadiness.hasStripeAccount ? (isZh ? '已创建提现账户' : 'Payout account detected') : (isZh ? '需要连接 Stripe 才能提现' : 'Connect Stripe to enable payouts'),
                },
                {
                  label: isZh ? '提现权限已启用' : 'Payouts enabled',
                  ok: payoutReadiness.payoutsEnabled,
                  desc: payoutReadiness.payoutsEnabled ? (isZh ? '状态正常，可接收提现' : 'Account can receive payouts') : (isZh ? '仍需完成 Stripe 设置' : 'Complete Stripe setup to unlock payouts'),
                },
                {
                  label: isZh ? '达到最低提现金额' : 'Minimum withdrawal reached',
                  ok: payoutReadiness.hasWithdrawableFunds,
                  desc: payoutReadiness.hasWithdrawableFunds ? formatUsd(availableDollars) : `${formatUsd(Math.max(0.01 - availableDollars, 0))} ${isZh ? '后可提现' : 'remaining to withdraw'}`,
                },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${item.ok ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {item.ok ? '✓' : '!'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-600 mt-1">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-indigo-600" />
              <h2 className="text-sm font-semibold text-slate-900">{isZh ? '钱包摘要（最近 20 条）' : 'Wallet summary (last 20 records)'}</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{isZh ? '入账总额' : 'Incoming total'}</p>
                <p className="mt-1 text-sm font-semibold text-emerald-700">{formatUsd(walletAnalytics.incomingTotal)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{isZh ? '提现/流出总额' : 'Withdrawals total'}</p>
                <p className="mt-1 text-sm font-semibold text-red-600">{formatUsd(walletAnalytics.outgoingTotal)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{isZh ? '处理中记录' : 'Pending items'}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{walletAnalytics.pendingCount}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{isZh ? '平均入账金额' : 'Avg incoming'}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formatUsd(walletAnalytics.avgEarning)}</p>
              </div>
            </div>
            {walletAnalytics.latestTx && (
              <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs text-indigo-800">
                {isZh ? '最近记录：' : 'Latest record: '}
                <span className="font-semibold">{walletAnalytics.latestTx.title}</span>
                {' • '}
                {walletAnalytics.latestTx.date.toLocaleDateString()}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={motionReduced ? false : { opacity: 0, y: 10 }}
        animate={motionReduced ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8"
      >
        <div className="px-5 md:px-6 py-4 border-b border-slate-100 bg-slate-50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{t('wallet.payout.title')}</h2>
            <p className="text-sm text-slate-500 mt-1">
              {stripeStatus?.payoutsEnabled
                ? (isZh ? '提现账户已激活，可管理收款设置。' : 'Your payout account is active and ready to receive withdrawals.')
                : stripeStatus
                  ? (isZh ? '账户已创建，但需要完成 Stripe 设置。' : 'Your Stripe account exists but still needs setup to enable payouts.')
                  : t('wallet.stripe.desc')}
            </p>
          </div>
          <button
            onClick={handleConnectStripe}
            disabled={isConnecting}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${stripeStatus && !stripeStatus.payoutsEnabled ? 'bg-red-50 border border-red-200 text-red-700 hover:bg-red-100' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            <ExternalLink size={16} />
            {isConnecting
              ? t('common.loading')
              : stripeStatus?.payoutsEnabled
                ? (isZh ? '管理账户' : 'Manage Account')
                : stripeStatus
                  ? (isZh ? '完成设置' : 'Complete Setup')
                  : t('wallet.stripe.connect')}
          </button>
        </div>
        <div className="p-5 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.14em]">{t('wallet.stripe.title')}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${stripeStatus?.payoutsEnabled ? 'bg-emerald-100 text-emerald-700' : stripeStatus ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                  {stripeStatus?.payoutsEnabled ? 'ACTIVE' : stripeStatus ? 'RESTRICTED' : 'NOT CONNECTED'}
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.14em]">{isZh ? '可提现余额' : 'Withdrawable balance'}</p>
              <p className="mt-2 text-lg font-bold text-slate-900">{formatUsd(availableDollars)}</p>
              <p className="mt-1 text-xs text-slate-500">{payoutReadiness.canWithdrawNow ? (isZh ? '已满足提现条件' : 'Ready to withdraw') : (isZh ? '需先满足提现条件' : 'Need setup + minimum amount')}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.14em]">{isZh ? '待到账余额' : 'Pending balance'}</p>
              <p className="mt-2 text-lg font-bold text-slate-900">{formatUsd(pendingDollars)}</p>
              <p className="mt-1 text-xs text-slate-500">{isZh ? `预计 ${estArrival} 前后更新` : `Estimated update around ${estArrival}`}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={motionReduced ? false : { opacity: 0, y: 10 }}
        animate={motionReduced ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.12 }}
        className="mt-8"
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{t('wallet.history.title')}</h2>
            <p className="text-sm text-slate-500">{isZh ? '支持搜索与筛选，快速定位提现或待处理记录。' : 'Search and filter your wallet activity to quickly find payouts or pending records.'}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowHistoryFilters((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium ${showHistoryFilters ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            <Filter size={16} />
            {isZh ? '筛选' : 'Filters'}
          </button>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.5fr)_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                ref={historySearchRef}
                type="text"
                value={historyQuery}
                onChange={(e) => setHistoryQuery(e.target.value)}
                placeholder={isZh ? '搜索商户、状态、类型...' : 'Search merchant, status, type...'}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-9 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              {historyQuery && (
                <button
                  type="button"
                  onClick={() => setHistoryQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                {filteredTransactions.length} {isZh ? '条记录' : 'records'}
              </div>
              <button
                type="button"
                onClick={resetHistoryFilters}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                {isZh ? '重置' : 'Reset'}
              </button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {showHistoryFilters && (
              <motion.div
                initial={motionReduced ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={motionReduced ? undefined : { opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={historyTypeFilter}
                    onChange={(e) => setHistoryTypeFilter(e.target.value as HistoryTypeFilter)}
                    className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900"
                  >
                    <option value="all">{isZh ? '全部类型' : 'All types'}</option>
                    <option value="earnings">{isZh ? '入账 / 收益' : 'Earnings / incoming'}</option>
                    <option value="withdrawals">{isZh ? '提现 / 支出' : 'Withdrawals / outgoing'}</option>
                  </select>
                  <select
                    value={historyStatusFilter}
                    onChange={(e) => setHistoryStatusFilter(e.target.value as HistoryStatusFilter)}
                    className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900"
                  >
                    <option value="all">{isZh ? '全部状态' : 'All statuses'}</option>
                    <option value="pending">{isZh ? '处理中' : 'Pending / processing'}</option>
                    <option value="completed">{isZh ? '已完成' : 'Completed'}</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {filteredTransactions.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <AnimatePresence initial={false}>
              {filteredTransactions.map((tx, index) => {
                const isExpanded = expandedTxId === tx.id
                return (
                  <motion.div
                    key={tx.id}
                    layout
                    initial={motionReduced ? false : { opacity: 0, y: 8 }}
                    animate={motionReduced ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: motionReduced ? 0 : Math.min(index * 0.02, 0.12) }}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedTxId((prev) => (prev === tx.id ? null : tx.id))}
                      className="w-full p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 text-left"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${tx.isPending ? 'bg-amber-100 text-amber-700' : tx.isWithdrawal ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                          {tx.icon}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 truncate">{tx.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{tx.date.toLocaleDateString()} • {tx.status}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`font-bold ${tx.isWithdrawal ? 'text-red-500' : 'text-emerald-600'}`}>
                          {tx.isWithdrawal ? '-' : '+'}{formatUsd(Math.abs(tx.amount))}
                        </div>
                        {tx.isPending && (
                          <div className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-1">
                            {isZh ? '处理中' : 'Processing'}
                          </div>
                        )}
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={motionReduced ? false : { height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={motionReduced ? undefined : { height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-0">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-slate-500">{isZh ? '类型' : 'Type'}</p>
                                <p className="font-semibold text-slate-900 mt-0.5">{tx.type}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">{isZh ? '状态' : 'Status'}</p>
                                <p className="font-semibold text-slate-900 mt-0.5">{tx.status}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">{isZh ? '金额' : 'Amount'}</p>
                                <p className={`font-semibold mt-0.5 ${tx.isWithdrawal ? 'text-red-600' : 'text-emerald-700'}`}>{tx.isWithdrawal ? '-' : '+'}{formatUsd(Math.abs(tx.amount))}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">{isZh ? '记录时间' : 'Recorded at'}</p>
                                <p className="font-semibold text-slate-900 mt-0.5">{tx.date.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        ) : transactions.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                <Search size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{isZh ? '没有匹配的钱包记录' : 'No wallet records match your filters'}</h3>
              <p className="text-slate-500 mb-5">{isZh ? '尝试清空搜索或切换筛选条件。' : 'Try clearing search or adjusting your filter settings.'}</p>
              <button
                type="button"
                onClick={resetHistoryFilters}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {isZh ? '重置筛选' : 'Reset filters'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🚀</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{isZh ? '暂无钱包记录' : 'No Transactions Yet'}</h3>
              <p className="text-gray-500 mb-6">
                {isZh
                  ? '钱包暂无活动记录。先从交易和财富页开始建立你的财务节奏，记录会自动显示在这里。'
                  : 'No wallet activity yet. Start from Transactions and Wealth to build momentum, and activity will appear here automatically.'}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/wealth')}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors w-full shadow-lg shadow-emerald-600/20"
                >
                  {isZh ? '前往财富页' : 'Start Earning Now'}
                </button>
                <button
                  onClick={() => router.push('/transactions')}
                  className="w-full rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {isZh ? '查看交易页' : 'Open Transactions'}
                </button>
                <p className="text-xs text-gray-400">
                  {isZh ? '提示：先连接 Stripe 可在余额满足条件时快速提现' : 'Tip: Connect Stripe now to unlock fast withdrawals when funds become available'}
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {workflowPreferences.stickyMobileActionBar && (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{isZh ? '钱包操作' : 'Wallet actions'}</p>
              <p className="text-sm font-bold text-slate-900 truncate">
                {payoutReadiness.canWithdrawNow ? `${isZh ? '可提现' : 'Ready to withdraw'} • ${formatUsd(availableDollars)}` : (isZh ? '连接提现账户或等待余额到账' : 'Connect payouts or wait for balance')}
              </p>
            </div>
            <button
              type="button"
              onClick={payoutReadiness.canWithdrawNow ? handleWithdraw : handleConnectStripe}
              disabled={isConnecting}
              className="h-11 shrink-0 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white disabled:opacity-60"
            >
              {payoutReadiness.canWithdrawNow ? t('wallet.withdraw') : (stripeStatus?.payoutsEnabled ? (isZh ? '管理提现' : 'Manage payouts') : (isZh ? '连接 Stripe' : 'Connect Stripe'))}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
