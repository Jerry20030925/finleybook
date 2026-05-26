'use client'

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  DocumentArrowUpIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  TrashIcon,
  EyeIcon,
  CheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { useDebounce } from 'use-debounce'

import TransactionModal from '@/components/TransactionModal'
import { useAuth } from '@/components/AuthProvider'
import {
  getUserTransactions,
  Transaction,
  deleteTransaction,
  deleteTransactionsBatch,
  updateTransactionsCategoryBatch,
  updateTransactionsBatch,
  updateTransactionsByIdBatch,
  addTransactionsBatch
} from '@/lib/dataService'
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, isWithinInterval } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { useLanguage } from '@/components/LanguageProvider'
import { useCurrency } from '@/components/CurrencyProvider'
import CsvImportModal from '@/components/CsvImportModal'
import { useExperience } from '@/components/ExperienceProvider'

import { useRouter, useSearchParams } from 'next/navigation'
import Skeleton from '@/components/Skeleton';

const ITEMS_PER_PAGE = 50
const TX_CATEGORY_LEARNING_STORAGE_KEY = 'finleybook.transactionCategoryLearning.v1'

type TxHistoryPatch = {
  id: string
  updates: Partial<Pick<Transaction, 'category' | 'type' | 'date' | 'amount'>>
}

type TxHistoryEntry = {
  id: string
  label: string
  before: TxHistoryPatch[]
  after: TxHistoryPatch[]
  createdAt: number
}

type SmartCategorySuggestion = {
  category: string
  confidence: 'high' | 'medium' | 'low'
  source: 'learned' | 'history' | 'keyword'
}

type DeletedBatchEntry = {
  id: string
  label: string
  transactions: Transaction[]
  deletedAt: number
  restored: boolean
}

