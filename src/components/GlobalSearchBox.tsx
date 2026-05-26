'use client'

import { Fragment, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { MagnifyingGlassIcon, ArrowTopRightOnSquareIcon, DocumentTextIcon, Squares2X2Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

import { useAuth } from '@/components/AuthProvider'
import { useLanguage } from '@/components/LanguageProvider'
import { useCurrency } from '@/components/CurrencyProvider'
import { useExperience } from '@/components/ExperienceProvider'
import { MOTION_DURATION, MOTION_EASE } from '@/lib/motionTokens'

type SearchResult = {
  id: string
  title: string
  subtitle: string
  href: string
  type: 'page' | 'transaction' | 'action'
  keywords?: string
}

type ServerTransactionSearchResult = {
  id: string
  title: string
  category: string
  amount: number
  date: string
  href: string
}

interface GlobalSearchBoxProps {
  className?: string
  mobile?: boolean
}

const MAX_PAGE_RESULTS = 5
const MAX_ACTION_RESULTS = 4
const MAX_TRANSACTION_RESULTS = 6
const SEARCH_HISTORY_KEY = 'finley.search.history.v1'
const MAX_RECENT_SEARCHES = 6

export default function GlobalSearchBox({ className, mobile = false }: GlobalSearchBoxProps) {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const { formatAmount } = useCurrency()
  const { reduceMotion, allowRichMotion } = useExperience()
  const router = useRouter()
  const pathname = usePathname() || '/'

  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [transactionResults, setTransactionResults] = useState<ServerTransactionSearchResult[]>([])
  const [isIndexing, setIsIndexing] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const deferredQuery = useDeferredValue(query)

  useEffect(() => {
    if (mobile) return
    if (typeof window === 'undefined') return

    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase()
      const isTypingTarget =
        tag === 'input' ||
        tag === 'textarea' ||
        target?.isContentEditable

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsOpen(true)
        requestAnimationFrame(() => inputRef.current?.focus())
        return
      }

      if (!isTypingTarget && event.key === '/') {
        event.preventDefault()
        setIsOpen(true)
        requestAnimationFrame(() => inputRef.current?.focus())
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [mobile])

  const pageCatalog = useMemo<SearchResult[]>(() => {
    const zh = language === 'zh'
    return [
      { id: 'dashboard', title: t('nav.dashboard') || 'Dashboard', subtitle: zh ? '总览和每日关键数据' : 'Overview and daily key metrics', href: '/dashboard', type: 'page', keywords: 'overview summary home net worth assets spending' },
      { id: 'transactions', title: t('nav.transactions') || 'Transactions', subtitle: zh ? '记账、筛选和导入交易' : 'Bookkeeping, filter, and import transactions', href: '/transactions', type: 'page', keywords: 'expense income bookkeeping ledger add transaction' },
      { id: 'reports', title: t('nav.reports') || 'Reports', subtitle: zh ? '下载专业财务报告' : 'Download professional financial reports', href: '/reports', type: 'page', keywords: 'pdf csv export statement monthly report analytics' },
      { id: 'budget', title: t('nav.budget') || 'Budget', subtitle: zh ? '设置预算并监控进度' : 'Set budgets and monitor progress', href: '/budget', type: 'page', keywords: 'budget cap control overspending plan' },
      { id: 'goals', title: t('nav.goals') || 'Goals', subtitle: zh ? '创建储蓄与投资目标' : 'Create savings and investment goals', href: '/goals', type: 'page', keywords: 'goal savings milestone target invest' },
      { id: 'subscription', title: t('nav.subscription') || 'Subscription', subtitle: zh ? '查看套餐和权益' : 'Compare plans and benefits', href: '/subscription', type: 'page', keywords: 'pricing plans pro premium upgrade features' },
      { id: 'profile', title: t('nav.profile') || 'Profile', subtitle: zh ? '个人资料与 AI 助手入口' : 'Profile and AI assistant entry', href: '/profile', type: 'page', keywords: 'account profile ai assistant copilot' },
      { id: 'settings', title: t('nav.settings') || 'Settings', subtitle: zh ? '通知和安全设置' : 'Notification and security settings', href: '/settings', type: 'page', keywords: 'settings security preferences notifications' },
      { id: 'shop', title: 'Shop', subtitle: zh ? '搜索商家与产品机会' : 'Search merchants and product opportunities', href: '/shop', type: 'page', keywords: 'product products deals shopping merchant amazon ebay nike apple samsung iphone laptop beauty fashion' },
      { id: 'help', title: 'Help', subtitle: zh ? '使用指南与常见问题' : 'How-to guides and FAQs', href: '/help', type: 'page', keywords: 'help support guide faq tutorial learn' }
    ]
  }, [language, t])

  const actionCatalog = useMemo<SearchResult[]>(() => {
    const zh = language === 'zh'
    const baseActions: SearchResult[] = [
      {
        id: 'qa-add-transaction',
        title: zh ? '快速记一笔' : 'Add a transaction',
        subtitle: zh ? '打开交易页面开始记账' : 'Open Transactions to record income or expense',
        href: '/transactions',
        type: 'action',
        keywords: 'add transaction expense income record bookkeeping new payment charge'
      },
      {
        id: 'qa-run-report',
        title: zh ? '生成月度报告' : 'Generate monthly report',
        subtitle: zh ? '进入报告中心导出 PDF/CSV' : 'Open Reports to export PDF or CSV',
        href: '/reports',
        type: 'action',
        keywords: 'report export pdf csv monthly statement summary download'
      },
      {
        id: 'qa-set-budget',
        title: zh ? '设置预算上限' : 'Set a budget cap',
        subtitle: zh ? '快速进入预算页面设置分类预算' : 'Open Budget and set category limits',
        href: '/budget',
        type: 'action',
        keywords: 'budget cap limit overspending save savings plan monthly category'
      },
      {
        id: 'qa-check-goals',
        title: zh ? '创建储蓄目标' : 'Create a savings goal',
        subtitle: zh ? '进入目标页面设置本月目标' : 'Open Goals to set a target for this month',
        href: '/goals',
        type: 'action',
        keywords: 'goal target saving milestone plan achieve'
      },
      {
        id: 'qa-ask-ai',
        title: zh ? '打开 AI 助手' : 'Open Finley AI assistant',
        subtitle: zh ? '前往个人主页使用 AI 辅助建议' : 'Go to Profile to ask for guided financial help',
        href: '/profile',
        type: 'action',
        keywords: 'ai assistant copilot help guidance ask strategy bookkeeping support'
      }
    ]

    const routeContextActions: Record<string, SearchResult[]> = {
      '/dashboard': [
        {
          id: 'ctx-dash-review-reports',
          title: zh ? '查看本月趋势报告' : 'Review this month trend report',
          subtitle: zh ? '打开报告页查看趋势与导出' : 'Open Reports for trends and exports',
          href: '/reports',
          type: 'action',
          keywords: 'dashboard review report monthly trend insight'
        }
      ],
      '/transactions': [
        {
          id: 'ctx-tx-import',
          title: zh ? '导入交易数据' : 'Import transaction data',
          subtitle: zh ? '使用 CSV 导入快速补齐记录' : 'Use CSV import to backfill records quickly',
          href: '/transactions',
          type: 'action',
          keywords: 'import csv transaction backfill ledger upload'
        },
        {
          id: 'ctx-tx-review-expense',
          title: zh ? '筛选最近支出' : 'Review recent expenses',
          subtitle: zh ? '在交易页按支出关键词快速筛选' : 'Search recent expenses in Transactions',
          href: '/transactions?q=expense',
          type: 'action',
          keywords: 'expense spending filter recent transaction'
        }
      ],
      '/reports': [
        {
          id: 'ctx-reports-export',
          title: zh ? '下载专业 PDF 报告' : 'Download professional PDF report',
          subtitle: zh ? '打开报表页导出最新 PDF' : 'Open Reports and export the latest PDF',
          href: '/reports',
          type: 'action',
          keywords: 'download pdf report export print'
        }
      ],
      '/budget': [
        {
          id: 'ctx-budget-adjust',
          title: zh ? '调整预算分类上限' : 'Adjust category budget caps',
          subtitle: zh ? '打开预算页修改分类上限' : 'Open Budget to adjust category limits',
          href: '/budget',
          type: 'action',
          keywords: 'budget adjust limit category optimize'
        }
      ],
      '/subscription': [
        {
          id: 'ctx-subscription-compare',
          title: zh ? '查看 Pro 权益对比' : 'Compare Pro benefits',
          subtitle: zh ? '阅读功能差异后再决定升级' : 'Review plan differences before upgrading',
          href: '/subscription',
          type: 'action',
          keywords: 'subscription pricing plan compare pro upgrade'
        }
      ]
    }

    const contextual = routeContextActions[pathname] || []
    return [...contextual, ...baseActions].filter((item, index, self) => self.findIndex((candidate) => candidate.id === item.id) === index)
  }, [language, pathname])

  const normalizedQuery = query.trim().toLowerCase()
  const deferredNormalizedQuery = deferredQuery.trim().toLowerCase()

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(SEARCH_HISTORY_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        setRecentSearches(parsed.filter((item): item is string => typeof item === 'string').slice(0, MAX_RECENT_SEARCHES))
      }
    } catch (error) {
      console.error('Failed to restore search history:', error)
    }
  }, [])

  const persistSearchHistory = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return

    setRecentSearches((previous) => {
      const next = [trimmed, ...previous.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_RECENT_SEARCHES)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next))
      }
      return next
    })
  }

  const clearSearchHistory = () => {
    setRecentSearches([])
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(SEARCH_HISTORY_KEY)
    }
  }

  useEffect(() => {
    if (!isOpen) return
    if (!user) {
      setTransactionResults([])
      return
    }

    let cancelled = false
    const controller = new AbortController()
    const requestLimit = deferredNormalizedQuery ? MAX_TRANSACTION_RESULTS : 3

    const runSearch = async () => {
      setIsIndexing(true)
      try {
        const token = await user.getIdToken()
        const params = new URLSearchParams({
          q: deferredQuery.trim(),
          limit: String(requestLimit)
        })

        const response = await fetch(`/api/search?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Search request failed')
        }

        const data = await response.json()
        if (!cancelled) {
          setTransactionResults(Array.isArray(data.results) ? data.results : [])
        }
      } catch (error: any) {
        if (error?.name === 'AbortError') return
        console.error('Failed to load server search results:', error)
        if (!cancelled) {
          setTransactionResults([])
        }
      } finally {
        if (!cancelled) {
          setIsIndexing(false)
        }
      }
    }

    const timeoutId = window.setTimeout(runSearch, deferredNormalizedQuery ? 140 : 0)

    return () => {
      cancelled = true
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [deferredNormalizedQuery, deferredQuery, isOpen, user])

  const tokenizedQuery = deferredNormalizedQuery.split(/\s+/).filter(Boolean)

  const scoreMatch = (candidate: SearchResult) => {
    if (!deferredNormalizedQuery) return 0
    const title = candidate.title.toLowerCase()
    const subtitle = candidate.subtitle.toLowerCase()
    const keywords = (candidate.keywords || '').toLowerCase()
    const haystack = `${title} ${subtitle} ${keywords}`

    let score = 0
    if (title.includes(deferredNormalizedQuery)) score += 8
    if (subtitle.includes(deferredNormalizedQuery)) score += 4
    if (keywords.includes(deferredNormalizedQuery)) score += 5
    if (haystack.includes(deferredNormalizedQuery)) score += 2

    tokenizedQuery.forEach((token) => {
      if (title.includes(token)) score += 3
      else if (keywords.includes(token)) score += 2
      else if (subtitle.includes(token)) score += 1
    })

    if (candidate.type === 'action' && /(how|help|how to|guide|start|next|怎么|帮助|不会|新手|begin)/.test(deferredNormalizedQuery)) {
      score += 3
    }

    return score
  }

  const pageResults = useMemo(() => {
    if (!deferredNormalizedQuery) {
      return pageCatalog.slice(0, MAX_PAGE_RESULTS)
    }

    return pageCatalog
      .map((item) => ({ item, score: scoreMatch(item) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item)
      .slice(0, MAX_PAGE_RESULTS)
  }, [deferredNormalizedQuery, pageCatalog])

  const transactionResultItems = useMemo<SearchResult[]>(() => {
    return transactionResults.map((tx) => ({
      id: `tx-${tx.id}`,
      title: tx.title || (language === 'zh' ? '交易' : 'Transaction'),
      subtitle: `${tx.category || (language === 'zh' ? '未分类' : 'Uncategorized')} • ${formatAmount(Math.abs(tx.amount || 0))} • ${format(new Date(tx.date), deferredNormalizedQuery ? 'MM/dd/yyyy' : 'MM/dd')}`,
      href: tx.href || `/transactions?q=${encodeURIComponent(query.trim())}`,
      type: 'transaction'
    }))
  }, [deferredNormalizedQuery, formatAmount, language, query, transactionResults])

  const actionResults = useMemo<SearchResult[]>(() => {
    if (!deferredNormalizedQuery) {
      return actionCatalog.slice(0, MAX_ACTION_RESULTS)
    }

    return actionCatalog
      .map((item) => ({ item, score: scoreMatch(item) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item)
      .slice(0, MAX_ACTION_RESULTS)
  }, [actionCatalog, deferredNormalizedQuery])

  const flattenedResults = useMemo(
    () => [...actionResults, ...pageResults, ...transactionResultItems],
    [actionResults, pageResults, transactionResultItems]
  )

  const smartSuggestionChips = useMemo(() => {
    const zh = language === 'zh'
    if (deferredNormalizedQuery) {
      const suggestions: string[] = []
      if (/budget|预算|spend|支出/.test(deferredNormalizedQuery)) {
        suggestions.push(zh ? '本月预算超支分析' : 'monthly budget overspending analysis')
      }
      if (/report|报告|pdf|export|导出/.test(deferredNormalizedQuery)) {
        suggestions.push(zh ? '导出本月 PDF 报告' : 'export monthly pdf report')
      }
      if (/goal|储蓄|savings|save/.test(deferredNormalizedQuery)) {
        suggestions.push(zh ? '创建本月储蓄目标' : 'create monthly savings goal')
      }
      return suggestions.slice(0, 3)
    }

    return [
      zh ? '记一笔今天的支出' : 'add today expense',
      zh ? '生成本月财务报告' : 'generate monthly report',
      zh ? '帮我设置预算上限' : 'set budget cap for me',
    ]
  }, [deferredNormalizedQuery, language])

  const smartHeaderNote = useMemo(() => {
    if (!deferredNormalizedQuery) {
      if (pathname.startsWith('/transactions')) {
        return language === 'zh' ? '正在交易页：可直接搜索交易、分类或金额。' : 'You are in Transactions. Search transactions, categories, or amounts.'
      }
      if (pathname.startsWith('/reports')) {
        return language === 'zh' ? '正在报表页：试试搜索“PDF”、“CSV”或“月度报告”。' : 'You are in Reports. Try “PDF”, “CSV”, or “monthly report”.'
      }
      return language === 'zh' ? '可搜索页面、交易记录，或使用快捷操作。' : 'Search pages, transactions, or use quick actions.'
    }

    if (actionResults.length > 0 && pageResults.length === 0 && transactionResultItems.length === 0) {
      return language === 'zh' ? '未找到直接结果，已为你推荐可执行操作。' : 'No direct matches. Recommended actions are shown instead.'
    }

    if (transactionResultItems.length > 0) {
      return language === 'zh' ? '已匹配交易记录，可直接打开查看详情。' : 'Matched transactions found. Open one to review details.'
    }

    return language === 'zh' ? '按上下键选择结果，回车打开。' : 'Use arrow keys to navigate and Enter to open.'
  }, [actionResults.length, deferredNormalizedQuery, language, pageResults.length, pathname, transactionResultItems.length])

  const highlightMatch = (text: string) => {
    if (!normalizedQuery) return text
    const source = text || ''
    const target = normalizedQuery
    const index = source.toLowerCase().indexOf(target)
    if (index < 0) return source

    const before = source.slice(0, index)
    const match = source.slice(index, index + target.length)
    const after = source.slice(index + target.length)

    return (
      <Fragment>
        {before}
        <mark className="bg-indigo-100 text-indigo-800 rounded px-0.5">{match}</mark>
        {after}
      </Fragment>
    )
  }

  useEffect(() => {
    if (!isOpen) return
    if (flattenedResults.length === 0) {
      setActiveIndex(0)
      return
    }
    setActiveIndex((prev) => {
      if (prev < 0) return 0
      if (prev >= flattenedResults.length) return flattenedResults.length - 1
      return prev
    })
  }, [flattenedResults, isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isOpen) return
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (rootRef.current?.contains(target)) return
      setIsOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown, { passive: true })
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  const onSubmit = () => {
    const trimmed = query.trim()
    if (!trimmed) return

    persistSearchHistory(trimmed)
    if (flattenedResults.length > 0) {
      const selected = flattenedResults[activeIndex] || flattenedResults[0]
      router.push(selected.href)
    } else {
      router.push(`/transactions?q=${encodeURIComponent(trimmed)}`)
    }
    setIsOpen(false)
  }

  const onSelect = (href: string) => {
    const trimmed = query.trim()
    if (trimmed) {
      persistSearchHistory(trimmed)
    }
    setIsOpen(false)
    router.push(href)
  }

  return (
    <div ref={rootRef} className={clsx('relative', className)}>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
        </div>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onFocus={() => setIsOpen(true)}
          onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              if (!isOpen) {
                setIsOpen(true)
                return
              }
              if (flattenedResults.length > 0) {
                setActiveIndex((prev) => (prev + 1) % flattenedResults.length)
              }
              return
            }

            if (event.key === 'ArrowUp') {
              event.preventDefault()
              if (!isOpen) {
                setIsOpen(true)
                return
              }
              if (flattenedResults.length > 0) {
                setActiveIndex((prev) => (prev - 1 + flattenedResults.length) % flattenedResults.length)
              }
              return
            }

            if (event.key === 'Enter') {
              event.preventDefault()
              if (flattenedResults.length > 0) {
                const selected = flattenedResults[activeIndex] || flattenedResults[0]
                onSelect(selected.href)
                return
              }
              onSubmit()
            }
            if (event.key === 'Escape') {
              setIsOpen(false)
            }
          }}
          placeholder={t('nav.searchPlaceholder') || 'Search wealth, products...'}
          className={clsx(
            'block w-full rounded-full border-0 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 bg-slate-50',
            mobile ? 'py-3 pl-10 pr-12 text-base' : 'py-2 pl-10 pr-20 text-sm'
          )}
        />
        {mobile && query.trim() && (
          <button
            type="button"
            aria-label={language === 'zh' ? '清空搜索' : 'Clear search'}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setQuery('')
              setIsOpen(true)
              requestAnimationFrame(() => inputRef.current?.focus())
            }}
            className="absolute inset-y-0 right-2 inline-flex items-center justify-center rounded-full px-2 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <span className="text-base leading-none">×</span>
          </button>
        )}
        {!mobile && !query.trim() && (
          <div className="pointer-events-none absolute inset-y-0 right-3 hidden items-center md:flex">
            <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-400">
              Ctrl/⌘ K
            </span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {mobile && (
              <motion.button
                type="button"
                aria-label={language === 'zh' ? '关闭搜索面板' : 'Close search panel'}
                onClick={() => setIsOpen(false)}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? MOTION_DURATION.micro : MOTION_DURATION.fast, ease: MOTION_EASE.out }}
                className={clsx('fixed inset-0 z-[70] bg-slate-900/20', allowRichMotion ? 'backdrop-blur-[1px]' : '')}
              />
            )}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: reduceMotion ? MOTION_DURATION.micro : MOTION_DURATION.fast, ease: MOTION_EASE.out }}
              className={clsx(
                'rounded-2xl border border-slate-200 bg-white/95 shadow-2xl overflow-hidden',
                allowRichMotion ? 'backdrop-blur-md' : '',
                mobile
                  ? 'fixed left-3 right-3 top-[calc(env(safe-area-inset-top)+4.25rem)] z-[80] max-h-[calc(100dvh-env(safe-area-inset-top)-5rem-env(safe-area-inset-bottom))]'
                  : 'absolute left-0 right-0 top-[calc(100%+10px)] z-[60] max-h-[70vh]'
              )}
            >
              <div className={clsx('sticky top-0 z-10 px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white/90', allowRichMotion ? 'backdrop-blur-md' : '')}>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500 font-semibold">
                  {normalizedQuery ? (language === 'zh' ? `搜索结果：${query}` : `Results for "${query}"`) : (language === 'zh' ? '快速搜索' : 'Quick Search')}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">{smartHeaderNote}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isIndexing && <span className="text-[11px] text-slate-400">{language === 'zh' ? '索引中...' : 'Indexing...'}</span>}
                  {mobile && (
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition"
                      aria-label={language === 'zh' ? '关闭搜索' : 'Close search'}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className={clsx('overflow-y-auto overscroll-contain p-2', mobile ? 'max-h-[calc(100dvh-env(safe-area-inset-top)-11.5rem-env(safe-area-inset-bottom))] pb-[calc(env(safe-area-inset-bottom)+8px)]' : 'max-h-[56vh]')}>
              {smartSuggestionChips.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2 px-1">
                  {smartSuggestionChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setQuery(chip)
                        setIsOpen(true)
                        requestAnimationFrame(() => inputRef.current?.focus())
                      }}
                      className="rounded-full border border-indigo-100 bg-indigo-50/70 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {!normalizedQuery && recentSearches.length > 0 && (
                <div className="mb-2 rounded-xl border border-slate-100 bg-slate-50/70 p-2">
                  <div className="mb-1 flex items-center justify-between px-1">
                    <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                      {language === 'zh' ? '最近搜索' : 'Recent'}
                    </p>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={clearSearchHistory}
                      className="text-[11px] text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      {language === 'zh' ? '清空' : 'Clear'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setQuery(item)
                          setIsOpen(true)
                          inputRef.current?.focus()
                        }}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {actionResults.length > 0 && (
                <div className="mb-2 rounded-xl border border-slate-100 bg-white p-2">
                  <p className="px-1 pb-1 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    {normalizedQuery ? (language === 'zh' ? '推荐操作' : 'Recommended actions') : (language === 'zh' ? '快捷操作' : 'Quick actions')}
                  </p>
                  <div className="space-y-1">
                    {actionResults.map((item, index) => (
                      <motion.button
                        key={item.id}
                        type="button"
                        aria-pressed={activeIndex === index}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => onSelect(item.href)}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={clsx(
                          'w-full rounded-xl border px-3 py-2 text-left transition-colors',
                          activeIndex === index
                            ? 'border-indigo-200 bg-indigo-50/60'
                            : 'border-transparent bg-slate-50/80 hover:border-slate-200 hover:bg-slate-100'
                        )}
                        initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                        transition={{ duration: MOTION_DURATION.fast, ease: MOTION_EASE.out, delay: reduceMotion ? 0 : index * 0.02 }}
                        whileHover={allowRichMotion ? { x: 1 } : undefined}
                      >
                        <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                        <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {isIndexing && normalizedQuery && (
                <div className="mb-2 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <div className="h-3 w-2/5 animate-pulse rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                </div>
              )}

              {flattenedResults.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <p className="text-sm font-semibold text-slate-800">{language === 'zh' ? '没有匹配结果' : 'No direct matches'}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'zh' ? '按回车将跳转到交易搜索结果。' : 'Press Enter to search transactions directly.'}
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {smartSuggestionChips.map((chip) => (
                      <button
                        key={`empty-${chip}`}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setQuery(chip)
                          setIsOpen(true)
                          requestAnimationFrame(() => inputRef.current?.focus())
                        }}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {pageResults.length > 0 && (
                    <div className="mb-1">
                      <p className="px-3 py-1 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{language === 'zh' ? '页面' : 'Pages'}</p>
                      <motion.div
                        className="space-y-1"
                        initial={reduceMotion ? false : 'hidden'}
                        animate={reduceMotion ? undefined : 'show'}
                        variants={{
                          hidden: { opacity: 0 },
                          show: { opacity: 1, transition: { staggerChildren: 0.03 } }
                        }}
                      >
                        {pageResults.map((item, index) => (
                          <motion.button
                            key={item.id}
                            aria-pressed={activeIndex === actionResults.length + index}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => onSelect(item.href)}
                            onMouseEnter={() => setActiveIndex(actionResults.length + index)}
                            className={clsx(
                              'w-full text-left px-3 py-2.5 rounded-xl transition-colors',
                              activeIndex === actionResults.length + index ? 'bg-slate-100 ring-1 ring-slate-200' : 'hover:bg-slate-100'
                            )}
                            initial={reduceMotion ? false : { opacity: 0, y: 5 }}
                          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                          transition={{ duration: MOTION_DURATION.fast, ease: MOTION_EASE.out, delay: reduceMotion ? 0 : index * 0.02 }}
                          whileHover={allowRichMotion ? { x: 1 } : undefined}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 rounded-lg bg-slate-100 p-1.5">
                                <Squares2X2Icon className="h-4 w-4 text-slate-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-900 truncate">{highlightMatch(item.title)}</p>
                                <p className="text-xs text-slate-500 truncate">{highlightMatch(item.subtitle)}</p>
                              </div>
                              <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-300 mt-1" />
                            </div>
                          </motion.button>
                        ))}
                      </motion.div>
                    </div>
                  )}

                  {transactionResultItems.length > 0 && (
                    <div>
                      <p className="px-3 py-1 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{language === 'zh' ? '交易记录' : 'Transactions'}</p>
                      <motion.div
                        className="space-y-1"
                        initial={reduceMotion ? false : 'hidden'}
                        animate={reduceMotion ? undefined : 'show'}
                        variants={{
                          hidden: { opacity: 0 },
                          show: { opacity: 1, transition: { staggerChildren: 0.03 } }
                        }}
                      >
                        {transactionResultItems.map((item, txIndex) => (
                          <motion.button
                            key={item.id}
                            aria-pressed={activeIndex === actionResults.length + pageResults.length + txIndex}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => onSelect(item.href)}
                            onMouseEnter={() => setActiveIndex(actionResults.length + pageResults.length + txIndex)}
                            className={clsx(
                              'w-full text-left px-3 py-2.5 rounded-xl transition-colors',
                              activeIndex === actionResults.length + pageResults.length + txIndex ? 'bg-slate-100 ring-1 ring-slate-200' : 'hover:bg-slate-100'
                            )}
                            initial={reduceMotion ? false : { opacity: 0, y: 5 }}
                          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                          transition={{ duration: MOTION_DURATION.fast, ease: MOTION_EASE.out, delay: reduceMotion ? 0 : txIndex * 0.02 }}
                          whileHover={allowRichMotion ? { x: 1 } : undefined}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 rounded-lg bg-indigo-50 p-1.5">
                                <DocumentTextIcon className="h-4 w-4 text-indigo-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-900 truncate">{highlightMatch(item.title)}</p>
                                <p className="text-xs text-slate-500 truncate">{highlightMatch(item.subtitle)}</p>
                              </div>
                              <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-300 mt-1" />
                            </div>
                          </motion.button>
                        ))}
                      </motion.div>
                    </div>
                  )}
                </>
              )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
