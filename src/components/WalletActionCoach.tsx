'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ExternalLink, Sparkles, Wallet, Banknote, Clock3 } from 'lucide-react'
import toast from 'react-hot-toast'
import { doc, onSnapshot } from 'firebase/firestore'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/components/AuthProvider'
import { useLanguage } from '@/components/LanguageProvider'
import { useExperience } from '@/components/ExperienceProvider'
import { db } from '@/lib/firebase'
import { MOTION_DURATION, MOTION_EASE } from '@/lib/motionTokens'

type WalletSnapshot = {
  available: number
  pending: number
  lifetime: number
}

type CoachContext = 'dashboard' | 'reports'

function formatUsdFromCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

export default function WalletActionCoach({
  context,
  className = '',
}: {
  context: CoachContext
  className?: string
}) {
  const { user } = useAuth()
  const { language } = useLanguage()
  const { allowRichMotion, reduceMotion } = useExperience()
  const systemReducedMotion = useReducedMotion()
  const prefersReducedMotion = reduceMotion || systemReducedMotion
  const isZh = language === 'zh'
  const router = useRouter()

  const [wallet, setWallet] = useState<WalletSnapshot>({ available: 0, pending: 0, lifetime: 0 })
  const [stripeStatus, setStripeStatus] = useState<any>(null)
  const [isLoadingWallet, setIsLoadingWallet] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  useEffect(() => {
    if (!user?.uid) {
      setWallet({ available: 0, pending: 0, lifetime: 0 })
      setStripeStatus(null)
      setIsLoadingWallet(false)
      return
    }
    if (!db) {
      setIsLoadingWallet(false)
      return
    }

    setIsLoadingWallet(true)
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data()
        const nextWallet = data.wallet_snapshot ? {
          available: data.wallet_snapshot.available_balance || 0,
          pending: data.wallet_snapshot.pending_balance || 0,
          lifetime: data.wallet_snapshot.lifetime_earnings || 0,
        } : (data.wallet || { available: 0, pending: 0, lifetime: 0 })
        setWallet(nextWallet)
        setStripeStatus(data.stripeAccountStatus || null)
      } else {
        setWallet({ available: 0, pending: 0, lifetime: 0 })
        setStripeStatus(null)
      }
      setIsLoadingWallet(false)
    }, () => {
      setIsLoadingWallet(false)
    })

    return () => unsub()
  }, [user?.uid])

  const handleConnectStripe = useCallback(async () => {
    if (!user) {
      toast.error(isZh ? '请先登录。' : 'Please log in first.')
      router.push('/')
      return
    }
    try {
      setIsConnecting(true)
      const toastId = toast.loading(isZh ? '正在连接 Stripe...' : 'Connecting to Stripe...')
      const token = await user.getIdToken()
      const response = await fetch('/api/stripe/onboarding', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.url) {
        toast.success(isZh ? '正在跳转 Stripe...' : 'Redirecting to Stripe...', { id: toastId })
        window.location.href = data.url
        return
      }
      toast.error(data.error || (isZh ? '连接失败' : 'Connection failed'), { id: toastId })
    } catch (error: any) {
      toast.error(error?.message || (isZh ? '连接失败' : 'Connection failed'))
    } finally {
      setIsConnecting(false)
    }
  }, [isZh, router, user])

  const handleWithdraw = useCallback(async () => {
    if (!user) {
      toast.error(isZh ? '请先登录。' : 'Please log in first.')
      router.push('/')
      return
    }
    if (!stripeStatus?.payoutsEnabled) {
      toast.error(isZh ? '请先完成 Stripe 提现设置。' : 'Complete Stripe payout setup first.')
      return
    }
    if (wallet.available < 1) {
      toast.error(isZh ? '提现金额至少需要 $0.01。' : 'You need at least $0.01 to withdraw.')
      return
    }
    try {
      setIsWithdrawing(true)
      const toastId = toast.loading(isZh ? '正在处理提现...' : 'Processing withdrawal...')
      const token = await user.getIdToken()
      const response = await fetch('/api/payout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || (isZh ? '提现失败' : 'Withdrawal failed'))
      }
      toast.success(isZh ? '提现已发起' : 'Withdrawal initiated', { id: toastId })
    } catch (error: any) {
      toast.error(error?.message || (isZh ? '提现失败' : 'Withdrawal failed'))
    } finally {
      setIsWithdrawing(false)
    }
  }, [isZh, router, stripeStatus?.payoutsEnabled, user, wallet.available])

  const coach = useMemo(() => {
    if (!user) {
      return {
        title: isZh ? '登录后查看钱包建议' : 'Log in to see wallet actions',
        detail: isZh ? '登录后系统会根据余额和提现状态推荐下一步操作。' : 'Finley will recommend the next wallet action based on your balance and payout status.',
        tone: 'slate' as const,
        primaryLabel: isZh ? '登录' : 'Log in',
        primaryAction: () => router.push('/'),
        secondaryLabel: isZh ? '了解订阅' : 'View Subscription',
        secondaryHref: '/subscription',
      }
    }

    if (!stripeStatus) {
      return {
        title: isZh ? '连接 Stripe 开启提现路径' : 'Connect Stripe to unlock payouts',
        detail: isZh ? '完成提现账户设置后，报表复盘时可直接从这里发起提现。' : 'After setup, you can trigger withdrawals directly from this flow during your reviews.',
        tone: 'indigo' as const,
        primaryLabel: isZh ? '连接 Stripe' : 'Connect Stripe',
        primaryAction: handleConnectStripe,
        secondaryLabel: isZh ? '打开钱包' : 'Open Wallet',
        secondaryHref: '/wallet',
      }
    }

    if (!stripeStatus.payoutsEnabled) {
      return {
        title: isZh ? '完成 Stripe 设置以启用提现' : 'Finish Stripe setup to enable payouts',
        detail: isZh ? '账户已创建但仍受限，完成验证后即可提现。' : 'Your payout account exists but is restricted until setup is completed.',
        tone: 'amber' as const,
        primaryLabel: isZh ? '完成设置' : 'Complete Setup',
        primaryAction: handleConnectStripe,
        secondaryLabel: isZh ? '打开钱包' : 'Open Wallet',
        secondaryHref: '/wallet',
      }
    }

    if (wallet.available >= 1) {
      return {
        title: isZh ? '可提现余额已准备好' : 'Withdrawable balance is ready',
        detail: isZh ? `当前可提现 ${formatUsdFromCents(wallet.available)}，可在完成复盘后立即发起。` : `${formatUsdFromCents(wallet.available)} is available. You can withdraw it right after your review.`,
        tone: 'emerald' as const,
        primaryLabel: isZh ? '立即提现' : 'Withdraw now',
        primaryAction: handleWithdraw,
        secondaryLabel: isZh ? '钱包详情' : 'Wallet details',
        secondaryHref: '/wallet',
      }
    }

    if (wallet.pending > 0) {
      return {
        title: isZh ? '有资金正在处理' : 'Funds are processing',
        detail: isZh ? `待到账 ${formatUsdFromCents(wallet.pending)}，建议先查看钱包记录状态。` : `${formatUsdFromCents(wallet.pending)} is pending. Review wallet history while it processes.`,
        tone: 'blue' as const,
        primaryLabel: isZh ? '查看钱包记录' : 'Review wallet history',
        primaryAction: () => router.push('/wallet'),
        secondaryLabel: isZh ? '继续复盘' : 'Continue review',
        secondaryHref: context === 'reports' ? '/reports' : '/dashboard',
      }
    }

    return {
      title: isZh ? '钱包状态正常，继续积累可提现余额' : 'Wallet is healthy. Keep building withdrawable balance',
      detail: isZh ? `累计 ${formatUsdFromCents(wallet.lifetime)}。建议继续记录交易并保持月度复盘。` : `${formatUsdFromCents(wallet.lifetime)} lifetime. Keep logging activity and running monthly reviews.`,
      tone: 'slate' as const,
      primaryLabel: isZh ? '打开钱包' : 'Open Wallet',
      primaryAction: () => router.push('/wallet'),
      secondaryLabel: isZh ? '财富页' : 'Wealth page',
      secondaryHref: '/wealth',
    }
  }, [context, handleConnectStripe, handleWithdraw, isZh, router, stripeStatus, user, wallet.available, wallet.lifetime, wallet.pending])

  const toneClasses = {
    slate: 'border-slate-200 bg-white',
    indigo: 'border-indigo-200 bg-indigo-50/70',
    amber: 'border-amber-200 bg-amber-50/70',
    emerald: 'border-emerald-200 bg-emerald-50/70',
    blue: 'border-sky-200 bg-sky-50/70',
  } as const

  const toneIconClasses = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    blue: 'bg-sky-100 text-sky-700 border-sky-200',
  } as const

  if (isLoadingWallet) {
    return (
      <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse ${className}`}>
        <div className="h-4 w-40 rounded bg-slate-200" />
        <div className="mt-3 h-5 w-64 rounded bg-slate-200 max-w-full" />
        <div className="mt-2 h-4 w-full rounded bg-slate-100" />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="h-9 rounded bg-slate-100" />
          <div className="h-9 rounded bg-slate-100" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: MOTION_DURATION.panel, ease: MOTION_EASE.out }}
      className={`rounded-2xl border p-4 shadow-sm ${toneClasses[coach.tone]} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${toneIconClasses[coach.tone]}`}>
            <Wallet size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 flex items-center gap-1.5">
              <Sparkles size={12} />
              {isZh ? 'Wallet Action Coach' : 'Wallet Action Coach'}
            </p>
            <h3 className="mt-1 text-sm md:text-base font-semibold text-slate-900">{coach.title}</h3>
            <p className="mt-1 text-xs md:text-sm text-slate-600 leading-relaxed">{coach.detail}</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-500 shrink-0">
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-2 py-1">
            <Banknote size={12} /> {formatUsdFromCents(wallet.available)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-2 py-1">
            <Clock3 size={12} /> {formatUsdFromCents(wallet.pending)}
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={coach.primaryAction}
          disabled={isConnecting || isWithdrawing}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
        >
          {(isConnecting || isWithdrawing) ? (isZh ? '处理中...' : 'Working...') : coach.primaryLabel}
          {!isConnecting && !isWithdrawing && <ArrowRight size={15} />}
        </button>
        <Link
          href={coach.secondaryHref}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          {coach.secondaryLabel}
          <ExternalLink size={14} />
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600 md:hidden">
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1">
          <Banknote size={11} /> {isZh ? '可提现' : 'Available'} {formatUsdFromCents(wallet.available)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1">
          <Clock3 size={11} /> {isZh ? '待到账' : 'Pending'} {formatUsdFromCents(wallet.pending)}
        </span>
      </div>
    </motion.div>
  )
}