export default function TransactionsPage() {
  const { user, loading: authLoading } = useAuth()
  const { t, language } = useLanguage()
  const { formatAmount } = useCurrency()
  const { allowRichMotion, reduceMotion } = useExperience()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showCsvModal, setShowCsvModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [categoryChip, setCategoryChip] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [dateFilter, setDateFilter] = useState<'thisMonth' | 'lastMonth' | 'thisYear' | 'all'>('thisMonth')
  const [currentPage, setCurrentPage] = useState(1)
  const [mobileVisibleCount, setMobileVisibleCount] = useState(ITEMS_PER_PAGE)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<string[]>([])
  const [bulkCategoryDraft, setBulkCategoryDraft] = useState('')
  const [bulkTypeDraft, setBulkTypeDraft] = useState<'keep' | 'income' | 'expense'>('keep')
  const [bulkDateDraft, setBulkDateDraft] = useState('')
  const [bulkAmountDraft, setBulkAmountDraft] = useState('')
  const [bulkSubmitting, setBulkSubmitting] = useState(false)
  const [confirmDeleteSelected, setConfirmDeleteSelected] = useState(false)
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null)
  const [swipedRowId, setSwipedRowId] = useState<string | null>(null)
  const [draggingRowId, setDraggingRowId] = useState<string | null>(null)
  const [dragOffsetX, setDragOffsetX] = useState(0)
  const [categoryLearningMap, setCategoryLearningMap] = useState<Record<string, string>>({})
  const [historyStack, setHistoryStack] = useState<TxHistoryEntry[]>([])
  const [redoStack, setRedoStack] = useState<TxHistoryEntry[]>([])
  const [recentlyDeletedBatches, setRecentlyDeletedBatches] = useState<DeletedBatchEntry[]>([])
  const [historyApplying, setHistoryApplying] = useState(false)
  const [showRuleCenter, setShowRuleCenter] = useState(false)
  const [ruleCenterQuery, setRuleCenterQuery] = useState('')
  const [confirmClearRules, setConfirmClearRules] = useState(false)
  const [debouncedSearchTerm] = useDebounce(searchTerm, 250)
  const touchStartXRef = useRef<number | null>(null)
  const touchRowIdRef = useRef<string | null>(null)
  const undoRestoreInFlightRef = useRef<Set<string>>(new Set())
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const initialSearchQuery = (searchParams?.get('q') || '').trim()

  const dateLocale = language === 'en' ? enUS : zhCN

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user) {
      loadTransactions()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [user, authLoading])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm, filterType, categoryChip, sortBy, dateFilter])

  useEffect(() => {
    if (!initialSearchQuery) return
    setSearchTerm(initialSearchQuery)
    setDateFilter('all')
  }, [initialSearchQuery])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobileViewport(mobile)
      if (!mobile) {
        setShowMobileFilters(false)
        setSwipedRowId(null)
      }
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(TX_CATEGORY_LEARNING_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Record<string, string>
      if (parsed && typeof parsed === 'object') {
        setCategoryLearningMap(parsed)
      }
    } catch (error) {
      console.warn('Failed to load transaction category learning map', error)
    }
  }, [])

  const loadTransactions = async () => {
    if (!user?.uid) return

    try {
      setLoading(true)
      const data = await getUserTransactions(user.uid, 2000)
      setTransactions(data)
    } catch (error) {
      console.error('Error loading transactions:', error)
      toast.error(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const dateRange = useMemo(() => {
    const now = new Date()
    switch (dateFilter) {
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) }
      case 'lastMonth':
        const lastMonth = subMonths(now, 1)
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) }
      case 'thisYear':
        return { start: startOfYear(now), end: endOfYear(now) }
      default:
        return null
    }
  }, [dateFilter])

  const quickCategoryChips = useMemo(() => {
    const counts = new Map<string, number>()

    transactions.forEach((transaction) => {
      const matchesType = filterType === 'all'
        ? true
        : filterType === 'income'
          ? transaction.type === 'income' || transaction.type === 'cashback'
          : transaction.type === 'expense'

      const matchesDate = dateRange
        ? isWithinInterval(new Date(transaction.date), dateRange)
        : true

      if (!matchesType || !matchesDate) return

      const category = (transaction.category || 'Other').trim()
      if (!category) return
      counts.set(category, (counts.get(category) || 0) + 1)
    })

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([category, count]) => ({ category, count }))
  }, [transactions, filterType, dateRange])

  const filteredTransactions = useMemo(() => {
    const normalizedSearchTerm = debouncedSearchTerm.trim().toLowerCase()

    return transactions
      .filter((transaction) => {
        const description = transaction.description?.toLowerCase() || ''
        const category = transaction.category?.toLowerCase() || ''
        const matchesSearch = normalizedSearchTerm.length === 0
          || description.includes(normalizedSearchTerm)
          || category.includes(normalizedSearchTerm)
        const matchesType = filterType === 'all'
          ? true
          : filterType === 'income'
            ? transaction.type === 'income' || transaction.type === 'cashback'
            : transaction.type === 'expense'

        const matchesDate = dateRange
          ? isWithinInterval(new Date(transaction.date), dateRange)
          : true
        const matchesCategoryChip = categoryChip === 'all'
          ? true
          : (transaction.category || '').toLowerCase() === categoryChip.toLowerCase()

        return matchesSearch && matchesType && matchesDate && matchesCategoryChip
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        }
        return Math.abs(b.amount) - Math.abs(a.amount)
      })
  }, [transactions, debouncedSearchTerm, filterType, dateRange, sortBy, categoryChip])

  const totalIncome = useMemo(() => filteredTransactions
    .filter((transaction) => transaction.type === 'income' || transaction.type === 'cashback')
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0), [filteredTransactions])

  const totalExpense = useMemo(() => filteredTransactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0), [filteredTransactions])

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE))
  const currentPageSafe = Math.min(currentPage, totalPages)
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPageSafe - 1) * ITEMS_PER_PAGE
    return filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredTransactions, currentPageSafe])
  const paginationStart = filteredTransactions.length === 0 ? 0 : (currentPageSafe - 1) * ITEMS_PER_PAGE + 1
  const paginationEnd = Math.min(currentPageSafe * ITEMS_PER_PAGE, filteredTransactions.length)
  const hasActiveFilters = searchTerm.trim().length > 0 || filterType !== 'all' || categoryChip !== 'all' || dateFilter !== 'all'

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    setMobileVisibleCount(ITEMS_PER_PAGE)
  }, [debouncedSearchTerm, filterType, categoryChip, sortBy, dateFilter])

  useEffect(() => {
    setSelectedTransactionIds([])
    setSelectionMode(false)
    setConfirmDeleteSelected(false)
  }, [debouncedSearchTerm, filterType, categoryChip, sortBy, dateFilter])

  const visibleTransactions = useMemo(() => {
    if (isMobileViewport) {
      return filteredTransactions.slice(0, mobileVisibleCount)
    }
    return paginatedTransactions
  }, [filteredTransactions, isMobileViewport, mobileVisibleCount, paginatedTransactions])

  const hasMoreMobileResults = isMobileViewport && visibleTransactions.length < filteredTransactions.length

  const activeFilterLabels = useMemo(() => {
    const labels: string[] = []
    if (dateFilter !== 'all') {
      labels.push(dateFilter === 'thisMonth' ? 'This Month' : dateFilter === 'lastMonth' ? 'Last Month' : 'This Year')
    }
    if (filterType !== 'all') labels.push(filterType === 'income' ? 'Income' : 'Expense')
    if (sortBy !== 'date') labels.push('Sort: Amount')
    if (categoryChip !== 'all') labels.push(`Category: ${categoryChip}`)
    if (searchTerm.trim()) labels.push(`Search: ${searchTerm.trim()}`)
    return labels
  }, [categoryChip, dateFilter, filterType, searchTerm, sortBy])

  const normalizedDescriptionCategoryMap = useMemo(() => {
    const map = new Map<string, string>()
    const categoryFrequencyByDescription = new Map<string, Map<string, number>>()

    transactions.forEach((transaction) => {
      const key = (transaction.description || '').trim().toLowerCase()
      const category = (transaction.category || '').trim()
      if (!key || !category) return
      const current = categoryFrequencyByDescription.get(key) || new Map<string, number>()
      current.set(category, (current.get(category) || 0) + 1)
      categoryFrequencyByDescription.set(key, current)
    })

    categoryFrequencyByDescription.forEach((frequencyMap, descriptionKey) => {
      const top = Array.from(frequencyMap.entries()).sort((a, b) => b[1] - a[1])[0]
      if (top?.[0]) {
        map.set(descriptionKey, top[0])
      }
    })

    return map
  }, [transactions])

  const persistCategoryLearning = useCallback((pairs: Array<{ description?: string; category: string }>) => {
    setCategoryLearningMap((prev) => {
      const next = { ...prev }
      let changed = false

      pairs.forEach(({ description, category }) => {
        const key = (description || '').trim().toLowerCase()
        const normalizedCategory = category.trim()
        if (!key || !normalizedCategory) return
        if (next[key] === normalizedCategory) return
        next[key] = normalizedCategory
        changed = true
      })

      if (!changed) return prev

      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(TX_CATEGORY_LEARNING_STORAGE_KEY, JSON.stringify(next))
        } catch (error) {
          console.warn('Failed to persist transaction category learning map', error)
        }
      }

      return next
    })
  }, [])

  const removeCategoryLearningRule = useCallback((descriptionKey: string) => {
    setCategoryLearningMap((prev) => {
      if (!prev[descriptionKey]) return prev
      const next = { ...prev }
      delete next[descriptionKey]
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(TX_CATEGORY_LEARNING_STORAGE_KEY, JSON.stringify(next))
        } catch (error) {
          console.warn('Failed to persist transaction category learning map', error)
        }
      }
      return next
    })
  }, [])

  const clearCategoryLearningRules = useCallback(() => {
    setCategoryLearningMap({})
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(TX_CATEGORY_LEARNING_STORAGE_KEY)
      } catch (error) {
        console.warn('Failed to clear transaction category learning map', error)
      }
    }
  }, [])

  const inferSuggestedCategory = useCallback((transaction: Transaction): SmartCategorySuggestion | null => {
    const learningMatch = categoryLearningMap[(transaction.description || '').trim().toLowerCase()]
    if (learningMatch && learningMatch !== transaction.category) {
      return { category: learningMatch, confidence: 'high', source: 'learned' }
    }

    const exactMatch = normalizedDescriptionCategoryMap.get((transaction.description || '').trim().toLowerCase())
    if (exactMatch && exactMatch !== transaction.category) {
      return { category: exactMatch, confidence: 'medium', source: 'history' }
    }

    const text = `${transaction.description || ''} ${transaction.merchantName || ''}`.toLowerCase()
    const keywordRules: Array<{ keywords: string[]; category: string }> = [
      { keywords: ['uber', 'lyft', 'taxi', 'bus', 'train', 'metro', 'fuel', 'petrol', 'gas station'], category: 'Transport' },
      { keywords: ['woolworths', 'coles', 'aldi', 'grocery', 'supermarket', 'market'], category: 'Food' },
      { keywords: ['mcdonald', 'kfc', 'starbucks', 'cafe', 'restaurant', 'ubereats', 'doordash'], category: 'Food' },
      { keywords: ['amazon', 'ebay', 'shop', 'shopping', 'uniqlo', 'nike'], category: 'Shopping' },
      { keywords: ['rent', 'mortgage', 'landlord', 'apartment', 'utility', 'electricity', 'water bill'], category: 'Housing' },
      { keywords: ['doctor', 'clinic', 'pharmacy', 'hospital', 'medical'], category: 'Health' },
      { keywords: ['netflix', 'spotify', 'cinema', 'movie', 'game', 'steam'], category: 'Entertainment' },
      { keywords: ['salary', 'payroll', 'wage'], category: 'Salary' },
      { keywords: ['dividend', 'interest', 'investment'], category: 'Investment' }
    ]

    const matchedRule = keywordRules.find((rule) => rule.keywords.some((keyword) => text.includes(keyword)))
    if (matchedRule && matchedRule.category !== transaction.category) {
      return { category: matchedRule.category, confidence: 'low', source: 'keyword' }
    }

    return null
  }, [categoryLearningMap, normalizedDescriptionCategoryMap])

  const smartSuggestionDetailsByTransactionId = useMemo(() => {
    const suggestions = new Map<string, SmartCategorySuggestion>()
    transactions.forEach((transaction) => {
      if (!transaction.id) return
      const suggestion = inferSuggestedCategory(transaction)
      if (suggestion) suggestions.set(transaction.id, suggestion)
    })
    return suggestions
  }, [transactions, inferSuggestedCategory])

  const smartSuggestionsByTransactionId = useMemo(() => {
    const map = new Map<string, string>()
    smartSuggestionDetailsByTransactionId.forEach((value, key) => {
      map.set(key, value.category)
    })
    return map
  }, [smartSuggestionDetailsByTransactionId])

  const learningRulesList = useMemo(() => {
    const query = ruleCenterQuery.trim().toLowerCase()
    return Object.entries(categoryLearningMap)
      .map(([descriptionKey, category]) => ({ descriptionKey, category }))
      .filter((rule) => {
        if (!query) return true
        return rule.descriptionKey.includes(query) || rule.category.toLowerCase().includes(query)
      })
      .sort((a, b) => a.descriptionKey.localeCompare(b.descriptionKey))
  }, [categoryLearningMap, ruleCenterQuery])

  const parseMoneyInput = (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return null

    const isParenNegative = /^\(.*\)$/.test(trimmed)
    const cleaned = trimmed
      .replace(/[A-Za-z$€£¥₩₹]/g, '')
      .replace(/,/g, '')
      .replace(/\s+/g, '')
      .replace(/[()]/g, '')

    const value = Number(cleaned)
    if (Number.isNaN(value)) return null
    return Math.abs(isParenNegative ? -value : value)
  }

  const applyLocalPatches = useCallback((patches: TxHistoryPatch[]) => {
    const patchMap = new Map(patches.map((patch) => [patch.id, patch.updates]))
    setTransactions((prev) => prev.map((transaction) => {
      if (!transaction.id) return transaction
      const patch = patchMap.get(transaction.id)
      if (!patch) return transaction
      return {
        ...transaction,
        ...(typeof patch.category !== 'undefined' ? { category: patch.category } : {}),
        ...(typeof patch.type !== 'undefined' ? { type: patch.type } : {}),
        ...(typeof patch.amount !== 'undefined' ? { amount: Math.abs(Number(patch.amount) || 0) } : {}),
        ...(patch.date ? { date: new Date(patch.date) } : {})
      }
    }))
  }, [])

  const pushHistoryEntry = useCallback((entry: TxHistoryEntry) => {
    setHistoryStack((prev) => [entry, ...prev].slice(0, 10))
    setRedoStack([])
  }, [])

  const buildBeforePatches = (ids: string[]): TxHistoryPatch[] => {
    const selected = new Set(ids)
    return transactions
      .filter((transaction) => transaction.id && selected.has(transaction.id))
      .map((transaction) => ({
        id: transaction.id!,
        updates: {
          category: transaction.category,
          type: transaction.type,
          date: new Date(transaction.date),
          amount: Math.abs(Number(transaction.amount) || 0)
        }
      }))
  }

  const selectedCount = selectedTransactionIds.length
  const visibleSelectableIds = useMemo(
    () => visibleTransactions.map((transaction) => transaction.id).filter(Boolean) as string[],
    [visibleTransactions]
  )
  const allVisibleSelected = visibleSelectableIds.length > 0
    && visibleSelectableIds.every((id) => selectedTransactionIds.includes(id))

  const toggleTransactionSelected = (transactionId?: string) => {
    if (!transactionId) return
    setSelectedTransactionIds((prev) => (
      prev.includes(transactionId)
        ? prev.filter((id) => id !== transactionId)
        : [...prev, transactionId]
    ))
  }

  const toggleSelectAllVisible = () => {
    if (visibleSelectableIds.length === 0) return
    setSelectedTransactionIds((prev) => {
      if (allVisibleSelected) {
        return prev.filter((id) => !visibleSelectableIds.includes(id))
      }
      const merged = new Set([...prev, ...visibleSelectableIds])
      return Array.from(merged)
    })
  }

  const resetSelectionMode = () => {
    setSelectionMode(false)
    setSelectedTransactionIds([])
    setBulkCategoryDraft('')
    setBulkTypeDraft('keep')
    setBulkDateDraft('')
    setBulkAmountDraft('')
    setConfirmDeleteSelected(false)
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setFilterType('all')
    setCategoryChip('all')
    setSortBy('date')
    setDateFilter('all')
    setShowMobileFilters(false)
  }

  const applyHistoryPatchesRemote = async (patches: TxHistoryPatch[]) => {
    await updateTransactionsByIdBatch(
      patches.map((patch) => ({
        transactionId: patch.id,
        updates: patch.updates
      }))
    )
  }

  const handleUndoLastAction = async () => {
    const entry = historyStack[0]
    if (!entry || historyApplying) return
    try {
      setHistoryApplying(true)
      await applyHistoryPatchesRemote(entry.before)
      applyLocalPatches(entry.before)
      setHistoryStack((prev) => prev.slice(1))
      setRedoStack((prev) => [entry, ...prev].slice(0, 10))
      toast.success(`Undid: ${entry.label}`)
    } catch (error) {
      console.error('Undo history action failed:', error)
      toast.error('Could not undo last action')
    } finally {
      setHistoryApplying(false)
    }
  }

  const handleRedoLastAction = async () => {
    const entry = redoStack[0]
    if (!entry || historyApplying) return
    try {
      setHistoryApplying(true)
      await applyHistoryPatchesRemote(entry.after)
      applyLocalPatches(entry.after)
      setRedoStack((prev) => prev.slice(1))
      setHistoryStack((prev) => [entry, ...prev].slice(0, 10))
      toast.success(`Redid: ${entry.label}`)
    } catch (error) {
      console.error('Redo history action failed:', error)
      toast.error('Could not redo last action')
    } finally {
      setHistoryApplying(false)
    }
  }

  const recordPatchHistory = (label: string, before: TxHistoryPatch[], after: TxHistoryPatch[]) => {
    if (before.length === 0 || after.length === 0) return
    pushHistoryEntry({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      label,
      before,
      after,
      createdAt: Date.now()
    })
  }

  const registerDeletedBatch = (label: string, deletedTransactions: Transaction[]) => {
    if (deletedTransactions.length === 0) return ''
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setRecentlyDeletedBatches((prev) => [
      {
        id,
        label,
        transactions: deletedTransactions,
        deletedAt: Date.now(),
        restored: false
      },
      ...prev
    ].slice(0, 6))
    return id
  }

  const restoreDeletedBatchById = async (batchId: string) => {
    const target = recentlyDeletedBatches.find((entry) => entry.id === batchId)
    if (!target || target.restored) return

    try {
      await addTransactionsBatch(target.transactions.map(toRestorablePayload))
      setRecentlyDeletedBatches((prev) => prev.map((entry) => (
        entry.id === batchId ? { ...entry, restored: true } : entry
      )))
      await loadTransactions()
      toast.success(`Restored: ${target.label}`)
    } catch (error) {
      console.error('Restore deleted batch failed:', error)
      toast.error('Could not restore deleted transactions')
    }
  }

  const toRestorablePayload = (transaction: Transaction): Omit<Transaction, 'id' | 'createdAt'> => {
    const { id, createdAt, ...payload } = transaction
    return {
      ...payload,
      date: new Date(transaction.date),
      userId: transaction.userId
    }
  }

  const showUndoDeleteToast = (deletedTransactions: Transaction[], label: string) => {
    const undoKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const deletedBatchId = registerDeletedBatch(label, deletedTransactions)
    let restoring = false

    toast((toastInstance) => (
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900">{label}</p>
          <p className="text-xs text-slate-500">Undo within 5 seconds</p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
          disabled={restoring}
          onClick={async () => {
            if (restoring || undoRestoreInFlightRef.current.has(undoKey)) return
            restoring = true
            undoRestoreInFlightRef.current.add(undoKey)
            try {
              if (deletedBatchId) {
                await restoreDeletedBatchById(deletedBatchId)
              } else {
                await addTransactionsBatch(deletedTransactions.map(toRestorablePayload))
                await loadTransactions()
              }
              toast.dismiss(toastInstance.id)
              toast.success('Delete undone')
            } catch (error) {
              console.error('Undo delete failed:', error)
              toast.error('Could not restore deleted transaction(s)')
            } finally {
              undoRestoreInFlightRef.current.delete(undoKey)
            }
          }}
        >
          Undo
        </button>
      </div>
    ), { duration: 5000, position: 'top-center' })
  }

  const handleDeleteSingle = async (transactionId?: string) => {
    if (!transactionId) return
    try {
      const deletedTransaction = transactions.find((transaction) => transaction.id === transactionId)
      await deleteTransaction(transactionId)
      setTransactions((prev) => prev.filter((transaction) => transaction.id !== transactionId))
      setSelectedTransactionIds((prev) => prev.filter((id) => id !== transactionId))
      setSwipedRowId((prev) => (prev === transactionId ? null : prev))
      setExpandedTransactionId((prev) => (prev === transactionId ? null : prev))
      if (deletedTransaction) {
        showUndoDeleteToast([deletedTransaction], 'Transaction deleted')
      } else {
        toast.success('Transaction deleted')
      }
    } catch (error) {
      console.error('Delete transaction failed:', error)
      toast.error('Failed to delete transaction')
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedCount === 0) return
    if (!confirmDeleteSelected) {
      setConfirmDeleteSelected(true)
      toast.error('Tap delete again to confirm batch delete')
      return
    }
    try {
      const selectedIdsSnapshot = [...selectedTransactionIds]
      const selectedCountSnapshot = selectedIdsSnapshot.length
      const deletedTransactions = transactions.filter((transaction) => transaction.id && selectedIdsSnapshot.includes(transaction.id))
      setBulkSubmitting(true)
      await deleteTransactionsBatch(selectedIdsSnapshot)
      const selected = new Set(selectedIdsSnapshot)
      setTransactions((prev) => prev.filter((transaction) => !transaction.id || !selected.has(transaction.id)))
      resetSelectionMode()
      if (deletedTransactions.length > 0) {
        showUndoDeleteToast(
          deletedTransactions,
          `Deleted ${selectedCountSnapshot} transaction${selectedCountSnapshot > 1 ? 's' : ''}`
        )
      } else {
        toast.success(`Deleted ${selectedCountSnapshot} transaction${selectedCountSnapshot > 1 ? 's' : ''}`)
      }
    } catch (error) {
      console.error('Batch delete failed:', error)
      toast.error('Failed to delete selected transactions')
    } finally {
      setBulkSubmitting(false)
      setConfirmDeleteSelected(false)
    }
  }

  const handleApplyBulkCategory = async () => {
    const category = bulkCategoryDraft.trim()
    if (!category || selectedCount === 0) return
    const selectedIdsSnapshot = [...selectedTransactionIds]
    const before = buildBeforePatches(selectedIdsSnapshot)
    try {
      setBulkSubmitting(true)
      await updateTransactionsCategoryBatch(selectedIdsSnapshot, category)
      const selected = new Set(selectedIdsSnapshot)
      setTransactions((prev) => prev.map((transaction) => (
        transaction.id && selected.has(transaction.id)
          ? { ...transaction, category }
          : transaction
      )))
      const after = before.map((patch) => ({ id: patch.id, updates: { ...patch.updates, category } }))
      recordPatchHistory(`Set category: ${category}`, before, after)
      persistCategoryLearning(
        transactions
          .filter((transaction) => transaction.id && selected.has(transaction.id))
          .map((transaction) => ({ description: transaction.description, category }))
      )
      toast.success(`Updated category for ${selectedCount} transaction${selectedCount > 1 ? 's' : ''}`)
      resetSelectionMode()
    } catch (error) {
      console.error('Batch category update failed:', error)
      toast.error('Failed to update selected transactions')
    } finally {
      setBulkSubmitting(false)
    }
  }

  const handleApplyBulkType = async () => {
    if (selectedCount === 0 || bulkTypeDraft === 'keep') return
    const selectedIdsSnapshot = [...selectedTransactionIds]
    const before = buildBeforePatches(selectedIdsSnapshot)
    try {
      setBulkSubmitting(true)
      await updateTransactionsBatch(selectedIdsSnapshot, { type: bulkTypeDraft })
      const selected = new Set(selectedIdsSnapshot)
      setTransactions((prev) => prev.map((transaction) => (
        transaction.id && selected.has(transaction.id)
          ? { ...transaction, type: bulkTypeDraft }
          : transaction
      )))
      const after = before.map((patch) => ({ id: patch.id, updates: { ...patch.updates, type: bulkTypeDraft } }))
      recordPatchHistory(`Set type: ${bulkTypeDraft}`, before, after)
      toast.success(`Updated type for ${selectedCount} transaction${selectedCount > 1 ? 's' : ''}`)
      resetSelectionMode()
    } catch (error) {
      console.error('Batch type update failed:', error)
      toast.error('Failed to update selected transaction type')
    } finally {
      setBulkSubmitting(false)
    }
  }

  const handleApplyBulkDate = async () => {
    if (selectedCount === 0 || !bulkDateDraft) return
    const selectedIdsSnapshot = [...selectedTransactionIds]
    const before = buildBeforePatches(selectedIdsSnapshot)
    try {
      const date = new Date(`${bulkDateDraft}T00:00:00`)
      if (Number.isNaN(date.getTime())) {
        toast.error('Invalid date')
        return
      }
      setBulkSubmitting(true)
      await updateTransactionsBatch(selectedIdsSnapshot, { date })
      const selected = new Set(selectedIdsSnapshot)
      setTransactions((prev) => prev.map((transaction) => (
        transaction.id && selected.has(transaction.id)
          ? { ...transaction, date }
          : transaction
      )))
      const after = before.map((patch) => ({ id: patch.id, updates: { ...patch.updates, date } }))
      recordPatchHistory(`Set date: ${bulkDateDraft}`, before, after)
      toast.success(`Updated date for ${selectedCount} transaction${selectedCount > 1 ? 's' : ''}`)
      resetSelectionMode()
    } catch (error) {
      console.error('Batch date update failed:', error)
      toast.error('Failed to update selected transaction date')
    } finally {
      setBulkSubmitting(false)
    }
  }

  const smartCategoryApplicableCount = useMemo(() => {
    if (selectedCount === 0) return 0
    return selectedTransactionIds.filter((id) => smartSuggestionsByTransactionId.has(id)).length
  }, [selectedCount, selectedTransactionIds, smartSuggestionsByTransactionId])

  const smartConfidenceSummary = useMemo(() => {
    const summary = { high: 0, medium: 0, low: 0 }
    selectedTransactionIds.forEach((id) => {
      const detail = smartSuggestionDetailsByTransactionId.get(id)
      if (!detail) return
      summary[detail.confidence] += 1
    })
    return summary
  }, [selectedTransactionIds, smartSuggestionDetailsByTransactionId])

  const batchPreviewLines = useMemo(() => {
    const lines: string[] = []
    if (bulkCategoryDraft.trim()) lines.push(`Category -> ${bulkCategoryDraft.trim()}`)
    if (bulkTypeDraft !== 'keep') lines.push(`Type -> ${bulkTypeDraft}`)
    if (bulkDateDraft) lines.push(`Date -> ${bulkDateDraft}`)
    if (bulkAmountDraft.trim()) {
      const parsed = parseMoneyInput(bulkAmountDraft)
      lines.push(parsed == null ? 'Amount -> invalid format' : `Amount -> ${parsed}`)
    }
    if (smartCategoryApplicableCount > 0) {
      lines.push(
        `Smart category candidates -> ${smartCategoryApplicableCount} (H:${smartConfidenceSummary.high} / M:${smartConfidenceSummary.medium} / L:${smartConfidenceSummary.low})`
      )
    }
    return lines
  }, [
    bulkAmountDraft,
    bulkCategoryDraft,
    bulkDateDraft,
    bulkTypeDraft,
    smartCategoryApplicableCount,
    smartConfidenceSummary
  ])

  const selectedTransactionsForPreview = useMemo(() => {
    if (selectedTransactionIds.length === 0) return []
    const selected = new Set(selectedTransactionIds)
    return transactions.filter((transaction) => transaction.id && selected.has(transaction.id))
  }, [selectedTransactionIds, transactions])

  const batchImpactPreview = useMemo(() => {
    if (selectedTransactionsForPreview.length === 0) return null

    const parsedAmount = bulkAmountDraft.trim() ? parseMoneyInput(bulkAmountDraft) : null
    const predictedType = bulkTypeDraft !== 'keep' ? bulkTypeDraft : null

    const sumByType = (rows: Array<{ amount: number; type: Transaction['type'] }>) => {
      const income = rows
        .filter((row) => row.type === 'income' || row.type === 'cashback')
        .reduce((sum, row) => sum + Math.abs(row.amount), 0)
      const expense = rows
        .filter((row) => row.type === 'expense')
        .reduce((sum, row) => sum + Math.abs(row.amount), 0)
      return { income, expense, net: income - expense }
    }

    const beforeRows = selectedTransactionsForPreview.map((transaction) => ({
      amount: Math.abs(Number(transaction.amount) || 0),
      type: transaction.type
    }))

    const afterRows = selectedTransactionsForPreview.map((transaction) => ({
      amount: parsedAmount != null ? parsedAmount : Math.abs(Number(transaction.amount) || 0),
      type: predictedType ?? transaction.type
    }))

    const before = sumByType(beforeRows)
    const after = sumByType(afterRows)

    return {
      count: selectedTransactionsForPreview.length,
      before,
      after,
      deltaIncome: after.income - before.income,
      deltaExpense: after.expense - before.expense,
      deltaNet: after.net - before.net
    }
  }, [bulkAmountDraft, bulkTypeDraft, selectedTransactionsForPreview])

  const handleSmartCategorizeSelected = async () => {
    if (selectedCount === 0) return
    const selectedIdsSnapshot = [...selectedTransactionIds]
    const before = buildBeforePatches(selectedIdsSnapshot)
    const grouped = new Map<string, string[]>()
    selectedIdsSnapshot.forEach((id) => {
      const suggestion = smartSuggestionsByTransactionId.get(id)
      if (!suggestion) return
      const ids = grouped.get(suggestion) || []
      ids.push(id)
      grouped.set(suggestion, ids)
    })

    if (grouped.size === 0) {
      toast.error('No smart category suggestions found for selected transactions')
      return
    }

    try {
      setBulkSubmitting(true)
      await Promise.all(
        Array.from(grouped.entries()).map(([category, ids]) => updateTransactionsCategoryBatch(ids, category))
      )

      const byId = new Map<string, string>()
      grouped.forEach((ids, category) => ids.forEach((id) => byId.set(id, category)))

      setTransactions((prev) => prev.map((transaction) => (
        transaction.id && byId.has(transaction.id)
          ? { ...transaction, category: byId.get(transaction.id)! }
          : transaction
      )))
      const after = before.map((patch) => ({
        id: patch.id,
        updates: {
          ...patch.updates,
          ...(byId.has(patch.id) ? { category: byId.get(patch.id)! } : {})
        }
      }))
      recordPatchHistory('Smart categorize', before, after)
      const selectedForLearning = transactions
        .filter((transaction) => transaction.id && byId.has(transaction.id))
        .map((transaction) => ({ description: transaction.description, category: byId.get(transaction.id!)! }))
      persistCategoryLearning(selectedForLearning)

      toast.success(`Smart categorized ${Array.from(byId.keys()).length} transaction${byId.size > 1 ? 's' : ''}`)
      resetSelectionMode()
    } catch (error) {
      console.error('Smart categorize failed:', error)
      toast.error('Smart categorization failed')
    } finally {
      setBulkSubmitting(false)
    }
  }

  const handleApplyBulkAmount = async () => {
    if (selectedCount === 0) return
    const parsedAmount = parseMoneyInput(bulkAmountDraft)
    if (parsedAmount == null) {
      toast.error('Enter a valid amount (supports $, commas, A$, parentheses)')
      return
    }

    const selectedIdsSnapshot = [...selectedTransactionIds]
    const before = buildBeforePatches(selectedIdsSnapshot)

    try {
      setBulkSubmitting(true)
      await updateTransactionsBatch(selectedIdsSnapshot, { amount: parsedAmount })
      const selected = new Set(selectedIdsSnapshot)
      setTransactions((prev) => prev.map((transaction) => (
        transaction.id && selected.has(transaction.id)
          ? { ...transaction, amount: parsedAmount }
          : transaction
      )))
      const after = before.map((patch) => ({ id: patch.id, updates: { ...patch.updates, amount: parsedAmount } }))
      recordPatchHistory(`Set amount: ${parsedAmount}`, before, after)
      toast.success(`Updated amount for ${selectedCount} transaction${selectedCount > 1 ? 's' : ''}`)
      resetSelectionMode()
    } catch (error) {
      console.error('Batch amount update failed:', error)
      toast.error('Failed to update selected transaction amount')
    } finally {
      setBulkSubmitting(false)
    }
  }

  const handleRowTouchStart = (transactionId: string, clientX: number) => {
    if (!isMobileViewport || selectionMode) return
    touchStartXRef.current = clientX
    touchRowIdRef.current = transactionId
    setDraggingRowId(transactionId)
    setDragOffsetX(swipedRowId === transactionId ? -116 : 0)
  }

  const handleRowTouchMove = (clientX: number) => {
    if (!isMobileViewport || selectionMode) return
    const startX = touchStartXRef.current
    const rowId = touchRowIdRef.current
    if (startX == null || !rowId) return

    const delta = clientX - startX
    const maxReveal = -116
    const next = swipedRowId === rowId
      ? Math.max(maxReveal, Math.min(0, -116 + delta))
      : Math.max(maxReveal, Math.min(0, delta))
    setDragOffsetX(next)
  }

  const handleRowTouchEnd = () => {
    const rowId = touchRowIdRef.current
    if (!rowId) return
    const shouldReveal = dragOffsetX <= -56
    setSwipedRowId(shouldReveal ? rowId : null)
    setDraggingRowId(null)
    setDragOffsetX(0)
    touchStartXRef.current = null
    touchRowIdRef.current = null
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false
      const tag = target.tagName
      return target.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const typing = isTypingTarget(event.target)
      const meta = event.metaKey || event.ctrlKey

      if (meta && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) {
          void handleRedoLastAction()
        } else {
          void handleUndoLastAction()
        }
        return
      }

      if (typing) return

      if (event.key === '/') {
        event.preventDefault()
        searchInputRef.current?.focus()
        searchInputRef.current?.select()
        return
      }

      if (meta && event.key.toLowerCase() === 'a' && selectionMode) {
        event.preventDefault()
        toggleSelectAllVisible()
        return
      }

      if (event.key === 'Escape') {
        if (showMobileFilters) setShowMobileFilters(false)
        if (swipedRowId) setSwipedRowId(null)
        if (expandedTransactionId) setExpandedTransactionId(null)
        if (confirmDeleteSelected) setConfirmDeleteSelected(false)
        if (selectionMode) resetSelectionMode()
        return
      }

      if (event.key.toLowerCase() === 's' && !meta && !event.altKey) {
        event.preventDefault()
        if (selectionMode) {
          resetSelectionMode()
        } else {
          setSwipedRowId(null)
          setSelectionMode(true)
        }
        return
      }

      if (event.key.toLowerCase() === 'r' && !meta && !event.altKey) {
        event.preventDefault()
        setShowRuleCenter((prev) => !prev)
        return
      }

      if (event.key.toLowerCase() === 'f' && !meta && !event.altKey) {
        event.preventDefault()
        if (isMobileViewport) {
          setShowMobileFilters((prev) => !prev)
        } else {
          searchInputRef.current?.focus()
        }
        return
      }

      if ((event.key === 'Delete' || event.key === 'Backspace') && selectionMode && selectedCount > 0) {
        event.preventDefault()
        void handleDeleteSelected()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    confirmDeleteSelected,
    expandedTransactionId,
    handleDeleteSelected,
    handleRedoLastAction,
    handleUndoLastAction,
    isMobileViewport,
    resetSelectionMode,
    selectedCount,
    selectionMode,
    showMobileFilters,
    swipedRowId,
    toggleSelectAllVisible
  ])

  return (
    <div className="min-h-screen bg-gray-50">


      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          className="mb-8"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('transactions.title')}</h1>
          <p className="text-gray-600">{t('transactions.subtitle') || "Manage your income and expenses"}</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="flex gap-4 mb-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1 md:grid md:grid-cols-3 md:overflow-visible"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            className="min-w-[200px] flex-shrink-0 snap-start bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 md:min-w-0 md:flex-shrink"
            whileHover={allowRichMotion ? { y: -2 } : undefined}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          >
            <h3 className="text-sm font-medium text-gray-500 mb-2">{t('dashboard.totalIncome')}</h3>
            <p className="text-2xl font-bold text-green-600">{formatAmount(totalIncome)}</p>
          </motion.div>
          <motion.div
            className="min-w-[200px] flex-shrink-0 snap-start bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 md:min-w-0 md:flex-shrink"
            whileHover={allowRichMotion ? { y: -2 } : undefined}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          >
            <h3 className="text-sm font-medium text-gray-500 mb-2">{t('dashboard.totalExpenses')}</h3>
            <p className="text-2xl font-bold text-red-600">{formatAmount(totalExpense)}</p>
          </motion.div>
          <motion.div
            className="min-w-[200px] flex-shrink-0 snap-start bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 md:min-w-0 md:flex-shrink"
            whileHover={allowRichMotion ? { y: -2 } : undefined}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          >
            <h3 className="text-sm font-medium text-gray-500 mb-2">{t('dashboard.netIncome')}</h3>
            <p className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatAmount(totalIncome - totalExpense)}
            </p>
          </motion.div>
        </motion.div>

        {/* Controls */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="space-y-3">
            {/* Search — full-width */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t('common.search') || "Search..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              />
              {!isMobileViewport && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 border border-gray-200 rounded px-2 py-0.5">
                  /
                </span>
              )}
            </div>

            {isMobileViewport && (
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowMobileFilters((prev) => !prev)}
                  className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 active:bg-gray-50"
                  aria-expanded={showMobileFilters}
                >
                  <AdjustmentsHorizontalIcon className="w-4 h-4" />
                  {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
                  {activeFilterLabels.length > 0 && (
                    <span className="rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5 text-[11px] font-semibold">
                      {activeFilterLabels.length}
                    </span>
                  )}
                </button>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-1 min-h-[44px] px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-700 active:bg-gray-50"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>
            )}

            {activeFilterLabels.length > 0 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {activeFilterLabels.map((label) => (
                  <span key={label} className="whitespace-nowrap rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
                    {label}
                  </span>
                ))}
              </div>
            )}

            {/* Filters — horizontal-scroll on mobile, flex-wrap on desktop */}
            <div className="hidden sm:flex gap-2 overflow-x-auto no-scrollbar pb-1 sm:flex-wrap sm:overflow-visible">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as 'thisMonth' | 'lastMonth' | 'thisYear' | 'all')}
                className="min-h-[44px] flex-shrink-0 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 bg-white"
              >
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="thisYear">This Year</option>
                <option value="all">Total (All Time)</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
                className="min-h-[44px] flex-shrink-0 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
              >
                <option value="all">{t('common.allTypes') || "All Types"}</option>
                <option value="income">{t('common.income') || "Income"}</option>
                <option value="expense">{t('common.expense') || "Expense"}</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                className="min-h-[44px] flex-shrink-0 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
              >
                <option value="date">{t('common.sortByDate') || "Sort by Date"}</option>
                <option value="amount">{t('common.sortByAmount') || "Sort by Amount"}</option>
              </select>
              {hasActiveFilters && !isMobileViewport && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="min-h-[44px] flex-shrink-0 px-4 py-2.5 text-sm border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {quickCategoryChips.length > 0 && (
              <motion.div
                layout
                className="flex gap-2 overflow-x-auto no-scrollbar pb-1"
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0.12 : 0.18 }}
              >
                <motion.button
                  type="button"
                  layout
                  onClick={() => setCategoryChip('all')}
                  className={`relative whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${categoryChip === 'all'
                    ? 'border-indigo-300 text-indigo-700 bg-indigo-50'
                    : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
                    }`}
                  whileTap={allowRichMotion ? { scale: 0.97 } : undefined}
                >
                  {categoryChip === 'all' && (
                    <motion.span
                      layoutId="category-chip-active"
                      className="absolute inset-0 rounded-full border border-indigo-300 bg-indigo-50 -z-10"
                      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                    />
                  )}
                  All Categories
                </motion.button>
                {quickCategoryChips.map((chip) => (
                  <motion.button
                    key={chip.category}
                    type="button"
                    layout
                    onClick={() => setCategoryChip(chip.category)}
                    className={`relative whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${categoryChip === chip.category
                      ? 'border-indigo-300 text-indigo-700 bg-indigo-50'
                      : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
                      }`}
                    whileTap={allowRichMotion ? { scale: 0.97 } : undefined}
                  >
                    {categoryChip === chip.category && (
                      <motion.span
                        layoutId="category-chip-active"
                        className="absolute inset-0 rounded-full border border-indigo-300 bg-indigo-50 -z-10"
                        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                      />
                    )}
                    <span className="relative z-10">{chip.category}</span>
                    <span className="relative z-10 ml-1 text-[10px] opacity-75">({chip.count})</span>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Action buttons — full-width on mobile */}
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  if (selectionMode) {
                    resetSelectionMode()
                    return
                  }
                  setSelectionMode(true)
                  setSwipedRowId(null)
                }}
                className={`min-h-[44px] px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${selectionMode
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {selectionMode ? `Done (${selectedCount})` : 'Select'}
              </button>
              <div className="relative inline-flex rounded-xl shadow-sm flex-1 sm:flex-initial">
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="relative inline-flex items-center justify-center gap-x-1.5 rounded-l-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 flex-1 sm:flex-initial active:bg-indigo-700"
                >
                  <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                  {t('transactions.add') || "Add Transaction"}
                </button>
                <Menu as="div" className="relative -ml-px flex">
                  <Menu.Button className="relative inline-flex items-center rounded-r-xl bg-indigo-600 px-3 py-3 text-sm text-white hover:bg-indigo-500 focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 border-l border-indigo-700 active:bg-indigo-700">
                    <span className="sr-only">Open options</span>
                    <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => setShowCsvModal(true)}
                              className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                } group flex w-full items-center px-4 py-3 text-sm`}
                            >
                              <DocumentArrowUpIcon
                                className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                              />
                              Import Statement (CSV)
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>
          {!loading && filteredTransactions.length > 0 && (
            <p className="mt-4 text-sm text-gray-500">
              {isMobileViewport
                ? `Showing ${visibleTransactions.length} of ${filteredTransactions.length} transactions`
                : `Showing ${paginationStart}-${paginationEnd} of ${filteredTransactions.length} transactions`}
            </p>
          )}
          {isMobileViewport && !selectionMode && filteredTransactions.length > 0 && (
            <p className="mt-2 text-xs text-gray-400">
              Swipe a transaction left for quick actions.
            </p>
          )}
        </motion.div>

        <AnimatePresence>
          {isMobileViewport && showMobileFilters && (
            <>
              <motion.button
                type="button"
                className="fixed inset-0 z-40 bg-slate-900/35"
                aria-label="Close filters"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileFilters(false)}
              />
              <motion.div
                className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white border-t border-gray-200 shadow-2xl p-4 pb-[calc(env(safe-area-inset-bottom)+16px)]"
                initial={reduceMotion ? false : { y: '100%', opacity: 0.7 }}
                animate={{ y: 0, opacity: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { y: '100%', opacity: 0.8 }}
                transition={{ type: 'spring', stiffness: 340, damping: 32 }}
              >
                <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-200" />
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Filters</h3>
                    <p className="text-xs text-gray-500">Refine transactions quickly on mobile</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(false)}
                    className="min-h-[40px] min-w-[40px] rounded-full border border-gray-200 text-gray-600 inline-flex items-center justify-center"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Date range</label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value as 'thisMonth' | 'lastMonth' | 'thisYear' | 'all')}
                      className="min-h-[48px] w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 bg-white"
                    >
                      <option value="thisMonth">This Month</option>
                      <option value="lastMonth">Last Month</option>
                      <option value="thisYear">This Year</option>
                      <option value="all">Total (All Time)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Type</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
                      className="min-h-[48px] w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 bg-white"
                    >
                      <option value="all">{t('common.allTypes') || "All Types"}</option>
                      <option value="income">{t('common.income') || "Income"}</option>
                      <option value="expense">{t('common.expense') || "Expense"}</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Sort</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                      className="min-h-[48px] w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 bg-white"
                    >
                      <option value="date">{t('common.sortByDate') || "Sort by Date"}</option>
                      <option value="amount">{t('common.sortByAmount') || "Sort by Amount"}</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="min-h-[46px] rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(false)}
                    className="min-h-[46px] rounded-xl bg-indigo-600 text-sm font-semibold text-white"
                  >
                    Apply
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {selectionMode && (
          <motion.div
            className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <div className="flex items-center gap-2 text-sm text-indigo-800">
                <CheckCircleIcon className="h-4 w-4" />
                <span className="font-medium">{selectedCount} selected</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSelectAllVisible}
                  className="min-h-[40px] px-3 rounded-lg border border-indigo-200 bg-white text-xs font-medium text-indigo-700"
                >
                  {allVisibleSelected ? 'Unselect visible' : 'Select visible'}
                </button>
                <button
                  type="button"
                  onClick={resetSelectionMode}
                  className="min-h-[40px] px-3 rounded-lg border border-indigo-200 bg-white text-xs font-medium text-indigo-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {(historyStack.length > 0 || redoStack.length > 0) && (
          <motion.div
            className="mb-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Recent actions</p>
                <p className="text-xs text-slate-500">
                  Undo/redo recent bulk edits without leaving this page.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUndoLastAction}
                  disabled={historyStack.length === 0 || historyApplying}
                  className="min-h-[40px] px-3 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Undo
                </button>
                <button
                  type="button"
                  onClick={handleRedoLastAction}
                  disabled={redoStack.length === 0 || historyApplying}
                  className="min-h-[40px] px-3 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Redo
                </button>
              </div>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {historyStack.slice(0, 3).map((entry) => (
                <span
                  key={entry.id}
                  className="whitespace-nowrap rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                >
                  {entry.label}
                </span>
              ))}
              {redoStack.slice(0, 2).map((entry) => (
                <span
                  key={`redo-${entry.id}`}
                  className="whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                >
                  Redo: {entry.label}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          className="mb-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Smart Rules Center</p>
              <p className="text-xs text-slate-500">
                Manage learned auto-categorization rules. Shortcut: <span className="font-semibold">R</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                {Object.keys(categoryLearningMap).length} learned
              </span>
              <button
                type="button"
                onClick={() => setShowRuleCenter((prev) => !prev)}
                className="min-h-[36px] px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700"
              >
                {showRuleCenter ? 'Hide Rules' : 'Open Rules'}
              </button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {showRuleCenter && (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: reduceMotion ? 0.12 : 0.2 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={ruleCenterQuery}
                      onChange={(e) => setRuleCenterQuery(e.target.value)}
                      placeholder="Search learned rules by description or category"
                      className="min-h-[40px] flex-1 px-3 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!confirmClearRules) {
                          setConfirmClearRules(true)
                          return
                        }
                        clearCategoryLearningRules()
                        setConfirmClearRules(false)
                      }}
                      className={`min-h-[40px] px-3 rounded-lg border text-sm font-medium ${confirmClearRules
                        ? 'border-red-400 bg-red-600 text-white'
                        : 'border-slate-300 bg-white text-slate-700'
                        }`}
                      disabled={Object.keys(categoryLearningMap).length === 0}
                    >
                      {confirmClearRules ? 'Confirm Clear Rules' : 'Clear All Rules'}
                    </button>
                  </div>

                  {learningRulesList.length === 0 ? (
                    <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-white p-4 text-center">
                      <p className="text-sm font-medium text-slate-700">No rules found</p>
                      <p className="text-xs text-slate-500 mt-1">Apply smart categories to build reusable rules.</p>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
                      {learningRulesList.slice(0, 40).map((rule) => (
                        <div key={rule.descriptionKey} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2.5">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description Key</p>
                            <p className="text-sm font-medium text-slate-900 break-all">{rule.descriptionKey}</p>
                            <p className="text-xs text-indigo-700 mt-1">Category: {rule.category}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {selectionMode && (
                              <button
                                type="button"
                                onClick={() => setBulkCategoryDraft(rule.category)}
                                className="min-h-[34px] px-2.5 rounded-lg border border-indigo-200 bg-indigo-50 text-xs font-medium text-indigo-700"
                              >
                                Use in batch
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeCategoryLearningRule(rule.descriptionKey)}
                              className="min-h-[34px] px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {recentlyDeletedBatches.length > 0 && (
          <motion.div
            className="mb-4 rounded-xl border border-amber-200 bg-amber-50/50 p-3"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-amber-900">Recently deleted</p>
                <p className="text-xs text-amber-800/80">Recover recent deletes even after the toast disappears.</p>
              </div>
              <button
                type="button"
                onClick={() => setRecentlyDeletedBatches((prev) => prev.filter((entry) => !entry.restored).slice(0, 3))}
                className="min-h-[36px] px-2.5 rounded-lg border border-amber-200 bg-white text-xs font-medium text-amber-900"
              >
                Hide restored
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {recentlyDeletedBatches.slice(0, 4).map((entry) => (
                <div key={entry.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200/70 bg-white p-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">{entry.label}</p>
                    <p className="text-xs text-slate-500">
                      {entry.transactions.length} item{entry.transactions.length > 1 ? 's' : ''} · {new Date(entry.deletedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => restoreDeletedBatchById(entry.id)}
                    disabled={entry.restored}
                    className="min-h-[38px] px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {entry.restored ? 'Restored' : 'Restore'}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Transactions List */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100"
          initial={allowRichMotion ? 'hidden' : false}
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: allowRichMotion ? 0.05 : 0
              }
            }
          }}
        >
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <motion.div
              className="p-10 text-center text-gray-500"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0.12 : 0.2 }}
            >
              <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                <MagnifyingGlassIcon className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-700">
                {hasActiveFilters ? t('transactions.noResults') : t('transactions.noRecords')}
              </p>
            </motion.div>
          ) : (
            <motion.div layout className="divide-y divide-gray-100">
              <AnimatePresence initial={false} mode="popLayout">
                {visibleTransactions.map((transaction, index) => (
                  <motion.div
                    layout
                    key={transaction.id}
                    className="relative overflow-hidden bg-white"
                    variants={allowRichMotion ? {
                      hidden: { opacity: 0, y: 10 },
                      show: { opacity: 1, y: 0 }
                    } : undefined}
                    initial={allowRichMotion ? { opacity: 0, y: 8 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    exit={allowRichMotion ? { opacity: 0, y: -6 } : undefined}
                    transition={{
                      duration: reduceMotion ? 0.1 : 0.2,
                      delay: reduceMotion ? 0 : index * 0.015
                    }}
                  >
                    {isMobileViewport && !selectionMode && transaction.id && (
                      <div className="absolute inset-y-0 right-0 flex items-stretch">
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedTransactionId((prev) => prev === transaction.id ? null : transaction.id || null)
                            setSwipedRowId(null)
                          }}
                          className="w-14 bg-slate-100 text-slate-700 flex items-center justify-center border-l border-slate-200 active:bg-slate-200"
                          aria-label="View details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSingle(transaction.id)}
                          className="w-14 bg-red-500 text-white flex items-center justify-center active:bg-red-600"
                          aria-label="Delete transaction"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}

                    <motion.div
                      className={`relative z-10 p-4 sm:p-6 transition-colors ${selectionMode ? 'bg-indigo-50/20' : 'hover:bg-gray-50 active:bg-gray-100'}`}
                      animate={{
                        x: isMobileViewport && !selectionMode
                          ? (draggingRowId === transaction.id ? dragOffsetX : swipedRowId === transaction.id ? -116 : 0)
                          : 0
                      }}
                      transition={{ type: 'spring', stiffness: 360, damping: 34, mass: 0.6 }}
                      whileHover={!selectionMode && allowRichMotion && !isMobileViewport ? { x: 1 } : undefined}
                      onTouchStart={(e) => transaction.id && handleRowTouchStart(transaction.id, e.touches[0].clientX)}
                      onTouchMove={(e) => handleRowTouchMove(e.touches[0].clientX)}
                      onTouchEnd={handleRowTouchEnd}
                      onTouchCancel={handleRowTouchEnd}
                      onClick={() => {
                        if (swipedRowId && swipedRowId !== transaction.id) {
                          setSwipedRowId(null)
                        }
                      }}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {selectionMode && (
                            <button
                              type="button"
                              onClick={() => toggleTransactionSelected(transaction.id)}
                              className={`mt-0.5 h-6 w-6 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${selectedTransactionIds.includes(transaction.id || '')
                                ? 'border-indigo-500 bg-indigo-500 text-white'
                                : 'border-gray-300 bg-white text-transparent'
                                }`}
                              aria-label={selectedTransactionIds.includes(transaction.id || '') ? 'Deselect transaction' : 'Select transaction'}
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-y-2 mb-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${(transaction.type === 'income' || transaction.type === 'cashback')
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {transaction.type === 'cashback'
                                  ? (t('wealth.boost.cashback') || 'Cashback')
                                  : transaction.type === 'income'
                                    ? (t('common.income') || "Income")
                                    : (t('common.expense') || "Expense")}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setCategoryChip(transaction.category || 'all')
                                  if (isMobileViewport) setShowMobileFilters(false)
                                  setSwipedRowId(null)
                                }}
                                className="text-sm text-gray-500 hover:text-indigo-700 hover:underline text-left truncate"
                              >
                                {transaction.category}
                              </button>
                              {transaction.id && smartSuggestionDetailsByTransactionId.get(transaction.id) && (
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ml-2 ${smartSuggestionDetailsByTransactionId.get(transaction.id)?.confidence === 'high'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : smartSuggestionDetailsByTransactionId.get(transaction.id)?.confidence === 'medium'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-amber-100 text-amber-700'
                                    }`}
                                  title={`Smart suggestion confidence: ${smartSuggestionDetailsByTransactionId.get(transaction.id)?.confidence}`}
                                >
                                  AI {smartSuggestionDetailsByTransactionId.get(transaction.id)?.confidence}
                                </span>
                              )}
                            </div>
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 leading-snug break-words">{transaction.description}</h3>
                            <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 gap-x-4 gap-y-1">
                              <span>{format(new Date(transaction.date), 'PP', { locale: dateLocale })}</span>
                              {transaction.paymentMethod && <span>{transaction.paymentMethod}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-lg sm:text-xl font-bold ${(transaction.type === 'income' || transaction.type === 'cashback') ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {(transaction.type === 'income' || transaction.type === 'cashback') ? '+' : '-'}{formatAmount(Math.abs(transaction.amount))}
                          </p>
                          <div className="mt-1 flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setExpandedTransactionId((prev) => prev === transaction.id ? null : transaction.id || null)
                                setSwipedRowId(null)
                              }}
                              className="text-[11px] text-slate-500 hover:text-indigo-600"
                            >
                              Details
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSearchTerm(transaction.description || '')
                                setCurrentPage(1)
                                setSwipedRowId(null)
                              }}
                              className="text-[11px] text-slate-500 hover:text-indigo-600"
                            >
                              Similar
                            </button>
                          </div>
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {expandedTransactionId === transaction.id && (
                          <motion.div
                            initial={reduceMotion ? false : { opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: reduceMotion ? 0.12 : 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                              <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                                <div>
                                  <p className="text-slate-500">Category</p>
                                  <p className="font-medium text-slate-900 break-words">{transaction.category || 'Uncategorized'}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Payment</p>
                                  <p className="font-medium text-slate-900 break-words">{transaction.paymentMethod || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Date</p>
                                  <p className="font-medium text-slate-900">{format(new Date(transaction.date), 'PPpp', { locale: dateLocale })}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Status</p>
                                  <p className="font-medium text-slate-900 capitalize">{transaction.status || 'completed'}</p>
                                </div>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {transaction.id && smartSuggestionsByTransactionId.get(transaction.id) && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const suggestion = smartSuggestionDetailsByTransactionId.get(transaction.id!)
                                      if (!suggestion) return
                                      try {
                                        setBulkSubmitting(true)
                                        const before = buildBeforePatches([transaction.id!])
                                        await updateTransactionsCategoryBatch([transaction.id!], suggestion.category)
                                        setTransactions((prev) => prev.map((row) => (
                                          row.id === transaction.id ? { ...row, category: suggestion.category } : row
                                        )))
                                        const after = before.map((patch) => ({
                                          id: patch.id,
                                          updates: { ...patch.updates, category: suggestion.category }
                                        }))
                                        recordPatchHistory(`Smart category: ${suggestion.category}`, before, after)
                                        persistCategoryLearning([{ description: transaction.description, category: suggestion.category }])
                                        toast.success(`Updated category to ${suggestion.category}`)
                                      } catch (error) {
                                        console.error('Single smart category update failed:', error)
                                        toast.error('Could not apply smart category')
                                      } finally {
                                        setBulkSubmitting(false)
                                      }
                                    }}
                                    disabled={bulkSubmitting}
                                    className="min-h-[38px] px-3 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-medium text-emerald-700 disabled:opacity-50"
                                  >
                                    Smart category: {smartSuggestionDetailsByTransactionId.get(transaction.id)?.category}
                                    <span className="ml-1 opacity-75">
                                      ({smartSuggestionDetailsByTransactionId.get(transaction.id)?.confidence})
                                    </span>
                                  </button>
                                )}
                                {!selectionMode && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectionMode(true)
                                      toggleTransactionSelected(transaction.id)
                                      setSwipedRowId(null)
                                    }}
                                    className="min-h-[38px] px-3 rounded-lg border border-indigo-200 bg-white text-xs font-medium text-indigo-700"
                                  >
                                    Select for batch
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSingle(transaction.id)}
                                  className="min-h-[38px] px-3 rounded-lg border border-red-200 bg-white text-xs font-medium text-red-700"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isMobileViewport ? (
                <div className="p-4 flex flex-col items-center gap-3 text-sm text-gray-500">
                  <span>Showing {visibleTransactions.length} of {filteredTransactions.length} transactions</span>
                  {hasMoreMobileResults ? (
                    <motion.button
                      type="button"
                      onClick={() => setMobileVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                      className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                      whileTap={allowRichMotion ? { scale: 0.98 } : undefined}
                    >
                      Load More ({Math.min(ITEMS_PER_PAGE, filteredTransactions.length - visibleTransactions.length)} more)
                    </motion.button>
                  ) : filteredTransactions.length > ITEMS_PER_PAGE ? (
                    <button
                      type="button"
                      onClick={() => setMobileVisibleCount(ITEMS_PER_PAGE)}
                      className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Back to Top of List
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
                  <span>Page {currentPageSafe} / {totalPages}</span>
                  <div className="flex gap-2">
                    <motion.button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPageSafe <= 1}
                      className="px-3 py-1.5 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      whileTap={allowRichMotion ? { scale: 0.96 } : undefined}
                    >
                      Previous
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPageSafe >= totalPages}
                      className="px-3 py-1.5 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      whileTap={allowRichMotion ? { scale: 0.96 } : undefined}
                    >
                      Next
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence>
          {selectionMode && (
            <motion.div
              className="fixed inset-x-3 bottom-[calc(76px+env(safe-area-inset-bottom))] z-30 sm:static sm:inset-auto sm:mt-4 sm:bottom-auto"
              initial={reduceMotion ? false : { y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { y: 16, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0.12 : 0.2 }}
            >
              <div className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur shadow-xl p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">Batch actions</p>
                    <p className="text-xs text-slate-500">
                      {selectedCount > 0 ? `${selectedCount} transaction${selectedCount > 1 ? 's' : ''} selected` : 'Select transactions to enable actions'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={bulkCategoryDraft}
                        onChange={(e) => setBulkCategoryDraft(e.target.value)}
                        placeholder="New category"
                        className="min-h-[42px] w-full sm:w-40 px-3 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder-gray-400"
                      />
                      <button
                        type="button"
                        onClick={handleApplyBulkCategory}
                        disabled={selectedCount === 0 || !bulkCategoryDraft.trim() || bulkSubmitting}
                        className="min-h-[42px] px-3 rounded-xl border border-indigo-200 bg-indigo-600 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Apply
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[auto_auto_auto] gap-2">
                      <input
                        type="text"
                        value={bulkAmountDraft}
                        onChange={(e) => setBulkAmountDraft(e.target.value)}
                        placeholder="Amount (e.g. A$1,250.00)"
                        className="min-h-[42px] px-3 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder-gray-400 bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleApplyBulkAmount}
                        disabled={selectedCount === 0 || !bulkAmountDraft.trim() || bulkSubmitting}
                        className="min-h-[42px] px-3 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Clean / Set Amount
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[auto_auto_auto] gap-2">
                      <select
                        value={bulkTypeDraft}
                        onChange={(e) => setBulkTypeDraft(e.target.value as 'keep' | 'income' | 'expense')}
                        className="min-h-[42px] px-3 rounded-xl border border-gray-300 text-sm text-gray-900 bg-white"
                      >
                        <option value="keep">Type: Keep</option>
                        <option value="income">Set Income</option>
                        <option value="expense">Set Expense</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleApplyBulkType}
                        disabled={selectedCount === 0 || bulkTypeDraft === 'keep' || bulkSubmitting}
                        className="min-h-[42px] px-3 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Apply Type
                      </button>
                      <button
                        type="button"
                        onClick={handleSmartCategorizeSelected}
                        disabled={selectedCount === 0 || smartCategoryApplicableCount === 0 || bulkSubmitting}
                        className="min-h-[42px] px-3 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-medium text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Smart ({smartCategoryApplicableCount})
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[auto_auto_auto] gap-2">
                      <input
                        type="date"
                        value={bulkDateDraft}
                        onChange={(e) => setBulkDateDraft(e.target.value)}
                        className="min-h-[42px] px-3 rounded-xl border border-gray-300 text-sm text-gray-900 bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleApplyBulkDate}
                        disabled={selectedCount === 0 || !bulkDateDraft || bulkSubmitting}
                        className="min-h-[42px] px-3 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Apply Date
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteSelected}
                        disabled={selectedCount === 0 || bulkSubmitting}
                        className={`min-h-[42px] px-3 rounded-xl border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${confirmDeleteSelected
                          ? 'border-red-400 bg-red-600 text-white'
                          : 'border-red-200 bg-white text-red-700'
                          }`}
                      >
                        {confirmDeleteSelected ? `Confirm Delete (${selectedCount})` : 'Delete selected'}
                      </button>
                    </div>
                  </div>
                </div>
                {batchPreviewLines.length > 0 && (
                  <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Change Preview</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {batchPreviewLines.map((line) => (
                        <span
                          key={line}
                          className="rounded-full border border-indigo-200 bg-white px-2.5 py-1 text-xs font-medium text-indigo-700"
                        >
                          {line}
                        </span>
                      ))}
                    </div>
                    {batchImpactPreview && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="rounded-lg border border-slate-200 bg-white p-2">
                          <p className="text-[11px] text-slate-500">Income Impact</p>
                          <p className={`text-sm font-semibold ${batchImpactPreview.deltaIncome >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                            {batchImpactPreview.deltaIncome >= 0 ? '+' : ''}{formatAmount(batchImpactPreview.deltaIncome)}
                          </p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-white p-2">
                          <p className="text-[11px] text-slate-500">Expense Impact</p>
                          <p className={`text-sm font-semibold ${batchImpactPreview.deltaExpense <= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                            {batchImpactPreview.deltaExpense >= 0 ? '+' : ''}{formatAmount(batchImpactPreview.deltaExpense)}
                          </p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-white p-2">
                          <p className="text-[11px] text-slate-500">Net Impact</p>
                          <p className={`text-sm font-semibold ${batchImpactPreview.deltaNet >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                            {batchImpactPreview.deltaNet >= 0 ? '+' : ''}{formatAmount(batchImpactPreview.deltaNet)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {confirmDeleteSelected && (
                  <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs sm:text-sm font-medium text-red-800">
                      Confirm delete for {selectedCount} selected transaction{selectedCount > 1 ? 's' : ''}.
                    </p>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteSelected(false)}
                      className="min-h-[36px] px-2.5 rounded-lg border border-red-200 bg-white text-xs font-medium text-red-700"
                    >
                      Cancel delete
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <TransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false)
          loadTransactions()
        }}
      />

      <CsvImportModal
        isOpen={showCsvModal}
        onClose={() => setShowCsvModal(false)}
        onSuccess={() => {
          setShowCsvModal(false)
          loadTransactions()
        }}
      />
    </div>
  )
}
